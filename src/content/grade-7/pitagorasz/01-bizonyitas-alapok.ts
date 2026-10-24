/**
 * 7. osztály › Pitagorasz tétele › 1. A Pitagorasz-tétel bizonyítása és alapszintű alkalmazása
 *
 * GOLD-STANDARD EXAMPLE — other lessons copy this structure:
 *   1. small helpers for this lesson (figures, number pools)
 *   2. generators (each: levels 1–3, hint, step-by-step solution, figure that follows the numbers)
 *   3. the lesson steps (theory → check → theory → explore → examples → practice …)
 *   4. mini test + daily challenge pool
 */
import {
  choice,
  defineSubtopic,
  num,
  PYTHAGOREAN_TRIPLES,
  rootText,
  simplifyRoot,
  tex,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type Rng,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** Vertex name sets — the curriculum asks for varied labels, not always ABC. */
const NAME_SETS: [string, string, string][] = [
  ['A', 'B', 'C'],
  ['K', 'L', 'M'],
  ['P', 'Q', 'R'],
  ['D', 'E', 'F'],
  ['X', 'Y', 'Z'],
  ['M', 'N', 'P'],
];

/** Triples with all sides ≤ 30, e.g. [3, 4, 5], [6, 8, 10], [5, 12, 13] … */
const SMALL_TRIPLES = PYTHAGOREAN_TRIPLES.filter(([, , c]) => c <= 30);

/**
 * A right triangle figure. The right angle is at the 3rd vertex; legs a (2nd–3rd vertex)
 * and b (3rd–1st vertex); hypotenuse c (1st–2nd). `turn` rotates the whole triangle (degrees)
 * so students also see it in unusual positions.
 */
function rightTriangle(opts: {
  a: number;
  b: number;
  names?: [string, string, string];
  turn?: number;
  labels?: { a?: string; b?: string; c?: string };
  highlight?: ('a' | 'b' | 'c')[];
  squares?: { a?: string; b?: string; c?: string };
}): Figure {
  const t = ((opts.turn ?? 0) * Math.PI) / 180;
  const rot = (x: number, y: number): XY => [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
  return {
    type: 'triangle',
    coords: [rot(opts.b, 0), rot(0, opts.a), rot(0, 0)],
    vertices: opts.names ?? ['A', 'B', 'C'],
    rightAngleAt: 'C',
    sideLabels: opts.labels,
    highlight: opts.highlight,
    squares: opts.squares,
    fill: true,
  };
}

/** Side name from its two endpoint letters, alphabetical: ('L','K') → 'KL'. */
const sideName = (p: string, q: string) => [p, q].sort().join('');

/** A random unit and a matching scale, so numbers stay realistic. */
function pickUnit(rng: Rng): string {
  return rng.pick(['cm', 'cm', 'dm', 'm', 'mm']);
}

/** Two legs (1…12) whose squares do NOT add up to a perfect square → root answer. */
function nonTripleLegs(rng: Rng): [number, number] {
  for (;;) {
    const a = rng.int(1, 9);
    const b = rng.int(a, 12);
    const s = a * a + b * b;
    if (Math.round(Math.sqrt(s)) ** 2 !== s) return [a, b];
  }
}

/** "√50 = 5√2" when it simplifies, otherwise "√34" — for solutions. */
function rootSteps(n: number): string {
  const { coef, radicand } = simplifyRoot(n);
  if (radicand === 1) return tex`\sqrt{${num(n)}} = ${num(coef)}`;
  if (coef === 1) return tex`\sqrt{${num(n)}}`;
  return tex`\sqrt{${num(n)}} = ${texRoot(coef, radicand)}`;
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Hypotenuse from the two legs. L1 whole numbers, L2 root or decimal answers, L3 word problems. */
const hypotenuse: GeneratorDef = {
  id: 'hypotenuse',
  title: 'Átfogó kiszámítása a két befogóból',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) return wordProblem(rng, 'hypotenuse');
    const unit = pickUnit(rng);
    const names = level === 1 ? NAME_SETS[0] : rng.pick(NAME_SETS);
    const [A, B, C] = names;
    const turn = level === 1 ? 0 : rng.pick([0, 90, 180, 270, 25, 205]);

    let a: number;
    let b: number;
    if (level === 1) {
      [a, b] = rng.shuffle(rng.pick(SMALL_TRIPLES).slice(0, 2));
    } else if (rng.chance(0.3)) {
      // decimal legs from a scaled triple: 1,5 and 2 → 2,5
      const [x, y] = rng.pick(SMALL_TRIPLES.filter(([, , c]) => c <= 15));
      [a, b] = rng.shuffle([x / 2, y / 2]);
    } else {
      [a, b] = rng.shuffle(nonTripleLegs(rng));
    }
    const sum = a * a + b * b;
    const c = Math.sqrt(sum);
    const exact = Number.isInteger(Math.round(c * 1e9) / 1e9) || Math.abs(c * 10 - Math.round(c * 10)) < 1e-9;
    const cLabel = `${C === 'C' ? 'c' : sideName(A, B)} = ?`;

    const answer = exact
      ? ({ type: 'number', value: Math.round(c * 10) / 10, unit } as const)
      : ({ type: 'root', ...simplifyRoot(sum), requireSimplified: false, acceptDecimal: 2, unit } as const);

    return {
      prompt: tex`Egy derékszögű háromszög befogói $${num(a)}$ ${unit} és $${num(b)}$ ${unit}. Számítsd ki az átfogó hosszát!${exact ? '' : ' (Gyökös alakban add meg!)'}`,
      figure: rightTriangle({
        a,
        b,
        names,
        turn,
        labels: { a: `${num(a)} ${unit}`, b: `${num(b)} ${unit}`, c: cLabel },
        highlight: ['c'],
      }),
      answer,
      inputLabel: '$c =$',
      hint: 'Az átfogó a derékszöggel szemközti, leghosszabb oldal. Írd fel: $c^2 = a^2 + b^2$, aztán vonj négyzetgyököt!',
      solution: [
        tex`A befogók: $a = ${num(a)}$ ${unit}, $b = ${num(b)}$ ${unit}. Az átfogó $c$.`,
        tex`Pitagorasz tétele: $c^2 = a^2 + b^2$.`,
        tex`$c^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(sum)}$`,
        exact ? tex`$c = \sqrt{${num(sum)}} = ${num(Math.round(c * 10) / 10)}$` : tex`$c = ${rootSteps(sum)} \approx ${num(c, 2)}$`,
        exact
          ? tex`Az átfogó **${num(Math.round(c * 10) / 10)} ${unit}**.`
          : tex`Az átfogó **$${texRoot(simplifyRoot(sum).coef, simplifyRoot(sum).radicand)}$ ${unit}** (kb. ${num(c, 2)} ${unit}).`,
      ],
    };
  },
};

/** A leg from the hypotenuse and the other leg. */
const leg: GeneratorDef = {
  id: 'leg',
  title: 'Befogó kiszámítása az átfogóból és a másik befogóból',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) return wordProblem(rng, 'leg');
    const unit = pickUnit(rng);
    const names = level === 1 ? NAME_SETS[0] : rng.pick(NAME_SETS);
    const turn = level === 1 ? 0 : rng.pick([0, 90, 180, 270, 30, 210]);

    let known: number;
    let c: number;
    if (level === 1) {
      const t = rng.pick(SMALL_TRIPLES);
      known = rng.pick([t[0], t[1]]);
      c = t[2];
    } else {
      // c² − known² is not a perfect square → root answer
      for (;;) {
        c = rng.int(4, 15);
        known = rng.int(1, c - 1);
        const d = c * c - known * known;
        if (Math.round(Math.sqrt(d)) ** 2 !== d) break;
      }
    }
    const diff = c * c - known * known;
    const missing = Math.sqrt(diff);
    const askA = rng.chance(0.5); // which leg is unknown
    const [aVal, bVal] = askA ? [missing, known] : [known, missing];
    const unknownLetter = askA ? 'a' : 'b';
    const knownLetter = askA ? 'b' : 'a';
    const isInt = Number.isInteger(Math.round(missing * 1e9) / 1e9);
    const root = simplifyRoot(diff);

    return {
      prompt: tex`Egy derékszögű háromszög átfogója $${num(c)}$ ${unit}, az egyik befogója $${num(known)}$ ${unit}. Mekkora a másik befogó?${isInt ? '' : ' (Gyökös alakban add meg!)'}`,
      figure: rightTriangle({
        a: aVal,
        b: bVal,
        names,
        turn,
        labels: {
          [knownLetter]: `${num(known)} ${unit}`,
          [unknownLetter]: `${unknownLetter} = ?`,
          c: `${num(c)} ${unit}`,
        },
        highlight: [unknownLetter as 'a' | 'b'],
      }),
      answer: isInt
        ? { type: 'number', value: Math.round(missing), unit }
        : { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit },
      inputLabel: `$${unknownLetter} =$`,
      hint: tex`Most az egyik **befogó** hiányzik. Rendezd át a tételt: $${unknownLetter}^2 = c^2 - ${knownLetter}^2$.`,
      solution: [
        tex`Az átfogó $c = ${num(c)}$ ${unit}, a befogó $${knownLetter} = ${num(known)}$ ${unit}.`,
        tex`$${knownLetter}^2 + ${unknownLetter}^2 = c^2$, ezért $${unknownLetter}^2 = c^2 - ${knownLetter}^2$.`,
        tex`$${unknownLetter}^2 = ${num(c)}^2 - ${num(known)}^2 = ${num(c * c)} - ${num(known * known)} = ${num(diff)}$`,
        isInt ? tex`$${unknownLetter} = \sqrt{${num(diff)}} = ${num(missing)}$` : tex`$${unknownLetter} = ${rootSteps(diff)} \approx ${num(missing, 2)}$`,
        isInt
          ? tex`A hiányzó befogó **${num(missing)} ${unit}**.`
          : tex`A hiányzó befogó **$${texRoot(root.coef, root.radicand)}$ ${unit}** (kb. ${num(missing, 2)} ${unit}).`,
      ],
    };
  },
};

