import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aegis — Adaptive Protection for Digital Banking",
    template: "%s · Aegis",
  },
  description:
    "Aegis protects vulnerable customers before, during, and after digital financial fraud — a decision-security prototype for digital banking. Simulation only; not connected to real bank accounts.",
  applicationName: "Aegis",
  keywords: [
    "fintech",
    "fraud prevention",
    "digital banking",
    "decision integrity",
    "scam interception",
    "Aegis",
  ],
  authors: [{ name: "Aegis" }],
  openGraph: {
    title: "Aegis — Adaptive Protection for Digital Banking",
    description:
      "Decision-security for digital banking: stop scams before money leaves the account. Simulation prototype.",
    type: "website",
    siteName: "Aegis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegis — Adaptive Protection for Digital Banking",
    description:
      "Decision-security for digital banking: stop scams before money leaves the account.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink-950 text-cream-100 font-body antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
