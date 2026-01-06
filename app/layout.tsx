import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olera - Elder Care Made Simple",
  description: "Find and establish elder care with ease. Connect families with care providers nationwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
