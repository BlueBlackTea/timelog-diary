/**
 * Highlighter — 형광펜 효과 SVG 컴포넌트
 *
 * plan.md 스펙:
 *  - rect 3개 겹침: [연한 배경] + [왼쪽 캡 14px] + [오른쪽 캡 14px]
 *  - skewX(-2.5) 기울기
 *  - feTurbulence + feDisplacementMap 가장자리 번짐
 *  - gradientUnits="userSpaceOnUse" 사용 금지 (기본값 objectBoundingBox 사용)
 *  - filter seed: id 해시 기반 고정 (새로고침 후에도 동일한 번짐)
 *  - completed: 전체 opacity 0.45
 *
 * 사용 예:
 *   <Highlighter color={task.color} width={measuredWidth} completed={task.completed} id={task.id} />
 *
 * width는 부모 컨테이너를 ResizeObserver로 실측 후 전달할 것.
 */

interface HighlighterProps {
  /** 형광펜 색상 (hex) */
  color: string;
  /** 실측 너비 (px) — ResizeObserver로 측정한 값 */
  width: number;
  /** 완료 여부 — true 시 opacity 0.45 */
  completed?: boolean;
  /**
   * Task ID 등 고유 식별자 — feTurbulence seed 고정에 사용.
   * 생략 시 seed=0 (모든 인스턴스 동일한 번짐 패턴)
   */
  id?: string;
}

/** 문자열 → 0~999 정수 해시 (feTurbulence seed 용) */
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 1000;
}

const HEIGHT = 20;
const CAP = 14;

export default function Highlighter({
  color,
  width,
  completed = false,
  id = "",
}: HighlighterProps) {
  const seed = id ? hashSeed(id) : 0;
  // 같은 페이지 내 여러 인스턴스가 ID를 공유하지 않도록 접두사로 분리
  const uid = `hl-${seed}-${id.slice(-4) || "0"}`;

  // width가 0이면 렌더링 생략 (ResizeObserver 초기값 방어)
  if (width <= 0) return null;

  const capRX = Math.max(0, width - CAP);

  return (
    <svg
      aria-hidden
      width={width}
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      overflow="visible"
      style={{ opacity: completed ? 0.45 : 1 }}
      className="pointer-events-none absolute inset-0"
    >
      <defs>
        {/* 왼쪽 캡 그라데이션: 진함 → 투명 */}
        <linearGradient id={`${uid}-cap-l`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color} stopOpacity={0.62} />
          <stop offset="62%"  stopColor={color} stopOpacity={0.44} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>

        {/* 오른쪽 캡 그라데이션: 투명 → 진함 */}
        <linearGradient id={`${uid}-cap-r`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color} stopOpacity={0} />
          <stop offset="38%"  stopColor={color} stopOpacity={0.44} />
          <stop offset="100%" stopColor={color} stopOpacity={0.62} />
        </linearGradient>

        {/* 가장자리 번짐 필터 — seed 고정으로 새로고침 후에도 동일한 패턴 */}
        <filter id={`${uid}-noise`} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={4}
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* rect 3개 겹침 + skewX(-2.5) + 번짐 필터 */}
      <g filter={`url(#${uid}-noise)`} transform="skewX(-2.5)">
        {/* 연한 배경 — 전체 너비 */}
        <rect
          x={0}
          width={width}
          height={HEIGHT}
          rx={2}
          fill={color}
          fillOpacity={0.26}
        />
        {/* 왼쪽 캡 14px */}
        <rect
          x={0}
          width={CAP}
          height={HEIGHT}
          rx={2}
          fill={`url(#${uid}-cap-l)`}
        />
        {/* 오른쪽 캡 14px */}
        <rect
          x={capRX}
          width={CAP}
          height={HEIGHT}
          rx={2}
          fill={`url(#${uid}-cap-r)`}
        />
      </g>
    </svg>
  );
}
