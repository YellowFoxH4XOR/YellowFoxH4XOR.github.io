import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { site } from "@/lib/site";

// Display + body voice: a crafted grotesque with real character.
const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Data/labels voice: a quiet mono for eyebrows, metadata, and code.
const splineMono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${site.name} — Blog` },
      ],
    },
  },
  openGraph: {
    title: `${site.name} | ${site.role}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.role}`,
    description: site.description,
    creator: site.twitterHandle,
  },
  // Encourage rich snippets / large image previews in search and AI cards.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

// Tints mobile browser chrome (address bar) to the ember accent. Matches the
// PWA manifest theme_color; a single accent works across light/dark since the
// site follows the system theme.
export const viewport: Viewport = {
  themeColor: "#b85c26",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-300">
        {/* Keyboard skip link — hidden until focused. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        {/* Ambient room tone. Three layers, all clipped to the viewport by a
            fixed overflow-hidden wrapper so nothing can cause horizontal
            overflow on a phone:
              1. paper grain, so flat colour never reads as flat plastic
              2. a dot field that fades out as the page goes down
              3. two lamplit ember pools, warmer at the top of the page
            Opacities are deliberately low; this should be felt, not seen. */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-[0.055] dark:opacity-[0.075]" />
          <div className="absolute inset-0 bg-dot-pattern opacity-55 [mask-image:radial-gradient(ellipse_85%_55%_at_50%_0%,black,transparent)] dark:opacity-40" />
          <div className="absolute -top-[18%] right-[-12%] h-[620px] w-[620px] rounded-full bg-brand/16 blur-[130px] animate-pulse-slow dark:bg-brand/14" />
          <div className="absolute bottom-[-22%] left-[-14%] h-[560px] w-[560px] rounded-full bg-brand/10 blur-[125px] dark:bg-brand/9" />
          {/* A vignette pulls the corners down so the centre of the page reads
              as the lit part of the room. */}
          <div className="absolute inset-0 [background:radial-gradient(120%_85%_at_50%_10%,transparent_45%,color-mix(in_oklch,var(--color-foreground)_9%,transparent)_100%)] dark:[background:radial-gradient(120%_85%_at_50%_10%,transparent_40%,oklch(0_0_0/0.4)_100%)]" />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main
            id="main-content"
            className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16 lg:px-8"
          >
            {children}
          </main>
          <Footer />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
