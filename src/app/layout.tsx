import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav/Nav";

export const metadata: Metadata = {
  title: "Odunayomide",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
