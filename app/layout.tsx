import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniVibe",
  description: "AI-assisted social matching for meaningful conversations."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
