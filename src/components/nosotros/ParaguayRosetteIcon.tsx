import type { SVGProps } from 'react';

const SCALLOP_PATH =
  'M12 2.4Q13.48 1.15 14.37 2.87Q16.22 2.29 16.38 4.22Q18.31 4.38 17.73 6.23Q19.45 7.12 18.2 8.6Q19.45 10.08 17.73 10.97Q18.31 12.82 16.38 12.98Q16.22 14.91 14.37 14.33Q13.48 16.05 12 14.8Q10.52 16.05 9.63 14.33Q7.78 14.91 7.62 12.98Q5.69 12.82 6.27 10.97Q4.55 10.08 5.8 8.6Q4.55 7.12 6.27 6.23Q5.69 4.38 7.62 4.22Q7.78 2.29 9.63 2.87Q10.52 1.15 12 2.4Z';

export default function ParaguayRosetteIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <g stroke="#17191c" strokeWidth="0.8" strokeLinejoin="round">
        
        <path d="M9.2 12 6.3 21.9l2.2-1.2 1.4 1.9 2.5-9z" fill="#D52B1E" />
        <path d="m14.8 12 2.9 9.9-2.2-1.2-1.4 1.9-2.5-9z" fill="#0038A8" />

<path d={SCALLOP_PATH} fill="#D52B1E" />
      </g>

<circle
        cx="12"
        cy="8.6"
        r="5.3"
        stroke="#9F1D14"
        strokeWidth="1.2"
        strokeDasharray="0.35 1.73"
        opacity="0.6"
      />

<circle
        cx="12"
        cy="8.6"
        r="4.2"
        fill="#FFFFFF"
        stroke="#17191c"
        strokeOpacity="0.18"
        strokeWidth="0.5"
      />

<circle cx="12" cy="8.6" r="2.5" fill="#0038A8" />

<polygon
        points="12.00,7.25 12.32,8.16 13.28,8.18 12.52,8.77 12.79,9.69 12.00,9.15 11.21,9.69 11.48,8.77 10.72,8.18 11.68,8.16"
        fill="#FFD100"
      />

<circle cx="11.1" cy="7.6" r="0.55" fill="#FFFFFF" opacity="0.45" />
    </svg>
  );
}
