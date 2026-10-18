import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Breathe4School · Annotation workspace",
  description: "Open your PDFs, annotate answer scripts, and save your work on this device.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
