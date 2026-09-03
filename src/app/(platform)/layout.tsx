import { Outfit, Plus_Jakarta_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--platform-font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--platform-font-sans",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--platform-font-mono",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--platform-font-serif",
  display: "swap",
});

/**
 * Fonts + chrome-free shell for the cloned Ascend post-auth platform.
 * Landing page lives outside this route group and stays unchanged.
 */
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${outfit.variable} ${jakarta.variable} ${plex.variable} ${instrument.variable}`}
    >
      {children}
    </div>
  );
}
