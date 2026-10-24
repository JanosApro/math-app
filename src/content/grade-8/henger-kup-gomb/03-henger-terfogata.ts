/**
 * 8. osztály › Henger, kúp és gömb › 3. Az egyenes henger térfogata
 *
 * GOLD-STANDARD EXAMPLE (3D): a cylinder figure that follows the generated numbers,
 * answers in π-form (expression answers like '45π') and with π ≈ 3,14 (number answers),
 * an explore card with sliders, reverse problems and a "what happens if…" choice.
 *
 * Notation (see DECISIONS.md): r radius, d diameter, H height of the solid, B base area,
 * V volume; π is written after the factors (r²π); results are left in π-form unless the
 * task says π ≈ 3,14.
 */
import {
  choice,
  clean,
  defineSubtopic,
  num,
  round,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A right cylinder with labelled radius (or diameter) and height. Follows the numbers. */
function cylinder(r: number, H: number, unit: string, opts: { useDiameter?: boolean; unknownH?: boolean; unknownR?: boolean } = {}): Figure {
  const hLabel = opts.unknownH ? 'H = ?' : `H = ${num(H)} ${unit}`;
  const rLabel = opts.unknownR ? 'r = ?' : `r = ${num(r)} ${unit}`;
  return {
    type: 'solid',
    shape: 'cylinder',
    r,
    h: H,
    labels: opts.useDiameter ? { d: `d = ${num(2 * r)} ${unit}`, h: hLabel } : { r: rLabel, h: hLabel },
    highlight: opts.unknownH ? ['h'] : opts.unknownR ? ['r'] : undefined,
  };
}

/** "45π" as typed (expression answers) and "45\pi" for LaTeX. */
const piValue = (k: number) => `${k}π`;
const piTex = (k: number) => tex`${num(k)}\pi`;

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Base area B = r²π. */
const baseArea: GeneratorDef = {
  id: 'base-area',
  title: 'Az alaplap területe (B = r²π)',
  levels: [1],
  generate(rng): Question {
    const r = rng.int(2, 9);
    const H = rng.int(2, 12);
    const unit = rng.pick(['cm', 'dm', 'm']);
    return {
      prompt: tex`Egy henger alapkörének sugara $r = ${num(r)}$ ${unit}. Mekkora az alaplap területe? Az eredményt $\pi$-vel kifejezve add meg!`,
      figure: cylinder(r, H, unit),
      answer: { type: 'expression', value: piValue(r * r) },
      inputLabel: '$B =$',
      hint: 'Az alaplap egy kör: a területe $B = r^2\\pi$.',
      solution: [
        tex`Az alaplap kör, ezért $B = r^2\pi$.`,
        tex`$B = ${num(r)}^2 \cdot \pi = ${piTex(r * r)}$`,
        tex`Az alaplap területe **$${piTex(r * r)}$ ${unit}²**.`,
      ],
    };
  },
};

/**
 * Volume V = r²πH.
 * L1: r and H whole numbers, π-form.  L2: diameter given (π-form) or π ≈ 3,14.
 * L3: real-life container in litres (dm³), π ≈ 3,14, rounded to one decimal.
 */
const volume: GeneratorDef = {
  id: 'volume',
  title: 'A henger térfogata (V = r²πH)',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const ctx = rng.pick([
        { what: 'Egy henger alakú esővízgyűjtő tartály', r: [2, 3, 4], H: [6, 8, 9, 10] },
        { what: 'Egy henger alakú akvárium', r: [1, 2], H: [3, 4, 5] },
        { what: 'Egy henger alakú hordó', r: [2, 3], H: [5, 6, 7, 8] },
      ]);
      const r = rng.pick(ctx.r);
      const H = rng.pick(ctx.H);
      const k = r * r * H;
      const V = clean(k * 3.14);
      return {
        prompt: tex`${ctx.what} alapkörének sugara $${num(r)}$ dm, magassága $${num(H)}$ dm. Hány liter víz fér bele? ($\pi \approx 3,14$; $1\ \text{dm}^3 = 1$ liter; egy tizedesjegyre kerekíts!)`,
        figure: cylinder(r, H, 'dm'),
        answer: { type: 'number', value: V, precision: 1, unit: 'l' },
        inputLabel: '$V \\approx$',
        hint: 'Számítsd ki a térfogatot dm³-ben ($V = r^2\\pi H$). Mivel 1 dm³ = 1 liter, a szám ugyanaz marad.',
        solution: [
          tex`$V = r^2\pi H = ${num(r)}^2 \cdot \pi \cdot ${num(H)} = ${piTex(k)}$ dm³.`,
          tex`$\pi \approx 3,14$ értékkel: $V \approx ${num(k)} \cdot 3,14 = ${num(V)}$ dm³.`,
          tex`$1$ dm³ $= 1$ liter, tehát kb. **${num(round(V, 1))} liter** víz fér bele.`,
        ],
      };
    }
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    if (level === 1) {
      const r = rng.int(1, 6);
      const H = rng.int(2, 12);
      const k = r * r * H;
      return {
        prompt: tex`Egy henger alapkörének sugara $${num(r)}$ ${unit}, magassága $${num(H)}$ ${unit}. Számítsd ki a térfogatát! ($\pi$-vel kifejezve add meg.)`,
        figure: cylinder(r, H, unit),
        answer: { type: 'expression', value: piValue(k) },
        inputLabel: '$V =$',
        hint: 'A henger térfogata az alaplap területének és a magasságnak a szorzata: $V = B \\cdot H = r^2\\pi H$.',
        solution: [
          tex`Az alaplap területe: $B = r^2\pi = ${num(r)}^2\pi = ${piTex(r * r)}$ ${unit}².`,
          tex`$V = B \cdot H = ${piTex(r * r)} \cdot ${num(H)} = ${piTex(k)}$`,
          tex`A henger térfogata **$${piTex(k)}$ ${unit}³**.`,
        ],
      };
    }
    // level 2
    if (rng.chance(0.5)) {
      const d = 2 * rng.int(2, 8);
      const r = d / 2;
      const H = rng.int(3, 15);
      const k = r * r * H;
      return {
        prompt: tex`Egy henger alapkörének átmérője $${num(d)}$ ${unit}, magassága $${num(H)}$ ${unit}. Számítsd ki a térfogatát! ($\pi$-vel kifejezve add meg.)`,
        figure: cylinder(r, H, unit, { useDiameter: true }),
        answer: { type: 'expression', value: piValue(k) },
        inputLabel: '$V =$',
        hint: 'Vigyázz: az átmérő a sugár kétszerese! Előbb számítsd ki a sugarat.',
        solution: [
          tex`A sugár az átmérő fele: $r = ${num(d)} : 2 = ${num(r)}$ ${unit}.`,
          tex`$V = r^2\pi H = ${num(r)}^2 \cdot \pi \cdot ${num(H)} = ${num(r * r)} \cdot ${num(H)} \cdot \pi = ${piTex(k)}$`,
          tex`A henger térfogata **$${piTex(k)}$ ${unit}³**.`,
        ],
      };
    }
    const r = rng.int(2, 10);
    const H = rng.int(2, 15);
    const k = r * r * H;
    const V = clean(k * 3.14);
    return {
      prompt: tex`Egy henger alapkörének sugara $${num(r)}$ ${unit}, magassága $${num(H)}$ ${unit}. Számítsd ki a térfogatát! ($\pi \approx 3,14$)`,
      figure: cylinder(r, H, unit),
      answer: { type: 'number', value: V, unit: `${unit}³` },
      inputLabel: '$V \\approx$',
      hint: 'Számold ki előbb $\\pi$-vel kifejezve ($V = r^2\\pi H$), aztán szorozz $3,14$-dal!',
      solution: [
        tex`$V = r^2\pi H = ${num(r)}^2 \cdot \pi \cdot ${num(H)} = ${piTex(k)}$`,
        tex`$V \approx ${num(k)} \cdot 3,14 = ${num(V)}$`,
        tex`A henger térfogata kb. **${num(V)} ${unit}³**.`,
      ],
    };
  },
};

