import type { Figure } from '../../figures/types';

/** One example in the /dev figure gallery. */
export interface GalleryEntry {
  /** Short title shown above the figure. */
  title: string;
  figure: Figure;
  /** What this example demonstrates (edge case, option, …). */
  note?: string;
}

export interface GallerySection {
  /** Section title, e.g. 'Háromszög (triangle)'. */
  title: string;
  /** Figure type(s) shown, for the index. */
  types: string[];
  entries: GalleryEntry[];
}
