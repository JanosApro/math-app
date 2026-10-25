/**
 * 7. osztály › Valós számok › 5. Számtani műveletek valós számokkal
 *
 * Properties of + and · in R (the same laws as in Q), the root rules √(ab) = √a·√b and
 * √(a : b) = √a : √b, the sum trap √(a + b) ≠ √a + √b, simplifying roots to k√n, adding and
 * subtracting like roots, √(a²) = |a|, and setting up a numeric expression from a real situation.
 * Every answer is computed by code.
 */
import {
  choice,
  clean,
  defineSubtopic,
  num,
  rootText,
  simplifyRoot,
  tex,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A root answer in simplified k√n form. */
const rootAnswer = (coef: number, radicand: number, unit?: string) =>
  ({ type: 'root' as const, coef, radicand, unit });

/** The three operation properties, always with both names. */
const LAW = {
  comm: 'kommutativitás (felcserélhetőség)',
  assoc: 'asszociativitás (csoportosíthatóság)',
  dist: 'disztributivitás (széttagolhatóság)',
} as const;

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** √n = k√m (partial root extraction). */
const simplifyRootGen: GeneratorDef = {
  id: 'simplify-root',
  title: 'Gyök egyszerűbb alakra hozása (√n = k√m)',
  levels: [1, 2],
  generate(rng, level): Question {
    const radicands = level === 1 ? [2, 3, 5, 6, 7] : [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
    const m = rng.pick(radicands);
    const k = level === 1 ? rng.int(2, 5) : rng.int(2, 9);
    const n = k * k * m;
    const s = simplifyRoot(n);
    return {
      prompt: tex`Hozd egyszerűbb alakra! $\sqrt{${num(n)}}$`,
      answer: rootAnswer(s.coef, s.radicand),
      hint: 'Keresd meg a legnagyobb négyzetszámot, amely osztja a gyök alatti számot, és bontsd szorzatra!',
      solution: [
        tex`$${num(n)} = ${num(k * k)} \cdot ${num(m)}$`,
        tex`$\sqrt{${num(n)}} = \sqrt{${num(k * k)} \cdot ${num(m)}} = \sqrt{${num(k * k)}} \cdot \sqrt{${num(m)}}$`,
        tex`$= ${num(k)} \cdot \sqrt{${num(m)}} = ${texRoot(s.coef, s.radicand)}$`,
        tex`Az egyszerűbb alak: **$${texRoot(s.coef, s.radicand)}$**.`,
      ],
    };
  },
};

/** √a · √b = √(ab) and √a : √b = √(a : b). */
const rootProduct: GeneratorDef = {
  id: 'root-product',
  title: 'Gyökök szorzása és osztása',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const [a, b] = rng.pick([
        [8, 2],
        [12, 3],
        [18, 2],
        [27, 3],
        [50, 2],
        [20, 5],
        [32, 2],
        [45, 5],
        [75, 3],
        [48, 3],
        [72, 2],
        [128, 2],
        [28, 7],
        [44, 11],
        [52, 13],
        [68, 17],
        [84, 21],
        [96, 6],
        [54, 6],
        [80, 20],
      ] as [number, number][]);
      const value = Math.sqrt(a * b);
      return {
        prompt: tex`Számítsd ki! $\sqrt{${num(a)}} \cdot \sqrt{${num(b)}}$`,
        answer: { type: 'number', value },
        hint: 'Két gyök szorzata egyenlő a szorzat gyökével: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$.',
        solution: [
          tex`$\sqrt{${num(a)}} \cdot \sqrt{${num(b)}} = \sqrt{${num(a)} \cdot ${num(b)}} = \sqrt{${num(a * b)}}$`,
          tex`$= ${num(value)}$`,
          tex`Az eredmény **${num(value)}**.`,
        ],
      };
    }
    if (rng.chance(0.5)) {
      const [a, b] = rng.pick([
        [75, 3],
        [98, 2],
        [108, 3],
        [72, 2],
        [125, 5],
        [180, 5],
        [147, 3],
        [162, 2],
      ] as [number, number][]);
      const value = Math.sqrt(a / b);
      return {
        prompt: tex`Számítsd ki! $\sqrt{${num(a)}} : \sqrt{${num(b)}}$`,
        answer: { type: 'number', value },
        hint: 'Két gyök hányadosa egyenlő a hányados gyökével: $\\sqrt{a} : \\sqrt{b} = \\sqrt{a : b}$.',
        solution: [
          tex`$\sqrt{${num(a)}} : \sqrt{${num(b)}} = \sqrt{${num(a)} : ${num(b)}} = \sqrt{${num(a / b)}}$`,
          tex`$= ${num(value)}$`,
          tex`Az eredmény **${num(value)}**.`,
        ],
      };
    }
    const [a, b] = rng.pick([
      [6, 3],
      [10, 5],
      [14, 7],
      [15, 3],
      [21, 3],
      [22, 2],
    ] as [number, number][]);
    const s = simplifyRoot(a * b);
    return {
      prompt: tex`Számítsd ki, és egyszerűbb alakban add meg! $\sqrt{${num(a)}} \cdot \sqrt{${num(b)}}$`,
      answer: rootAnswer(s.coef, s.radicand),
      hint: 'Előbb vond össze a két gyököt egy gyök alá, aztán hozd egyszerűbb alakra!',
      solution: [
        tex`$\sqrt{${num(a)}} \cdot \sqrt{${num(b)}} = \sqrt{${num(a * b)}}$`,
        tex`$${num(a * b)} = ${num(s.coef * s.coef)} \cdot ${num(s.radicand)}$, ezért $\sqrt{${num(a * b)}} = ${texRoot(s.coef, s.radicand)}$`,
        tex`Az eredmény **$${texRoot(s.coef, s.radicand)}$**.`,
      ],
    };
  },
};

