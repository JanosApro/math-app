/**
 * Topic icons (inline SVG, currentColor). Names are used in topics.json ("icon").
 * PLACEHOLDER SET — task 01 replaces the drawings; keep the component API:
 *   <TopicIcon name="triangle" size={28} />
 */
export function TopicIcon({ name, size = 28 }: { name?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon={name}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}
