// Simple illustrations drawn in code (SVG), so they follow the app's
// colours and switch with dark mode automatically. No image files needed.

type Props = { className?: string };

// A two-storey boarding house with lit windows — for the login page.
export function BoardingHouseIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="A boarding house">
      <circle cx="320" cy="70" r="34" className="fill-amber-300/80" />
      <ellipse cx="200" cy="278" rx="190" ry="14" className="fill-primary/10" />

      {/* Trees */}
      <rect x="44" y="200" width="8" height="70" rx="3" className="fill-amber-900/60" />
      <circle cx="48" cy="190" r="30" className="fill-emerald-500/70" />
      <rect x="350" y="214" width="7" height="56" rx="3" className="fill-amber-900/60" />
      <circle cx="353" cy="204" r="24" className="fill-emerald-500/60" />

      {/* House body and roof */}
      <rect x="100" y="120" width="200" height="150" rx="8" className="fill-card stroke-primary/30" strokeWidth="2" />
      <path d="M86 128 L200 56 L314 128 Z" className="fill-primary" />
      <rect x="180" y="92" width="40" height="22" rx="4" className="fill-primary-foreground/80" />

      {/* Windows: top floor */}
      {[118, 178, 238].map((x, i) => (
        <rect key={`t${x}`} x={x} y="140" width="44" height="36" rx="5"
          className={i === 1 ? "fill-secondary stroke-primary/30" : "fill-amber-200 stroke-primary/30"} strokeWidth="2" />
      ))}
      {/* Windows: ground floor */}
      <rect x="118" y="200" width="44" height="36" rx="5" className="fill-amber-200 stroke-primary/30" strokeWidth="2" />
      <rect x="238" y="200" width="44" height="36" rx="5" className="fill-secondary stroke-primary/30" strokeWidth="2" />

      {/* Door */}
      <rect x="180" y="206" width="40" height="64" rx="6" className="fill-primary/80" />
      <circle cx="211" cy="240" r="3" className="fill-amber-300" />
    </svg>
  );
}

// A bed under a window — shown on room cards that have no photo yet.
export function RoomIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="No photo yet">
      <rect width="320" height="200" className="fill-primary/10" />
      <rect x="0" y="150" width="320" height="50" className="fill-primary/15" />

      {/* Window */}
      <rect x="196" y="34" width="84" height="64" rx="6" className="fill-sky-200/80 stroke-primary/40" strokeWidth="3" />
      <line x1="238" y1="34" x2="238" y2="98" className="stroke-primary/40" strokeWidth="3" />
      <line x1="196" y1="66" x2="280" y2="66" className="stroke-primary/40" strokeWidth="3" />

      {/* Bed */}
      <rect x="40" y="96" width="14" height="70" rx="4" className="fill-primary/70" />
      <rect x="54" y="122" width="140" height="30" rx="6" className="fill-card stroke-primary/30" strokeWidth="2" />
      <rect x="60" y="108" width="40" height="18" rx="6" className="fill-secondary stroke-primary/30" strokeWidth="2" />
      <rect x="100" y="114" width="94" height="14" rx="5" className="fill-primary/50" />
      <rect x="186" y="128" width="10" height="38" rx="3" className="fill-primary/70" />

      {/* Plant */}
      <rect x="266" y="132" width="22" height="24" rx="3" className="fill-amber-700/60" />
      <circle cx="277" cy="124" r="14" className="fill-emerald-500/60" />
    </svg>
  );
}

// A house with a plus sign — for the empty dashboard.
export function AddFirstRoomIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 200 160" className={className} role="img" aria-label="No rooms yet">
      <ellipse cx="100" cy="146" rx="80" ry="8" className="fill-primary/10" />
      <rect x="45" y="70" width="110" height="74" rx="8" className="fill-card stroke-primary/30" strokeWidth="2" />
      <path d="M35 76 L100 28 L165 76 Z" className="fill-primary/80" />
      <circle cx="100" cy="106" r="22" className="fill-primary" />
      <path d="M100 95 V117 M89 106 H111" className="stroke-primary-foreground" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