/** Word problems built on scaled Pythagorean triples, so the answers are exact. */
function wordProblem(rng: Rng, ask: 'hypotenuse' | 'leg'): Question {
  const kind = rng.pick(['ladder', 'screen', 'pole', 'park'] as const);
  if (kind === 'park') {
    // two-step: how much shorter is the diagonal path?
    const [x, y, z] = rng.pick([
      [60, 80, 100],
      [90, 120, 150],
      [50, 120, 130],
      [120, 160, 200],
      [80, 150, 170],
    ]);
    const saved = x + y - z;
    return {
      prompt: tex`Egy téglalap alakú park oldalai $${num(x)}$ m és $${num(y)}$ m. Panni a park egyik sarkából az átellenes sarokba megy. Hány méterrel rövidebb az út az átlón át, mint a park két szélén körbe?`,
      figure: {
        type: 'quadrilateral',
        shape: 'rectangle',
        a: y,
        b: x,
        sideLabels: { a: `${num(y)} m`, b: `${num(x)} m` },
        diagonals: { e: 'átló = ?' },
        highlight: ['e'],
        vertices: ['', '', '', ''],
        fill: true,
      },
      answer: { type: 'number', value: saved, unit: 'm' },
      hint: 'Az átló egy derékszögű háromszög átfogója, amelynek befogói a park oldalai. Számítsd ki, aztán hasonlítsd össze a két út hosszát!',
      solution: [
        tex`Az átló a $${num(x)}$ m és $${num(y)}$ m befogójú derékszögű háromszög átfogója.`,
        tex`$d^2 = ${num(x)}^2 + ${num(y)}^2 = ${num(x * x)} + ${num(y * y)} = ${num(z * z)}$, így $d = ${num(z)}$ m.`,
        tex`A két szélen: $${num(x)} + ${num(y)} = ${num(x + y)}$ m.`,
        tex`A különbség: $${num(x + y)} - ${num(z)} = ${num(saved)}$ m.`,
        tex`Az átlón át **${num(saved)} m-rel** rövidebb az út.`,
      ],
    };
  }

  // [shorter leg, longer leg, hypotenuse]
  const pools: Record<'ladder' | 'screen' | 'pole', [number, number, number][]> = {
    ladder: [
      [1.5, 2, 2.5],
      [3, 4, 5],
      [1.8, 2.4, 3],
      [2.5, 6, 6.5],
      [1.75, 6, 6.25],
      [2.1, 2.8, 3.5],
    ],
    screen: [
      [60, 80, 100],
      [36, 48, 60],
      [48, 64, 80],
      [30, 40, 50],
      [45, 60, 75],
    ],
    pole: [
      [5, 12, 13],
      [6, 8, 10],
      [9, 12, 15],
      [7, 24, 25],
      [8, 15, 17],
    ],
  };
  const [s, l, h] = rng.pick(pools[kind]);

  if (kind === 'ladder') {
    // wall = longer leg (vertical), ground distance = shorter leg
    const fig = (labels: { wall: string; ground: string; ladder: string }): Figure => ({
      type: 'triangle',
      coords: [
        [s, 0],
        [0, l],
        [0, 0],
      ],
      vertices: ['', '', ''],
      rightAngleAt: 'C',
      sideLabels: { a: labels.wall, b: labels.ground, c: labels.ladder },
      highlight: [ask === 'hypotenuse' ? 'c' : 'a'],
      fill: true,
    });
    if (ask === 'hypotenuse') {
      return {
        prompt: tex`Egy létra alja $${num(s)}$ m-re van a faltól, a teteje $${num(l)}$ m magasan éri el a falat. Milyen hosszú a létra?`,
        figure: fig({ wall: `${num(l)} m`, ground: `${num(s)} m`, ladder: 'létra = ?' }),
        answer: { type: 'number', value: h, unit: 'm' },
        hint: 'A fal, a talaj és a létra derékszögű háromszöget alkot. A létra az átfogó.',
        solution: [
          tex`A fal és a talaj derékszöget zár be, ezért a létra a derékszögű háromszög **átfogója**.`,
          tex`$c^2 = ${num(s)}^2 + ${num(l)}^2 = ${num(s * s)} + ${num(l * l)} = ${num(h * h)}$`,
          tex`$c = \sqrt{${num(h * h)}} = ${num(h)}$`,
          tex`A létra **${num(h)} m** hosszú.`,
        ],
      };
    }
    return {
      prompt: tex`Egy $${num(h)}$ m hosszú létra alja $${num(s)}$ m-re van a faltól. Milyen magasan éri el a létra a falat?`,
      figure: fig({ wall: 'magasság = ?', ground: `${num(s)} m`, ladder: `${num(h)} m` }),
      answer: { type: 'number', value: l, unit: 'm' },
      hint: 'A létra az átfogó. A falon mért magasság az egyik befogó: $a^2 = c^2 - b^2$.',
      solution: [
        tex`A létra a derékszögű háromszög átfogója: $c = ${num(h)}$ m, a talajon mért befogó $b = ${num(s)}$ m.`,
        tex`$a^2 = c^2 - b^2 = ${num(h)}^2 - ${num(s)}^2 = ${num(h * h)} - ${num(s * s)} = ${num(l * l)}$`,
        tex`$a = \sqrt{${num(l * l)}} = ${num(l)}$`,
        tex`A létra **${num(l)} m** magasan éri el a falat.`,
      ],
    };
  }

  if (kind === 'screen') {
    const fig = (labels: { w: string; h: string; d: string }): Figure => ({
      type: 'quadrilateral',
      shape: 'rectangle',
      a: l,
      b: s,
      sideLabels: { a: labels.w, b: labels.h },
      diagonals: { e: labels.d },
      highlight: ['e'],
      vertices: ['', '', '', ''],
      fill: true,
    });
    if (ask === 'hypotenuse') {
      return {
        prompt: tex`Egy tévé képernyője $${num(l)}$ cm széles és $${num(s)}$ cm magas. Milyen hosszú a képernyő átlója?`,
        figure: fig({ w: `${num(l)} cm`, h: `${num(s)} cm`, d: 'átló = ?' }),
        answer: { type: 'number', value: h, unit: 'cm' },
        hint: 'Az átló két derékszögű háromszögre vágja a téglalapot. Az átló az átfogó.',
        solution: [
          tex`Az átló egy olyan derékszögű háromszög átfogója, amelynek befogói $${num(l)}$ cm és $${num(s)}$ cm.`,
          tex`$d^2 = ${num(l)}^2 + ${num(s)}^2 = ${num(l * l)} + ${num(s * s)} = ${num(h * h)}$`,
          tex`$d = \sqrt{${num(h * h)}} = ${num(h)}$`,
          tex`A képernyő átlója **${num(h)} cm**.`,
        ],
      };
    }
    return {
      prompt: tex`Egy tévé képernyőjének átlója $${num(h)}$ cm, a szélessége $${num(l)}$ cm. Milyen magas a képernyő?`,
      figure: fig({ w: `${num(l)} cm`, h: 'magasság = ?', d: `${num(h)} cm` }),
      answer: { type: 'number', value: s, unit: 'cm' },
      hint: 'Az átló az átfogó, a szélesség és a magasság a befogók.',
      solution: [
        tex`Az átló az átfogó ($${num(h)}$ cm), a szélesség az egyik befogó ($${num(l)}$ cm).`,
        tex`$m^2 = ${num(h)}^2 - ${num(l)}^2 = ${num(h * h)} - ${num(l * l)} = ${num(s * s)}$`,
        tex`$m = \sqrt{${num(s * s)}} = ${num(s)}$`,
        tex`A képernyő **${num(s)} cm** magas.`,
      ],
    };
  }

  // pole: a rope from the top of a flagpole to the ground
  const fig = (labels: { pole: string; ground: string; rope: string }): Figure => ({
    type: 'triangle',
    coords: [
      [s, 0],
      [0, l],
      [0, 0],
    ],
    vertices: ['', '', ''],
    rightAngleAt: 'C',
    sideLabels: { a: labels.pole, b: labels.ground, c: labels.rope },
    highlight: [ask === 'hypotenuse' ? 'c' : 'a'],
    fill: true,
  });
  if (ask === 'hypotenuse') {
    return {
      prompt: tex`Egy $${num(l)}$ m magas zászlórúd tetejét kötéllel rögzítik a földhöz. A kötél földi vége $${num(s)}$ m-re van a rúd aljától. Milyen hosszú a kötél?`,
      figure: fig({ pole: `${num(l)} m`, ground: `${num(s)} m`, rope: 'kötél = ?' }),
      answer: { type: 'number', value: h, unit: 'm' },
      hint: 'A rúd merőleges a talajra. A kötél a derékszögű háromszög átfogója.',
      solution: [
        tex`A rúd és a talaj derékszöget zár be, a kötél az átfogó.`,
        tex`$c^2 = ${num(l)}^2 + ${num(s)}^2 = ${num(l * l)} + ${num(s * s)} = ${num(h * h)}$`,
        tex`$c = \sqrt{${num(h * h)}} = ${num(h)}$`,
        tex`A kötél **${num(h)} m** hosszú.`,
      ],
    };
  }
  return {
    prompt: tex`Egy zászlórúd tetejétől egy $${num(h)}$ m hosszú kötél fut le a földig. A kötél földi vége $${num(s)}$ m-re van a rúd aljától. Milyen magas a zászlórúd?`,
    figure: fig({ pole: 'rúd = ?', ground: `${num(s)} m`, rope: `${num(h)} m` }),
    answer: { type: 'number', value: l, unit: 'm' },
    hint: 'A kötél az átfogó, a rúd az egyik befogó: $a^2 = c^2 - b^2$.',
    solution: [
      tex`A kötél az átfogó ($${num(h)}$ m), a talajon mért távolság az egyik befogó ($${num(s)}$ m).`,
      tex`$a^2 = ${num(h)}^2 - ${num(s)}^2 = ${num(h * h)} - ${num(s * s)} = ${num(l * l)}$`,
      tex`$a = \sqrt{${num(l * l)}} = ${num(l)}$`,
      tex`A zászlórúd **${num(l)} m** magas.`,
    ],
  };
}

