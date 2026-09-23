import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Monitoring — Sistem Berkas Tim",
  description: "Sistem monitoring berkas, pengumuman, dan persetujuan profil tim.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`h-full antialiased ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-[#111111]">{children}</body>
    </html>
  );
}