/** √(a + b) is not √a + √b: true/false traps and a multiple-choice value. */
const rootSumTrap: GeneratorDef = {
  id: 'root-sum-trap',
  title: 'A gyökös összeg csapdája',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 2) {
      const [a, b, c] = rng.pick([
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [8, 15, 17],
        [9, 12, 15],
        [7, 24, 25],
        [10, 24, 26],
        [12, 16, 20],
        [15, 20, 25],
        [18, 24, 30],
        [20, 21, 29],
        [14, 48, 50],
        [16, 30, 34],
        [24, 32, 40],
        [9, 40, 41],
      ] as [number, number, number][]);
      return {
        prompt: tex`Mennyi $\sqrt{${num(a)}^2 + ${num(b)}^2}$?`,
        answer: choice(rng, c, [a + b, a * b, c * c], { fallback: (r) => c + r.int(1, 5) }),
        hint: 'Előbb a gyök alatti négyzetösszeget számítsd ki, és csak utána vonj gyököt!',
        solution: [
          tex`$${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(c * c)}$`,
          tex`$\sqrt{${num(c * c)}} = ${num(c)}$`,
          tex`Az eredmény **${num(c)}**.`,
          tex`Figyeld meg: $\sqrt{${num(a)}^2 + ${num(b)}^2} \ne ${num(a)} + ${num(b)}$, tehát a gyököt nem lehet tagokra bontani.`,
        ],
      };
    }
    const p = rng.int(2, 6);
    const q = rng.int(2, 6);
    const a = p * p;
    const b = q * q;
    const product = rng.chance(0.35);
    if (product) {
      return {
        prompt: tex`Igaz vagy hamis?\n\n$\sqrt{${num(a)} \cdot ${num(b)}} = \sqrt{${num(a)}} \cdot \sqrt{${num(b)}}$`,
        answer: { type: 'truefalse', value: true },
        hint: 'A szorzat gyöke valóban szorzattá bontható. Számítsd ki mindkét oldalt!',
        solution: [
          tex`Bal oldal: $\sqrt{${num(a * b)}} = ${num(p * q)}$`,
          tex`Jobb oldal: $${num(p)} \cdot ${num(q)} = ${num(p * q)}$`,
          tex`A két oldal egyenlő, tehát az állítás **igaz**.`,
        ],
      };
    }
    return {
      prompt: tex`Igaz vagy hamis?\n\n$\sqrt{${num(a)} + ${num(b)}} = \sqrt{${num(a)}} + \sqrt{${num(b)}}$`,
      answer: { type: 'truefalse', value: false },
      hint: 'A gyök alatt összeadás van. Előbb végezd el az összeadást, és csak utána vonj gyököt!',
      solution: [
        tex`Bal oldal: $\sqrt{${num(a + b)}} \approx ${num(Math.sqrt(a + b), 2)}$`,
        tex`Jobb oldal: $${num(p)} + ${num(q)} = ${num(p + q)}$`,
        tex`$${num(Math.sqrt(a + b), 2)} \ne ${num(p + q)}$, tehát az állítás **hamis**.`,
      ],
    };
  },
};

