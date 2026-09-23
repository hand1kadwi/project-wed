import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Wed | Your wedding fund",
  description: "A private plan for reaching your wedding fund.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
