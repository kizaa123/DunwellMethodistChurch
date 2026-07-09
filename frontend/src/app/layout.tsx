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
  themeColor: "#1e3a5f",
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
    "color-scheme": "light only",
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
      style={{ colorScheme: "light only" }}
    >
      <body className="min-h-full flex flex-col bg-[hsl(30,7%,97%)] text-[hsl(24,5%,11%)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
