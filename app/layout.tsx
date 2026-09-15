import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillVerse | AI Learning & Assessment Platform",
  description: "SkillVerse high-contrast AI-driven coding and skill evaluation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#0A0A0C] text-[#F9FAFB] relative overflow-x-hidden selection:bg-[#00F2FE]/20 selection:text-[#00F2FE]">
        {/* Subtle grid texture overlay across canvas */}
        <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-40 z-0" />

        {/* Ambient background glow: cyan top-left, violet bottom-right */}
        <div className="fixed -top-36 -left-36 w-[420px] h-[420px] bg-[#00F2FE] rounded-full blur-[130px] opacity-10 pointer-events-none z-0" />
        <div className="fixed -bottom-36 -right-36 w-[420px] h-[420px] bg-[#9B51E0] rounded-full blur-[130px] opacity-10 pointer-events-none z-0" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#00F2FE]/5 rounded-full blur-[160px] pointer-events-none z-0" />

        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
