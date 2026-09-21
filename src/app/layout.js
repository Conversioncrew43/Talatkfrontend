import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Talat K — NLP Coach",
  description: "Book a consultation with an NLP coach. Quiet, precise, modern practice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
