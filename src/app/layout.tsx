import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { site } from "@/lib/site";
import { pageAlternates } from "@/lib/page-metadata";

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
  alternates: pageAlternates("/"),
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="site-main site-wrap flex-1"
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
