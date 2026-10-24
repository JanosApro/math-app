/**
 * Small inline SVG icons used by the app shell (navigation, XP) and the app logo.
 * All use currentColor unless noted, 24×24 grid, round 2 px strokes.
 */
import type { ReactNode } from 'react';

function Svg({ size = 24, children, className }: { size?: number; children: ReactNode; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export type NavIconName = 'map' | 'daily' | 'profile' | 'settings';

export function NavIcon({ name, size = 24 }: { name: NavIconName; size?: number }) {
  switch (name) {
    case 'map':
      return (
        <Svg size={size}>
          <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" fill="currentColor" fillOpacity={0.14} />
          <path d="M9 4v13.5M15 6.5V20" />
        </Svg>
      );
    case 'daily':
      return (
        <Svg size={size}>
          <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" fill="currentColor" fillOpacity={0.14} />
        </Svg>
      );
    case 'profile':
      return (
        <Svg size={size}>
          <circle cx="12" cy="8.5" r="4" fill="currentColor" fillOpacity={0.14} />
          <path d="M4.5 20.5c1-3.8 4-5.6 7.5-5.6s6.5 1.8 7.5 5.6" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg size={size}>
          <path d="M4 7h8.5M17.5 7H20M4 17h2.5M11.5 17H20" />
          <circle cx="15" cy="7" r="2.5" fill="currentColor" fillOpacity={0.14} />
          <circle cx="9" cy="17" r="2.5" fill="currentColor" fillOpacity={0.14} />
        </Svg>
      );
  }
}

/** Four-pointed sparkle used for XP. */
export function XpIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="xp-icon">
      <path d="M12 2.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5z" fill="currentColor" />
      <circle cx="19" cy="18.5" r="2" fill="currentColor" opacity={0.6} />
    </svg>
  );
}

/** Trophy (chapter done). */
export function TrophyIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" fillOpacity={0.25} />
      <path d="M7 6H4.5v1.5A3 3 0 0 0 7.5 10.5M17 6h2.5v1.5a3 3 0 0 1-3 3M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z" />
    </Svg>
  );
}

export function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg size={size}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" fillOpacity={0.18} />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.5v2" />
    </Svg>
  );
}

export function CheckIcon({ size = 20, strokeWidth = 3 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5 10 17.5 19.5 7" />
    </svg>
  );
}

export function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor" />
    </svg>
  );
}

/** "Coming soon": an hourglass. */
export function SoonIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 4.5-8 8.5s8 4 8 8.5" />
    </Svg>
  );
}

/** Small flag used as the "planned pace" marker of the year goal. */
export function FlagIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M6 21V4" />
      <path d="M6 4.5h11l-2.5 4 2.5 4H6" fill="currentColor" fillOpacity={0.35} />
    </Svg>
  );
}

/**
 * The app logo: a winding trail of checkpoints drawn as a big "M", ending in a star.
 * Same drawing as public/icon.svg. Uses its own colors (it is a logo).
 */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="app-logo">
      <defs>
        <linearGradient id="mk-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6c5cff" />
          <stop offset="1" stopColor="#4433d1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#mk-logo-bg)" />
      <path d="M13 47 21 19l11 19 11-19 8 28" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="47" r="5" fill="#ff8a4c" stroke="#fff" strokeWidth="2.5" />
      <circle cx="32" cy="38" r="4.5" fill="#fff" />
      <path d="M51 38.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#ffd23f" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
