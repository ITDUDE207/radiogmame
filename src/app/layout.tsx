import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Error 404: Self Not Found",
  description:
    "A narrative puzzle game about reconstructing a missing person from her conflicting digital remains. Chapter One: The Last Login.",
  applicationName: "Error 404: Self Not Found",
  keywords: [
    "narrative game",
    "puzzle game",
    "interactive fiction",
    "digital archive",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0c0d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void text-ink antialiased">{children}</body>
    </html>
  );
}
