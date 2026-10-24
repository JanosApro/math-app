/**
 * Topic icons (inline SVG, `currentColor`). Names are used in topics.json ("icon").
 *
 *   <TopicIcon name="triangle" size={28} />
 *
 * All drawings use a 24×24 grid, 2 px round strokes and an optional soft fill
 * (`currentColor` at low opacity), so they work on any background and in dark mode.
 * Unknown or missing names fall back to a generic "math" icon (+ − × ÷).
 * To add an icon: add an entry to ICONS with the same name you use in topics.json.
 */
import type { ReactNode } from 'react';

/** Soft fill used for "inside" areas. */
const soft = { fill: 'currentColor', fillOpacity: 0.18, stroke: 'none' } as const;

const ICONS: Record<string, ReactNode> = {
  // Natural numbers: 1 2 3 on a counting line
  numbers: (
    <>
      <path d="M3.5 8.5 6 6.5v9" />
      <path d="M9.5 8.2c.3-1.1 1.2-1.7 2.3-1.7 1.3 0 2.2.9 2.2 2 0 1.8-2.4 3.4-4.5 7h4.6" />
      <path d="M16.6 7h3.6l-2.2 3c1.4 0 2.6.8 2.6 2.3 0 1.6-1.2 2.4-2.6 2.4-.9 0-1.6-.3-2.1-.9" />
      <path d="M3 19.5h18" />
    </>
  ),
  // Basic geometry: point, segment, ray, angle
  shapes: (
    <>
      <rect x="3.5" y="12.5" width="8" height="8" rx="1" {...soft} />
      <rect x="3.5" y="12.5" width="8" height="8" rx="1" />
      <circle cx="16.5" cy="16.5" r="4" />
      <path d="M11 3.5 15.5 11h-9z" {...soft} />
      <path d="M11 3.5 15.5 11h-9z" />
    </>
  ),
  // Divisibility: ÷
  divide: (
    <>
      <circle cx="12" cy="12" r="9" {...soft} />
      <path d="M7 12h10" />
      <circle cx="12" cy="7.8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16.2" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Fractions: a pie with three quarters shaded
  fraction: (
    <>
      <path d="M11 13V5a8 8 0 1 0 8 8z" {...soft} />
      <path d="M11 13V5a8 8 0 1 0 8 8zM3 13h8v8" />
      <path d="M13 11V3a8 8 0 0 1 8 8z" fill="currentColor" fillOpacity={0.45} />
    </>
  ),
  // Angles: two rays and an arc
  angle: (
    <>
      <path d="M4 19 20 19M4 19 15.5 5" />
      <path d="M10.5 19a6.5 6.5 0 0 0-2.4-5" />
      <circle cx="4" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  // Reflection: dashed axis, a shape and its mirror image
  mirror: (
    <>
      <path d="M12 2.5v19" strokeDasharray="2 2.6" />
      <path d="M9 6 3.5 17H9z" {...soft} />
      <path d="M9 6 3.5 17H9z" />
      <path d="M15 6l5.5 11H15z" />
    </>
  ),
  // Percent
  percent: (
    <>
      <path d="M18.5 5.5 5.5 18.5" />
      <circle cx="7" cy="7" r="2.7" {...soft} />
      <circle cx="7" cy="7" r="2.7" />
      <circle cx="17" cy="17" r="2.7" {...soft} />
      <circle cx="17" cy="17" r="2.7" />
    </>
  ),
  // Square root
  root: (
    <>
      <path d="M2.5 13.5h2.7l3.3 6.5L13 4h8.5" />
      <path d="M14.5 9.5l4.5 6M19 9.5l-4.5 6" />
    </>
  ),
  // Right triangle (Pythagoras)
  triangle: (
    <>
      <path d="M4 20V5l15 15z" {...soft} />
      <path d="M4 20V5l15 15z" />
      <path d="M4 15.5h4.5V20" />
    </>
  ),
  // Algebraic expressions: x²
  algebra: (
    <>
      <path d="M3.5 8.5 12 19.5M12 8.5 3.5 19.5" />
      <path d="M15 6.3c.2-1.2 1.1-1.8 2.2-1.8 1.2 0 2 .8 2 1.8 0 1.5-2 2.6-4 5.2h4.4" />
    </>
  ),
  // Polygons: a regular hexagon with a diagonal
  polygon: (
    <>
      <path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z" {...soft} />
      <path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z" />
      <path d="M4 7.4 20 16.6" strokeDasharray="2 2.2" />
    </>
  ),
  // Circle: radius from the center
  circle: (
    <>
      <circle cx="12" cy="12" r="9" {...soft} />
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 18.4 5.6" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Data: bar chart
  chart: (
    <>
      <path d="M3.5 3.5v17h17" />
      <rect x="7" y="12" width="3" height="6" rx="0.6" {...soft} />
      <rect x="7" y="12" width="3" height="6" rx="0.6" />
      <rect x="12" y="6.5" width="3" height="11.5" rx="0.6" {...soft} />
      <rect x="12" y="6.5" width="3" height="11.5" rx="0.6" />
      <rect x="17" y="9.5" width="3" height="8.5" rx="0.6" />
    </>
  ),
  // Similarity: a small and a big triangle with the same shape
  similar: (
    <>
      <path d="M2.5 19.5 6.5 12l4 7.5z" {...soft} />
      <path d="M2.5 19.5 6.5 12l4 7.5z" />
      <path d="M9.5 19.5 15.5 4.5l6 15z" />
    </>
  ),
  // Point, line and plane: a plane pierced by a line
  plane: (
    <>
      <path d="M7 7.5h14l-4 9H3z" {...soft} />
      <path d="M7 7.5h14l-4 9H3z" />
      <path d="M12 2.5v6.5M12 14v7.5" />
      <path d="M12 9.6v3.2" strokeDasharray="1 2" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Equations: a balance scale
  equation: (
    <>
      <path d="M12 4v15.5M7.5 20h9M4.5 6.5h15" />
      <path d="M4.5 6.5 2 12.5h5z" {...soft} />
      <path d="M4.5 6.5 2 12.5h5zM19.5 6.5l-2.5 6h5z" />
      <circle cx="12" cy="4" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  // Prism: a box in oblique projection, hidden edges dashed
  prism: (
    <>
      <path d="M3.5 9h11v11h-11z" {...soft} />
      <path d="M3.5 9h11v11h-11zM3.5 9 8 4.5h11L14.5 9M19 4.5v11l-4.5 4.5" />
      <path d="M8 4.5v11h11M8 15.5 3.5 20" strokeDasharray="1.6 2" />
    </>
  ),
  // Pyramid: square base, apex on top, hidden edges dashed
  pyramid: (
    <>
      <path d="M12 3 3.5 17.5l6.5 3z" {...soft} />
      <path d="M12 3 3.5 17.5l6.5 3 10.5-4zM10 20.5 12 3" />
      <path d="M3.5 17.5 14 14.5l6.5 2" strokeDasharray="1.6 2" />
    </>
  ),
  // Linear function: axes and a line
  function: (
    <>
      <path d="M3 12h18M12 3v18" strokeOpacity={0.55} />
      <path d="M4 19.5 19.5 4" />
      <circle cx="8" cy="15.6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="7.6" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  // Systems of equations: two lines meeting in one point
  system: (
    <>
      <path d="M3.5 3.5v17h17" strokeOpacity={0.55} />
      <path d="M6 18 20 5M6 9l14 6" />
      <circle cx="12.6" cy="11.8" r="3.2" {...soft} />
      <circle cx="12.6" cy="11.8" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  // Cylinder (also used for cone/sphere chapters)
  cylinder: (
    <>
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" {...soft} />
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 18c0-1.7 3.1-3 7-3s7 1.3 7 3" strokeDasharray="1.6 2" />
    </>
  ),
  // Extra names that are handy for future topics
  cone: (
    <>
      <path d="M12 3 4.5 18c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3z" {...soft} />
      <path d="M12 3 4.5 18c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3L12 3" />
      <path d="M4.5 18c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3" strokeDasharray="1.6 2" />
    </>
  ),
  sphere: (
    <>
      <circle cx="12" cy="12" r="9" {...soft} />
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12c0 1.9 4 3.4 9 3.4s9-1.5 9-3.4" />
      <path d="M3 12c0-1.9 4-3.4 9-3.4s9 1.5 9 3.4" strokeDasharray="1.6 2" />
    </>
  ),
  coordinate: (
    <>
      <path d="M3 12h18M12 3v18" />
      <path d="M17 7v5M17 7h-5" strokeDasharray="1.4 1.8" />
      <circle cx="17" cy="7" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
};

const FALLBACK: ReactNode = (
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" {...soft} />
    <path d="M7.5 6v5M5 8.5h5M14 8.5h5M5.5 15l4 4M9.5 15l-4 4M14 17h5" />
    <circle cx="16.5" cy="14.6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="19.4" r="0.9" fill="currentColor" stroke="none" />
  </>
);

/** Icon names that have a drawing (anything else renders the fallback). */
export const TOPIC_ICON_NAMES = Object.keys(ICONS);

export function TopicIcon({ name, size = 28 }: { name?: string; size?: number }) {
  const drawing = (name && ICONS[name]) || FALLBACK;
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
      data-icon={name}
      className="topic-icon"
    >
      {drawing}
    </svg>
  );
}
