import type { ReactNode } from 'react';
import SantLogoIcon from './SantLogoIcon';

export type StatusBadgeTone = 'amber' | 'emerald' | 'sky' | 'red' | 'zinc';

const TONES: Record<StatusBadgeTone, { icon: string; ping: string; dot: string }> = {
  amber: {
    icon: 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.85)]',
    ping: 'bg-amber-400/80',
    dot: 'bg-amber-400',
  },
  emerald: {
    icon: 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.85)]',
    ping: 'bg-emerald-400/80',
    dot: 'bg-emerald-400',
  },
  sky: {
    icon: 'text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.85)]',
    ping: 'bg-sky-400/80',
    dot: 'bg-sky-400',
  },
  red: {
    icon: 'text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.85)]',
    ping: 'bg-red-400/80',
    dot: 'bg-red-400',
  },
  zinc: {
    icon: 'text-zinc-400',
    ping: 'bg-zinc-400/80',
    dot: 'bg-zinc-400',
  },
};

interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusBadgeTone;
  
  live?: boolean;
  className?: string;
}

export default function StatusBadge({ children, tone = 'amber', live = true, className = '' }: StatusBadgeProps) {
  const t = TONES[tone];

  return (
    <span
      className={`relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap border border-[#17191c] bg-[#17191c] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_2px_10px_rgba(23,25,28,0.25)] select-none ${className}`}
    >
      {live && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent motion-reduce:hidden"
          aria-hidden="true"
        />
      )}

      <SantLogoIcon
        className={`relative z-10 h-3.5 w-3.5 shrink-0 ${t.icon} ${live ? 'animate-pulse motion-reduce:animate-none' : ''}`}
      />

      <span className="relative z-10 tracking-[0.22em]">{children}</span>

      <span className="relative z-10 ml-0.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center" aria-hidden="true">
        {live && (
          <span className={`absolute inline-flex h-full w-full animate-ping opacity-75 motion-reduce:hidden ${t.ping}`} />
        )}
        <span className={`relative inline-flex h-1 w-1 ${t.dot}`} />
      </span>
    </span>
  );
}
