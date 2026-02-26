import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const signature = Caveat({
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Matthew Grygar — System Engineer / IAM / Application Support",
  description:
    "Premium personal portfolio of Matthew Grygar — System Engineer focused on IAM/IdM, application support and reliable operations.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Matthew Grygar — System Engineer",
    description:
      "IAM • Application Support • Systems — premium, calm, security-aware operations.",
    url: "https://example.com",
    siteName: "Matthew Grygar",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Matthew Grygar" }],
    locale: "en_US",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${signature.variable}`}>
      <body>{children}</body>
    </html>
  );
}
