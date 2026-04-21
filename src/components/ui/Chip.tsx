"use client";

interface ChipProps {
  label: string;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, color, selected = true, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-0.5 rounded-full text-[11px] font-gothic font-bold transition-opacity"
      style={{ backgroundColor: color, opacity: selected ? 1 : 0.35 }}
    >
      {label}
    </button>
  );
}
