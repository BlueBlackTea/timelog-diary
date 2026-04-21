import { useRef, useState, useEffect } from "react";

/**
 * ResizeObserver 훅
 *
 * ref를 요소에 붙이면 contentRect.width를 실시간으로 반환한다.
 * Highlighter의 width prop 실측에 사용.
 *
 * 사용 예:
 *   const { ref, width } = useResizeObserver<HTMLSpanElement>();
 *   return (
 *     <div className="relative" style={{ height: 20 }}>
 *       <span ref={ref} className="relative z-10">{text}</span>
 *       <Highlighter width={width} ... />
 *     </div>
 *   );
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 마운트 직후 초기값 측정
    setWidth(el.getBoundingClientRect().width);

    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
