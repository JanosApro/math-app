/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 4. Matematikai kifejezések
 *
 * Numerical expressions and the order of operations, brackets, expressions with a variable,
 * formulas (rectangle perimeter and area), statements, and translating words into expressions.
 * Every value is computed by code; levels 1–2 stay within four operations and one bracket level.
 */
import {
  defineSubtopic,
  num,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type Rng,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers and small expression templates
// ---------------------------------------------------------------------------------------------

/** One numeric expression: its LaTeX body (without $), value and worked steps. */
interface NumericExpr {
  tex: string;
  value: number;
  steps: string[];
}

type ExprMaker = (rng: Rng) => NumericExpr;

/** A worked multiplication/division step. */
const step = (left: string, op: string, right: string, result: number): string =>
  tex`$${left} ${op} ${right} = ${num(result)}$`;

/** Level 1: two or three operations, no brackets (the order of operations does the work). */
const L1_MAKERS: ExprMaker[] = [
  (rng) => {
    const a = rng.int(2, 20);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const p = b * c;
    return {
      tex: tex`${num(a)} + ${num(b)} \cdot ${num(c)}`,
      value: a + p,
      steps: [step(num(b), '\\cdot', num(c), p), step(num(a), '+', num(p), a + p)],
    };
  },
  (rng) => {
    const a = rng.int(3, 9);
    const b = rng.int(3, 9);
    const p = a * b;
    const c = rng.int(2, p - 1);
    return {
      tex: tex`${num(a)} \cdot ${num(b)} - ${num(c)}`,
      value: p - c,
      steps: [step(num(a), '\\cdot', num(b), p), step(num(p), '-', num(c), p - c)],
    };
  },
  (rng) => {
    const b = rng.int(2, 9);
    const q = rng.int(2, 9);
    const a = b * q;
    const c = rng.int(2, 20);
    return {
      tex: tex`${num(a)} : ${num(b)} + ${num(c)}`,
      value: q + c,
      steps: [step(num(a), ':', num(b), q), step(num(q), '+', num(c), q + c)],
    };
  },
  (rng) => {
    const c = rng.int(2, 9);
    const q = rng.int(1, 9);
    const b = c * q;
    const a = q + rng.int(1, 20);
    return {
      tex: tex`${num(a)} - ${num(b)} : ${num(c)}`,
      value: a - q,
      steps: [step(num(b), ':', num(c), q), step(num(a), '-', num(q), a - q)],
    };
  },
  (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const d = rng.int(2, 9);
    const p = a * b;
    const q = c * d;
    return {
      tex: tex`${num(a)} \cdot ${num(b)} + ${num(c)} \cdot ${num(d)}`,
      value: p + q,
      steps: [step(num(a), '\\cdot', num(b), p), step(num(c), '\\cdot', num(d), q), step(num(p), '+', num(q), p + q)],
    };
  },
];

/** Level 2: three operations, one bracket level. */
const L2_MAKERS: ExprMaker[] = [
  (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const s = a + b;
    return {
      tex: tex`(${num(a)} + ${num(b)}) \cdot ${num(c)}`,
      value: s * c,
      steps: [step(num(a), '+', num(b), s), step(num(s), '\\cdot', num(c), s * c)],
    };
  },
  (rng) => {
    const a = rng.int(2, 9);
    const c = rng.int(1, 6);
    const b = c + rng.int(2, 7);
    const s = b - c;
    return {
      tex: tex`${num(a)} \cdot (${num(b)} - ${num(c)})`,
      value: a * s,
      steps: [step(num(b), '-', num(c), s), step(num(a), '\\cdot', num(s), a * s)],
    };
  },
  (rng) => {
    const c = rng.int(2, 9);
    const q = rng.int(2, 9);
    const a = rng.int(2, 8);
    const b = c * q - a;
    if (b < 2) return L2_MAKERS[0](rng);
    const s = a + b;
    return {
      tex: tex`(${num(a)} + ${num(b)}) : ${num(c)}`,
      value: q,
      steps: [step(num(a), '+', num(b), s), step(num(s), ':', num(c), q)],
    };
  },
  (rng) => {
    const a = rng.int(3, 9);
    const b = rng.int(3, 9);
    const p = a * b;
    const c = rng.int(1, Math.min(8, p - 2));
    const d = rng.int(1, p - c - 1);
    const s = c + d;
    return {
      tex: tex`${num(a)} \cdot ${num(b)} - (${num(c)} + ${num(d)})`,
      value: p - s,
      steps: [step(num(a), '\\cdot', num(b), p), step(num(c), '+', num(d), s), step(num(p), '-', num(s), p - s)],
    };
  },
  (rng) => {
    const a = rng.int(2, 15);
    const c = rng.int(1, 7);
    const b = c + rng.int(2, 8);
    const d = rng.int(2, 9);
    const s = b - c;
    const p = s * d;
    return {
      tex: tex`${num(a)} + (${num(b)} - ${num(c)}) \cdot ${num(d)}`,
      value: a + p,
      steps: [step(num(b), '-', num(c), s), step(num(s), '\\cdot', num(d), p), step(num(a), '+', num(p), a + p)],
    };
  },
  (rng) => {
    const d = rng.int(2, 9);
    const q = rng.int(2, 9);
    const a = rng.int(2, 6);
    const b = rng.int(2, 6);
    const p = a * b;
    const c = d * q - p;
    if (c < 1) return L2_MAKERS[1](rng);
    const s = p + c;
    return {
      tex: tex`(${num(a)} \cdot ${num(b)} + ${num(c)}) : ${num(d)}`,
      value: q,
      steps: [step(num(a), '\\cdot', num(b), p), step(num(p), '+', num(c), s), step(num(s), ':', num(d), q)],
    };
  },
  (rng) => {
    const a = rng.int(2, 8);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const d = rng.int(1, Math.max(1, a * (b + c) - 1));
    const s = b + c;
    const p = a * s;
    return {
      tex: tex`${num(a)} \cdot (${num(b)} + ${num(c)}) - ${num(d)}`,
      value: p - d,
      steps: [step(num(b), '+', num(c), s), step(num(a), '\\cdot', num(s), p), step(num(p), '-', num(d), p - d)],
    };
  },
];

/** Level 3: four operations, one or two bracket groups. */
const L3_MAKERS: ExprMaker[] = [
  (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const c = rng.int(3, 12);
    const d = rng.int(1, 2);
    const s = a + b;
    const t = c - d;
    return {
      tex: tex`(${num(a)} + ${num(b)}) \cdot (${num(c)} - ${num(d)})`,
      value: s * t,
      steps: [step(num(a), '+', num(b), s), step(num(c), '-', num(d), t), step(num(s), '\\cdot', num(t), s * t)],
    };
  },
  (rng) => {
    const a = rng.int(2, 7);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const d = rng.int(2, 9);
    const p = c * d;
    const s = b + p;
    return {
      tex: tex`${num(a)} \cdot (${num(b)} + ${num(c)} \cdot ${num(d)})`,
      value: a * s,
      steps: [step(num(c), '\\cdot', num(d), p), step(num(b), '+', num(p), s), step(num(a), '\\cdot', num(s), a * s)],
    };
  },
  (rng) => {
    const a = rng.int(3, 9);
    const b = rng.int(3, 9);
    const c = rng.int(3, 9);
    const s = a + b;
    const p = s * c;
    let d = rng.int(2, 5);
    let e = rng.int(2, 5);
    while (d * e >= p) {
      d = rng.int(2, 5);
      e = rng.int(2, 5);
    }
    const q = d * e;
    return {
      tex: tex`(${num(a)} + ${num(b)}) \cdot ${num(c)} - ${num(d)} \cdot ${num(e)}`,
      value: p - q,
      steps: [step(num(a), '+', num(b), s), step(num(s), '\\cdot', num(c), p), step(num(d), '\\cdot', num(e), q), step(num(p), '-', num(q), p - q)],
    };
  },
  (rng) => {
    const d = rng.int(2, 9);
    const q = rng.int(2, 9);
    const a = rng.int(3, 7);
    const b = rng.int(3, 7);
    const p = a * b;
    const c = p - d * q;
    if (c < 1) return L3_MAKERS[2](rng);
    const e = rng.int(1, 10);
    const s = p - c;
    return {
      tex: tex`(${num(a)} \cdot ${num(b)} - ${num(c)}) : ${num(d)} + ${num(e)}`,
      value: q + e,
      steps: [step(num(a), '\\cdot', num(b), p), step(num(p), '-', num(c), s), step(num(s), ':', num(d), q), step(num(q), '+', num(e), q + e)],
    };
  },
  (rng) => {
    for (;;) {
      const a = rng.int(2, 7);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      const s = b + c;
      const p = a * s;
      const divisors = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => p % d === 0);
      if (divisors.length === 0) continue;
      const d = rng.pick(divisors);
      const q = p / d;
      return {
        tex: tex`${num(a)} \cdot (${num(b)} + ${num(c)}) : ${num(d)}`,
        value: q,
        steps: [step(num(b), '+', num(c), s), step(num(a), '\\cdot', num(s), p), step(num(p), ':', num(d), q)],
      };
    }
  },
];

