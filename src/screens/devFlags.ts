/**
 * Developer switches for testing the map (dev builds only; ignored in production).
 *
 *   localStorage.setItem('matek-kaland:dev-open-all', '1')   // then reload
 *
 * makes every "todo" subtopic look openable ON THE MAP, so all node states (done, recommended,
 * available, soft-locked) and the soft-lock dialog can be tried before the content exists.
 * Opening such a lesson shows the lesson player's "készül" screen. Remove the key to switch off.
 */
import type { GradeTopics } from '../engine/types';

export const DEV_OPEN_ALL_KEY = 'matek-kaland:dev-open-all';

export function devOpenAll(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return window.localStorage.getItem(DEV_OPEN_ALL_KEY) === '1';
  } catch {
    return false;
  }
}

const cache = new WeakMap<GradeTopics, GradeTopics>();

/** A copy of the catalog where every todo subtopic is treated as draft (stable per input). */
export function withAllOpen(g: GradeTopics): GradeTopics {
  let out = cache.get(g);
  if (!out) {
    out = {
      ...g,
      topics: g.topics.map((tp) => ({
        ...tp,
        subtopics: tp.subtopics.map((s) => (s.status === 'todo' ? { ...s, status: 'draft' as const } : s)),
      })),
    };
    cache.set(g, out);
  }
  return out;
}