/** Adding and subtracting like roots; L3 needs one simplification first. */
const addRoots: GeneratorDef = {
  id: 'add-roots',
  title: 'Összeadás és kivonás gyökös kifejezésekkel',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const m = rng.pick([2, 3, 5, 6, 7, 10, 11, 13]);
      const add = rng.chance(0.55);
      let A = rng.int(2, 6);
      let B = rng.int(2, 6);
      while (B === A) B = rng.int(2, 6);
      if (!add && A < B) [A, B] = [B, A];
      const first = A * A * m;
      const second = B * B * m;
      const coef = add ? A + B : A - B;
      const op = add ? '+' : '-';
      return {
        prompt: tex`Számítsd ki! $\sqrt{${num(first)}} ${op} \sqrt{${num(second)}}$`,
        answer: rootAnswer(coef, m),
        hint: 'Előbb mindkét gyököt hozd $k\\sqrt{n}$ alakra, aztán vond össze az egynemű tagokat!',
        solution: [
          tex`$\sqrt{${num(first)}} = ${texRoot(A, m)}$, mert $${num(first)} = ${num(A * A)} \cdot ${num(m)}$.`,
          tex`$\sqrt{${num(second)}} = ${texRoot(B, m)}$, mert $${num(second)} = ${num(B * B)} \cdot ${num(m)}$.`,
          tex`$${texRoot(A, m)} ${op} ${texRoot(B, m)} = ${texRoot(coef, m)}$`,
          tex`Az eredmény **$${texRoot(coef, m)}$**.`,
        ],
      };
    }
    const n = rng.pick(level === 1 ? [2, 3, 5, 7] : [2, 3, 5, 6, 7, 10, 11, 13]);
    const add = level === 1 ? true : rng.chance(0.4);
    let a: number;
    let b: number;
    if (add) {
      a = rng.int(1, 7);
      b = rng.int(1, 7);
    } else {
      a = rng.int(2, 8);
      b = rng.int(1, a - 1);
    }
    const coef = add ? a + b : a - b;
    const op = add ? '+' : '-';
    return {
      prompt: tex`Számítsd ki! $${texRoot(a, n)} ${op} ${texRoot(b, n)}$`,
      answer: rootAnswer(coef, n),
      hint: 'Az egynemű tagokat úgy adjuk össze vagy vonjuk ki, mint az egyszerű betűs kifejezéseket: csak az együtthatók változnak.',
      solution: [
        tex`Mindkét tagnak ugyanaz a gyöktényezője: $\sqrt{${num(n)}}$.`,
        tex`$${texRoot(a, n)} ${op} ${texRoot(b, n)} = (${num(a)} ${op} ${num(b)})\sqrt{${num(n)}}$`,
        tex`$= ${texRoot(coef, n)}$`,
        tex`Az eredmény **$${texRoot(coef, n)}$**.`,
      ],
    };
  },
};

/** √(a²) = |a| and expressions mixing roots with absolute values. */
const absEval: GeneratorDef = {
  id: 'abs-eval',
  title: 'Kifejezés gyökökkel és abszolút értékkel',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const a = -rng.int(2, 9);
      const b = -rng.int(2, 9);
      const value = -a - b;
      return {
        prompt: tex`Számítsd ki! $\sqrt{(${a})^2} + |${b}|$`,
        answer: { type: 'number', value },
        hint: 'Minden valós számra $\\sqrt{a^2} = |a|$, tehát a gyök eredménye nem negatív.',
        solution: [
          tex`$\sqrt{(${a})^2} = |${a}| = ${num(-a)}$`,
          tex`$|${b}| = ${num(-b)}$`,
          tex`$${num(-a)} + ${num(-b)} = ${num(value)}$`,
          tex`Az eredmény **${num(value)}**.`,
        ],
      };
    }
    if (level === 2) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const value = clean((a + b) / 10);
      const square = a * a < 10 ? `0,0${a * a}` : `0,${a * a}`;
      return {
        prompt: tex`Számítsd ki! $\sqrt{(-0,${num(a)})^2} + |-0,${num(b)}|$`,
        answer: { type: 'number', value },
        hint: 'Előbb a négyzetre emelés és a gyökvonás következik, aztán az abszolút érték.',
        solution: [
          tex`$(-0,${num(a)})^2 = ${square}$`,
          tex`$\sqrt{${square}} = 0,${num(a)}$`,
          tex`$|-0,${num(b)}| = 0,${num(b)}$`,
          tex`$${num(a / 10)} + ${num(b / 10)} = ${num(value)}$`,
          tex`Az eredmény **${num(value)}**.`,
        ],
      };
    }
    const a = -rng.int(3, 9);
    const b = rng.int(2, 9);
    const value = -a + b - Math.abs(a + b);
    return {
      prompt: tex`Számítsd ki! $\sqrt{(${a})^2} + \sqrt{${num(b)}^2} - |${a} + ${num(b)}|$`,
      answer: { type: 'number', value },
      hint: 'Használd a $\\sqrt{a^2} = |a|$ azonosságot mindkét gyöknél!',
      solution: [
        tex`$\sqrt{(${a})^2} = |${a}| = ${num(-a)}$`,
        tex`$\sqrt{${num(b)}^2} = ${num(b)}$`,
        tex`$|${a} + ${num(b)}| = |${a + b}| = ${num(Math.abs(a + b))}$`,
        tex`$${num(-a)} + ${num(b)} - ${num(Math.abs(a + b))} = ${num(value)}$`,
        tex`Az eredmény **${num(value)}**.`,
      ],
    };
  },
};

