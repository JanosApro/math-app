/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 6. Egyenletek az N₀ halmazon
 *
 * One-step equations solved by the role of the unknown (the textbook method, not transposing):
 * unknown addend, minuend, subtrahend, factor, dividend and divisor. Two-step equations appear
 * only at level 3. Every solution is checked by substitution. Division is written with ':'.
 */
import {
  article,
  choice,
  defineSubtopic,
  num,
  suffix,
  tex,
  textChoice,
  type GeneratorDef,
  type Question,
  type Rng,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** Accusative suffix after a numeral: 2-t, 3-at, 5-öt … (numbers 1–20 used in the stories). */
function accusative(n: number): string {
  const forms: Record<number, string> = {
    1: 'et', 2: 't', 3: 'at', 4: 'et', 5: 'öt', 6: 'ot', 7: 'et', 8: 'at', 9: 'et', 10: 'et',
    11: 'et', 12: 't', 13: 'at', 14: 'et', 15: 'öt', 16: 'ot', 17: 'et', 18: 'at', 19: 'et',
    20: 'at', 21: 'et', 22: 't', 23: 'at', 24: 'et', 25: 'öt', 26: 'ot', 27: 'et', 28: 'at',
    29: 'et', 30: 'at', 31: 'et', 32: 't', 33: 'at', 34: 'et', 35: 'öt', 36: 'ot', 37: 'et',
    38: 'at', 39: 'et', 40: 'et',
  };
  return forms[n] ?? 'et';
}

/** Equation text for the six one-step roles. */
const eq = {
  add: (a: number, b: number) => tex`$x + ${num(a)} = ${num(b)}$`,
  sub: (a: number, b: number) => tex`$x - ${num(a)} = ${num(b)}$`,
  sub2: (a: number, b: number) => tex`$${num(a)} - x = ${num(b)}$`,
  mul: (a: number, b: number) => tex`$${num(a)} \cdot x = ${num(b)}$`,
  div: (a: number, b: number) => tex`$x : ${num(a)} = ${num(b)}$`,
  div2: (a: number, b: number) => tex`$${num(a)} : x = ${num(b)}$`,
};

// ---------------------------------------------------------------------------------------------
// 2. Story helper (shared by the equation-choice and the solve-the-story generators)
// ---------------------------------------------------------------------------------------------

interface StoryData {
  /** The story with the unknown marked x. */
  text: string;
  /** The question asking for x. */
  ask: string;
  equation: string;
  answer: number;
  hint: string;
  solution: string[];
  /** Equations that come from a typical misunderstanding. */
  wrongs: string[];
}

function storyData(rng: Rng, level: number): StoryData {
  const kinds =
    level === 2
      ? (['add', 'sub', 'mul'] as const)
      : (['add', 'sub', 'sub2', 'mul', 'div', 'div2'] as const);
  const kind = rng.pick(kinds);

  if (kind === 'add') {
    const a = rng.int(2, level === 2 ? 9 : 15);
    const s = rng.int(2, level === 2 ? 12 : 25);
    const b = a + s;
    return {
      text: tex`Gondoltam egy számra, jelöljük $x$-szel. Hozzáadtam ${num(a)}-${accusative(a)}, és ${num(b)}-${accusative(b)} kaptam.`,
      ask: 'Melyik számra gondoltam?',
      equation: eq.add(a, b),
      answer: s,
      hint: 'A gondolt szám az ismeretlen tag. Az összegből vond ki az ismert tagot!',
      solution: [
        tex`A szöveg egyenlettel: $x + ${num(a)} = ${num(b)}$.`,
        tex`Az ismeretlen tag: $x = ${num(b)} - ${num(a)} = ${num(s)}$.`,
        tex`Ellenőrzés: $${num(s)} + ${num(a)} = ${num(b)}$ ✓`,
      ],
      wrongs: [eq.sub(a, b), eq.sub2(a, b), eq.mul(a, b)],
    };
  }

  if (kind === 'sub') {
    const a = rng.int(2, level === 2 ? 9 : 15);
    const s = a + rng.int(2, level === 2 ? 12 : 20);
    const b = s - a;
    return {
      text: tex`Gondoltam egy számra, jelöljük $x$-szel. Kivontam belőle ${num(a)}-${accusative(a)}, és ${num(b)}-${accusative(b)} kaptam.`,
      ask: 'Melyik számra gondoltam?',
      equation: eq.sub(a, b),
      answer: s,
      hint: 'A gondolt szám az ismeretlen kisebbítendő. A különbséghez add hozzá a kivonandót!',
      solution: [
        tex`A szöveg egyenlettel: $x - ${num(a)} = ${num(b)}$.`,
        tex`Az ismeretlen kisebbítendő: $x = ${num(b)} + ${num(a)} = ${num(s)}$.`,
        tex`Ellenőrzés: $${num(s)} - ${num(a)} = ${num(b)}$ ✓`,
      ],
      wrongs: [eq.add(a, b), eq.sub2(a, b), eq.mul(a, b)],
    };
  }

  if (kind === 'sub2') {
    const b = rng.int(2, level === 3 ? 12 : 9);
    const s = rng.int(2, level === 3 ? 20 : 12);
    const a = s + b;
    return {
      text: tex`Gondoltam egy számra, jelöljük $x$-szel. A ${num(a)}-${suffix(a, 'ból', 'ből')} kivontam a gondolt számot, és ${num(b)}-${accusative(b)} kaptam.`,
      ask: 'Melyik számra gondoltam?',
      equation: eq.sub2(a, b),
      answer: s,
      hint: 'A gondolt szám az ismeretlen kivonandó. A kisebbítendőből vond ki a különbséget!',
      solution: [
        tex`A szöveg egyenlettel: $${num(a)} - x = ${num(b)}$.`,
        tex`Az ismeretlen kivonandó: $x = ${num(a)} - ${num(b)} = ${num(s)}$.`,
        tex`Ellenőrzés: $${num(a)} - ${num(s)} = ${num(b)}$ ✓`,
      ],
      wrongs: [eq.sub(a, b), eq.add(a, b), eq.div(a, b)],
    };
  }

  if (kind === 'mul') {
    const boxes = rng.int(2, level === 2 ? 6 : 9);
    const per = rng.int(2, level === 2 ? 8 : 9);
    const total = boxes * per;
    return {
      text: tex`Egy dobozban $x$ szem cukorka van. ${num(boxes)} dobozban összesen ${num(total)} szem cukorka van.`,
      ask: 'Hány szem cukorka van egy dobozban?',
      equation: eq.mul(boxes, total),
      answer: per,
      hint: 'A dobozok száma · az egy dobozban lévő cukorkák száma = az összes cukorka.',
      solution: [
        tex`A szöveg egyenlettel: $${num(boxes)} \cdot x = ${num(total)}$.`,
        tex`Az ismeretlen tényező: $x = ${num(total)} : ${num(boxes)} = ${num(per)}$.`,
        tex`Ellenőrzés: $${num(boxes)} \cdot ${num(per)} = ${num(total)}$ ✓`,
      ],
      wrongs: [eq.add(boxes, total), eq.div(boxes, total), eq.sub(boxes, total)],
    };
  }

  if (kind === 'div') {
    const friends = rng.int(2, level === 3 ? 6 : 4);
    const each = rng.int(2, level === 3 ? 9 : 6) * 100;
    const total = friends * each;
    return {
      text: tex`Kati $x$ dinárt egyenlően szétosztott ${num(friends)} barátja között, és mindegyik ${num(each)} dinárt kapott.`,
      ask: 'Hány dinárja volt Katinak?',
      equation: eq.div(friends, each),
      answer: total,
      hint: 'Az ismeretlen osztandó a hányados és az osztó szorzata.',
      solution: [
        tex`A szöveg egyenlettel: $x : ${num(friends)} = ${num(each)}$.`,
        tex`Az ismeretlen osztandó: $x = ${num(each)} \cdot ${num(friends)} = ${num(total)}$.`,
        tex`Ellenőrzés: $${num(total)} : ${num(friends)} = ${num(each)}$ ✓`,
      ],
      wrongs: [eq.div2(friends, each), eq.mul(friends, each), eq.sub(friends, each)],
    };
  }

  const kids = rng.int(2, level === 3 ? 6 : 4);
  const each = rng.int(2, level === 3 ? 9 : 6) * 100;
  const total = kids * each;
  return {
    text: tex`${num(total)} dinárt egyenlően szétosztottunk $x$ gyerek között, és mindegyik ${num(each)} dinárt kapott.`,
    ask: 'Hány gyerek között osztották szét a pénzt?',
    equation: eq.div2(total, each),
    answer: kids,
    hint: 'Az ismeretlen osztó az osztandó és a hányados hányadosa.',
    solution: [
      tex`A szöveg egyenlettel: $${num(total)} : x = ${num(each)}$.`,
      tex`Az ismeretlen osztó: $x = ${num(total)} : ${num(each)} = ${num(kids)}$.`,
      tex`Ellenőrzés: $${num(total)} : ${num(kids)} = ${num(each)}$ ✓`,
    ],
    wrongs: [eq.div(kids, each), eq.mul(kids, each), eq.sub(kids, each)],
  };
}

// ---------------------------------------------------------------------------------------------
// 3. Generators
// ---------------------------------------------------------------------------------------------

/** Unknown addend / minuend / subtrahend. */
const addSub: GeneratorDef = {
  id: 'add-sub',
  title: 'Ismeretlen tag, kisebbítendő vagy kivonandó',
  levels: [1, 2],
  generate(rng, level): Question {
    const kind = level === 1 ? rng.pick(['add', 'sub'] as const) : rng.pick(['add', 'sub', 'sub2'] as const);
    if (kind === 'add') {
      const a = rng.int(2, level === 1 ? 12 : 30);
      const x = rng.int(2, level === 1 ? 20 : 45);
      const b = a + x;
      return {
        prompt: tex`Oldd meg az egyenletet!\n\n$x + ${num(a)} = ${num(b)}$`,
        answer: { type: 'number', value: x },
        inputLabel: '$x =$',
        hint: 'Az ismeretlen tagot úgy kapod, hogy az összegből kivonod az ismert tagot.',
        solution: [
          tex`Az ismeretlen tag: $x = ${num(b)} - ${num(a)}$.`,
          tex`$x = ${num(x)}$`,
          tex`Ellenőrzés: $${num(x)} + ${num(a)} = ${num(b)}$ ✓`,
          tex`A megoldás **${num(x)}**.`,
        ],
      };
    }
    if (kind === 'sub') {
      const a = rng.int(2, level === 1 ? 10 : 25);
      const x = a + rng.int(2, level === 1 ? 12 : 30);
      const b = x - a;
      return {
        prompt: tex`Oldd meg az egyenletet!\n\n$x - ${num(a)} = ${num(b)}$`,
        answer: { type: 'number', value: x },
        inputLabel: '$x =$',
        hint: 'Az ismeretlen kisebbítendő a különbség és a kivonandó összege.',
        solution: [
          tex`Az ismeretlen kisebbítendő: $x = ${num(b)} + ${num(a)}$.`,
          tex`$x = ${num(x)}$`,
          tex`Ellenőrzés: $${num(x)} - ${num(a)} = ${num(b)}$ ✓`,
          tex`A megoldás **${num(x)}**.`,
        ],
      };
    }
    const b = rng.int(2, level === 2 ? 20 : 10);
    const x = rng.int(2, level === 2 ? 25 : 12);
    const a = x + b;
    return {
      prompt: tex`Oldd meg az egyenletet!\n\n$${num(a)} - x = ${num(b)}$`,
      answer: { type: 'number', value: x },
      inputLabel: '$x =$',
      hint: 'Az ismeretlen kivonandó a kisebbítendő és a különbség különbsége.',
      solution: [
        tex`Az ismeretlen kivonandó: $x = ${num(a)} - ${num(b)}$.`,
        tex`$x = ${num(x)}$`,
        tex`Ellenőrzés: $${num(a)} - ${num(x)} = ${num(b)}$ ✓`,
        tex`A megoldás **${num(x)}**.`,
      ],
    };
  },
};

/** Unknown factor a · x = b. */
const mul: GeneratorDef = {
  id: 'mul',
  title: 'Ismeretlen tényező',
  levels: [1, 2],
  generate(rng, level): Question {
    const a = rng.int(2, level === 1 ? 9 : 12);
    const x = rng.int(2, level === 1 ? 9 : 15);
    const b = a * x;
    return {
      prompt: tex`Oldd meg az egyenletet!\n\n$${num(a)} \cdot x = ${num(b)}$`,
      answer: { type: 'number', value: x },
      inputLabel: '$x =$',
      hint: 'A szorzatot oszd el az ismert tényezővel!',
      solution: [
        tex`Az ismeretlen tényező: $x = ${num(b)} : ${num(a)}$.`,
        tex`$x = ${num(x)}$`,
        tex`Ellenőrzés: $${num(a)} \cdot ${num(x)} = ${num(b)}$ ✓`,
        tex`A megoldás **${num(x)}**.`,
      ],
    };
  },
};

/** Unknown dividend x : a = b or unknown divisor a : x = b. */
const div: GeneratorDef = {
  id: 'div',
  title: 'Ismeretlen osztandó vagy osztó',
  levels: [1, 2],
  generate(rng, level): Question {
    if (rng.chance(0.5)) {
      const a = rng.int(2, level === 1 ? 7 : 12);
      const b = rng.int(2, level === 1 ? 9 : 15);
      const x = a * b;
      return {
        prompt: tex`Oldd meg az egyenletet!\n\n$x : ${num(a)} = ${num(b)}$`,
        answer: { type: 'number', value: x },
        inputLabel: '$x =$',
        hint: 'Az ismeretlen osztandó a hányados és az osztó szorzata.',
        solution: [
          tex`Az ismeretlen osztandó: $x = ${num(b)} \cdot ${num(a)}$.`,
          tex`$x = ${num(x)}$`,
          tex`Ellenőrzés: $${num(x)} : ${num(a)} = ${num(b)}$ ✓`,
          tex`A megoldás **${num(x)}**.`,
        ],
      };
    }
    const b = rng.int(2, level === 1 ? 7 : 12);
    const x = rng.int(2, level === 1 ? 9 : 15);
    const a = b * x;
    return {
      prompt: tex`Oldd meg az egyenletet!\n\n$${num(a)} : x = ${num(b)}$`,
      answer: { type: 'number', value: x },
      inputLabel: '$x =$',
      hint: 'Az ismeretlen osztó az osztandó és a hányados hányadosa.',
      solution: [
        tex`Az ismeretlen osztó: $x = ${num(a)} : ${num(b)}$.`,
        tex`$x = ${num(x)}$`,
        tex`Ellenőrzés: $${num(a)} : ${num(x)} = ${num(b)}$ ✓`,
        tex`A megoldás **${num(x)}**.`,
      ],
    };
  },
};

/** Two-step equations of the form k · x ± c = b (level 3). */
const twoStep: GeneratorDef = {
  id: 'two-step',
  title: 'Kétlépéses egyenlet',
  levels: [3],
  generate(rng): Question {
    const k = rng.int(2, 5);
    const x = rng.int(2, 12);
    const plus = rng.chance(0.5);
    const c = plus ? rng.int(1, 20) : rng.int(1, Math.max(1, k * x - 1));
    const b = plus ? k * x + c : k * x - c;
    return {
      prompt: tex`Oldd meg az egyenletet!\n\n$${num(k)} \cdot x ${plus ? '+' : '-'} ${num(c)} = ${num(b)}$`,
      answer: { type: 'number', value: x },
      inputLabel: '$x =$',
      hint: tex`Előbb az ismeretlen tagot keresd meg ($${num(k)} \cdot x$), aztán az ismeretlen tényezőt!`,
      solution: plus
        ? [
            tex`Az ismeretlen tag: $${num(k)} \cdot x = ${num(b)} - ${num(c)} = ${num(k * x)}$.`,
            tex`Az ismeretlen tényező: $x = ${num(k * x)} : ${num(k)} = ${num(x)}$.`,
            tex`Ellenőrzés: $${num(k)} \cdot ${num(x)} + ${num(c)} = ${num(b)}$ ✓`,
            tex`A megoldás **${num(x)}**.`,
          ]
        : [
            tex`Az ismeretlen kisebbítendő: $${num(k)} \cdot x = ${num(b)} + ${num(c)} = ${num(k * x)}$.`,
            tex`Az ismeretlen tényező: $x = ${num(k * x)} : ${num(k)} = ${num(x)}$.`,
            tex`Ellenőrzés: $${num(k)} \cdot ${num(x)} - ${num(c)} = ${num(b)}$ ✓`,
            tex`A megoldás **${num(x)}**.`,
          ],
    };
  },
};

/** Choose the equation that describes a story. */
const storyEquation: GeneratorDef = {
  id: 'story-equation',
  title: 'Egyenlet felírása szöveges feladatból',
  levels: [2, 3],
  generate(rng, level): Question {
    const story = storyData(rng, level);
    return {
      prompt: `${story.text}\n\nMelyik egyenlet írja le a feladatot?`,
      answer: textChoice(story.equation, story.wrongs),
      hint: 'Keresd meg, mi az ismeretlen, és milyen művelet szerepel a szövegben!',
      solution: [
        story.solution[0],
        story.solution[1],
        tex`A helyes egyenlet: **${story.equation}**.`,
      ],
    };
  },
};

/** Solve an everyday story (the answer is x). */
const storySolve: GeneratorDef = {
  id: 'story-solve',
  title: 'Szöveges feladat megoldása egyenlettel',
  levels: [3],
  generate(rng): Question {
    const story = storyData(rng, 3);
    return {
      prompt: `${story.text}\n\n${story.ask}`,
      answer: { type: 'number', value: story.answer },
      inputLabel: '$x =$',
      hint: story.hint,
      solution: story.solution,
    };
  },
};

/** True/false: is the given number a solution? */
const checkSolution: GeneratorDef = {
  id: 'check-solution',
  title: 'Megoldás-e ez a szám?',
  levels: [1, 2],
  generate(rng, level): Question {
    const kind = level === 1 ? rng.pick(['add', 'sub', 'mul'] as const) : rng.pick(['add', 'sub', 'sub2', 'mul', 'div', 'div2'] as const);
    let equation: string;
    let solution: number;
    let substitution: (v: number) => string;
    let wrongCandidates: number[];
    if (kind === 'add') {
      const a = rng.int(2, 12);
      const s = rng.int(2, 20);
      const b = a + s;
      equation = eq.add(a, b);
      solution = s;
      substitution = (v) => tex`$${num(v)} + ${num(a)} = ${num(v + a)}$`;
      wrongCandidates = [b + a, b, s + 1];
    } else if (kind === 'sub') {
      const a = rng.int(2, 12);
      const s = a + rng.int(2, 15);
      const b = s - a;
      equation = eq.sub(a, b);
      solution = s;
      substitution = (v) => tex`$${num(v)} - ${num(a)} = ${num(v - a)}$`;
      wrongCandidates = [b - a, b, s + 1];
    } else if (kind === 'sub2') {
      const b = rng.int(2, 10);
      const s = rng.int(2, 18);
      const a = s + b;
      equation = eq.sub2(a, b);
      solution = s;
      substitution = (v) => tex`$${num(a)} - ${num(v)} = ${num(a - v)}$`;
      wrongCandidates = [a + b, b, s + 1];
    } else if (kind === 'mul') {
      const a = rng.int(2, 9);
      const s = rng.int(2, 9);
      const b = a * s;
      equation = eq.mul(a, b);
      solution = s;
      substitution = (v) => tex`$${num(a)} \cdot ${num(v)} = ${num(a * v)}$`;
      wrongCandidates = [b + a, b, b - a];
    } else if (kind === 'div') {
      const a = rng.int(2, 7);
      const s = rng.int(2, 9);
      const b = s;
      equation = eq.div(a, b);
      solution = a * s;
      substitution = (v) => tex`$${num(v)} : ${num(a)} = ${num(v / a)}$`;
      // Keep the trial divisions exact: false claims are other multiples of the divisor.
      wrongCandidates = [(b + 1) * a, (b - 1) * a, (b + 2) * a];
    } else {
      const b = rng.int(2, 7);
      const s = rng.int(2, 9);
      const a = b * s;
      equation = eq.div2(a, b);
      solution = s;
      substitution = (v) => tex`$${num(a)} : ${num(v)} = ${num(a / v)}$`;
      // b and 1 are divisors of a; 1 never solves a : x = b with b ≥ 2.
      wrongCandidates = [b, 1];
    }
    const isRight = rng.chance(0.45);
    const validWrongs = wrongCandidates.filter((v) => Number.isInteger(v) && v >= 0 && v !== solution);
    const k = isRight ? solution : validWrongs.length ? rng.pick(validWrongs) : solution + 1;
    return {
      prompt: tex`Megoldása-e ${article(k)} $${num(k)}$ a következő egyenletnek?\n\n${equation}`,
      answer: { type: 'truefalse', value: isRight },
      hint: 'Helyettesítsd be a számot az ismeretlen helyére, és nézd meg, igaz-e az egyenlőség!',
      solution: [
        tex`Helyettesítsük be: $x = ${num(k)}$. Ekkor ${substitution(k)}.`,
        isRight
          ? tex`Az egyenlőség igaz, tehát ${article(num(k))} $${num(k)}$ **megoldás**.`
          : tex`Az egyenlőség nem igaz, tehát ${article(num(k))} $${num(k)}$ **nem megoldás**. A helyes megoldás $${num(solution)}$.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-06',
  goals: [
    'megérteni, mi az egyenlet, az ismeretlen és a megoldás,',
    'megoldani egy- és kétlépéses egyenleteket az ismeretlen szerepe szerint,',
    'ellenőrizni a megoldást behelyettesítéssel,',
    'szöveges feladatból egyenletet felírni és megoldani.',
  ],
  parts: [
    {
      title: 'Az egyenlet és a megoldás',
      steps: [
        {
          type: 'theory',
          title: 'Egyenlet, ismeretlen, megoldás',
          body: 'Az egyenlet két oldala egyenlő. A betű az ismeretlen. A megoldás az a szám, amelyet behelyettesítve igaz egyenlőséget kapunk.',
          figure: {
            type: 'barModel',
            rows: [{ segments: [{ value: 8, label: '8', color: 'red' }, { value: 7, label: 'x', unknown: true }] }],
            total: { label: '15' },
            caption: 'x + 8 = 15',
          },
          remember: '$x + 8 = 15$ → $x = 7$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA $7$ megoldása az $x + 5 = 12$ egyenletnek.',
            answer: { type: 'truefalse', value: true },
            hint: 'Helyettesítsd be a $7$-et az $x$ helyére!',
            solution: [tex`$7 + 5 = 12$`, 'Az egyenlőség igaz, tehát a $7$ **megoldás**.'],
          },
        },
        {
          type: 'example',
          title: 'Az ismeretlen tag',
          problem: tex`Oldd meg: $x + 8 = 15$`,
          steps: [
            { text: tex`Az ismeretlen tag: $x = 15 - 8$.` },
            { text: tex`$x = 7$` },
            { text: tex`Ellenőrzés: $7 + 8 = 15$ ✓` },
          ],
          answer: 'A megoldás **7**.',
        },
        { type: 'practice', generator: 'add-sub', level: 1, count: 2 },
      ],
    },
    {
      title: 'Az ismeretlen tag',
      steps: [
        {
          type: 'theory',
          title: 'Melyik szerepben van az ismeretlen?',
          body: 'Ismeretlen tag: összeg − ismert tag. Ismeretlen kisebbítendő: különbség + kivonandó. Ismeretlen kivonandó: kisebbítendő − különbség.',
          figure: {
            type: 'barModel',
            rows: [{ segments: [{ value: 6, label: '6', color: 'red' }, { value: 9, label: '9', color: 'blue' }] }],
            total: { label: 'x = ?' },
            caption: 'x − 6 = 9',
          },
          remember: '$x - 6 = 9$ → $x = 9 + 6 = 15$',
        },
        {
          type: 'check',
          question: {
            prompt: tex`Melyik művelettel kapod meg az ismeretlent?\n\n$23 - x = 9$`,
            answer: textChoice('$23 - 9$', ['$23 + 9$', '$9 - 23$', '$23 \\cdot 9$']),
            hint: 'Az ismeretlen itt a kivonandó.',
            solution: [
              'Az ismeretlen a kivonandó: kisebbítendő − különbség.',
              tex`$x = 23 - 9 = 14$`,
              tex`Ellenőrzés: $23 - 14 = 9$ ✓`,
            ],
          },
        },
        {
          type: 'example',
          title: 'Az ismeretlen kivonandó',
          problem: tex`Oldd meg: $23 - x = 9$`,
          steps: [
            { text: tex`Az ismeretlen kivonandó: $x = 23 - 9$.` },
            { text: tex`$x = 14$` },
            { text: tex`Ellenőrzés: $23 - 14 = 9$ ✓` },
          ],
          answer: 'A megoldás **14**.',
        },
        { type: 'practice', generator: 'add-sub', level: 1 },
        { type: 'practice', generator: 'add-sub', level: 2 },
      ],
    },
    {
      title: 'Az ismeretlen tényező',
      steps: [
        {
          type: 'theory',
          title: 'Szorzat és tényező',
          body: 'A szorzatot elosztjuk az ismert tényezővel, így megkapjuk az ismeretlen tényezőt. Például $6x = 42$, ezért $x = 42 : 6 = 7$.',
          remember: '$a \\cdot x = b$ → $x = b : a$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nHa $7x = 56$, akkor $x = 8$.',
            answer: { type: 'truefalse', value: true },
            hint: 'Oszd el a szorzatot az ismert tényezővel!',
            solution: [tex`$x = 56 : 7 = 8$`, tex`Ellenőrzés: $7 \cdot 8 = 56$ ✓`, 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Ismeretlen tényező',
          problem: tex`Oldd meg: $9x = 63$`,
          steps: [
            { text: tex`Az ismeretlen tényező: $x = 63 : 9$.` },
            { text: tex`$x = 7$` },
            { text: tex`Ellenőrzés: $9 \cdot 7 = 63$ ✓` },
          ],
          answer: 'A megoldás **7**.',
        },
        { type: 'practice', generator: 'mul', level: 1 },
        { type: 'practice', generator: 'mul', level: 2 },
      ],
    },
    {
      title: 'Az ismeretlen az osztásban',
      steps: [
        {
          type: 'theory',
          title: 'Osztandó és osztó',
          body: 'Az osztandó a hányados és az osztó szorzata. Az osztó az osztandó és a hányados hányadosa.',
          figure: {
            type: 'table',
            header: ['Egyenlet', 'Ismeretlen', 'Megoldás'],
            rows: [
              ['x : a = b', 'osztandó', 'x = b · a'],
              ['a : x = b', 'osztó', 'x = a : b'],
            ],
          },
          remember: '$x : a = b$ → $x = b \\cdot a$\n$a : x = b$ → $x = a : b$',
        },
        {
          type: 'check',
          question: {
            prompt: tex`Melyik művelettel kapod meg az ismeretlent?\n\n$48 : x = 6$`,
            answer: textChoice('$48 : 6$', ['$48 \\cdot 6$', '$6 : 48$', '$48 - 6$']),
            hint: 'Az ismeretlen itt az osztó.',
            solution: [
              'Az ismeretlen az osztó: osztandó : hányados.',
              tex`$x = 48 : 6 = 8$`,
              tex`Ellenőrzés: $48 : 8 = 6$ ✓`,
            ],
          },
        },
        {
          type: 'example',
          title: 'Ismeretlen osztó',
          problem: tex`Oldd meg: $45 : x = 9$`,
          steps: [
            { text: tex`Az ismeretlen osztó: $x = 45 : 9$.` },
            { text: tex`$x = 5$` },
            { text: tex`Ellenőrzés: $45 : 5 = 9$ ✓` },
          ],
          answer: 'A megoldás **5**.',
        },
        { type: 'practice', generator: 'div', level: 1 },
        { type: 'practice', generator: 'div', level: 2 },
      ],
    },
    {
      title: 'Szöveges feladatok',
      steps: [
        {
          type: 'theory',
          title: 'A szövegtől az egyenletig',
          body: 'Először jelöld $x$-szel az ismeretlent, aztán írd fel az egyenletet. Végül oldd meg, és ellenőrizd a szövegben.',
          remember: 'ismeretlen → egyenlet → megoldás → ellenőrzés',
        },
        {
          type: 'check',
          question: {
            prompt: 'Egy dobozban $x$ szem cukorka van. $6$ dobozban összesen $72$ szem van. Melyik egyenlet írja le?',
            answer: textChoice('$6x = 72$', ['$x + 6 = 72$', '$x : 6 = 72$', '$6 : x = 72$']),
            hint: 'A dobozok száma és az egy dobozban lévő cukorkák száma szorzódik.',
            solution: ['A hat doboz mindegyikében $x$ szem van, összesen $6x$.', 'Tehát $6x = 72$.', 'Innen $x = 12$.'],
          },
        },
        {
          type: 'example',
          title: 'Pénz szétosztása',
          problem: 'Kati $x$ dinárt egyenlően szétosztott $4$ barátja között, és mindegyik $250$ dinárt kapott. Mennyi pénze volt?',
          steps: [
            { text: 'Jelöljük $x$-szel a teljes összeget.' },
            { text: tex`Az egyenlet: $x : 4 = 250$.` },
            { text: tex`Az ismeretlen osztandó: $x = 250 \cdot 4 = 1000$.` },
            { text: tex`Ellenőrzés: $1000 : 4 = 250$ ✓` },
          ],
          answer: 'Katinak **1000 dinárja** volt.',
        },
        { type: 'practice', generator: 'story-equation', level: 2 },
        { type: 'practice', generator: 'story-solve', level: 3 },
        { type: 'practice', generator: 'two-step', level: 3 },
        { type: 'practice', generator: 'check-solution', level: 2 },
      ],
    },
  ],
  generators: [addSub, mul, div, twoStep, storyEquation, storySolve, checkSolution],
  miniTest: {
    items: [
      { generator: 'add-sub', level: 1 },
      { generator: 'add-sub', level: 2 },
      { generator: 'mul', level: 1 },
      { generator: 'div', level: 1 },
      { generator: 'div', level: 2 },
      { generator: 'story-equation', level: 2 },
      { generator: 'two-step', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'add-sub', level: 1 },
    { generator: 'mul', level: 1 },
    { generator: 'div', level: 1 },
    { generator: 'check-solution', level: 1 },
    { generator: 'story-equation', level: 2 },
    { generator: 'story-solve', level: 3 },
    { generator: 'add-sub', level: 2 },
  ],
});
