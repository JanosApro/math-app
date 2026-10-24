/**
 * Onboarding illustration: a dashed adventure trail across squared paper, with floating
 * geometric shapes and math symbols. Pure SVG shapes, colors from theme tokens (see
 * Onboarding.css `.wa-*`), gentle CSS float animations (disabled with reduced motion).
 */
export function WelcomeArt() {
  return (
    <svg className="wa" viewBox="0 0 340 220" role="img" aria-hidden="true" focusable="false">
      {/* trail */}
      <path className="wa-trail" d="M28 196c40 0 52-46 92-46s46 34 86 30 30-62 70-70 32-40 38-62" />
      <circle className="wa-node wa-c-blue" cx="28" cy="196" r="10" />
      <circle className="wa-node wa-c-pink" cx="120" cy="150" r="10" />
      <circle className="wa-node wa-c-green" cx="206" cy="180" r="10" />
      <circle className="wa-node wa-c-violet" cx="276" cy="110" r="10" />
      {/* goal star */}
      <g className="wa-float wa-d2">
        <path
          className="wa-star"
          d="M314 22l6.2 12.6 13.9 2-10 9.8 2.4 13.8-12.5-6.6-12.4 6.6 2.4-13.8-10-9.8 13.8-2z"
        />
      </g>
      {/* floating shapes */}
      <g className="wa-float wa-d1">
        <path className="wa-shape wa-c-orange" d="M52 30 82 82H22z" />
      </g>
      <g className="wa-float wa-d3">
        <circle className="wa-shape wa-c-teal" cx="170" cy="58" r="24" />
        <path className="wa-line" d="M170 58l17-17" />
        <circle className="wa-dot" cx="170" cy="58" r="3" />
      </g>
      <g className="wa-float wa-d2">
        <rect className="wa-shape wa-c-yellow" x="226" y="134" width="40" height="40" rx="6" transform="rotate(-12 246 154)" />
      </g>
      <g className="wa-float wa-d4">
        <path className="wa-glyph" d="M104 92h22M110 92v18M120 92v14c0 3 2 4 5 3" />
      </g>
      {/* plus / times / root glyphs */}
      <path className="wa-glyph wa-float wa-d3" d="M248 44v18M239 53h18" />
      <path className="wa-glyph wa-float wa-d1" d="M30 116l12 12M42 116l-12 12" />
      <path className="wa-glyph wa-float wa-d4" d="M296 168h6l6 14 10-30h14" />
      <path className="wa-glyph wa-float wa-d2" d="M74 186h16M74 194h16" />
    </svg>
  );
}