/** Which operation property is shown? L1 identify, L2 true/false about R. */
const laws: GeneratorDef = {
  id: 'laws',
  title: 'Műveleti tulajdonságok a valós számok körében',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 2) {
      const a = rng.int(2, 12);
      const b = rng.int(2, 9);
      const c = rng.int(2, 6);
      const big = rng.int(4, 12);
      const small = rng.int(1, big - 1);
      const items = [
        {
          text: tex`A valós számok körében $${a} + ${b} = ${b} + ${a}$.`,
          value: true,
          why: tex`Az összeadás felcserélhető: $${a} + ${b} = ${b} + ${a}$.`,
        },
        {
          text: tex`A valós számok körében $${big} - ${small} = ${small} - ${big}$.`,
          value: false,
          why: tex`A kivonás nem felcserélhető: $${big} - ${small} = ${big - small}$, de $${small} - ${big} = ${small - big}$.`,
        },
        {
          text: tex`A valós számok körében $${a} \cdot 1 = ${a}$.`,
          value: true,
          why: 'Az 1 a szorzás egységeleme.',
        },
        {
          text: tex`A valós számok körében $${a} : ${a} = 1$.`,
          value: true,
          why: 'Ha a szám nem 0, akkor önmagával osztva 1-et kapunk.',
        },
        {
          text: tex`A valós számok körében $${a} : 0$ értelmezett.`,
          value: false,
          why: 'Nullával nem osztunk, ezért ez az osztás nem értelmezett.',
        },
        {
          text: tex`A valós számok körében $(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})$.`,
          value: true,
          why: 'Az összeadás csoportosítható.',
        },
        {
          text: tex`A valós számok körében $(${big} - ${small}) - ${c} = ${big} - (${small} - ${c})$.`,
          value: false,
          why: tex`A bal oldal $${big - small - c}$, a jobb oldal $${big - small + c}$ — nem egyenlők.`,
        },
        {
          text: tex`A valós számok körében $${a} \cdot (${b} + ${c}) = ${a} \cdot ${b} + ${a} \cdot ${c}$.`,
          value: true,
          why: 'A szorzás széttagolható az összeadásra: $a(b + c) = ab + ac$.',
        },
        {
          text: tex`A valós számok körében $(${a} \cdot ${b}) \cdot ${c} = ${a} \cdot (${b} \cdot ${c})$.`,
          value: true,
          why: 'A szorzás csoportosítható.',
        },
        {
          text: 'Minden valós számnak van reciproka.',
          value: false,
          why: 'A 0-nak nincs reciproka.',
        },
      ];
      const item = rng.pick(items);
      return {
        prompt: `Igaz vagy hamis?\n\n**${item.text}**`,
        answer: { type: 'truefalse', value: item.value },
        hint: 'Gondold végig, melyik műveletnél milyen kivétel lehet (például a 0 szerepe)!',
        solution: [
          item.why,
          item.value ? 'Az állítás tehát **igaz**.' : 'Az állítás tehát **hamis**.',
        ],
      };
    }
    const kind = rng.pick(['comm-add', 'comm-mul', 'assoc-add', 'assoc-mul', 'dist-add', 'dist-sub'] as const);
    const a = rng.pick([2, 3, 5, 6, 7]);
    const b = rng.pick([2, 3, 5, 6, 7]);
    const c = rng.pick([2, 3, 5, 6, 7]);
    const r = (x: number) => tex`\sqrt{${num(x)}}`;
    let equation: string;
    let correct: string;
    if (kind === 'comm-add') {
      equation = tex`$${r(a)} + ${r(b)} = ${r(b)} + ${r(a)}$`;
      correct = LAW.comm;
    } else if (kind === 'comm-mul') {
      equation = tex`$${r(a)} \cdot ${r(b)} = ${r(b)} \cdot ${r(a)}$`;
      correct = LAW.comm;
    } else if (kind === 'assoc-add') {
      equation = tex`$(${r(a)} + ${r(b)}) + ${r(c)} = ${r(a)} + (${r(b)} + ${r(c)})$`;
      correct = LAW.assoc;
    } else if (kind === 'assoc-mul') {
      equation = tex`$(${r(a)} \cdot ${r(b)}) \cdot ${r(c)} = ${r(a)} \cdot (${r(b)} \cdot ${r(c)})$`;
      correct = LAW.assoc;
    } else if (kind === 'dist-add') {
      equation = tex`$${r(a)} \cdot (${r(b)} + ${r(c)}) = ${r(a)} \cdot ${r(b)} + ${r(a)} \cdot ${r(c)}$`;
      correct = LAW.dist;
    } else {
      equation = tex`$${r(a)} \cdot (${r(b)} - ${r(c)}) = ${r(a)} \cdot ${r(b)} - ${r(a)} \cdot ${r(c)}$`;
      correct = LAW.dist;
    }
    const wrongs = Object.values(LAW).filter((l) => l !== correct);
    return {
      prompt: `Melyik műveleti tulajdonságot mutatja az egyenlőség?\n\n${equation}`,
      answer: textChoice(correct, [...wrongs, 'egyik sem']),
      hint: 'Figyeld meg, mi változott: a tagok sorrendje, a zárójelek helye vagy a zárójel felbontása?',
      solution: [
        `Az egyenlőség: ${equation}`,
        kind.startsWith('comm')
          ? 'Csak a tagok sorrendje cserélődött fel.'
          : kind.startsWith('assoc')
            ? 'Csak a zárójelek (a csoportosítás) helye változott.'
            : 'A zárójel előtti tényezőt mindkét taggal megszoroztuk.',
        `Ez ${correct.startsWith('a') ? 'az' : 'a'} **${correct}**.`,
      ],
    };
  },
};

