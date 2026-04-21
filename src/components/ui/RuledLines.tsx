/**
 * RuledLines — 줄 노트 배경선 컴포넌트
 *
 * 절대 위치로 부모를 꽉 채우는 순수 배경 레이어.
 * 부모는 반드시 `position: relative` + 고정 높이 또는 flex-1이어야 한다.
 *
 * 사용 예:
 *   <div className="relative flex-1">
 *     <RuledLines />
 *     <div className="relative z-10">내용</div>
 *   </div>
 */

interface RuledLinesProps {
  /** 줄 간격 (px). 기본값 28 */
  lineHeight?: number;
  /** 줄 색상. 기본값 var(--color-line) */
  lineColor?: string;
  /** 줄 굵기 (px). 기본값 1 */
  lineWidth?: number;
  /** 왼쪽 여백선 표시 여부 */
  marginLine?: boolean;
  /** 왼쪽 여백선 위치 (px). 기본값 64 */
  marginLineX?: number;
  /** 왼쪽 여백선 색상. 기본값 #EFA4B8 (핑크) */
  marginLineColor?: string;
}

export default function RuledLines({
  lineHeight = 28,
  lineColor = "var(--color-line)",
  lineWidth = 1,
  marginLine = false,
  marginLineX = 64,
  marginLineColor = "#EFA4B8",
}: RuledLinesProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: [
          // 가로 줄 (repeating-linear-gradient)
          `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent ${lineHeight - lineWidth}px,
            ${lineColor} ${lineHeight - lineWidth}px,
            ${lineColor} ${lineHeight}px
          )`,
          // 여백선 (세로)
          marginLine
            ? `linear-gradient(
                to right,
                transparent ${marginLineX - 1}px,
                ${marginLineColor}55 ${marginLineX - 1}px,
                ${marginLineColor}55 ${marginLineX}px,
                transparent ${marginLineX}px
              )`
            : null,
        ]
          .filter(Boolean)
          .join(", "),
        backgroundSize: `100% ${lineHeight}px`,
      }}
    />
  );
}
