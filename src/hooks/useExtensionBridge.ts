"use client";

import { useEffect } from "react";
import { useDailyStore } from "@/store/dailyStore";

/**
 * Chrome 확장 ↔ 웹앱 브릿지
 *
 * 확장의 background.js가 타이머 종료 요청 시
 * scripting.executeScript로 'timelog:stop-timer' CustomEvent를 발송.
 * 이 훅이 그 이벤트를 받아 Zustand의 stopTimer()를 호출.
 *
 * 확장 미설치 환경(웹 브라우저, GitHub Pages)에서는 아무 동작 없음.
 */
export function useExtensionBridge() {
  const stopTimer = useDailyStore((s) => s.stopTimer);

  useEffect(() => {
    const handler = () => stopTimer();
    window.addEventListener("timelog:stop-timer", handler);
    return () => window.removeEventListener("timelog:stop-timer", handler);
  }, [stopTimer]);
}
