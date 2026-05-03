import type { Metadata } from "next";
import localFont from "next/font/local";
import { Caveat, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 한글 손글씨 폰트 — NanumDongHi (로컬)
const nanumDongHi = localFont({
  src: "../fonts/NanumDongHi.ttf",
  variable: "--font-nanum-donghi",
  display: "swap",
  weight: "400",
});

// 영문 손글씨 폰트 — Caveat (Google Fonts)
const caveat = Caveat({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-caveat",
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
      className={`${nanumDongHi.variable} ${caveat.variable} ${notoSansKR.variable} h-full`}
    >
      <body className="min-h-full bg-paper text-ink font-gothic antialiased">
        {children}
      </body>
    </html>
  );
}
