import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-6 py-10 text-center text-sm text-muted-foreground">
      <p>
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  );
}