/** A numeric expression at the requested level. */
function numericExpr(rng: Rng, level: number): NumericExpr {
  const pool = level === 1 ? L1_MAKERS : level === 2 ? L2_MAKERS : L3_MAKERS;
  return rng.pick(pool)(rng);
}

/** One expression with a variable: display, the value of n, the result and the steps. */
interface VarExpr {
  tex: string;
  n: number;
  value: number;
  steps: string[];
}

type VarMaker = (rng: Rng) => VarExpr;

const VAR_MAKERS: VarMaker[] = [
  (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(1, 20);
    const n = rng.int(1, 10);
    return {
      tex: tex`${num(a)}n + ${num(b)}`,
      n,
      value: a * n + b,
      steps: [tex`$${num(a)} \cdot ${num(n)} + ${num(b)} = ${num(a * n)} + ${num(b)} = ${num(a * n + b)}$`],
    };
  },
  (rng) => {
    const a = rng.int(2, 9);
    const n = rng.int(1, 10);
    const b = rng.int(1, Math.max(1, a * n - 1));
    return {
      tex: tex`${num(a)}n - ${num(b)}`,
      n,
      value: a * n - b,
      steps: [tex`$${num(a)} \cdot ${num(n)} - ${num(b)} = ${num(a * n)} - ${num(b)} = ${num(a * n - b)}$`],
    };
  },
  (rng) => {
    const a = rng.int(2, 6);
    const b = rng.int(2, 9);
    const n = rng.int(1, 10);
    const s = n + b;
    return {
      tex: tex`${num(a)}(n + ${num(b)})`,
      n,
      value: a * s,
      steps: [tex`$${num(n)} + ${num(b)} = ${num(s)}$`, tex`$${num(a)} \cdot ${num(s)} = ${num(a * s)}$`],
    };
  },
  (rng) => {
    const b = rng.int(2, 9);
    const q = rng.int(2, 10);
    const n = b * q;
    const c = rng.int(1, 10);
    return {
      tex: tex`n : ${num(b)} + ${num(c)}`,
      n,
      value: q + c,
      steps: [tex`$${num(n)} : ${num(b)} = ${num(q)}$`, tex`$${num(q)} + ${num(c)} = ${num(q + c)}$`],
    };
  },
];

