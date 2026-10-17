import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Breathe4School · Annotation workspace",
  description: "A focused PDF annotation prototype for school answer books.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