/** Reverse problems: height (L2) or radius (L3) from the volume. */
const reverse: GeneratorDef = {
  id: 'reverse',
  title: 'Magasság vagy sugár a térfogatból',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'dm', 'm']);
    const r = rng.int(2, 7);
    const H = rng.int(2, 12);
    const k = r * r * H;
    if (level === 2) {
      return {
        prompt: tex`Egy henger térfogata $V = ${piTex(k)}$ ${unit}³, alapkörének sugara $${num(r)}$ ${unit}. Milyen magas a henger?`,
        figure: cylinder(r, H, unit, { unknownH: true }),
        answer: { type: 'number', value: H, unit },
        inputLabel: '$H =$',
        hint: tex`$V = B \cdot H$, tehát $H = V : B$. Számítsd ki előbb az alaplap területét!`,
        solution: [
          tex`Az alaplap területe: $B = r^2\pi = ${num(r)}^2\pi = ${piTex(r * r)}$ ${unit}².`,
          tex`$H = V : B = ${piTex(k)} : ${piTex(r * r)} = ${num(H)}$ (a $\pi$ kiesik).`,
          tex`A henger **${num(H)} ${unit}** magas.`,
        ],
      };
    }
    return {
      prompt: tex`Egy henger térfogata $V = ${piTex(k)}$ ${unit}³, magassága $${num(H)}$ ${unit}. Mekkora az alapkör sugara?`,
      figure: cylinder(r, H, unit, { unknownR: true }),
      answer: { type: 'number', value: r, unit },
      inputLabel: '$r =$',
      hint: tex`Osszad el a térfogatot a magassággal: így megkapod az alaplap területét ($r^2\pi$). Ebből mi lehet $r$?`,
      solution: [
        tex`$B = V : H = ${piTex(k)} : ${num(H)} = ${piTex(r * r)}$ ${unit}².`,
        tex`$r^2\pi = ${piTex(r * r)}$, tehát $r^2 = ${num(r * r)}$.`,
        tex`$r = \sqrt{${num(r * r)}} = ${num(r)}$`,
        tex`Az alapkör sugara **${num(r)} ${unit}**.`,
      ],
    };
  },
};

