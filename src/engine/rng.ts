/**
 * Seeded random number generator. The same seed always gives the same sequence,
 * so the same seed always produces the same exercise (the daily challenge relies on this).
 *
 * Content authors: only use the `rng` passed to your generator. Never use Math.random().
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  /** Integer in [min, max] that is not in `except`. */
  intExcept(min: number, max: number, except: readonly number[]): number;
  /** Random element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** k different elements (k ≤ items.length), in random order. */
  sample<T>(items: readonly T[], k: number): T[];
  /** A shuffled copy. */
  shuffle<T>(items: readonly T[]): T[];
  /** true with probability p. */
  chance(p: number): boolean;
  /** -1 or +1. */
  sign(): 1 | -1;
  /** A new independent generator derived from this one and a label. */
  fork(label: string): Rng;
}

/** 32-bit string hash (cyrb53 folded to 32 bits). */
export function hashString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}

export function createRng(seed: number | string): Rng {
  let state = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  // mulberry32
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new Error(`rng.int: invalid range [${min}, ${max}]`);
    }
    return min + Math.floor(next() * (max - min + 1));
  };

  const rng: Rng = {
    next,
    int,
    intExcept(min, max, except) {
      const allowed: number[] = [];
      for (let v = min; v <= max; v++) if (!except.includes(v)) allowed.push(v);
      if (allowed.length === 0) throw new Error(`rng.intExcept: nothing left in [${min}, ${max}]`);
      return allowed[int(0, allowed.length - 1)];
    },
    pick(items) {
      if (items.length === 0) throw new Error('rng.pick: empty array');
      return items[int(0, items.length - 1)];
    },
    sample(items, k) {
      if (k > items.length) throw new Error(`rng.sample: k=${k} > ${items.length}`);
      return rng.shuffle(items).slice(0, k);
    },
    shuffle(items) {
      const a = items.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = int(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    chance(p) {
      return next() < p;
    },
    sign() {
      return next() < 0.5 ? -1 : 1;
    },
    fork(label) {
      return createRng(hashString(`${state}:${label}`));
    },
  };
  return rng;
}
