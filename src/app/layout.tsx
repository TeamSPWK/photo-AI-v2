import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WavePort",
  description: "Your Presence, The New ImpactWave.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
