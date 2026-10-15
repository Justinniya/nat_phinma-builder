// Simple illustrations drawn in code (SVG), in shades of the app's blue,
// so they match the theme and switch with dark mode. No image files needed.

type Props = { className?: string };

// A bed under a window — shown on room cards that have no photo yet.
export function RoomIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label="No photo yet">
      <rect width="320" height="200" className="fill-primary/5" />
      <rect x="0" y="152" width="320" height="48" className="fill-primary/10" />

      {/* Window */}
      <rect x="200" y="36" width="80" height="62" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="2" />
      <line x1="240" y1="36" x2="240" y2="98" className="stroke-primary/30" strokeWidth="2" />
      <line x1="200" y1="67" x2="280" y2="67" className="stroke-primary/30" strokeWidth="2" />

      {/* Bed */}
      <rect x="44" y="98" width="12" height="68" rx="3" className="fill-primary/40" />
      <rect x="56" y="124" width="136" height="28" rx="5" className="fill-card stroke-primary/25" strokeWidth="2" />
      <rect x="62" y="110" width="38" height="16" rx="5" className="fill-card stroke-primary/25" strokeWidth="2" />
      <rect x="100" y="116" width="92" height="12" rx="4" className="fill-primary/30" />
      <rect x="184" y="130" width="10" height="36" rx="3" className="fill-primary/40" />
    </svg>
  );
}

// A house with a plus sign — for the empty dashboard.
export function AddFirstRoomIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 200 160" className={className} role="img" aria-label="No rooms yet">
      <ellipse cx="100" cy="146" rx="70" ry="6" className="fill-primary/10" />
      <rect x="48" y="70" width="104" height="72" rx="6" className="fill-card stroke-primary/25" strokeWidth="2" />
      <path d="M38 76 L100 30 L162 76 Z" className="fill-primary/20" />
      <circle cx="100" cy="106" r="20" className="fill-primary" />
      <path d="M100 96 V116 M90 106 H110" className="stroke-primary-foreground" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
