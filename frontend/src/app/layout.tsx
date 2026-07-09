import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a5f" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a5f" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "Dunwell Methodist Church",
    template: "%s | Dunwell Methodist Church",
  },
  description:
    "Dunwell Methodist Church — Growing in Faith, Serving in Love. Join us for worship, fellowship, and community outreach.",
  icons: {
    icon: "/favicon.png",
  },
  other: {
    "color-scheme": "only light",
    "supported-color-schemes": "light",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      style={{ colorScheme: "only light" }}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="theme-color" content="#1e3a5f" />
        <meta name="supported-color-schemes" content="light" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{background-color:#f8f7f5!important;color:#1c1917!important;color-scheme:only light!important}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f7f5] text-[#1c1917]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