/** A variable expression suited to the level. */
function varExpr(rng: Rng, level: number): VarExpr {
  const pool =
    level === 1 ? [VAR_MAKERS[0], VAR_MAKERS[1]] : level === 2 ? [VAR_MAKERS[0], VAR_MAKERS[2], VAR_MAKERS[3]] : VAR_MAKERS;
  return rng.pick(pool)(rng);
}

/** Rectangle figure with two labelled sides. */
function rectangle(a: number, b: number, labels: { a: string; b: string }): Figure {
  return {
    type: 'quadrilateral',
    shape: 'rectangle',
    a,
    b,
    sideLabels: { a: labels.a, b: labels.b },
    vertices: ['', '', '', ''],
    fill: true,
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Evaluate a numeric expression using the order of operations. */
const orderOps: GeneratorDef = {
  id: 'order-ops',
  title: 'Műveletek sorrendje, zárójelek',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const e = numericExpr(rng, level);
    return {
      prompt: tex`Számítsd ki!\n\n$${e.tex}$`,
      answer: { type: 'number', value: e.value },
      inputLabel: '$= $',
      hint: 'Először a zárójelet, aztán a szorzást és osztást, végül az összeadást és kivonást végezd el!',
      solution: [...e.steps, tex`Az eredmény **${num(e.value)}**.`],
    };
  },
};

/** Substitute a value into an expression with a variable. */
const variable: GeneratorDef = {
  id: 'variable',
  title: 'Kifejezés értéke behelyettesítéssel',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const e = varExpr(rng, level);
    return {
      prompt: tex`Számítsd ki, ha $n = ${num(e.n)}$!\n\n$${e.tex}$`,
      answer: { type: 'number', value: e.value },
      inputLabel: 'érték =',
      hint: 'Az $n$ helyére írd be a megadott számot, és a műveletek sorrendje szerint számolj!',
      solution: [tex`Helyettesítsük be: $n = ${num(e.n)}$.`, ...e.steps, tex`Az érték **${num(e.value)}**.`],
    };
  },
};

