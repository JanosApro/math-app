/**
 * 5. osztály › Mértani alapfogalmak › 2. Az egyenesek kölcsönös helyzete a síkban. A sík részei
 *
 * Geometry lesson: intersecting and parallel lines, the unique parallel through a point
 * (two set squares), transitivity, half-planes, the regions cut out by 2–4 lines, and
 * triangles / parallelograms as plane regions. Every figure is built from the same line
 * configuration as the question; the intersection and region counts are computed from it.
 */
import {
  article,
  defineSubtopic,
  num,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: lines, intersections, regions, figures
// ---------------------------------------------------------------------------------------------

/** An infinite line given by two points and its name (p, q, r, s). */
type LineDef = { a: XY; b: XY; label: string };

const at = (x: number, y: number): XY => [x, y];

/** Hungarian article before a line name: p = pé → a, q = kú → a, r = er → az, s = ess → az. */
const VOWEL_LINE = new Set(['r', 's', 'e', 'f']);
const lineArt = (name: string) => (VOWEL_LINE.has(name) ? 'az' : 'a');
const LineArt = (name: string) => (VOWEL_LINE.has(name) ? 'Az' : 'A');

/** Intersection of two infinite lines, or null when they are parallel. */
function lineIntersection(l1: LineDef, l2: LineDef): XY | null {
  const [x1, y1] = l1.a;
  const [x2, y2] = l1.b;
  const [x3, y3] = l2.a;
  const [x4, y4] = l2.b;
  const d1x = x2 - x1;
  const d1y = y2 - y1;
  const d2x = x4 - x3;
  const d2y = y4 - y3;
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / den;
  return [x1 + t * d1x, y1 + t * d1y];
}

const pointKey = (p: XY) => `${Math.round(p[0] * 1000)}:${Math.round(p[1] * 1000)}`;

/** Every distinct intersection point of the lines (parallel pairs contribute none). */
function intersectionPoints(lines: LineDef[]): XY[] {
  const out: XY[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const p = lineIntersection(lines[i], lines[j]);
      if (!p) continue;
      const key = pointKey(p);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(p);
      }
    }
  }
  return out;
}

/** How many new regions the i-th line creates when added to the previous ones. */
function newRegions(lines: LineDef[], i: number): number {
  const keys = new Set<string>();
  for (let j = 0; j < i; j++) {
    const p = lineIntersection(lines[i], lines[j]);
    if (p) keys.add(pointKey(p));
  }
  return keys.size + 1;
}

/** Number of regions the lines cut the plane into. */
function regionCount(lines: LineDef[]): number {
  let regions = 1;
  for (let i = 0; i < lines.length; i++) regions += newRegions(lines, i);
  return regions;
}

/** The parallel pairs among the lines, as pairs of names. */
function parallelPairs(lines: LineDef[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      if (!lineIntersection(lines[i], lines[j])) out.push([lines[i].label, lines[j].label]);
    }
  }
  return out;
}

