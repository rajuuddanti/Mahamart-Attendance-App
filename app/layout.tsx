import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mahamart Attendance",
  description: "Attendance management for Mahamart",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}