---
title: "A Go Event Pipeline at 100k Events/Day, Sub-200ms"
date: "2026-03-31"
excerpt: "How we built a serverless SQS → Lambda → DynamoDB pipeline in Go that handles 100k events a day at sub-200ms end-to-end latency with 99.99% uptime — and what broke along the way."
tags: ["go", "aws", "systems", "architecture"]
---

Last year we inherited a Python-based event ingestion service that was held
together with SQS, a couple of Lambda functions, and a prayer. It worked well
enough at 5k events a day. At 100k it fell over — partial batch failures
silently swallowed events, a poorly chosen partition key turned one DynamoDB
table into a hot mess, and duplicate deliveries were writing ghost records no
one noticed for three weeks. This is the rewrite story.

(For context on why we chose Go over Python for this service, I covered that
tradeoff in detail in [Python or Go for a backend service](/blog/python-or-go-backend).)

## The architecture in one sentence

Events arrive over SQS, a Go Lambda function processes each batch, writes to
DynamoDB, and anything that truly fails lands in a dead-letter queue. Simple on
paper. The surface area for failure is in the details.

## Lesson 1: SQS is at-least-once. Design for it.

The [Lambda–SQS integration docs](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html)
are clear about this, but it still catches teams off guard: a message can be
delivered more than once. Network hiccups, visibility timeout races, a Lambda
invocation that times out and returns — any of these can cause a message to
reappear in the queue after you've already processed it.

The fix is an idempotency key baked into every event at the producer. On the
consumer side, we do a conditional write to DynamoDB: write only if the key
doesn't already exist. If it does, the write is a no-op. The event was already
processed, nothing blows up, the duplicate is silently discarded.

```go
func handleEvent(ctx context.Context, event Event) error {
    item, err := attributevalue.MarshalMap(event)
    if err != nil {
        return fmt.Errorf("marshal: %w", err)
    }

    _, err = db.PutItem(ctx, &dynamodb.PutItemInput{
        TableName:           aws.String(tableName),
        Item:                item,
        ConditionExpression: aws.String("attribute_not_exists(idempotency_key)"),
    })
    if err != nil {
        var condFailed *types.ConditionalCheckFailedException
        if errors.As(err, &condFailed) {
            // Already processed — not an error.
            return nil
        }
        return err
    }
    return nil
}
```

This is the same principle behind any reliable system:
side effects need to be safe to retry. A non-deterministic upstream — in that
case a language model, here an at-least-once queue — makes retries inevitable.
Your write layer has to absorb the duplicates without flinching.

## Lesson 2: DynamoDB partition keys and the hot partition problem

Our original table used `event_type` as the partition key. There are four event
types in the system. Under load, roughly 70% of traffic hit one of them. That
partition got hammered; the others sat idle. DynamoDB had no way to redistribute
that capacity, and we started seeing throttling errors on every spike.

The fix was a composite key: `{event_type}#{uuid}`. We also added a GSI on
`event_type` with a sort key of `created_at` so we could still query by type
efficiently. Read capacity distributed across thousands of partitions instead of
four. Throttling errors dropped to zero within hours of the deploy.

The tell for a hot partition is asymmetric consumed-capacity metrics in
CloudWatch. If one partition is pinned at capacity and the rest are flat, the
key design is the problem, not the provisioned throughput.

## Lesson 3: Batching, backpressure, and the visibility timeout

Lambda processes SQS batches of up to 10 messages by default (we bumped ours
to 100 with batch windows). We batch DynamoDB writes using `BatchWriteItem`,
which handles up to 25 items per call. A batch of 100 SQS messages becomes four
DynamoDB batch writes.

Two things to know here: `BatchWriteItem` can return unprocessed items without
erroring. You have to check `UnprocessedItems` in the response and retry those
with exponential backoff. We wrote a thin retry loop that respects DynamoDB's
backoff signals before the Lambda function returns.

The other thing is visibility timeout. If your Lambda takes longer than the
timeout to process a batch, SQS makes those messages visible again — now you
have two concurrent Lambdas working on the same batch. Set the visibility
timeout to at least six times your expected Lambda duration. We set ours to 90
seconds against a p99 Lambda duration of 12 seconds.

## Lesson 4: Partial batch failures and the DLQ

With SQS and Lambda, a batch either fully succeeds or fully fails by default.
If message 7 of 10 throws an unhandled error, Lambda reprocesses all 10. That's
wasteful and creates more duplicates.

Enable `ReportBatchItemFailures` in the Lambda event source mapping. Then return
a `SQSBatchResponse` with the message IDs that actually failed. Only those
messages go back to the queue. Messages that exceeded the maximum receive count
fall into the dead-letter queue, where we have a separate Lambda for alerting
and manual inspection.

Never let the DLQ grow silently. We alarm on it at a depth of 1. An event in
the DLQ means something we did not anticipate happened; we want to know
immediately, not in a weekly review.

## Cold starts and why Go helped

Go's binary startup time is measured in milliseconds. On the warmest of JVM
services I've run, you're waiting hundreds of milliseconds just to get to your
first line of business logic. With Go on Lambda, cold starts were a non-issue
at our scale — the p99 cold start was under 80ms, well inside our 200ms
end-to-end budget.

We also kept the handler lean: no global HTTP client pools to initialize, no
dependency injection frameworks, one DynamoDB client initialized in `init()`.
The smaller the binary, the faster the deploy and the faster the cold start.

## The serverless vs. long-running consumer tradeoff

Serverless won here because our traffic is spiky and unpredictable. Lambda
scales to zero at night and bursts to dozens of concurrent invocations during
peak without any tuning. A long-running consumer — an ECS task, a dedicated EC2
box — would either over-provision or lag under sudden load spikes.

The calculus flips when you have sustained, predictable throughput above a
certain rate. At that point, the per-invocation cost of Lambda exceeds what
you'd pay for a reserved instance running a tight consumer loop, and you lose
fine-grained backpressure control. For anything above a few million events per
day at continuous load, I'd reach for a long-running consumer. Below that, and
especially where load is irregular, serverless is hard to beat on cost and
operational overhead.

## What the numbers look like

After six months in production: 100k events per day average, 200ms p99
end-to-end latency (measured from SQS send to DynamoDB confirm), 99.99% event
delivery rate, zero production incidents. The DLQ has fired twice — both times
caught by the alarm within two minutes.

The refactor also reduced costs compared to the previous Python setup, mostly
because Lambda duration dropped by 60%. The performance gains from switching
languages — covered in depth in [cutting Postgres query latency](/blog/postgresql-query-latency)
for a different service — compound across your whole compute bill.

If you're building something similar: nail the idempotency first, get the
partition key right before you have traffic, and treat the DLQ as a first-class
signal rather than a safety net you never look at.