/** Recognising the hypotenuse / the correct equation for a triangle with unusual labels. */
const sideNames: GeneratorDef = {
  id: 'side-names',
  title: 'Befogók és átfogó felismerése tetszőleges betűzésnél',
  levels: [1, 2],
  generate(rng, level): Question {
    const letters = rng.pick(NAME_SETS.slice(1));
    // which letter gets the right angle
    const order = rng.shuffle([0, 1, 2]);
    const names: [string, string, string] = [letters[order[0]], letters[order[1]], letters[order[2]]];
    const [P, Q, R] = names; // right angle at R; hypotenuse PQ
    const [a, b] = rng.shuffle(rng.pick(SMALL_TRIPLES.filter(([, , c]) => c <= 17)).slice(0, 2));
    const turn = rng.pick([0, 90, 180, 270, 40, 140, 220, 320]);

    if (level === 1) {
      const hyp = sideName(P, Q);
      const legs = [sideName(Q, R), sideName(R, P)];
      return {
        prompt: tex`A(z) $${P}${Q}${R}$ háromszögben a(z) $${R}$ csúcsnál derékszög van. Melyik oldal az **átfogó**?`,
        figure: rightTriangle({ a, b, names, turn }),
        answer: choice(rng, `$${hyp}$`, legs.map((s) => `$${s}$`), { count: 3 }),
        hint: 'Az átfogó a derékszöggel **szemközti** oldal: nem érinti a derékszög csúcsát.',
        solution: [
          tex`A derékszög a(z) $${R}$ csúcsnál van.`,
          tex`A(z) $${R}$ csúcsot nem tartalmazó oldal a(z) $${hyp}$ — ez a derékszöggel szemközti oldal.`,
          tex`Az átfogó tehát **$${hyp}$**, a befogók $${legs[0]}$ és $${legs[1]}$.`,
        ],
      };
    }
    // level 2: which equation is true? sides named by the opposite vertex, lower case
    const [p, q, r] = names.map((n) => n.toLowerCase());
    const correct = tex`$${p}^2 + ${q}^2 = ${r}^2$`;
    const wrongs = [tex`$${p}^2 + ${r}^2 = ${q}^2$`, tex`$${q}^2 + ${r}^2 = ${p}^2$`, tex`$${p} + ${q} = ${r}$`];
    return {
      prompt: tex`Melyik egyenlőség igaz erre a derékszögű háromszögre? (Minden oldalt a vele szemközti csúcs kisbetűje jelöl.)`,
      figure: rightTriangle({ a, b, names, turn, labels: { a: p, b: q, c: r } }),
      answer: choice(rng, correct, wrongs),
      hint: 'Keresd meg a derékszöget! A vele szemközti oldal az átfogó, és az kerül egyedül az egyenlőség egyik oldalára.',
      solution: [
        tex`A derékszög a(z) $${R}$ csúcsnál van, így a vele szemközti $${r}$ oldal az átfogó.`,
        tex`A befogók: $${p}$ és $${q}$.`,
        tex`Pitagorasz tétele: a befogók négyzetösszege egyenlő az átfogó négyzetével: **$${p}^2 + ${q}^2 = ${r}^2$**.`,
      ],
    };
  },
};