/** A numeric expression from a real situation: rectangle, square, path or missing side. */
const realExpr: GeneratorDef = {
  id: 'real-expr',
  title: 'Számfeladat valós helyzetből',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['rect-area', 'square-fence', 'path', 'missing-side'] as const);
    if (kind === 'rect-area') {
      const [a, b] = rng.pick([
        [18, 2],
        [8, 2],
        [12, 3],
        [50, 2],
        [20, 5],
        [27, 3],
        [32, 2],
        [45, 5],
        [75, 3],
        [48, 3],
        [63, 7],
        [80, 5],
        [98, 2],
        [108, 3],
        [125, 5],
        [147, 3],
        [162, 2],
        [200, 2],
      ] as [number, number][]);
      const area = Math.sqrt(a * b);
      const figure: Figure = {
        type: 'quadrilateral',
        shape: 'rectangle',
        a: Math.sqrt(a),
        b: Math.sqrt(b),
        sideLabels: { a: `${rootText(1, a)} m`, b: `${rootText(1, b)} m` },
        fill: true,
      };
      return {
        prompt: tex`Egy téglalap alakú kert oldalai $\sqrt{${num(a)}}$ m és $\sqrt{${num(b)}}$ m. Mekkora a területe?`,
        figure,
        answer: { type: 'number', value: area, unit: 'm²' },
        hint: 'A terület $T = a \\cdot b$. Két gyök szorzatát egy gyök alá is írhatod.',
        solution: [
          tex`$T = \sqrt{${num(a)}} \cdot \sqrt{${num(b)}} = \sqrt{${num(a)} \cdot ${num(b)}} = \sqrt{${num(a * b)}}$`,
          tex`$\sqrt{${num(a * b)}} = ${num(area)}$`,
          tex`A kert területe **${num(area)} m²**.`,
        ],
      };
    }
    if (kind === 'square-fence') {
      const side = rng.pick([8, 12, 18, 27, 32, 50, 75, 98, 108, 147]);
      const s = simplifyRoot(side);
      const coef = 4 * s.coef;
      const figure: Figure = {
        type: 'quadrilateral',
        shape: 'square',
        a: Math.sqrt(side),
        sideLabels: { a: `${rootText(1, side)} m` },
        fill: true,
      };
      return {
        prompt: tex`Egy négyzet alakú kert oldala $\sqrt{${num(side)}}$ m. Milyen hosszú kerítés kell körülötte?`,
        figure,
        answer: rootAnswer(coef, s.radicand, 'm'),
        hint: 'A kerület $K = 4a$. Utána hozd egyszerűbb alakra a gyököt!',
        solution: [
          tex`$K = 4 \cdot \sqrt{${num(side)}}$`,
          tex`$\sqrt{${num(side)}} = ${texRoot(s.coef, s.radicand)}$`,
          tex`$K = 4 \cdot ${texRoot(s.coef, s.radicand)} = ${texRoot(coef, s.radicand)}$`,
          tex`A kerítés **$${texRoot(coef, s.radicand)}$ m** hosszú.`,
        ],
      };
    }
    if (kind === 'path') {
      const m = rng.pick([2, 3, 5, 6, 7, 10, 11, 13]);
      const k1 = rng.int(2, 5);
      let k2 = rng.int(2, 5);
      while (k2 === k1) k2 = rng.int(2, 5);
      const first = k1 * k1 * m;
      const second = k2 * k2 * m;
      const coef = k1 + k2;
      return {
        prompt: tex`Egy túra két szakasza $\sqrt{${num(first)}}$ km és $\sqrt{${num(second)}}$ km. Milyen hosszú a teljes túra?`,
        figure: {
          type: 'barModel',
          rows: [
            {
              segments: [
                { value: Math.sqrt(first), label: `${rootText(1, first)} km`, color: 'blue' },
                { value: Math.sqrt(second), label: `${rootText(1, second)} km`, color: 'green' },
              ],
            },
          ],
          total: { label: '? km' },
        },
        answer: rootAnswer(coef, m, 'km'),
        hint: 'Mindkét gyököt hozd $k\\sqrt{n}$ alakra, aztán add össze az egynemű tagokat!',
        solution: [
          tex`$\sqrt{${num(first)}} = ${texRoot(k1, m)}$ és $\sqrt{${num(second)}} = ${texRoot(k2, m)}$`,
          tex`$${texRoot(k1, m)} + ${texRoot(k2, m)} = ${texRoot(coef, m)}$`,
          tex`A teljes túra **$${texRoot(coef, m)}$ km** hosszú.`,
        ],
      };
    }
    const a = rng.pick([2, 3, 5, 6, 7, 10, 11, 13]);
    const b = rng.pick([4, 9, 16, 25, 36]);
    const side = Math.sqrt(b);
    return {
      prompt: tex`Egy téglalap területe $\sqrt{${num(a * b)}}$ cm², az egyik oldala $\sqrt{${num(a)}}$ cm. Milyen hosszú a másik oldala?`,
      figure: {
        type: 'quadrilateral',
        shape: 'rectangle',
        a: Math.sqrt(a),
        b: side,
        sideLabels: { a: `${rootText(1, a)} cm`, b: '? cm' },
        fill: true,
      },
      answer: { type: 'number', value: side, unit: 'cm' },
      hint: 'A terület $T = a \\cdot b$, ezért $b = T : a$. Használd a gyökök osztására vonatkozó szabályt!',
      solution: [
        tex`$b = \sqrt{${num(a * b)}} : \sqrt{${num(a)}} = \sqrt{${num(a * b)} : ${num(a)}} = \sqrt{${num(b)}}$`,
        tex`$\sqrt{${num(b)}} = ${num(side)}$`,
        tex`A másik oldal **${num(side)} cm** hosszú.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. Static figures and checks
// ---------------------------------------------------------------------------------------------

/** √25 = 5 and √9 + √16 = 7 are different numbers. */
const sumTrapFigure: Figure = {
  type: 'numberLine',
  min: 0,
  max: 8,
  step: 1,
  points: [
    { value: 5, label: '√25 = 5', color: 'accent' },
    { value: 7, label: '√9 + √16 = 7', color: 'bad', below: true },
  ],
};

const lawCheck: Question = {
  prompt: 'Melyik tulajdonságot használtuk?\n\n$(\\sqrt{2} + \\sqrt{3}) + \\sqrt{5} = \\sqrt{2} + (\\sqrt{3} + \\sqrt{5})$',
  answer: textChoice(LAW.assoc, [LAW.comm, LAW.dist, 'egyik sem']),
  hint: 'Csak a zárójelek helye változott, a tagok sorrendje nem.',
  solution: [
    'A tagok sorrendje ugyanaz, csak a zárójelek (a csoportosítás) helye változott.',
    `Ez az **${LAW.assoc}**.`,
  ],
};

const trueFalseCheck: Question = {
  prompt: 'Igaz vagy hamis?\n\n**A valós számok körében a kivonás kommutatív.**',
  answer: { type: 'truefalse', value: false },
  hint: 'Próbáld ki két különböző számmal, például $7 - 3$ és $3 - 7$!',
  solution: [
    'A kivonás nem felcserélhető: $7 - 3 = 4$, de $3 - 7 = -4$.',
    'Az állítás tehát **hamis**.',
  ],
};

const rootProductCheck: Question = {
  prompt: 'Mennyi $\\sqrt{4} \\cdot \\sqrt{9}$?',
  answer: textChoice('$6$', ['$13$', '$36$', '$\\sqrt{13}$']),
  hint: 'Használd a $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$ szabályt, vagy számítsd ki külön a két gyököt!',
  solution: [
    tex`$\sqrt{4} \cdot \sqrt{9} = \sqrt{4 \cdot 9} = \sqrt{36} = 6$.`,
    tex`Külön-külön is: $2 \cdot 3 = 6$.`,
  ],
};

const absCheck: Question = {
  prompt: 'Mennyi $\\sqrt{(-6)^2}$?',
  answer: textChoice('$6$', ['$-6$', '$36$', '$12$']),
  hint: 'A négyzet után a gyökvonás eredménye nem lehet negatív. Használd a $\\sqrt{a^2} = |a|$ azonosságot!',
  solution: [
    tex`$(-6)^2 = 36$, és $\sqrt{36} = 6$.`,
    tex`Ugyanezt adja a $\sqrt{a^2} = |a|$ azonosság: $|-6| = 6$.`,
  ],
};

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-05',
  goals: [
    'alkalmazni a műveleti tulajdonságokat a valós számok körében,',
    'gyököket szorozni, osztani és egyszerűbb alakra hozni,',
    'összeadni és kivonni egynemű gyökös kifejezéseket,',
    'kiszámítani gyököket és abszolút értékeket tartalmazó kifejezéseket.',
  ],
  parts: [
    {
      title: 'Műveleti tulajdonságok',
      steps: [
        {
          type: 'theory',
          title: 'Ugyanazok a szabályok, mint a racionális számoknál',
          body: 'A valós számoknál is érvényes a **kommutativitás (felcserélhetőség)**, az **asszociativitás (csoportosíthatóság)** és a **disztributivitás (széttagolhatóság)**.',
          remember: 'R-ben ugyanazok a műveleti törvények, mint Q-ban.',
        },
        { type: 'check', question: lawCheck },
        {
          type: 'theory',
          title: 'Ami nem működik minden műveletnél',
          body: 'A kivonás és az osztás **nem** felcserélhető, és a 0-val való osztás nem értelmezett. A 0-nak nincs reciproka.',
        },
        { type: 'check', question: trueFalseCheck },
        { type: 'practice', generator: 'laws', level: 1 },
      ],
    },
    {
      title: 'Gyökök szorzása és osztása',
      steps: [
        {
          type: 'theory',
          title: 'Két gyök összevonása',
          body: 'Nem negatív $a$ és $b$ esetén a szorzat gyöke a gyökök szorzata, a hányados gyöke pedig a gyökök hányadosa.',
          remember: '$\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$\n$\\sqrt{a : b} = \\sqrt{a} : \\sqrt{b}$',
        },
        { type: 'check', question: rootProductCheck },
        {
          type: 'example',
          title: 'Szorzás és osztás',
          problem: 'Számítsd ki! $\\sqrt{8} \\cdot \\sqrt{2}$ és $\\sqrt{75} : \\sqrt{3}$',
          steps: [
            { text: '$\\sqrt{8} \\cdot \\sqrt{2} = \\sqrt{8 \\cdot 2} = \\sqrt{16} = 4$' },
            { text: '$\\sqrt{75} : \\sqrt{3} = \\sqrt{75 : 3} = \\sqrt{25} = 5$' },
          ],
          answer: 'A két eredmény $4$ és $5$.',
        },
        { type: 'practice', generator: 'root-product', level: 1, count: 2 },
        { type: 'practice', generator: 'root-product', level: 2 },
      ],
    },
    {
      title: 'A gyökös összeg csapdája',
      steps: [
        {
          type: 'theory',
          title: 'Összeadás a gyök alatt',
          body: 'A gyök alatti **összeadást nem lehet tagokra bontani**: $\\sqrt{9 + 16} = 5$, de $\\sqrt{9} + \\sqrt{16} = 7$. A két érték nem egyenlő.',
          figure: sumTrapFigure,
          remember: '$\\sqrt{a + b} \\ne \\sqrt{a} + \\sqrt{b}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$\\sqrt{4 + 9} = \\sqrt{4} + \\sqrt{9}$',
            answer: { type: 'truefalse', value: false },
            hint: 'Előbb a gyök alatti összeadást végezd el!',
            solution: [
              '$\\sqrt{4 + 9} = \\sqrt{13} \\approx 3,61$',
              '$\\sqrt{4} + \\sqrt{9} = 2 + 3 = 5$',
              'A két érték különbözik, tehát az állítás **hamis**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Melyik szám nagyobb?',
          problem: 'Hasonlítsd össze! $\\sqrt{5^2 + 12^2}$ és $\\sqrt{5^2} + \\sqrt{12^2}$',
          steps: [
            { text: '$\\sqrt{25 + 144} = \\sqrt{169} = 13$' },
            { text: '$\\sqrt{25} + \\sqrt{144} = 5 + 12 = 17$' },
          ],
          answer: '$13 < 17$, tehát a gyök alatti összeadás kisebb eredményt ad.',
        },
        { type: 'practice', generator: 'root-sum-trap', level: 1, count: 2 },
        { type: 'practice', generator: 'root-sum-trap', level: 2 },
      ],
    },
    {
      title: 'Gyökök egyszerűsítése és összeadása',
      steps: [
        {
          type: 'theory',
          title: 'Részleges gyökvonás',
          body: 'Ha a gyök alatti számban van négyzetszám tényező, kiemelhetjük: $\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$.',
          remember: '$\\sqrt{k^2 \\cdot n} = k\\sqrt{n}$',
        },
        {
          type: 'example',
          title: 'Egyszerűbb alak',
          problem: 'Hozd egyszerűbb alakra! $\\sqrt{50}$',
          steps: [
            { text: '$50 = 25 \\cdot 2$' },
            { text: '$\\sqrt{50} = \\sqrt{25} \\cdot \\sqrt{2} = 5\\sqrt{2}$' },
          ],
          answer: '$\\sqrt{50} = 5\\sqrt{2}$.',
        },
        { type: 'practice', generator: 'simplify-root', level: 1, count: 2 },
        {
          type: 'example',
          title: 'Egynemű gyökök összeadása',
          problem: 'Számítsd ki! $3\\sqrt{5} + 4\\sqrt{5}$',
          steps: [
            { text: 'Mindkét tagnak ugyanaz a gyöktényezője: $\\sqrt{5}$.' },
            { text: '$3\\sqrt{5} + 4\\sqrt{5} = (3 + 4)\\sqrt{5} = 7\\sqrt{5}$' },
          ],
          answer: 'Az eredmény $7\\sqrt{5}$.',
        },
        { type: 'practice', generator: 'add-roots', level: 1, count: 2 },
        { type: 'practice', generator: 'simplify-root', level: 2 },
        { type: 'practice', generator: 'add-roots', level: 2 },
        { type: 'practice', generator: 'add-roots', level: 3 },
      ],
    },
    {
      title: 'Abszolút érték és szöveges feladatok',
      steps: [
        {
          type: 'theory',
          title: 'A négyzetgyök és az abszolút érték',
          body: 'Minden valós $a$-ra $\\sqrt{a^2} = |a|$, mert a négyzetgyök eredménye nem negatív. Negatív szám négyzetének gyöke tehát az ellentettje.',
          remember: '$\\sqrt{a^2} = |a|$',
        },
        { type: 'check', question: absCheck },
        {
          type: 'example',
          title: 'Gyök és abszolút érték egy kifejezésben',
          problem: 'Számítsd ki! $\\sqrt{(-7)^2} + |-3|$',
          steps: [
            { text: '$\\sqrt{(-7)^2} = |-7| = 7$' },
            { text: '$|-3| = 3$' },
            { text: '$7 + 3 = 10$' },
          ],
          answer: 'Az eredmény $10$.',
        },
        { type: 'practice', generator: 'abs-eval', level: 1, count: 2 },
        { type: 'practice', generator: 'abs-eval', level: 2 },
        { type: 'practice', generator: 'abs-eval', level: 3 },
        { type: 'practice', generator: 'real-expr', level: 3 },
        { type: 'practice', generator: 'laws', level: 2 },
      ],
    },
  ],
  generators: [simplifyRootGen, rootProduct, rootSumTrap, addRoots, absEval, laws, realExpr],
  miniTest: {
    items: [
      { generator: 'simplify-root', level: 1 },
      { generator: 'root-product', level: 1 },
      { generator: 'root-sum-trap', level: 1 },
      { generator: 'laws', level: 1 },
      { generator: 'add-roots', level: 2 },
      { generator: 'abs-eval', level: 2 },
      { generator: 'real-expr', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'simplify-root', level: 1 },
    { generator: 'root-product', level: 1 },
    { generator: 'root-sum-trap', level: 2 },
    { generator: 'add-roots', level: 1 },
    { generator: 'abs-eval', level: 1 },
    { generator: 'laws', level: 2 },
    { generator: 'real-expr', level: 3 },
  ],
});
