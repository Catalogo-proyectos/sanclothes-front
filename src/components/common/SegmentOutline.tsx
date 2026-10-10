

const LINE = 'absolute border-[#d0d1d2]';

const DIAGONAL_CLIP = 'polygon(-10px 0, calc(100% + 10px) 0, calc(100% + 10px) 100%, -10px 100%)';

function Diagonal({ className }: { className: string }) {
  
  return (
    <svg
      viewBox="0 0 18.2 56"
      preserveAspectRatio="none"
      style={{ clipPath: DIAGONAL_CLIP }}
      className={`absolute inset-y-0 h-full w-[var(--s)] overflow-visible text-[#d0d1d2] ${className}`}
    >
      <path d="M19.175 -3 -0.975 59" fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function SegmentOutline({ kind }: { kind: 'start' | 'middle' | 'end' }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.55))]">
      {kind === 'start' && (
        <>
          <span className={`${LINE} inset-y-0 left-0 right-[calc(var(--s)-1.5px)] rounded-l-[10px] border-y-[1.5px] border-l-[1.5px] border-r-[1.5px] border-r-transparent`} />
          <span className={`${LINE} inset-y-0 right-0 w-[var(--s)] border-t-[1.5px]`} />
          <Diagonal className="right-0" />
        </>
      )}
      {kind === 'middle' && (
        <>
          <span className={`${LINE} inset-y-0 left-[var(--s)] right-0 border-t-[1.5px]`} />
          <span className={`${LINE} inset-y-0 left-0 right-[var(--s)] border-b-[1.5px]`} />
          <Diagonal className="left-0" />
          <Diagonal className="right-0" />
        </>
      )}
      {kind === 'end' && (
        <>
          <span className={`${LINE} inset-y-0 left-[calc(var(--s)-1.5px)] right-0 rounded-r-[10px] border-y-[1.5px] border-l-[1.5px] border-l-transparent border-r-[1.5px]`} />
          <span className={`${LINE} inset-y-0 left-0 w-[var(--s)] border-b-[1.5px]`} />
          <Diagonal className="left-0" />
        </>
      )}
    </span>
  );
}
