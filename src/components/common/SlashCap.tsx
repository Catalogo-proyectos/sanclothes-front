

const W = 18.2;
const H = 56;

const PATHS = {
  
  start: `M${W + 1} 0.75 L${W} 0.75 L0 ${H - 0.75} L${W + 1} ${H - 0.75}`,

  end: `M-1 0.75 L${W} 0.75 L0 ${H - 0.75} L-1 ${H - 0.75}`,
};

export default function SlashCap({ side, className = '' }: { side: 'start' | 'end'; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`block h-full w-[15.6px] shrink-0 overflow-visible text-[#d0d1d2] [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.55))] sm:w-[18.2px] ${className}`}
    >
      <path
        d={PATHS[side]}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
