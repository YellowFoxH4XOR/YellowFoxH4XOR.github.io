import type { Metadata } from "next";
import { Geist, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Fira Code carries over the monospace character of the original site.
const firaCode = Fira_Code({
  variable: "--font-geist-mono",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-300">
        {/* Background Ambient Grids & Glows — clipped to the viewport via a
            fixed overflow-hidden wrapper so the off-edge glows can't cause
            horizontal overflow (which made mobile browsers zoom out). */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.04]" />
          <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand/8 blur-[130px] dark:bg-brand/5 animate-pulse-slow" />
          <div className="absolute top-[35%] right-[-10%] h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px] dark:bg-[#d946ef]/3 animate-pulse-slow" />
          <div className="absolute bottom-[10%] left-[-5%] h-[450px] w-[450px] rounded-full bg-brand/5 blur-[110px]" />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16 lg:px-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