/** A figure drawn from a line configuration; optional marked intersection point. */
function linesFigure(lines: LineDef[], mark?: { at: XY; label?: string; dir?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' }): Figure {
  const points: Record<string, XY> = {
    C1: at(0, 0),
    C2: at(10, 7),
    C3: at(0, 7),
    C4: at(10, 0),
  };
  const items: GeoItem[] = [];
  lines.forEach((l, i) => {
    points[`L${i}a`] = l.a;
    points[`L${i}b`] = l.b;
    items.push({ kind: 'line', through: [`L${i}a`, `L${i}b`], label: l.label });
  });
  if (mark) {
    points.M = mark.at;
    items.push({ kind: 'point', at: 'M', label: mark.label ?? 'M', labelDir: mark.dir ?? 'ne' });
  }
  return { type: 'geometry', points, items };
}

// --- line configurations ---------------------------------------------------------------------

const horizontal = (y: number): [XY, XY] => [at(0, y), at(10, y)];
const vertical = (x: number): [XY, XY] => [at(x, 0), at(x, 7)];
const line = (label: string, a: XY, b: XY): LineDef => ({ a, b, label });

/** p ∥ q, r vertical through both. */
function tripleVertical(): { lines: LineDef[]; M: XY } {
  return { lines: [line('p', ...horizontal(2)), line('q', ...horizontal(5)), line('r', ...vertical(6))], M: at(6, 2) };
}

/** p ∥ q, slanted pieces; r horizontal. */
function tripleSlanted(): { lines: LineDef[]; M: XY } {
  return {
    lines: [line('p', at(0, 1), at(8, 5)), line('q', at(0, 3.5), at(7, 7)), line('r', at(0, 2.5), at(10, 2.5))],
    M: at(3, 2.5),
  };
}

/** p ∥ q vertical; r slanted. */
function tripleVerticals(): { lines: LineDef[]; M: XY } {
  return { lines: [line('p', ...vertical(3)), line('q', ...vertical(7)), line('r', at(0, 0.5), at(10, 5.5))], M: at(3, 2) };
}

/** Three lines in general position, all intersections inside the picture. */
function threeGeneral(): LineDef[] {
  return [
    line('p', at(0, 1), at(10, 4)),
    line('q', at(0, 6), at(10, 1.5)),
    line('r', at(2, 0), at(7, 8)),
  ];
}

/** Two parallels and a transversal. */
function threeOneParallel(): LineDef[] {
  return [line('p', ...horizontal(1.5)), line('q', ...horizontal(5.5)), line('r', ...vertical(5))];
}

/** Three lines through one point. */
function threeConcurrent(): LineDef[] {
  return [
    line('p', ...horizontal(3.5)),
    line('q', at(1.5, 0), at(8.5, 7)),
    line('r', at(1.5, 7), at(8.5, 0)),
  ];
}

/** Three parallel lines. */
function threeParallel(): LineDef[] {
  return [line('p', ...horizontal(1.5)), line('q', ...horizontal(3.5)), line('r', ...horizontal(5.5))];
}

/** Four lines in general position (no parallels, no three through one point). */
function fourGeneral(): LineDef[] {
  return [
    line('p', ...horizontal(2)),
    line('q', at(1, 0), at(8, 7)),
    line('r', at(0, 7), at(7, 0)),
    line('s', at(0, 0.2), at(10, 3.2)),
  ];
}

/** Four lines: one parallel pair plus two transversals. */
function fourOneParallel(): LineDef[] {
  return [
    line('p', ...horizontal(1.5)),
    line('q', ...horizontal(5.5)),
    line('r', ...vertical(5)),
    line('s', at(0, 0), at(10, 7)),
  ];
}

/** Four lines: two parallel pairs (a grid). */
function fourTwoParallel(): LineDef[] {
  return [line('p', ...horizontal(1.5)), line('q', ...horizontal(5.5)), line('r', ...vertical(3.5)), line('s', ...vertical(7))];
}

/** Four parallel lines. */
function fourParallel(): LineDef[] {
  return [line('p', ...horizontal(0.9)), line('q', ...horizontal(2.7)), line('r', ...horizontal(4.5)), line('s', ...horizontal(6.3))];
}

/** Four lines through one point. */
function fourConcurrent(): LineDef[] {
  return [
    line('p', ...horizontal(3.5)),
    line('q', at(1.5, 0), at(8.5, 7)),
    line('r', at(1.5, 7), at(8.5, 0)),
    line('s', ...vertical(5)),
  ];
}

/** Three concurrent lines and a transversal that avoids their common point. */
function fourThreeConcurrent(): LineDef[] {
  return [...threeConcurrent(), line('s', ...vertical(8))];
}

// --- static figures --------------------------------------------------------------------------

const twoLinesFigure: Figure = linesFigure([line('p', ...horizontal(2.5)), line('q', at(0, 1), at(10, 5))], {
  at: at(3.75, 2.5),
  label: 'M',
  dir: 'ne',
});

const parallelFigure: Figure = linesFigure([line('p', ...horizontal(2)), line('q', ...horizontal(4.8))]);

const halfPlaneFigure: Figure = {
  type: 'geometry',
  points: { E1: at(0, 3), E2: at(10, 3), A: at(4, 5), B: at(4, 1) },
  items: [
    { kind: 'region', points: ['E1', 'E2', at(10, 7), at(0, 7)], fill: 'accent' },
    { kind: 'line', through: ['E1', 'E2'], label: 'p' },
    { kind: 'point', at: 'A', labelDir: 'n' },
    { kind: 'point', at: 'B', labelDir: 's' },
  ],
};

const triangleRegion: Figure = {
  type: 'geometry',
  points: { A: at(0, 0), B: at(5.5, 0), C: at(2, 3.6) },
  items: [{ kind: 'polygon', points: ['A', 'B', 'C'], fill: 'accent', sideLabels: ['AB', 'BC', 'CA'] }],
};

const parallelogramRegion: Figure = {
  type: 'geometry',
  points: { A: at(0, 0), B: at(6, 0), C: at(7.6, 3.2), D: at(1.6, 3.2) },
  items: [{ kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: 'accent', sideLabels: ['AB', 'BC', 'CD', 'DA'] }],
};

/** A triangle and a parallelogram side by side: the two plane regions of the lesson. */
const shapePairFigure: Figure = {
  type: 'geometry',
  points: {
    K: at(0, 0),
    L: at(4.2, 0),
    M: at(1.6, 3.1),
    A: at(6.9, 0),
    B: at(11.9, 0),
    C: at(13.2, 2.9),
    D: at(8.2, 2.9),
  },
  items: [
    { kind: 'polygon', points: ['K', 'L', 'M'], fill: 'accent' },
    { kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: 'accent' },
  ],
};

/** The parallel through P with two set squares, shown step by step. */
const parallelConstruction: Figure = {
  type: 'construction',
  points: {
    E1: at(0, 1),
    E2: at(9, 1),
    P: at(4.5, 4.2),
    S1: at(2, 1),
    S2: at(5, 1),
    S3: at(2, 3.4),
    S1b: at(2, 4.2),
    S2b: at(5, 4.2),
    S3b: at(2, 6.6),
  },
  given: [
    { kind: 'line', through: ['E1', 'E2'], label: 'p' },
    { kind: 'point', at: 'P' },
  ],
  steps: [
    {
      caption: 'A derékszögű vonalzó egyik szárát a $p$ egyenesre illeszted.',
      items: [
        { kind: 'polygon', points: ['S1', 'S2', 'S3'], fill: 'muted', vertexLabels: false },
        { kind: 'angle', vertex: 'S1', from: 'S2', to: 'S3', right: true },
      ],
    },
    {
      caption: 'A másik vonalzót a derékszögű vonalzó másik szárához tolod.',
      items: [{ kind: 'line', through: ['S1', 'S3'], label: 'vonalzó', color: 'blue' }],
    },
    {
      caption: 'A derékszögű vonalzót a másik mentén a $P$ pontig tolod.',
      items: [
        { kind: 'polygon', points: ['S1b', 'S2b', 'S3b'], fill: 'muted', vertexLabels: false },
        { kind: 'angle', vertex: 'S1b', from: 'S2b', to: 'S3b', right: true },
        { kind: 'segment', from: 'S1', to: 'S1b', arrow: 'end', dashed: true, color: 'orange' },
        { kind: 'point', at: 'S1b', label: false },
      ],
    },
    {
      caption: 'A vonalzó éle mentén meghúzod a $P$-n átmenő $q$ egyenest.',
      items: [
        { kind: 'line', through: ['P', 'S2b'], label: 'q', color: 'accent' },
        { kind: 'parallel', from: 'E1', to: 'E2' },
        { kind: 'parallel', from: 'P', to: 'S2b' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Which line is parallel? / which statement is true? / which two lines meet at M? */
const linePosition: GeneratorDef = {
  id: 'line-position',
  title: 'Két egyenes helyzete az ábrán',
  levels: [1, 2],
  generate(rng, level): Question {
    const t = rng.pick([tripleVertical(), tripleSlanted(), tripleVerticals()]);
    const mode =
      level === 1
        ? rng.pick(['askP', 'askQ', 'notP', 'pair'] as const)
        : rng.pick(['askP', 'askQ', 'notP', 'pair', 'statement', 'intersection'] as const);
    const figure = linesFigure(t.lines, mode === 'intersection' ? { at: t.M, dir: 'ne' } : undefined);

    if (mode === 'askP' || mode === 'askQ') {
      const asked = mode === 'askP' ? 'p' : 'q';
      const other = mode === 'askP' ? 'q' : 'p';
      return {
        prompt: tex`Melyik egyenes párhuzamos a $${asked}$ egyenessel?`,
        figure,
        answer: textChoice(`$${other}$`, ['$r$', 'egyik sem']),
        hint: 'Két egyenes párhuzamos, ha soha nem találkozik.',
        solution: [
          tex`Az ábrán a $p$ és a $q$ egyenesek soha nem metszik egymást: párhuzamosak.`,
          tex`${LineArt('r')} $r$ egyenes metszi ${lineArt(asked)} $${asked}$ egyenest, ezért nem párhuzamos vele.`,
          tex`A válasz: **$${other}$**.`,
        ],
      };
    }
    if (mode === 'notP') {
      return {
        prompt: 'Melyik egyenes nem párhuzamos a $p$ egyenessel?',
        figure,
        answer: textChoice('$r$', ['$q$', 'nincs ilyen']),
        hint: 'Keresd meg azt az egyenest, amelyik metszi a $p$-t!',
        solution: [
          tex`A $q$ párhuzamos a $p$-vel, ezért nem lehet a válasz.`,
          tex`Az $r$ egyenes metszi a $p$-t, tehát nem párhuzamos vele.`,
          tex`A válasz: **$r$**.`,
        ],
      };
    }
    if (mode === 'pair') {
      return {
        prompt: 'Melyik két egyenes párhuzamos az ábrán?',
        figure,
        answer: textChoice(tex`$p$ és $q$`, [tex`$p$ és $r$`, tex`$q$ és $r$`]),
        hint: 'A párhuzamos egyenesek soha nem találkoznak.',
        solution: [
          tex`A $p$ és a $q$ egyenes soha nem metszi egymást: ők párhuzamosak.`,
          tex`Az $r$ mindkettőt metszi, ezért egyikkel sem párhuzamos.`,
          tex`A válasz: **$p$ és $q$**.`,
        ],
      };
    }
    if (mode === 'intersection') {
      return {
        prompt: 'Melyik két egyenes metszi egymást az $M$ pontban?',
        figure,
        answer: textChoice(tex`$p$ és $r$`, [tex`$p$ és $q$`, tex`$q$ és $r$`]),
        hint: 'Keresd meg az $M$ pontot, és nézd meg, melyik két egyenes megy át rajta!',
        solution: [
          tex`Az $M$ pont a $p$ és az $r$ egyenesen van.`,
          tex`A $q$ egyenes párhuzamos $p$-vel, ezért nem megy át $M$-en.`,
          tex`Az $M$ pontban a **$p$ és az $r$** egyenes metszi egymást.`,
        ],
      };
    }
    return {
      prompt: 'Melyik állítás igaz az ábrán látható egyenesekre?',
      figure,
      answer: textChoice(tex`$p \parallel q$`, [tex`$p \parallel r$`, tex`$q \parallel r$`, tex`$p$ és $q$ metszi egymást`]),
      hint: 'Keresd meg azt a két egyenest, amelyek soha nem találkoznak!',
      solution: [
        tex`A $p$ és a $q$ egyenes soha nem metszi egymást: $p \parallel q$.`,
        tex`Az $r$ egyenes mindkettőt metszi, ezért nem párhuzamos egyikkel sem.`,
        tex`Az egyetlen igaz állítás: **$p \parallel q$**.`,
      ],
    };
  },
};

/** True/false statements about relative position, the unique parallel and transitivity. */
type Statement = { text: string; value: boolean; why: string };

const positionTf: GeneratorDef = {
  id: 'position-tf',
  title: 'Igaz-hamis állítások az egyenesek helyzetéről',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: Statement[] =
      level === 1
        ? [
            { text: 'Két egyenesnek legfeljebb egy metszéspontja lehet.', value: true, why: 'Két egyenes vagy nem találkozik, vagy pontosan egy pontban metszi egymást.' },
            { text: 'Két párhuzamos egyenesnek van metszéspontja.', value: false, why: 'A párhuzamos egyenesek soha nem találkoznak, ezért nincs metszéspontjuk.' },
            { text: 'Ha két egyenes metszi egymást, akkor pontosan egy közös pontjuk van.', value: true, why: 'A metsző egyeneseknek egyetlen közös pontja van.' },
            { text: 'Két egyenes mindig metszi egymást.', value: false, why: 'Lehetnek párhuzamosak is; akkor nincs metszéspontjuk.' },
            { text: 'A párhuzamos egyenesek nem metszik egymást.', value: true, why: 'Ez a párhuzamosság jelentése a síkban.' },
            { text: 'A $p \\parallel q$ jelölés azt jelenti, hogy a $p$ és a $q$ egyenes párhuzamos.', value: true, why: 'A $\\parallel$ jel a párhuzamosság jele.' },
            { text: 'Két egyenesnek pontosan két metszéspontja lehet.', value: false, why: 'Két egyenesnek legfeljebb egy közös pontja lehet.' },
            { text: 'A párhuzamos egyenesek ugyanabba az irányba állnak.', value: true, why: 'A párhuzamos egyenesek iránya ugyanaz.' },
            { text: 'A metsző egyeneseknek nincs közös pontjuk.', value: false, why: 'A metsző egyenesek éppen egy közös pontban találkoznak.' },
            { text: 'A $p \\parallel q$ jelölésben a $\\parallel$ jel a párhuzamosságot jelenti.', value: true, why: 'A $\\parallel$ a párhuzamosság jele.' },
          ]
        : level === 2
          ? [
              { text: 'Egy ponton át az adott egyenessel pontosan egy párhuzamos egyenes húzható.', value: true, why: 'A párhuzamos egyetlen: a pont és az irány egyértelműen meghatározza.' },
              { text: 'Egy ponton át az adott egyenessel két párhuzamos egyenes húzható.', value: false, why: 'Csak egyetlen párhuzamos húzható át a ponton.' },
              { text: 'Ha $p \\parallel q$ és $q \\parallel r$, akkor $p \\parallel r$.', value: true, why: 'A párhuzamosság továbbadódik: mindhárom egyenes ugyanabba az irányba áll.' },
              { text: 'Ha $p \\parallel q$ és $p \\parallel r$, akkor $q$ és $r$ metszi egymást.', value: false, why: 'Ekkor $q \\parallel r$ is igaz, tehát nem metszik egymást.' },
              { text: 'Két párhuzamos egyenesnek nincs közös pontja.', value: true, why: 'A párhuzamosok soha nem találkoznak.' },
              { text: 'Ha két egyenes párhuzamos, akkor van olyan pont, amely mindkettőn rajta van.', value: false, why: 'A párhuzamos egyeneseknek éppen nincs közös pontjuk.' },
              { text: 'Ha $p \\parallel q$, akkor $q \\parallel p$.', value: true, why: 'A párhuzamosság kölcsönös.' },
              { text: 'Egy adott egyenessel egy ponton át csak egy párhuzamos húzható.', value: true, why: 'A párhuzamos egyetlen.' },
              { text: 'Ha két egyenes ugyanarra a harmadikra párhuzamos, akkor egymással is párhuzamosak.', value: true, why: 'Ez a párhuzamosság továbbadása (tranzitivitás).' },
              { text: 'Két párhuzamos egyenesnek pontosan egy közös pontja van.', value: false, why: 'A párhuzamosoknak nincs közös pontjuk.' },
            ]
          : [
              { text: 'Ha $p \\parallel q$, és az $r$ egyenes metszi $p$-t, akkor $r$ metszi $q$-t is.', value: true, why: 'A $q$ ugyanabba az irányba áll, mint a $p$, ezért az $r$ mindkettőt elmetszi.' },
              { text: 'Két egyenes a síkban vagy metszi egymást, vagy párhuzamos.', value: true, why: 'A síkban két egyenesnek ez a két lehetséges helyzete van.' },
              { text: 'Ha két egyenes nem párhuzamos, akkor van metszéspontjuk.', value: true, why: 'A nem párhuzamos egyenesek összetartók, ezért metszik egymást.' },
              { text: 'A síkon két egyenesnek lehet két metszéspontja.', value: false, why: 'Két egyenesnek legfeljebb egy közös pontja lehet.' },
              { text: 'Egy egyenes a síkot két félsíkra osztja.', value: true, why: 'Az egyenes két oldalán levő pontok két félsíkot alkotnak.' },
              { text: 'Két metsző egyenes a síkot négy részre osztja.', value: true, why: 'A négy rész a két egyenes négy szögletében van.' },
              { text: 'Három egyenes a síkot mindig hét részre osztja.', value: false, why: 'Csak általános helyzetben hét rész; párhuzamosoknál vagy egy ponton átmenő egyeneseknél kevesebb.' },
              { text: 'A háromszög a síknak egy része, amelyet három szakasz határol.', value: true, why: 'A háromszög három oldala három szakasz.' },
              { text: 'A paralelogramma a síknak egy része, amelyet négy szakasz határol.', value: true, why: 'A paralelogrammát négy oldalszakasz határolja.' },
              { text: 'Ha $p \\parallel q$ és $r \\parallel s$, akkor $p$ és $r$ biztosan metszi egymást.', value: false, why: 'Lehet, hogy $p$ és $r$ is párhuzamos; akkor nem metszik egymást.' },
              { text: 'Négy párhuzamos egyenes a síkot öt részre osztja.', value: true, why: 'Négy párhuzamos egyenes öt sávot hoz létre.' },
              { text: 'Négy egyenes a síkot legfeljebb 11 részre oszthatja.', value: true, why: 'Általános helyzetben négy egyenes 11 részt ad; ennél több nem lehet.' },
              { text: 'Három párhuzamos egyenes a síkot négy részre osztja.', value: true, why: 'Három párhuzamos egyenes négy sávot hoz létre.' },
              { text: 'Három egy ponton átmenő egyenes a síkot hat részre osztja.', value: true, why: 'A három egyenes hat „cikkre” osztja a síkot.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át, mit tudsz a metsző és a párhuzamos egyenesekről, illetve a sík részeiről!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

/** Number of intersection points of 2–4 lines, from the figure. */
const intersections: GeneratorDef = {
  id: 'intersections',
  title: 'Metszéspontok száma',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool =
      level === 1
        ? [
            () => [line('p', ...horizontal(1.5)), line('q', ...horizontal(5))],
            () => [line('p', ...horizontal(2)), line('q', at(0, 1), at(10, 6))],
            () => [line('p', ...horizontal(2)), line('q', at(0, 6), at(10, 1))],
            () => threeParallel(),
            () => threeConcurrent(),
          ]
        : level === 2
          ? [threeGeneral, threeOneParallel, threeConcurrent, threeParallel, fourGeneral, fourOneParallel, fourTwoParallel]
          : [fourGeneral, fourOneParallel, fourTwoParallel, fourConcurrent, fourThreeConcurrent, fourParallel];
    const lines = rng.pick(pool)();
    const points = intersectionPoints(lines);
    const n = points.length;
    const pairs = parallelPairs(lines);
    const allSame = n === 1;
    const solution: string[] = [];
    if (n === 0) {
      solution.push('Az egyenesek párhuzamosak, ezért soha nem találkoznak.');
      solution.push('Nincs közös pontjuk, tehát **0 metszéspont** van.');
    } else if (allSame && lines.length > 2) {
      solution.push('Az ábrán minden egyenes ugyanabban az egy pontban metszi a többit.');
      solution.push('Ezért összesen **1 metszéspont** van.');
    } else {
      solution.push(tex`Az ábrán az egyenesek páronként találkoznak; számold össze a találkozási pontokat!`);
      if (pairs.length > 0 && lines.length > 2) {
        solution.push(tex`A ${num(lines.length)} egyenes közül ${num(pairs.length * 2)}-${suffix(pairs.length * 2, 'nak', 'nek')} nincs metszéspontja a párjával.`);
        solution.push(tex`Párhuzamos párok: ${pairs.map(([a, b]) => `$${a}$–$${b}$`).join(', ')}.`);
      }
      solution.push(tex`Összesen **${num(n)} metszéspont** van az ábrán.`);
    }
    return {
      prompt: tex`Hány metszéspontja van ${article(lines.length)} ${num(lines.length)} egyenesnek?`,
      figure: linesFigure(lines),
      answer: { type: 'number', value: n },
      inputLabel: 'metszéspont =',
      hint: 'Keresd meg az összes pontot, ahol két egyenes találkozik. A párhuzamosoknak nincs metszéspontjuk.',
      solution,
    };
  },
};

/** Number of regions the plane is cut into by 2–4 lines, from the figure. */
const regions: GeneratorDef = {
  id: 'regions',
  title: 'A sík részei egyenesekkel',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool =
      level === 1
        ? [
            () => [line('p', ...horizontal(2)), line('q', at(0, 1), at(10, 6))],
            () => [line('p', ...horizontal(2)), line('q', ...horizontal(5))],
          ]
        : level === 2
          ? [threeGeneral, threeOneParallel, threeConcurrent, threeParallel]
          : [fourOneParallel, fourTwoParallel, fourConcurrent, fourThreeConcurrent, fourParallel];
    const lines = rng.pick(pool)();
    const regionsN = regionCount(lines);
    const steps: string[] = ['Az első egyenes 2 részre osztja a síkot.'];
    let running = 2;
    for (let i = 1; i < lines.length; i++) {
      const add = newRegions(lines, i);
      running += add;
      steps.push(tex`A ${num(i + 1)}. egyenes ${num(add)} új részt hoz létre, így ${num(running)} rész lesz.`);
    }
    steps.push(tex`A síkot összesen **${num(regionsN)} részre** osztják az egyenesek.`);
    return {
      prompt: tex`Hány részre osztja a síkot az ábrán látható ${num(lines.length)} egyenes?`,
      figure: linesFigure(lines),
      answer: { type: 'number', value: regionsN },
      inputLabel: 'rész =',
      hint: 'Számold meg az ábrán a sík részeit! Figyeld, hány új rész keletkezik minden új egyenessel.',
      solution: steps,
    };
  },
};

/** Naming triangles and parallelograms, and their sides. */
const shapeName: GeneratorDef = {
  id: 'shape-name',
  title: 'Háromszögek és paralelogrammák jelölése',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const mode = rng.pick(['notA', 'notB', 'notC', 'bothAB'] as const);
      if (mode === 'bothAB') {
        return {
          prompt: 'Melyik oldalon van rajta az $A$ és a $B$ csúcs is?',
          figure: triangleRegion,
          answer: textChoice('$AB$', ['$BC$', '$CA$']),
          hint: 'Keresd meg az oldal nevét: a két végpontjának betűje szerepel benne.',
          solution: ['Az $AB$ oldal két végpontja $A$ és $B$.', 'Ezért az $AB$ oldalon mindkét csúcs rajta van.'],
        };
      }
      const missing = mode === 'notA' ? 'A' : mode === 'notB' ? 'B' : 'C';
      const correct = missing === 'A' ? 'BC' : missing === 'B' ? 'CA' : 'AB';
      const wrongs = ['AB', 'BC', 'CA'].filter((s) => s !== correct);
      const art = missing === 'A' ? 'az' : 'a';
      const Art = art === 'az' ? 'Az' : 'A';
      const sideArt = correct.startsWith('A') ? 'az' : 'a';
      const SideArt = sideArt === 'az' ? 'Az' : 'A';
      return {
        prompt: tex`Melyik oldal nincs rajta ${art} $${missing}$ csúcson?`,
        figure: triangleRegion,
        answer: textChoice(`$${correct}$`, wrongs.map((s) => `$${s}$`)),
        hint: tex`Keresd meg azt az oldalt, amelynek a nevében nem szerepel a(z) $${missing}$ betű!`,
        solution: [
          tex`${Art} $${missing}$ csúcson a két szomszédos oldal megy át.`,
          tex`${SideArt} $${correct}$ oldalnak egyik végpontja sem $${missing}$, ezért nincs rajta.`,
        ],
      };
    }
    const mode = rng.pick(['name', 'parallel', 'pair'] as const);
    if (mode === 'name') {
      return {
        prompt: 'Melyik név jelöli helyesen az ábrán látható paralelogrammát?',
        figure: parallelogramRegion,
        answer: textChoice('$ABCD$', ['$ABDC$', '$ACBD$', '$ADBC$']),
        hint: 'A csúcsokat a kerület mentén, egymás után kell felsorolni.',
        solution: [
          'A paralelogramma csúcsai a kerület mentén: $A$, $B$, $C$, $D$.',
          'Ezért a helyes név $ABCD$; a többi felsorolás átlókon ugrál.',
        ],
      };
    }
    if (mode === 'pair') {
      return {
        prompt: 'Melyik oldalpár párhuzamos az ábrán látható paralelogrammán?',
        figure: parallelogramRegion,
        answer: textChoice(tex`$AB$ és $CD$`, [tex`$AB$ és $BC$`, tex`$BC$ és $CD$`]),
        hint: 'A paralelogrammának két párhuzamos oldalpárja van: a szemközti oldalak.',
        solution: ['A paralelogramma szemközti oldalai párhuzamosak.', 'Az $AB$ és a $CD$ szemközti oldalak, ezért párhuzamosak. Az $AB$ és a $BC$ szomszédos oldalak, nem párhuzamosak.'],
      };
    }
    return {
      prompt: 'Melyik oldal párhuzamos az $AB$ oldallal?',
      figure: parallelogramRegion,
      answer: textChoice('$CD$', ['$BC$', '$DA$', 'egyik sem']),
      hint: 'A paralelogramma szemközti oldalai párhuzamosak.',
      solution: ['A paralelogrammában a szemközti oldalak párhuzamosak.', 'Az $AB$ oldallal szemközt a $CD$ oldal van, ezért $AB \\parallel CD$.'],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-02',
  goals: [
    'felismerni a metsző és a párhuzamos egyeneseket,',
    'megszerkeszteni egy ponton át a párhuzamost,',
    'megszámolni a metszéspontokat és a sík részeit,',
    'felismerni a háromszögeket és a paralelogrammákat a sík részeiként.',
  ],
  parts: [
    {
      title: 'Két egyenes helyzete',
      steps: [
        {
          type: 'theory',
          title: 'Metsző és párhuzamos egyenesek',
          body: 'Két egyenes vagy **metszi** egymást, vagy **párhuzamos**. A metsző egyeneseknek egy közös pontjuk van; a párhuzamosoknak nincs. Jelölés: $p \\parallel q$.',
          figure: twoLinesFigure,
          remember: 'A metszéspont mindkét egyenesen rajta van.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $p$ és a $q$ egyenesek metszik egymást.',
            figure: parallelFigure,
            answer: { type: 'truefalse', value: false },
            hint: 'Nézd meg, találkozik-e a két egyenes az ábrán!',
            solution: ['Az ábrán a $p$ és a $q$ egyenes párhuzamos: soha nem találkozik.', 'Az állítás **hamis**.'],
          },
        },
        { type: 'practice', generator: 'line-position', level: 1, count: 2 },
        { type: 'practice', generator: 'position-tf', level: 1 },
      ],
    },
    {
      title: 'Párhuzamos szerkesztése',
      steps: [
        {
          type: 'theory',
          title: 'Egyetlen párhuzamos',
          body: 'Egy ponton át az adott egyenessel **pontosan egy** párhuzamos húzható. Két vonalzóval szerkesztjük meg: az egyiket a p egyeneshez illesztjük, a másikat ehhez toljuk.',
          remember: 'Egy ponton át egy párhuzamos van.',
        },
        {
          type: 'theory',
          title: 'Két vonalzóval',
          body: 'A derékszögű vonalzót a $p$ egyenesre illeszted, a másikat mellé. A derékszögűt a $P$ pontig tolod, majd a vonalzó éle mentén meghúzod a párhuzamost.',
          figure: parallelConstruction,
        },
        {
          type: 'check',
          question: {
            prompt: 'Egy ponton át az adott egyenessel pontosan egy párhuzamos egyenes húzható.',
            answer: { type: 'truefalse', value: true },
            hint: 'Gondolj a két vonalzós szerkesztésre: hány helyen lehet a $P$ ponton át párhuzamost húzni?',
            solution: ['A pont és az egyenes iránya egyetlen párhuzamost határoz meg.', 'Az állítás **igaz**.'],
          },
        },
        { type: 'practice', generator: 'line-position', level: 2 },
        { type: 'practice', generator: 'position-tf', level: 2 },
      ],
    },
    {
      title: 'A sík részei',
      steps: [
        {
          type: 'theory',
          title: 'Félsíkok',
          body: 'Egy egyenes a síkot két **félsíkra** osztja. A vonal két oldalán levő pontok különböző félsíkban vannak.',
          figure: halfPlaneFigure,
          remember: 'Egy egyenes → két félsík.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $p$ egyenes a síkot két félsíkra osztja.',
            figure: halfPlaneFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg, hány oldala van a $p$ egyenesnek!',
            solution: ['A $p$ egyenes két oldalán levő pontok két különböző félsíkot alkotnak.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Három egyenes a síkon',
          problem: 'Hány részre osztja a síkot az ábrán látható három egyenes?',
          figure: linesFigure(threeGeneral()),
          steps: [
            { text: 'Az első egyenes 2 részre osztja a síkot.' },
            { text: 'A második egyenes 2 új részt hoz létre: így 4 rész lesz.' },
            { text: 'A harmadik egyenes 3 új részt hoz létre: így 7 rész lesz.' },
          ],
          answer: 'Három egyenes **7 részre** osztja a síkot.',
        },
        { type: 'practice', generator: 'regions', level: 1, count: 2 },
        { type: 'practice', generator: 'regions', level: 2 },
      ],
    },
    {
      title: 'Sok egyenes, sok rész',
      steps: [
        {
          type: 'theory',
          title: 'Háromszögek és paralelogrammák',
          body: 'A háromszöget három szakasz határolja; csúcsai $K$, $L$, $M$. A paralelogrammát négy szakasz határolja; szemközti oldalai párhuzamosak.',
          figure: shapePairFigure,
          remember: 'Háromszög: $KLM$ · paralelogramma: $ABCD$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik oldal párhuzamos az $AB$ oldallal?',
            figure: parallelogramRegion,
            answer: textChoice('$CD$', ['$BC$', '$DA$', 'egyik sem']),
            hint: 'A paralelogramma szemközti oldalai párhuzamosak.',
            solution: ['A paralelogramma szemközti oldalai párhuzamosak.', 'Az $AB$ oldallal szemközt a $CD$ oldal van: $AB \\parallel CD$.'],
          },
        },
        {
          type: 'example',
          title: 'Négy egyenes metszéspontjai',
          problem: 'Hány metszéspontja van az ábrán látható négy egyenesnek?',
          figure: linesFigure(fourGeneral()),
          steps: [
            { text: 'Négy egyenesből $4 \\cdot 3 : 2 = 6$ egyenespár van.' },
            { text: 'Nincs párhuzamos, és nincs három egy ponton: mind a 6 pár külön pontban metszi egymást.' },
            { text: 'Az ábrán valóban 6 metszéspont látható.' },
          ],
          answer: 'Négy egyenesnek **6 metszéspontja** van.',
        },
        { type: 'practice', generator: 'intersections', level: 1 },
        { type: 'practice', generator: 'intersections', level: 2 },
        { type: 'practice', generator: 'intersections', level: 3 },
        { type: 'practice', generator: 'regions', level: 3 },
        { type: 'practice', generator: 'shape-name', level: 2 },
        { type: 'practice', generator: 'position-tf', level: 3 },
      ],
    },
  ],
  generators: [linePosition, positionTf, intersections, regions, shapeName],
  miniTest: {
    items: [
      { generator: 'line-position', level: 2 },
      { generator: 'position-tf', level: 1 },
      { generator: 'intersections', level: 1 },
      { generator: 'regions', level: 2 },
      { generator: 'intersections', level: 3 },
      { generator: 'shape-name', level: 2 },
      { generator: 'regions', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'line-position', level: 1 },
    { generator: 'position-tf', level: 1 },
    { generator: 'intersections', level: 1 },
    { generator: 'regions', level: 1 },
    { generator: 'shape-name', level: 1 },
    { generator: 'line-position', level: 2 },
    { generator: 'position-tf', level: 2 },
  ],
});
