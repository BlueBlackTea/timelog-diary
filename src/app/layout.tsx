import type { Metadata } from "next";
import { Nanum_Pen_Script, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 손글씨 한글 폰트 — Task 항목, 본문
const nanumPen = Nanum_Pen_Script({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});

// 고딕 한글 — 날짜, 숫자 강조
const notoSansKR = Noto_Sans_KR({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Timelog Diary",
  description: "종이 다이어리 스타일 업무 시간 기록기",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${nanumPen.variable} ${notoSansKR.variable} h-full`}
    >
      <body className="min-h-full bg-paper text-ink font-gothic antialiased">
        {children}
      </body>
    </html>
  );
}