/** Areas of the squares drawn on the sides (link to the area proof). */
const squareAreas: GeneratorDef = {
  id: 'square-areas',
  title: 'Az oldalakra rajzolt négyzetek területe',
  levels: [1, 2],
  generate(rng, level): Question {
    const [a, b, c] = rng.pick(SMALL_TRIPLES.filter(([, , z]) => z <= 26));
    const askHyp = rng.chance(0.5);
    if (level === 1) {
      if (askHyp) {
        return {
          prompt: tex`Egy derékszögű háromszög befogóira rajzolt négyzetek területe $${num(a * a)}$ cm² és $${num(b * b)}$ cm². Mekkora az átfogóra rajzolt négyzet területe?`,
          figure: { type: 'triangle', legs: [a, b], squares: { a: `${num(a * a)} cm²`, b: `${num(b * b)} cm²`, c: '?' }, notToScale: false },
          answer: { type: 'number', value: c * c, unit: 'cm²' },
          hint: 'A tétel szerint az átfogóra rajzolt négyzet területe a két kisebb négyzet területének összege.',
          solution: [
            tex`Pitagorasz tétele területekkel: $c^2 = a^2 + b^2$.`,
            tex`$c^2 = ${num(a * a)} + ${num(b * b)} = ${num(c * c)}$`,
            tex`Az átfogóra rajzolt négyzet területe **${num(c * c)} cm²**.`,
          ],
        };
      }
      return {
        prompt: tex`Egy derékszögű háromszög átfogójára rajzolt négyzet területe $${num(c * c)}$ cm², az egyik befogóra rajzolté $${num(a * a)}$ cm². Mekkora a másik befogóra rajzolt négyzet területe?`,
        figure: { type: 'triangle', legs: [a, b], squares: { a: `${num(a * a)} cm²`, b: '?', c: `${num(c * c)} cm²` } },
        answer: { type: 'number', value: b * b, unit: 'cm²' },
        hint: 'A két kisebb négyzet együtt akkora, mint a nagy. Vond ki a nagyból az ismert kicsit!',
        solution: [
          tex`$a^2 + b^2 = c^2$, ezért $b^2 = c^2 - a^2$.`,
          tex`$b^2 = ${num(c * c)} - ${num(a * a)} = ${num(b * b)}$`,
          tex`A másik befogóra rajzolt négyzet területe **${num(b * b)} cm²**.`,
        ],
      };
    }
    // level 2: from the areas to a side length (the hypotenuse or a leg), in different units
    const unit = rng.pick(['cm', 'dm', 'm']);
    if (askHyp) {
      return {
        prompt: tex`Egy derékszögű háromszög befogóira rajzolt négyzetek területe $${num(a * a)}$ ${unit}² és $${num(b * b)}$ ${unit}². Milyen hosszú az átfogó?`,
        figure: { type: 'triangle', legs: [a, b], squares: { a: `${num(a * a)} ${unit}²`, b: `${num(b * b)} ${unit}²` }, sideLabels: { c: 'c = ?' } },
        answer: { type: 'number', value: c, unit },
        inputLabel: '$c =$',
        hint: 'Először az átfogóra rajzolt négyzet területét számítsd ki, aztán gondold meg: mekkora annak a négyzetnek az oldala?',
        solution: [
          tex`Az átfogóra rajzolt négyzet területe: $c^2 = ${num(a * a)} + ${num(b * b)} = ${num(c * c)}$ ${unit}².`,
          tex`A négyzet oldala ennek a négyzetgyöke: $c = \sqrt{${num(c * c)}} = ${num(c)}$.`,
          tex`Az átfogó **${num(c)} ${unit}**.`,
        ],
      };
    }
    return {
      prompt: tex`Egy derékszögű háromszög átfogójára rajzolt négyzet területe $${num(c * c)}$ ${unit}², az egyik befogóra rajzolté $${num(a * a)}$ ${unit}². Milyen hosszú a másik befogó?`,
      figure: { type: 'triangle', legs: [a, b], squares: { a: `${num(a * a)} ${unit}²`, c: `${num(c * c)} ${unit}²` }, sideLabels: { b: 'b = ?' } },
      answer: { type: 'number', value: b, unit },
      inputLabel: '$b =$',
      hint: 'A két befogóra rajzolt négyzet együtt akkora, mint az átfogóra rajzolt. Számítsd ki a hiányzó négyzet területét, aztán az oldalát!',
      solution: [
        tex`A másik befogóra rajzolt négyzet területe: $b^2 = ${num(c * c)} - ${num(a * a)} = ${num(b * b)}$ ${unit}².`,
        tex`A négyzet oldala ennek a négyzetgyöke: $b = \sqrt{${num(b * b)}} = ${num(b)}$.`,
        tex`A másik befogó **${num(b)} ${unit}**.`,
      ],
    };
  },
};

