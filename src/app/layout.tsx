import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App — Bartosz",
  description: "Moja pierwsza aplikacja w Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