/** Match a verbal phrase with its expression. */
const translate: GeneratorDef = {
  id: 'translate',
  title: 'Szövegből kifejezés',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    type Item = { phrase: string; correct: string; wrongs: string[]; why: string };
    const l1: Item[] = [
      {
        phrase: 'az $n$ szám 5-tel nagyobb',
        correct: '$n + 5$',
        wrongs: ['$n - 5$', '$5n$', '$n : 5$'],
        why: 'Az „5-tel nagyobb” összeadást jelent: $n + 5$.',
      },
      {
        phrase: 'az $n$ szám 5-tel kisebb',
        correct: '$n - 5$',
        wrongs: ['$n + 5$', '$5 - n$', '$5n$'],
        why: 'Az „5-tel kisebb” kivonást jelent: $n - 5$.',
      },
      {
        phrase: 'az $n$ szám háromszorosa',
        correct: '$3n$',
        wrongs: ['$n + 3$', '$n : 3$', '$3 + n$'],
        why: 'A „háromszorosa” szorzást jelent: $3 \\cdot n = 3n$.',
      },
      {
        phrase: 'az $n$ szám fele',
        correct: '$n : 2$',
        wrongs: ['$2n$', '$n - 2$', '$2 : n$'],
        why: 'A „fele” osztást jelent: $n : 2$.',
      },
    ];
    const l2: Item[] = [
      {
        phrase: 'az $n$ számnál 4-gyel nagyobb szám kétszerese',
        correct: '$2(n + 4)$',
        wrongs: ['$2n + 4$', '$n + 4 \\cdot 2$', '$(n + 2) \\cdot 4$'],
        why: 'Előbb a 4-gyel nagyobb szám: $n + 4$, aztán annak a kétszerese: $2(n + 4)$. A zárójel kell, különben csak az $n$-t szoroznánk.',
      },
      {
        phrase: 'az $n$ szám és a 6 összegének a fele',
        correct: '$(n + 6) : 2$',
        wrongs: ['$n + 6 : 2$', '$n : 2 + 6$', '$(n + 2) : 6$'],
        why: 'Előbb az összeg: $n + 6$, aztán annak a fele: $(n + 6) : 2$.',
      },
      {
        phrase: 'az $n$ szám kétszeresénél 7-tel kevesebb',
        correct: '$2n - 7$',
        wrongs: ['$2(n - 7)$', '$n - 7 \\cdot 2$', '$7 - 2n$'],
        why: 'Előbb a kétszeres: $2n$, abból 7-tel kevesebb: $2n - 7$.',
      },
      {
        phrase: 'az $n$ szám és a 3 különbségének a háromszorosa',
        correct: '$3(n - 3)$',
        wrongs: ['$3n - 3$', '$n - 3 \\cdot 3$', '$3n + 3$'],
        why: 'Előbb a különbség: $n - 3$, aztán annak a háromszorosa: $3(n - 3)$.',
      },
    ];
    const l3: Item[] = [
      {
        phrase: 'az $n$ szám és a 4 összegének a kétszeresénél 3-mal kevesebb',
        correct: '$2(n + 4) - 3$',
        wrongs: ['$2n + 4 - 3$', '$2(n + 4 - 3)$', '$2n + 8 + 3$'],
        why: 'Előbb az összeg kétszerese: $2(n + 4)$, abból 3-mal kevesebb: $2(n + 4) - 3$.',
      },
      {
        phrase: 'az $n$ szám háromszorosának és a 6-nak az összege',
        correct: '$3n + 6$',
        wrongs: ['$3(n + 6)$', '$3n \\cdot 6$', '$n + 3 \\cdot 6$'],
        why: 'A háromszoros: $3n$, ehhez adjuk a 6-ot: $3n + 6$.',
      },
      {
        phrase: 'az $n$ számnál 2-vel kisebb szám harmadrésze',
        correct: '$(n - 2) : 3$',
        wrongs: ['$n - 2 : 3$', '$n : 3 - 2$', '$(n - 3) : 2$'],
        why: 'Előbb a 2-vel kisebb szám: $n - 2$, aztán annak a harmadrésze: $(n - 2) : 3$.',
      },
      {
        phrase: 'az $n$ szám és a 7 különbségének a kétszerese',
        correct: '$2(n - 7)$',
        wrongs: ['$2n - 7$', '$n - 7 \\cdot 2$', '$2n + 7$'],
        why: 'Előbb a különbség: $n - 7$, aztán annak a kétszerese: $2(n - 7)$.',
      },
    ];
    const item = rng.pick(level === 1 ? l1 : level === 2 ? l2 : l3);
    const intro = rng.pick([
      'Melyik kifejezés felel meg ennek?',
      'Melyik kifejezést jelenti ez?',
      'Melyik kifejezés illik ehhez a szöveghez?',
    ]);
    return {
      prompt: tex`${intro}\n\n**${item.phrase}**`,
      answer: textChoice(item.correct, item.wrongs),
      hint: 'A „nagyobb” összeadás, a „kisebb” kivonás, a „szorosa” szorzás, a „fele” vagy „harmadrésze” osztás. A zárójel a sorrendet őrzi.',
      solution: [item.why, tex`Helyesen: **${item.correct}**.`],
    };
  },
};

