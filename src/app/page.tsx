import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";
import { SocialLinks } from "@/components/social-links";
import { PostCard } from "@/components/post-card";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative animate-fade-in-up opacity-0 [animation-fill-mode:forwards]">
        <div className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gradient-brand pb-1">
              {site.greeting}{" "}
              <span className="inline-block hover:animate-bounce cursor-default">👋</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {site.intro}
            </p>
          </div>
          <div className="relative group shrink-0 self-center sm:self-auto">
            {/* Glowing background halo */}
            <div className="absolute -inset-1.5 rounded-[22px] bg-gradient-to-r from-brand via-violet-500 to-pink-500 opacity-20 blur-md transition-all duration-500 group-hover:opacity-75 group-hover:scale-105 group-hover:blur-lg" />
            
            {/* Glow border frame */}
            <div className="relative rounded-[20px] p-1.5 bg-gradient-to-b from-brand/30 to-border/30 group-hover:from-brand group-hover:to-pink-500 transition-all duration-500 shadow-md group-hover:shadow-[0_0_20px_var(--color-brand)]">
              <Image
                src="/images/profile.jpg"
                alt={`Portrait of ${site.name}`}
                width={120}
                height={120}
                priority
                className="size-28 rounded-2xl object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.01] sm:size-32"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="animate-fade-in-up opacity-0 animation-delay-100 [animation-fill-mode:forwards]">
        <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
          Links
        </h2>
        <SocialLinks />
      </section>

      {/* Latest writing */}
      <section className="animate-fade-in-up opacity-0 animation-delay-200 [animation-fill-mode:forwards]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
            Latest writing
          </h2>
          <Link
            href="/blog"
            className="group/all-posts inline-flex items-center gap-1 text-sm font-medium text-brand hover:opacity-80 transition-opacity"
          >
            All posts <ArrowRight className="size-4 transition-transform group-hover/all-posts:translate-x-1" />
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No posts yet — check back soon.
          </p>
        )}
      </section>
    </div>
  );
}