/** What happens to the volume if r or H is multiplied? */
const scaling: GeneratorDef = {
  id: 'scaling',
  title: 'Hogyan változik a térfogat?',
  levels: [2],
  generate(rng): Question {
    const which = rng.pick(['r', 'H', 'both'] as const);
    const k = rng.pick([2, 3]);
    const factor = which === 'r' ? k * k : which === 'H' ? k : k * k * k;
    // "-szorosára / -szeresére / -szörösére" with vowel harmony; 2 is spoken "két" (kétszeresére)
    const times = (n: number) => `$${num(n)}$-${n % 10 === 2 ? 'szeresére' : suffix(n, 'szorosára', 'szeresére', 'szörösére')}`;
    const what =
      which === 'r'
        ? `az alapkör sugarát ${times(k)} növeljük, a magasságot nem változtatjuk`
        : which === 'H'
          ? `a magasságot ${times(k)} növeljük, a sugarat nem változtatjuk`
          : `a sugarat is és a magasságot is ${times(k)} növeljük`;
    return {
      prompt: `Hányszorosára nő a henger térfogata, ha ${what}?`,
      answer: choice(rng, factor, [k, k * k, k * k * k, 2 * k, k + 1], { format: times }),
      hint: 'Nézd meg a képletet: $V = r^2\\pi H$. A sugár **négyzetesen** szerepel benne, a magasság csak egyszer.',
      solution: [
        'A térfogat képlete: $V = r^2\\pi H$.',
        which === 'r'
          ? tex`Ha $r$ helyett $${num(k)}r$ áll: $(${num(k)}r)^2\pi H = ${num(k * k)} \cdot r^2\pi H$.`
          : which === 'H'
            ? tex`Ha $H$ helyett $${num(k)}H$ áll: $r^2\pi \cdot ${num(k)}H = ${num(k)} \cdot r^2\pi H$.`
            : tex`$(${num(k)}r)^2\pi \cdot ${num(k)}H = ${num(k * k)} \cdot ${num(k)} \cdot r^2\pi H = ${num(factor)} \cdot r^2\pi H$.`,
        `A térfogat **${times(factor)}** nő.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-henger-kup-gomb-03',
  goals: [
    'kiszámítani a henger alaplapjának területét és a henger térfogatát,',
    'az eredményt π-vel kifejezve és közelítő értékkel is megadni,',
    'a térfogatból visszaszámolni a magasságot vagy a sugarat.',
  ],
  parts: [
    {
      title: 'A henger térfogata',
      steps: [
        {
          type: 'theory',
          title: 'A henger térfogata',
          body: 'Mint a hasábnál: alaplap · magasság. Az alaplap egy $r$ sugarú kör: $B = r^2\\pi$.',
          figure: { type: 'solid', shape: 'cylinder', r: 3, h: 5, labels: { r: 'r', h: 'H' } },
          remember: '$V = B \\cdot H = r^2\\pi H$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik képlettel számoljuk ki a henger **térfogatát**?',
            answer: textChoice('$V = r^2\\pi H$', ['$V = 2r\\pi H$', '$V = 2r^2\\pi + 2r\\pi H$', '$V = r\\pi H$']),
            hint: 'Térfogat = alaplap területe · magasság. Mekkora egy kör területe?',
            solution: [
              'Az alaplap területe $B = r^2\\pi$, ezt szorozzuk a magassággal: $V = r^2\\pi H$.',
              'A $2r\\pi H$ a palást területe, a $2r^2\\pi + 2r\\pi H$ a felszín — ezek nem térfogatok.',
            ],
          },
        },
        {
          type: 'explore',
          title: 'Próbáld ki!',
          body: 'Duplázd meg a sugarat: hányszorosára nő a térfogat?',
          sliders: [
            { name: 'r', label: '$r$ (cm)', min: 1, max: 6, step: 1, value: 2 },
            { name: 'H', label: '$H$ (cm)', min: 1, max: 10, step: 1, value: 5 },
          ],
          render: ({ r, H }) => ({
            figure: cylinder(r, H, 'cm'),
            text: tex`$B = r^2\pi = ${num(r)}^2\pi = ${piTex(r * r)}$ cm²\n\n$V = B \cdot H = ${piTex(r * r)} \cdot ${num(H)} = ${piTex(r * r * H)} \approx ${num(r * r * H * 3.14)}$ cm³`,
          }),
        },
        {
          type: 'example',
          title: 'A térfogat kiszámítása',
          problem: 'Egy henger alapkörének sugara $3$ cm, magassága $5$ cm. Mekkora a térfogata?',
          figure: cylinder(3, 5, 'cm'),
          steps: [
            { text: '$B = r^2\\pi = 3^2\\pi = 9\\pi$ cm²' },
            { text: '$V = B \\cdot H = 9\\pi \\cdot 5 = 45\\pi$ cm³ $\\approx 141,3$ cm³' },
          ],
          answer: 'A térfogat $45\\pi$ cm³. Beírva: **45π** (π gomb).',
        },
        { type: 'practice', generator: 'base-area', level: 1 },
        { type: 'practice', generator: 'volume', level: 1, count: 2 },
      ],
    },
    {
      title: 'Átmérő és arányok',
      steps: [
        {
          type: 'example',
          title: 'Ha az átmérő adott',
          problem: 'Egy henger alapkörének átmérője $10$ cm, magassága $12$ cm. Mekkora a térfogata?',
          figure: cylinder(5, 12, 'cm', { useDiameter: true }),
          steps: [
            { text: '$r = 10 : 2 = 5$ cm' },
            { text: '$V = r^2\\pi H = 5^2 \\cdot \\pi \\cdot 12 = 25 \\cdot 12 \\cdot \\pi = 300\\pi$ cm³.' },
          ],
          answer: 'A térfogat $300\\pi$ cm³ (kb. $942$ cm³).',
        },
        { type: 'practice', generator: 'volume', level: 2, count: 2 },
        { type: 'practice', generator: 'scaling', level: 2 },
      ],
    },
    {
      title: 'Visszafelé: a magasság',
      steps: [
        {
          type: 'example',
          title: 'Visszafelé: a magasság',
          problem: 'Egy henger térfogata $72\\pi$ cm³, alapkörének sugara $3$ cm. Milyen magas?',
          figure: cylinder(3, 8, 'cm', { unknownH: true }),
          steps: [
            { text: '$B = 3^2\\pi = 9\\pi$ cm²' },
            { text: '$H = V : B = 72\\pi : 9\\pi = 8$' },
          ],
          answer: 'A henger $8$ cm magas.',
        },
        { type: 'practice', generator: 'reverse', level: 2 },
        { type: 'practice', generator: 'volume', level: 3 },
        { type: 'practice', generator: 'reverse', level: 3 },
      ],
    },
  ],
  generators: [baseArea, volume, reverse, scaling],
  miniTest: {
    items: [
      { generator: 'base-area', level: 1 },
      { generator: 'volume', level: 1 },
      { generator: 'volume', level: 2 },
      { generator: 'reverse', level: 2 },
      { generator: 'scaling', level: 2 },
      { generator: 'volume', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'base-area', level: 1 },
    { generator: 'volume', level: 1 },
    { generator: 'volume', level: 2 },
    { generator: 'reverse', level: 2 },
    { generator: 'scaling', level: 2 },
  ],
});