/** Rectangle perimeter / area and square perimeter, including a reverse problem. */
const formula: GeneratorDef = {
  id: 'formula',
  title: 'Képletek: téglalap és négyzet',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(3, 12);
      const b = rng.int(3, 12);
      const sum = a + b;
      const k = 2 * sum;
      return {
        prompt: tex`Egy téglalap oldalai $a = ${num(a)}$ cm és $b = ${num(b)}$ cm. Számítsd ki a kerületét!`,
        figure: rectangle(a, b, { a: `${num(a)} cm`, b: `${num(b)} cm` }),
        answer: { type: 'number', value: k, unit: 'cm' },
        inputLabel: '$K =$',
        hint: 'A téglalap kerülete: $K = 2(a+b)$ — előbb az oldalak összege, aztán a kétszerese.',
        solution: [
          tex`$K = 2(a + b)$`,
          tex`$a + b = ${num(a)} + ${num(b)} = ${num(sum)}$`,
          tex`$K = 2 \cdot ${num(sum)} = ${num(k)}$`,
          tex`A kerület **${num(k)} cm**.`,
        ],
      };
    }
    if (level === 2 && rng.chance(0.5)) {
      const a = rng.int(3, 15);
      const k = 4 * a;
      return {
        prompt: tex`Egy négyzet oldala $a = ${num(a)}$ cm. Számítsd ki a kerületét!`,
        figure: { type: 'quadrilateral', shape: 'square', a, sideLabels: { a: `${num(a)} cm` }, vertices: ['', '', '', ''], fill: true },
        answer: { type: 'number', value: k, unit: 'cm' },
        inputLabel: '$K =$',
        hint: 'A négyzet négy egyenlő oldalból áll: $K = 4a$.',
        solution: [tex`$K = 4a$`, tex`$K = 4 \cdot ${num(a)} = ${num(k)}$`, tex`A kerület **${num(k)} cm**.`],
      };
    }
    if (level === 2) {
      const a = rng.int(4, 15);
      const b = rng.int(3, 12);
      const t = a * b;
      return {
        prompt: tex`Egy téglalap oldalai $a = ${num(a)}$ cm és $b = ${num(b)}$ cm. Számítsd ki a területét!`,
        figure: rectangle(a, b, { a: `${num(a)} cm`, b: `${num(b)} cm` }),
        answer: { type: 'number', value: t, unit: 'cm²' },
        inputLabel: '$T =$',
        hint: 'A téglalap területe: $T = a \\cdot b$.',
        solution: [tex`$T = a \cdot b$`, tex`$T = ${num(a)} \cdot ${num(b)} = ${num(t)}$`, tex`A terület **${num(t)} cm²**.`],
      };
    }
    const half = rng.int(12, 28);
    const k = 2 * half;
    const a = rng.int(Math.max(4, Math.floor(half * 0.4)), Math.min(half - 4, Math.ceil(half * 0.6)));
    const b = half - a;
    return {
      prompt: tex`Egy téglalap kerülete $K = ${num(k)}$ cm, az egyik oldala $a = ${num(a)}$ cm. Mekkora a másik oldala?`,
      figure: rectangle(a, b, { a: `${num(a)} cm`, b: 'b = ?' }),
      answer: { type: 'number', value: b, unit: 'cm' },
      inputLabel: '$b =$',
      hint: 'A kerület kétszerese az oldalak összegének: $K : 2 = a + b$.',
      solution: [
        tex`$K = 2(a + b)$, ezért $a + b = K : 2$`,
        tex`$a + b = ${num(k)} : 2 = ${num(half)}$`,
        tex`$b = ${num(half)} - ${num(a)} = ${num(b)}$`,
        tex`A másik oldal **${num(b)} cm**.`,
      ],
    };
  },
};