/** The converse: is a triangle with these sides right-angled? */
const converse: GeneratorDef = {
  id: 'converse',
  title: 'Derékszögű-e a háromszög? (a tétel megfordítása)',
  levels: [1, 2],
  generate(rng, level): Question {
    const triple = rng.pick(SMALL_TRIPLES);

    /** A near-miss: change one side by ±1 (still a valid triangle, not right-angled). */
    const nearMiss = (): [number, number, number] => {
      for (;;) {
        const t = [...rng.pick(SMALL_TRIPLES)] as [number, number, number];
        const i = rng.int(0, 2);
        t[i] += rng.sign();
        const [x, y, z] = [...t].sort((m, n) => m - n);
        if (x > 0 && x + y > z && x * x + y * y !== z * z) return t;
      }
    };

    if (level === 1) {
      const right = rng.chance(0.5);
      const sides = right ? [...triple] : nearMiss();
      const shown = rng.shuffle(sides);
      const [x, y, z] = [...sides].sort((m, n) => m - n);
      return {
        prompt: tex`Egy háromszög oldalai $${num(shown[0])}$ cm, $${num(shown[1])}$ cm és $${num(shown[2])}$ cm. Igaz vagy hamis?\n\n**A háromszög derékszögű.**`,
        answer: { type: 'truefalse', value: right },
        hint: 'Ha derékszögű, akkor a leghosszabb oldal az átfogó. Nézd meg: a két rövidebb oldal négyzetének összege egyenlő-e a leghosszabb oldal négyzetével?',
        solution: [
          tex`A leghosszabb oldal $${num(z)}$ cm — ha derékszögű a háromszög, ez az átfogó.`,
          tex`$${num(x)}^2 + ${num(y)}^2 = ${num(x * x)} + ${num(y * y)} = ${num(x * x + y * y)}$`,
          tex`$${num(z)}^2 = ${num(z * z)}$`,
          right
            ? tex`A kettő egyenlő, tehát a háromszög **derékszögű** — az állítás **igaz**.`
            : tex`$${num(x * x + y * y)} \ne ${num(z * z)}$, tehát a háromszög **nem derékszögű** — az állítás **hamis**.`,
        ],
      };
    }
    // level 2: pick the right-angled one among four
    const fmt = (t: readonly number[]) => tex`$${t.map((v) => num(v)).join(';\\ ')}$`;
    const wrongs: [number, number, number][] = [];
    while (wrongs.length < 3) {
      const w = nearMiss();
      if (!wrongs.some((o) => o.join() === w.join())) wrongs.push(w);
    }
    const [x, y, z] = triple;
    return {
      prompt: 'Melyik számhármas lehet egy **derékszögű** háromszög három oldalának hossza (cm-ben)?',
      answer: choice(rng, rng.shuffle(triple), wrongs.map((w) => rng.shuffle(w)), { format: fmt }),
      hint: 'Minden hármasnál nézd meg: a két kisebb szám négyzetének összege egyenlő-e a legnagyobb szám négyzetével?',
      solution: [
        'Egy háromszög akkor derékszögű, ha a két rövidebb oldal négyzetösszege egyenlő a leghosszabb oldal négyzetével.',
        tex`A(z) $${num(x)};\ ${num(y)};\ ${num(z)}$ hármasra: $${num(x * x)} + ${num(y * y)} = ${num(x * x + y * y)} = ${num(z)}^2$. ✓`,
        ...wrongs.map((w) => {
          const [p, q, r] = [...w].sort((m, n) => m - n);
          return tex`$${num(p)};\ ${num(q)};\ ${num(r)}$: $${num(p * p)} + ${num(q * q)} = ${num(p * p + q * q)}$, de $${num(r)}^2 = ${num(r * r)}$. ✗`;
        }),
        tex`A derékszögű háromszög oldalai: **$${num(x)};\ ${num(y)};\ ${num(z)}$**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. Static figures for the theory part
// ---------------------------------------------------------------------------------------------

/** Two (a + b)-squares with the same four triangles: what is left is c² on the left, a² + b² on the right. */
const proofFigure: Figure = {
  type: 'geometry',
  points: {
    // left square 0..5 (a = 2, b = 3)
    L1: [0, 0],
    L2: [5, 0],
    L3: [5, 5],
    L4: [0, 5],
    P1: [2, 0],
    P2: [5, 2],
    P3: [3, 5],
    P4: [0, 3],
    // right square 6.5..11.5
    R1: [6.5, 0],
    R2: [11.5, 0],
    R3: [11.5, 5],
    R4: [6.5, 5],
    Q1: [8.5, 0],
    Q2: [8.5, 2],
    Q3: [6.5, 2],
    Q4: [11.5, 2],
    Q5: [8.5, 5],
  },
  items: [
    // left: four triangles in the corners, tilted square c² in the middle
    { kind: 'region', points: ['L1', 'P1', 'P4'], fill: 'muted' },
    { kind: 'region', points: ['P1', 'L2', 'P2'], fill: 'muted' },
    { kind: 'region', points: ['P2', 'L3', 'P3'], fill: 'muted' },
    { kind: 'region', points: ['P3', 'L4', 'P4'], fill: 'muted' },
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], fill: 'orange', vertexLabels: false },
    { kind: 'polygon', points: ['L1', 'L2', 'L3', 'L4'], vertexLabels: false },
    { kind: 'label', at: [2.5, 2.5], text: 'c²', size: 'large' },
    // right: a² and b² squares + two rectangles cut into triangles
    { kind: 'polygon', points: ['R1', 'Q1', 'Q2', 'Q3'], fill: 'green', vertexLabels: false },
    { kind: 'polygon', points: ['Q2', 'Q4', 'R3', 'Q5'], fill: 'blue', vertexLabels: false },
    { kind: 'region', points: ['Q1', 'R2', 'Q4', 'Q2'], fill: 'muted' },
    { kind: 'region', points: ['Q3', 'Q2', 'Q5', 'R4'], fill: 'muted' },
    { kind: 'segment', from: 'Q1', to: 'Q4', width: 'thin' },
    { kind: 'segment', from: 'Q3', to: 'Q5', width: 'thin' },
    { kind: 'polygon', points: ['R1', 'R2', 'R3', 'R4'], vertexLabels: false },
    { kind: 'label', at: [7.5, 1], text: 'a²', size: 'large' },
    { kind: 'label', at: [10, 3.5], text: 'b²', size: 'large' },
    // side lengths a + b
    { kind: 'label', at: [1, 0], text: 'a', dir: 's' },
    { kind: 'label', at: [3.5, 0], text: 'b', dir: 's' },
    { kind: 'label', at: [7.5, 0], text: 'a', dir: 's' },
    { kind: 'label', at: [10, 0], text: 'b', dir: 's' },
  ],
};

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-pitagorasz-01',
  goals: [
    'felismerni a derékszögű háromszög befogóit és átfogóját,',
    'mit mond ki Pitagorasz tétele, és miért igaz,',
    'kiszámítani az átfogót vagy egy befogót,',
    'eldönteni egy háromszögről, hogy derékszögű-e.',
  ],
  steps: [
    {
      type: 'theory',
      title: 'A derékszögű háromszög oldalai',
      body: 'Egy háromszög **derékszögű**, ha az egyik szöge $90°$.\n\nA derékszöget közrefogó két oldal a két **befogó** (általában $a$ és $b$). A derékszöggel szemközti oldal az **átfogó** ($c$). Az átfogó mindig a **leghosszabb** oldal.',
      figure: rightTriangle({ a: 3, b: 4, labels: { a: 'a (befogó)', b: 'b (befogó)', c: 'c (átfogó)' }, highlight: ['c'] }),
    },
    {
      type: 'check',
      question: {
        prompt: 'A(z) $KLM$ derékszögű háromszögben a derékszög a(z) $K$ csúcsnál van. Melyik oldal az átfogó?',
        figure: rightTriangle({ a: 3, b: 5, names: ['L', 'M', 'K'], turn: 200 }),
        answer: textChoice('$LM$', ['$KL$', '$KM$']),
        hint: 'Az átfogó a derékszöggel szemközti oldal — nem érinti a $K$ csúcsot.',
        solution: ['A derékszög a $K$ csúcsnál van.', 'A $K$-val szemközti oldal az $LM$, ez az átfogó.'],
      },
    },
    {
      type: 'theory',
      title: 'Pitagorasz tétele',
      body: 'Rajzoljunk mindhárom oldalra egy-egy négyzetet! A rácson megszámolhatod: a két kisebb négyzet területe $9$ és $16$, a nagyé $25$ — és $9 + 16 = 25$.\n\nEz minden derékszögű háromszögre igaz:',
      figure: { type: 'triangle', legs: [3, 4], squares: { a: 'a² = 9', b: 'b² = 16', c: 'c² = 25' } },
      remember: '**Pitagorasz tétele:** a derékszögű háromszögben a befogók négyzetének összege egyenlő az átfogó négyzetével:\n$a^2 + b^2 = c^2$',
    },
    {
      type: 'theory',
      title: 'Miért igaz? — egy szemléletes bizonyítás',
      body: 'Vegyünk két egyforma, $a + b$ oldalú négyzetet, és tegyünk mindkettőbe **ugyanazt a négy** derékszögű háromszöget (szürkék).\n\nBalra a háromszögek között egy $c$ oldalú négyzet marad ki: $c^2$. Jobbra két négyzet marad ki: $a^2$ és $b^2$.\n\nA nagy négyzetek egyformák, a négy háromszög is ugyanaz, tehát a kimaradó részek területe is egyenlő: $a^2 + b^2 = c^2$.',
      figure: proofFigure,
    },
    {
      type: 'check',
      question: {
        prompt: 'Igaz vagy hamis?\n\n**Minden háromszögben igaz, hogy $a^2 + b^2 = c^2$.**',
        answer: { type: 'truefalse', value: false },
        hint: 'Gondolj arra, milyen háromszögről szólt a tétel!',
        solution: ['Pitagorasz tétele csak a **derékszögű** háromszögekre igaz.', 'Ott is csak akkor, ha $c$ az átfogó (a derékszöggel szemközti oldal).'],
      },
    },
    {
      type: 'explore',
      title: 'Próbáld ki!',
      body: 'Húzd a csúszkákat, és figyeld, hogyan változnak a négyzetek!',
      sliders: [
        { name: 'a', label: '$a$ befogó', min: 1, max: 8, step: 1, value: 3 },
        { name: 'b', label: '$b$ befogó', min: 1, max: 8, step: 1, value: 4 },
      ],
      render: ({ a, b }) => {
        const sum = a * a + b * b;
        const c = Math.sqrt(sum);
        const whole = Number.isInteger(c);
        return {
          figure: { type: 'triangle', legs: [a, b], squares: { a: `${num(a * a)}`, b: `${num(b * b)}`, c: `${num(sum)}` } },
          text: tex`$a^2 + b^2 = ${num(a * a)} + ${num(b * b)} = ${num(sum)} = c^2$\n\n$c = ${whole ? num(c) : tex`\sqrt{${num(sum)}} \approx ${num(c, 2)}`}$${whole ? ' — egész szám! 🎉' : ''}`,
        };
      },
    },
    {
      type: 'theory',
      title: 'Hogyan számolunk vele?',
      body: '**Ha az átfogó hiányzik:** összeadjuk a befogók négyzetét, és gyököt vonunk.\n$c = \\sqrt{a^2 + b^2}$\n\n**Ha egy befogó hiányzik:** az átfogó négyzetéből kivonjuk a másik befogó négyzetét, és gyököt vonunk.\n$a = \\sqrt{c^2 - b^2}$',
      remember: 'Átfogó: **összeadunk**. Befogó: **kivonunk**. Végül mindig **gyököt vonunk**!',
    },
    {
      type: 'example',
      title: 'Az átfogó kiszámítása',
      problem: 'Egy derékszögű háromszög befogói $6$ cm és $8$ cm. Milyen hosszú az átfogó?',
      figure: rightTriangle({ a: 6, b: 8, labels: { a: '6 cm', b: '8 cm', c: 'c = ?' }, highlight: ['c'] }),
      steps: [
        { text: 'Az átfogó hiányzik, ezért **összeadjuk** a befogók négyzetét: $c^2 = a^2 + b^2$.' },
        { text: '$c^2 = 6^2 + 8^2 = 36 + 64 = 100$' },
        { text: 'Gyököt vonunk: $c = \\sqrt{100} = 10$.' },
        { text: 'Ellenőrzés: az átfogó a leghosszabb oldal — $10 > 8$, rendben.' },
      ],
      answer: 'Az átfogó **10 cm** hosszú.',
    },
    { type: 'practice', generator: 'hypotenuse', level: 1, count: 2 },
    {
      type: 'example',
      title: 'Egy befogó kiszámítása',
      problem: 'Egy derékszögű háromszög átfogója $13$ cm, az egyik befogója $5$ cm. Mekkora a másik befogó?',
      figure: rightTriangle({ a: 12, b: 5, labels: { a: 'a = ?', b: '5 cm', c: '13 cm' }, highlight: ['a'] }),
      steps: [
        { text: 'Most egy befogó hiányzik, ezért **kivonunk**: $a^2 = c^2 - b^2$.' },
        { text: '$a^2 = 13^2 - 5^2 = 169 - 25 = 144$' },
        { text: 'Gyököt vonunk: $a = \\sqrt{144} = 12$.' },
        { text: 'Ellenőrzés: $5^2 + 12^2 = 25 + 144 = 169 = 13^2$. ✓' },
      ],
      answer: 'A másik befogó **12 cm**.',
    },
    { type: 'practice', generator: 'leg', level: 1, count: 2 },
    { type: 'practice', generator: 'square-areas', level: 1 },
    { type: 'practice', generator: 'side-names', level: 1 },
    {
      type: 'example',
      title: 'Ha nem egész szám jön ki',
      problem: 'Egy derékszögű háromszög befogói $3$ cm és $5$ cm. Milyen hosszú az átfogó?',
      figure: rightTriangle({ a: 3, b: 5, labels: { a: '3 cm', b: '5 cm', c: 'c = ?' }, highlight: ['c'] }),
      steps: [
        { text: '$c^2 = 3^2 + 5^2 = 9 + 25 = 34$' },
        { text: 'A $34$ nem négyzetszám, ezért a gyököt meghagyjuk: $c = \\sqrt{34}$.' },
        { text: 'Ha közelítő érték kell: $c \\approx 5{,}83$ cm.' },
      ],
      answer: 'Az átfogó $\\sqrt{34}$ cm, vagyis kb. $5{,}83$ cm. A válaszmezőbe a $\\sqrt{\\ }$ gombbal írhatod be: √34.',
    },
    { type: 'practice', generator: 'hypotenuse', level: 2, count: 2 },
    { type: 'practice', generator: 'leg', level: 2 },
    {
      type: 'theory',
      title: 'Megfordítva is igaz!',
      body: 'Ha egy háromszög oldalaira teljesül, hogy a két rövidebb oldal négyzetösszege egyenlő a leghosszabb oldal négyzetével, akkor a háromszög **derékszögű**. Ez a tétel **megfordítása**.\n\nAz ilyen egész számokat **pitagoraszi számhármasoknak** hívjuk, például:\n- $3;\\ 4;\\ 5$\n- $5;\\ 12;\\ 13$\n- $8;\\ 15;\\ 17$\n\nEgy hármas minden többszöröse is jó ($6;\\ 8;\\ 10$, $9;\\ 12;\\ 15$ …), ezért végtelen sok ilyen hármas van.',
    },
    {
      type: 'example',
      title: 'Derékszögű-e a háromszög?',
      problem: 'Egy háromszög oldalai $7$ cm, $24$ cm és $25$ cm. Derékszögű-e?',
      steps: [
        { text: 'A leghosszabb oldal $25$ cm — ha derékszögű, ez az átfogó.' },
        { text: '$7^2 + 24^2 = 49 + 576 = 625$' },
        { text: '$25^2 = 625$ — a kettő egyenlő!' },
      ],
      answer: 'A háromszög **derékszögű** (a derékszög a $25$ cm-es oldallal szemközt van).',
    },
    { type: 'practice', generator: 'converse', level: 1, count: 2 },
    { type: 'practice', generator: 'side-names', level: 2 },
    { type: 'practice', generator: 'converse', level: 2 },
    { type: 'practice', generator: 'hypotenuse', level: 3 },
    { type: 'practice', generator: 'leg', level: 3 },
  ],
  generators: [hypotenuse, leg, sideNames, squareAreas, converse],
  miniTest: {
    items: [
      { generator: 'hypotenuse', level: 1 },
      { generator: 'leg', level: 1 },
      { generator: 'side-names', level: 2 },
      { generator: 'hypotenuse', level: 2 },
      { generator: 'leg', level: 2 },
      { generator: 'converse', level: 1 },
      { generator: 'leg', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'hypotenuse', level: 1 },
    { generator: 'hypotenuse', level: 2 },
    { generator: 'leg', level: 1 },
    { generator: 'leg', level: 2 },
    { generator: 'side-names', level: 1 },
    { generator: 'square-areas', level: 1 },
    { generator: 'converse', level: 1 },
  ],
});
