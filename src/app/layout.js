import "./globals.css";

export const metadata = {
  title: "Talat K | NLP Coaching for Meaningful Change",
  description:
    "One-to-one online NLP coaching to explore old patterns, build confidence, and create meaningful change with Talat K.",
  openGraph: {
    title: "Talat K | NLP Coaching for Meaningful Change",
    description:
      "A considered, personal approach to NLP coaching and meaningful change.",
    type: "website",
  },
  icons: {
    icon: "/images/Logo_fnal-removebg-preview.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