/** True/false statements about expressions, formulas and the order of operations. */
const statement: GeneratorDef = {
  id: 'statement',
  title: 'Igaz vagy hamis állítások',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    type St = { text: string; value: boolean; why: string };
    const pool: St[] = [];
    if (level === 1) {
      const a = rng.int(2, 15);
      const b = rng.int(2, 8);
      const c = rng.int(2, 8);
      const correct = a + b * c;
      const wrong = (a + b) * c;
      const useCorrect = rng.chance(0.5);
      pool.push({
        text: tex`${Article(num(a))} $${num(a)} + ${num(b)} \cdot ${num(c)}$ kifejezés értéke $${num(useCorrect ? correct : wrong)}$.`,
        value: useCorrect,
        why: tex`A szorzás megelőzi az összeadást: $${num(b)} \cdot ${num(c)} = ${num(b * c)}$, majd $${num(a)} + ${num(b * c)} = ${num(correct)}$.`,
      });
      const n = rng.int(1, 9);
      const p = rng.int(2, 8);
      const q = rng.int(1, 12);
      const v = p * n + q;
      const claim = rng.chance(0.5) ? v : p * n;
      pool.push({
        text: tex`Ha $n = ${num(n)}$, akkor $${num(p)}n + ${num(q)} = ${num(claim)}$.`,
        value: claim === v,
        why: tex`$${num(p)} \cdot ${num(n)} + ${num(q)} = ${num(p * n)} + ${num(q)} = ${num(v)}$.`,
      });
    } else if (level === 2) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      const withBracket = (a + b) * c;
      const without = a + b * c;
      pool.push({
        text: tex`A $(${num(a)} + ${num(b)}) \cdot ${num(c)}$ és ${article(num(a))} $${num(a)} + ${num(b)} \cdot ${num(c)}$ értéke egyenlő.`,
        value: withBracket === without,
        why: tex`Zárójellel: $(${num(a)} + ${num(b)}) \cdot ${num(c)} = ${num(withBracket)}$; zárójel nélkül: $${num(a)} + ${num(b)} \cdot ${num(c)} = ${num(without)}$.`,
      });
      const n = rng.int(1, 9);
      const p = rng.int(2, 6);
      const q = rng.int(2, 9);
      const v = p * (n + q);
      const claim = rng.chance(0.5) ? v : p * n + q;
      pool.push({
        text: tex`Ha $n = ${num(n)}$, akkor $${num(p)}(n + ${num(q)}) = ${num(claim)}$.`,
        value: claim === v,
        why: tex`$${num(n)} + ${num(q)} = ${num(n + q)}$, majd $${num(p)} \cdot ${num(n + q)} = ${num(v)}$.`,
      });
      const d = rng.int(2, 6);
      const q2 = rng.int(2, 9);
      const dividend = d * q2;
      const extra = rng.int(1, 5);
      const correctDiv = dividend * extra;
      const useCorrect = rng.chance(0.5);
      const claimDiv = useCorrect ? q2 : q2 + rng.int(1, 3);
      pool.push({
        text: tex`${Article(num(correctDiv))} $${num(correctDiv)} : (${num(d)} \cdot ${num(extra)})$ kifejezés értéke $${num(claimDiv)}$.`,
        value: useCorrect,
        why: tex`A zárójelben $${num(d)} \cdot ${num(extra)} = ${num(d * extra)}$, és $${num(correctDiv)} : ${num(d * extra)} = ${num(q2)}$.`,
      });
    } else {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      const d = rng.int(1, 9);
      const correct = (a + b) * c - d;
      const wrong = a + b * c - d;
      const useCorrect = rng.chance(0.5);
      pool.push({
        text: tex`A $(${num(a)} + ${num(b)}) \cdot ${num(c)} - ${num(d)}$ kifejezés értéke $${num(useCorrect ? correct : wrong)}$.`,
        value: useCorrect,
        why: tex`Zárójellel: $${num(a)} + ${num(b)} = ${num(a + b)}$, majd $${num(a + b)} \cdot ${num(c)} = ${num((a + b) * c)}$, végül $${num((a + b) * c)} - ${num(d)} = ${num(correct)}$.`,
      });
      const n = rng.int(2, 10);
      const p = rng.int(2, 6);
      const q = rng.int(2, 7);
      const r = rng.int(1, 9);
      const v = p * (n + q) - r;
      const claim = rng.chance(0.5) ? v : p * (n + q);
      pool.push({
        text: tex`Ha $n = ${num(n)}$, akkor $${num(p)}(n + ${num(q)}) - ${num(r)} = ${num(claim)}$.`,
        value: claim === v,
        why: tex`$${num(n)} + ${num(q)} = ${num(n + q)}$; $${num(p)} \cdot ${num(n + q)} = ${num(p * (n + q))}$; $${num(p * (n + q))} - ${num(r)} = ${num(v)}$.`,
      });
      const total = 2 * rng.int(2, 12);
      pool.push({
        text: tex`$${num(total)} : 2 + 3 = ${num(total / 2 + 3)}$`,
        value: true,
        why: `Az osztás megelőzi az összeadást: $${num(total)} : 2 = ${num(total / 2)}$, majd $${num(total / 2)} + 3 = ${num(total / 2 + 3)}$.`,
      });
    }
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Számold ki a kifejezés értékét a műveletek sorrendje szerint!',
      solution: [s.why, tex`Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-04',
  goals: [
    'kiszámítani a zárójeles és zárójel nélküli kifejezéseket,',
    'helyettesíteni a változó helyére számot,',
    'szöveg alapján kifejezést felírni,',
    'képletekkel számolni és állításokról dönteni.',
  ],
  parts: [
    {
      title: 'A műveletek sorrendje',
      steps: [
        {
          type: 'theory',
          title: 'Mi az első?',
          body: 'A kifejezésben először a zárójelet, aztán a szorzást és osztást, végül az összeadást és kivonást végezzük el — mindig balról jobbra.',
          remember: 'zárójel → $\\cdot$, $:$ → $+$, $-$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA $3 + 4 \\cdot 2$ kifejezés értéke $14$.',
            answer: { type: 'truefalse', value: false },
            hint: 'A szorzás megelőzi az összeadást.',
            solution: ['Előbb $4 \\cdot 2 = 8$, aztán $3 + 8 = 11$.', 'A kifejezés értéke $11$, nem $14$ — az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Szorzás és összeadás',
          problem: 'Számítsd ki! $7 + 3 \\cdot 6$',
          steps: [
            { text: 'Előbb a szorzás: $3 \\cdot 6 = 18$.' },
            { text: 'Aztán az összeadás: $7 + 18 = 25$.' },
          ],
          answer: 'Az eredmény **25**.',
        },
        { type: 'practice', generator: 'order-ops', level: 1, count: 2 },
      ],
    },
    {
      title: 'Zárójelek',
      steps: [
        {
          type: 'theory',
          title: 'A zárójel szerepe',
          body: 'A zárójel megváltoztatja a sorrendet: előbb a zárójelben lévő műveletet végezzük el. Ugyanazok a számok zárójellel és anélkül mást jelenthetnek.',
          remember: '$(3+4) \\cdot 2 = 14$, de $3+4 \\cdot 2 = 11$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$(3 + 4) \\cdot 2 = 3 + 4 \\cdot 2$',
            answer: { type: 'truefalse', value: false },
            hint: 'Számold ki mindkét oldalt!',
            solution: ['Bal oldal: $3 + 4 = 7$, majd $7 \\cdot 2 = 14$.', 'Jobb oldal: $4 \\cdot 2 = 8$, majd $3 + 8 = 11$.', 'A kettő nem egyenlő — az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Zárójeles számítás',
          problem: 'Számítsd ki! $(8 + 4) \\cdot 3$',
          steps: [
            { text: 'Előbb a zárójel: $8 + 4 = 12$.' },
            { text: 'Aztán a szorzás: $12 \\cdot 3 = 36$.' },
          ],
          answer: 'Az eredmény **36**.',
        },
        { type: 'practice', generator: 'order-ops', level: 2, count: 2 },
        { type: 'practice', generator: 'translate', level: 1 },
      ],
    },
    {
      title: 'Kifejezés betűvel',
      steps: [
        {
          type: 'theory',
          title: 'A változó',
          body: 'A betű a kifejezésben **változó**: helyére számot írhatunk. A $2n$ ugyanazt jelenti, mint a $2 \\cdot n$; a szorzásjel elhagyható.',
          remember: '$2n = 2 \\cdot n$ · $3(n+2) = 3 \\cdot (n+2)$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA $2n$ kifejezésben a $2$ a változó.',
            answer: { type: 'truefalse', value: false },
            hint: 'Melyik betű helyére írhatunk számot?',
            solution: ['A változó az $n$ betű; a $2$ egy állandó tényező.', 'Az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Behelyettesítés',
          problem: 'Számítsd ki! $3n + 4$, ha $n = 5$',
          steps: [
            { text: 'Az $n$ helyére $5$-öt írunk: $3 \\cdot 5 + 4$.' },
            { text: '$3 \\cdot 5 = 15$, majd $15 + 4 = 19$.' },
          ],
          answer: 'Az érték **19**.',
        },
        { type: 'practice', generator: 'variable', level: 1, count: 2 },
        { type: 'practice', generator: 'variable', level: 2 },
        { type: 'practice', generator: 'translate', level: 2 },
        { type: 'practice', generator: 'statement', level: 1 },
      ],
    },
    {
      title: 'Szövegből kifejezés',
      steps: [
        {
          type: 'theory',
          title: 'Szavak és műveletek',
          body: 'A szöveget kifejezéssé alakítjuk: az „5-tel nagyobb” összeadás, a „háromszorosa” szorzás, a „különbség fele” osztás. A zárójel a sorrendet őrzi.',
          remember: '5-tel nagyobb: $n+5$ · háromszorosa: $3n$ · fele: $n:2$',
        },
        {
          type: 'example',
          title: 'Kétszeres és zárójel',
          problem: 'Írd fel kifejezéssel: az $n$ számnál $4$-gyel nagyobb szám kétszerese!',
          steps: [
            { text: 'A 4-gyel nagyobb szám: $n + 4$.' },
            { text: 'Ennek a kétszerese: $2 \\cdot (n + 4) = 2(n + 4)$.' },
            { text: 'A zárójel nélkül csak az $n$-t szoroznánk meg: $2n + 4$ — az más.' },
          ],
          answer: 'A kifejezés: **$2(n + 4)$**.',
        },
        { type: 'practice', generator: 'translate', level: 2 },
        { type: 'practice', generator: 'translate', level: 3 },
        { type: 'practice', generator: 'variable', level: 2 },
        { type: 'practice', generator: 'order-ops', level: 3 },
      ],
    },
    {
      title: 'Képletek és állítások',
      steps: [
        {
          type: 'theory',
          title: 'Képletek',
          body: 'A képlet betűkkel leírt összefüggés. A téglalap kerülete $K = 2(a+b)$, területe $T = a \\cdot b$. Az állítás lehet igaz vagy hamis; számolással dönthetjük el.',
          remember: '$K = 2(a+b)$ · $T = a \\cdot b$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA téglalap kerülete $K = a \\cdot b$.',
            answer: { type: 'truefalse', value: false },
            hint: 'Melyik képlet adja a kerületet, és melyik a területet?',
            solution: ['A kerület $K = 2(a+b)$; az $a \\cdot b$ a terület képlete.', 'Az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Téglalap kerülete',
          problem: 'Egy téglalap oldalai $7$ cm és $4$ cm. Mekkora a kerülete?',
          figure: rectangle(7, 4, { a: '7 cm', b: '4 cm' }),
          steps: [
            { text: '$K = 2(a+b) = 2(7+4)$' },
            { text: '$7 + 4 = 11$, majd $2 \\cdot 11 = 22$.' },
          ],
          answer: 'A kerület **22 cm**.',
        },
        { type: 'practice', generator: 'formula', level: 1 },
        { type: 'practice', generator: 'formula', level: 2 },
        { type: 'practice', generator: 'formula', level: 3 },
        { type: 'practice', generator: 'statement', level: 2 },
        { type: 'practice', generator: 'statement', level: 3 },
      ],
    },
  ],
  generators: [orderOps, variable, translate, formula, statement],
  miniTest: {
    items: [
      { generator: 'order-ops', level: 1 },
      { generator: 'order-ops', level: 2 },
      { generator: 'variable', level: 1 },
      { generator: 'translate', level: 2 },
      { generator: 'formula', level: 2 },
      { generator: 'statement', level: 2 },
      { generator: 'variable', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'order-ops', level: 1 },
    { generator: 'variable', level: 1 },
    { generator: 'translate', level: 1 },
    { generator: 'formula', level: 1 },
    { generator: 'statement', level: 1 },
    { generator: 'order-ops', level: 2 },
    { generator: 'formula', level: 2 },
  ],
});
