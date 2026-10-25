/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 3. Számtani műveletek az N₀ halmazon
 *
 * Arithmetic lesson: names of the terms, the commutative / associative / distributive laws,
 * the role of 0 and 1, when subtraction and division are possible in N₀, division with
 * remainder and clever mental calculation. Answers are computed by code.
 */
import {
  article,
  choice,
  clean,
  defineSubtopic,
  num,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type Rng,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers and static figures
// ---------------------------------------------------------------------------------------------

type OpKind = 'add' | 'sub' | 'mul' | 'div';

const OP_TEX: Record<OpKind, string> = { add: '+', sub: '-', mul: '\\cdot', div: ':' };
const OP_NAME: Record<OpKind, string> = { add: 'összeadás', sub: 'kivonás', mul: 'szorzás', div: 'osztás' };
const RESULT_NAME: Record<OpKind, string> = {
  add: 'összeg',
  sub: 'különbség',
  mul: 'szorzat',
  div: 'hányados',
};
const TERM_POOL = [
  'összeadandó',
  'összeg',
  'kisebbítendő',
  'kivonandó',
  'különbség',
  'tényező',
  'szorzat',
  'osztandó',
  'osztó',
  'hányados',
];

/** Four numbers for one operation: a op b = c, with a ≥ b for subtraction and b | a for division. */
function operation(rng: Rng, kind: OpKind, level: number): { a: number; b: number; c: number } {
  const big = level === 3;
  if (kind === 'add') {
    const a = rng.int(big ? 120 : 3, big ? 900 : 40);
    const b = rng.int(big ? 80 : 2, big ? 700 : 35);
    return { a, b, c: a + b };
  }
  if (kind === 'sub') {
    const b = rng.int(2, big ? 700 : 30);
    let c = rng.int(1, big ? 500 : 30);
    if (b === c) c = c > 1 ? c - 1 : c + 1; // the target number must be unambiguous
    return { a: b + c, b, c };
  }
  if (kind === 'mul') {
    const a = rng.int(2, big ? 40 : 9);
    const b = rng.int(2, big ? 25 : 9);
    return { a, b, c: a * b };
  }
  const b = rng.int(2, big ? 18 : 9);
  let c = rng.int(2, big ? 30 : 9);
  if (b === c) c = c > 2 ? c - 1 : c + 1; // 16 : 4 = 4 would name the same 4 twice
  return { a: b * c, b, c };
}

/** A labelled table of the four operations and their terms. */
const termsTable: Figure = {
  type: 'table',
  header: ['Művelet', 'Tagok', 'Eredmény'],
  rows: [
    ['összeadás', 'összeadandó + összeadandó', 'összeg'],
    ['kivonás', 'kisebbítendő − kivonandó', 'különbség'],
    ['szorzás', 'tényező · tényező', 'szorzat'],
    ['osztás', 'osztandó : osztó', 'hányados'],
  ],
  rowHeaders: false,
};

/** (3 + 2) · 2 = 3 · 2 + 2 · 2, drawn as two rectangles. */
const distributiveFigure: Figure = {
  type: 'geometry',
  points: { A: [0, 0], B: [3, 0], C: [5, 0], D: [5, 2], E: [3, 2], F: [0, 2] },
  items: [
    { kind: 'polygon', points: ['A', 'B', 'E', 'F'], fill: 'blue', vertexLabels: false },
    { kind: 'polygon', points: ['B', 'C', 'D', 'E'], fill: 'orange', vertexLabels: false },
    { kind: 'label', at: [1.5, 1], text: '3 · 2' },
    { kind: 'label', at: [4, 1], text: '2 · 2' },
    { kind: 'label', at: [1.5, 0], text: '3', dir: 's' },
    { kind: 'label', at: [4, 0], text: '2', dir: 's' },
  ],
  caption: 'A nagy téglalap területe (3 + 2) · 2.',
};

/** 23 = 4 · 5 + 3: four full groups of 5 and a remainder of 3. */
const remainderFigure: Figure = {
  type: 'barModel',
  rows: [
    {
      segments: [
        { value: 5, label: '5', color: 'blue' },
        { value: 5, label: '5', color: 'blue' },
        { value: 5, label: '5', color: 'blue' },
        { value: 5, label: '5', color: 'blue' },
        { value: 3, label: '3', color: 'orange' },
      ],
    },
  ],
  total: { label: '23' },
  caption: '23 = 4 · 5 + 3',
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Name of an operand or of the result. */
const terms: GeneratorDef = {
  id: 'terms',
  title: 'A műveletek tagjainak és eredményének neve',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const kinds: OpKind[] = level === 1 ? ['add', 'sub'] : level === 2 ? ['mul', 'div'] : ['add', 'sub', 'mul', 'div'];
    const kind = rng.pick(kinds);
    const { a, b, c } = operation(rng, kind, level);
    const askResult = rng.chance(0.45);
    const target = askResult ? c : rng.chance(0.5) ? a : b;
    let correct: string;
    if (askResult) correct = RESULT_NAME[kind];
    else if (kind === 'add') correct = 'összeadandó';
    else if (kind === 'mul') correct = 'tényező';
    else if (kind === 'sub') correct = target === a ? 'kisebbítendő' : 'kivonandó';
    else correct = target === a ? 'osztandó' : 'osztó';
    const wrongs = rng.shuffle(TERM_POOL.filter((t) => t !== correct)).slice(0, 3);
    return {
      prompt: tex`${Article(num(a))} $${num(a)} ${OP_TEX[kind]} ${num(b)} = ${num(c)}$ egyenlőségben mi a neve ${article(num(target))} $${num(target)}$-${suffix(target, 'nak', 'nek')}?`,
      answer: choice(rng, correct, wrongs, { count: 4 }),
      hint: 'Nézd meg, milyen műveletről van szó, és hogy a kérdéses szám tag vagy eredmény.',
      solution: [
        tex`Ez ${OP_NAME[kind]}. ${askResult ? `Az eredmény neve **${RESULT_NAME[kind]}**.` : `A tag neve **${correct}**.`}`,
        askResult
          ? tex`${Article(num(target))} $${num(target)}$ a művelet eredménye, tehát **${RESULT_NAME[kind]}**.`
          : tex`${Article(num(target))} $${num(target)}$ a művelet egyik tagja, tehát **${correct}**.`,
      ],
    };
  },
};

/** Which law was used: commutative, associative or distributive? */
const laws: GeneratorDef = {
  id: 'laws',
  title: 'Melyik műveleti tulajdonságot használtuk?',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const [a, b, c] = rng.sample([2, 3, 4, 5, 6, 7, 8, 9], 3); // different, so a swap is visible
    // level 3: distributivity, and the other two laws in less obvious forms (three terms, reversed)
    const kind =
      level === 1
        ? rng.pick(['comm-add', 'comm-mul'] as const)
        : level === 2
          ? rng.pick(['assoc-add', 'assoc-mul'] as const)
          : rng.pick(['dist-add', 'dist-sub', 'dist-rev', 'comm-three', 'assoc-rev'] as const);
    let equation: string;
    let correct: string;
    let why: string;
    if (kind === 'comm-add') {
      equation = tex`$${num(a)} + ${num(b)} = ${num(b)} + ${num(a)}$`;
      correct = 'kommutativitás (felcserélhetőség)';
      why = 'A két tag sorrendje felcserélődött.';
    } else if (kind === 'comm-mul') {
      equation = tex`$${num(a)} \cdot ${num(b)} = ${num(b)} \cdot ${num(a)}$`;
      correct = 'kommutativitás (felcserélhetőség)';
      why = 'A két tényező sorrendje felcserélődött.';
    } else if (kind === 'assoc-add') {
      equation = tex`$(${num(a)} + ${num(b)}) + ${num(c)} = ${num(a)} + (${num(b)} + ${num(c)})$`;
      correct = 'asszociativitás (csoportosíthatóság)';
      why = 'A zárójelek helye változott meg, a tagok sorrendje nem.';
    } else if (kind === 'assoc-mul') {
      equation = tex`$(${num(a)} \cdot ${num(b)}) \cdot ${num(c)} = ${num(a)} \cdot (${num(b)} \cdot ${num(c)})$`;
      correct = 'asszociativitás (csoportosíthatóság)';
      why = 'A zárójelek helye változott meg, a tényezők sorrendje nem.';
    } else if (kind === 'comm-three') {
      equation = tex`$${num(a)} + ${num(b)} + ${num(c)} = ${num(a)} + ${num(c)} + ${num(b)}$`;
      correct = 'kommutativitás (felcserélhetőség)';
      why = 'Két tag sorrendje felcserélődött, zárójel nincs.';
    } else if (kind === 'assoc-rev') {
      equation = tex`$${num(a)} \cdot (${num(b)} \cdot ${num(c)}) = (${num(a)} \cdot ${num(b)}) \cdot ${num(c)}$`;
      correct = 'asszociativitás (csoportosíthatóság)';
      why = 'A tényezők sorrendje ugyanaz maradt, csak a zárójel került máshová.';
    } else if (kind === 'dist-rev') {
      equation = tex`$${num(a)} \cdot ${num(b)} + ${num(a)} \cdot ${num(c)} = ${num(a)} \cdot (${num(b)} + ${num(c)})$`;
      correct = 'disztributivitás (széttagolhatóság)';
      why = 'A közös tényezőt kiemeltük: ez a széttagolás visszafelé.';
    } else if (kind === 'dist-add') {
      equation = tex`$${num(a)} \cdot (${num(b)} + ${num(c)}) = ${num(a)} \cdot ${num(b)} + ${num(a)} \cdot ${num(c)}$`;
      correct = 'disztributivitás (széttagolhatóság)';
      why = 'A zárójelben lévő összeget tagonként szoroztuk meg.';
    } else {
      let big = Math.max(b, c);
      let small = Math.min(b, c);
      if (big === small) small = small > 1 ? small - 1 : small + 1; // a non-zero difference
      equation = tex`$${num(a)} \cdot (${num(big)} - ${num(small)}) = ${num(a)} \cdot ${num(big)} - ${num(a)} \cdot ${num(small)}$`;
      correct = 'disztributivitás (széttagolhatóság)';
      why = 'A zárójelben lévő különbséget tagonként szoroztuk meg.';
    }
    const wrongs = ['kommutativitás (felcserélhetőség)', 'asszociativitás (csoportosíthatóság)', 'disztributivitás (széttagolhatóság)'].filter((w) => w !== correct);
    return {
      prompt: tex`Melyik tulajdonságot használtuk?\n\n${equation}`,
      answer: choice(rng, correct, wrongs, { count: 3 }),
      hint: 'Mi változott: a tagok sorrendje, a zárójelek helye vagy egy zárójel felbontása?',
      solution: [why, `Ez ${article(correct)} **${correct}** tulajdonsága.`],
    };
  },
};

/** Clever mental calculation: grouping, round products, 99 · n = 100n − n. */
const mental: GeneratorDef = {
  id: 'mental',
  title: 'Ügyes fejszámolás a műveleti tulajdonságokkal',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(11, 89);
      const c = 100 - a;
      const b = rng.int(10, 90);
      const sum = a + b + c;
      return {
        prompt: tex`Számítsd ki ügyesen!\n\n$${num(a)} + ${num(b)} + ${num(c)}$`,
        answer: { type: 'number', value: sum },
        hint: 'Keress két olyan tagot, amelyek összege kerek száz!',
        solution: [
          tex`${Article(num(a))} $${num(a)} + ${num(c)} = ${num(a + c)}$.`,
          tex`$${num(a + c)} + ${num(b)} = ${num(sum)}$.`,
          tex`Az eredmény **${num(sum)}**.`,
        ],
      };
    }
    if (level === 2) {
      if (rng.chance(0.5)) {
        const [a, c] = rng.pick([
          [4, 25],
          [25, 4],
          [20, 5],
          [5, 20],
          [2, 50],
          [50, 2],
        ] as [number, number][]);
        const b = rng.int(3, 19);
        const product = a * b * c;
        return {
          prompt: tex`Számítsd ki ügyesen!\n\n$${num(a)} \cdot ${num(b)} \cdot ${num(c)}$`,
          answer: { type: 'number', value: product },
          hint: 'Keress két olyan tényezőt, amelyek szorzata kerek száz!',
          solution: [
            tex`${Article(num(a))} $${num(a)} \cdot ${num(c)} = ${num(a * c)}$.`,
            tex`$${num(a * c)} \cdot ${num(b)} = ${num(product)}$.`,
            tex`Az eredmény **${num(product)}**.`,
          ],
        };
      }
      const a = rng.int(3, 9);
      const b = rng.int(1, 9);
      const product = a * (10 + b);
      return {
        prompt: tex`Számítsd ki ügyesen!\n\n$${num(a)} \cdot (10 + ${num(b)})$`,
        answer: { type: 'number', value: product },
        hint: 'Bontsd fel a zárójelet: a tízes és az egyes külön szorozható!',
        solution: [
          tex`$${num(a)} \cdot 10 = ${num(a * 10)}$.`,
          tex`$${num(a)} \cdot ${num(b)} = ${num(a * b)}$, és $${num(a * 10)} + ${num(a * b)} = ${num(product)}$.`,
          tex`Az eredmény **${num(product)}**.`,
        ],
      };
    }
    const a = rng.int(3, 25);
    const kind = rng.pick(['99', '101', '1000'] as const);
    if (kind === '1000') {
      const b = rng.int(111, 888);
      const c = 1000 - b;
      const sum = b + a + c;
      return {
        prompt: tex`Számítsd ki ügyesen!\n\n$${num(b)} + ${num(a)} + ${num(c)}$`,
        answer: { type: 'number', value: sum },
        hint: 'Keress két olyan tagot, amelyek összege kerek ezer!',
        solution: [tex`$${num(b)} + ${num(c)} = ${num(b + c)}$.`, tex`$${num(b + c)} + ${num(a)} = ${num(sum)}$.`, tex`Az eredmény **${num(sum)}**.`],
      };
    }
    const k = kind === '99' ? 99 : 101;
    const product = k * a;
    return {
      prompt: tex`Számítsd ki ügyesen!\n\n$${num(k)} \cdot ${num(a)}$`,
      answer: { type: 'number', value: product },
      hint: `Írd fel a ${num(k)}-t ${kind === '99' ? '$100 - 1$' : '$100 + 1$'} alakban!`,
      solution: [
        kind === '99'
          ? tex`$${num(k)} = 100 - 1$, ezért $${num(k)} \cdot ${num(a)} = 100 \cdot ${num(a)} - 1 \cdot ${num(a)}$.`
          : tex`$${num(k)} = 100 + 1$, ezért $${num(k)} \cdot ${num(a)} = 100 \cdot ${num(a)} + 1 \cdot ${num(a)}$.`,
        tex`$${num(100 * a)} ${kind === '99' ? '-' : '+'} ${num(a)} = ${num(product)}$.`,
        tex`Az eredmény **${num(product)}**.`,
      ],
    };
  },
};

/** Missing number in a one-step equation. */
const missing: GeneratorDef = {
  id: 'missing',
  title: 'Hiányzó szám a műveletekben',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const big = level === 3;
    const kinds = level === 1 ? (['add', 'sub', 'sub2'] as const) : level === 2 ? (['mul', 'div', 'div2'] as const) : (['add', 'sub', 'sub2', 'mul', 'div', 'div2'] as const);
    const kind = rng.pick(kinds);
    let prompt: string;
    let answer: number;
    let hint: string;
    let solution: string[];
    if (kind === 'add') {
      const a = rng.int(3, big ? 900000 : 40);
      const x = rng.int(2, big ? 90000 : 35);
      const c = a + x;
      prompt = tex`$${num(a)} + \square = ${num(c)}$`;
      answer = x;
      hint = 'Az összegből vond ki az ismert tagot!';
      solution = [tex`$\square = ${num(c)} - ${num(a)}$.`, tex`$\square = ${num(x)}$.`];
    } else if (kind === 'sub' || kind === 'sub2') {
      const a = rng.int(10, big ? 900000 : 60);
      const x = kind === 'sub' ? rng.int(2, a - 1) : a + rng.int(2, big ? 90000 : 35);
      const c = kind === 'sub' ? a - x : x - a;
      prompt = kind === 'sub' ? tex`$${num(a)} - \square = ${num(c)}$` : tex`$\square - ${num(a)} = ${num(c)}$`;
      answer = x;
      hint =
        kind === 'sub'
          ? 'A kisebbítendőből vond ki a különbséget!'
          : 'A kisebbítendő a különbség és a kivonandó összege.';
      solution =
        kind === 'sub'
          ? [tex`$\square = ${num(a)} - ${num(c)}$.`, tex`$\square = ${num(x)}$.`]
          : [tex`$\square = ${num(c)} + ${num(a)}$.`, tex`$\square = ${num(x)}$.`];
    } else if (kind === 'mul') {
      const a = rng.int(2, big ? 25 : 9);
      const x = rng.int(2, big ? 40 : 9);
      const c = a * x;
      prompt = tex`$${num(a)} \cdot \square = ${num(c)}$`;
      answer = x;
      hint = 'A szorzatot oszd el az ismert tényezővel!';
      solution = [tex`$\square = ${num(c)} : ${num(a)}$.`, tex`$\square = ${num(x)}$.`];
    } else if (kind === 'div') {
      const b = rng.int(2, big ? 20 : 9);
      const x = rng.int(2, big ? 40 : 9);
      const a = b * x;
      prompt = tex`$${num(a)} : \square = ${num(b)}$`;
      answer = x;
      hint = 'Az osztandót oszd el a hányadossal!';
      solution = [tex`$\square = ${num(a)} : ${num(b)}$.`, tex`$\square = ${num(x)}$.`];
    } else {
      const b = rng.int(2, big ? 20 : 9);
      const c = rng.int(2, big ? 40 : 9);
      const x = b * c;
      prompt = tex`$\square : ${num(b)} = ${num(c)}$`;
      answer = x;
      hint = 'Az osztandó a hányados és az osztó szorzata.';
      solution = [tex`$\square = ${num(c)} \cdot ${num(b)}$.`, tex`$\square = ${num(x)}$.`];
    }
    return {
      prompt: tex`Melyik szám hiányzik?\n\n${prompt}`,
      answer: { type: 'number', value: answer },
      inputLabel: '$\\square =$',
      hint,
      solution: [...solution, `A hiányzó szám **${num(answer)}**.`],
    };
  },
};

/** Division with remainder: give the quotient and the remainder. */
const remainder: GeneratorDef = {
  id: 'remainder',
  title: 'Maradékos osztás: hányados és maradék',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    // the divisors of the levels don't overlap: 2–5, 6–9, 11–25
    const b = level === 1 ? rng.int(2, 5) : level === 2 ? rng.int(6, 9) : rng.int(11, 25);
    const q = level === 1 ? rng.int(2, 6) : level === 2 ? rng.int(3, 12) : rng.int(10, 100);
    const r = rng.int(0, b - 1);
    const a = b * q + r;
    return {
      prompt: tex`Végezd el a maradékos osztást!\n\n$${num(a)} : ${num(b)}$\n\nMennyi a hányados és a maradék?`,
      answer: {
        type: 'numbers',
        fields: [
          { label: 'hányados', value: q },
          { label: 'maradék', value: r },
        ],
      },
      hint: 'A hányados a legnagyobb egész, amelyre az osztó szorzata még nem nagyobb az osztandónál.',
      solution: [
        tex`$${num(b)} \cdot ${num(q)} = ${num(b * q)}$, ez a legnagyobb többszörös, amely legfeljebb $${num(a)}$.`,
        tex`$${num(a)} - ${num(b * q)} = ${num(r)}$, tehát $${num(a)} = ${num(b)} \cdot ${num(q)} + ${num(r)}$.`,
        tex`A maradék $${num(r)}$, és $0 \le ${num(r)} < ${num(b)}$.`,
        `A hányados **${num(q)}**, a maradék **${num(r)}**.`,
      ],
    };
  },
};

/** The same relation from the other side: find the dividend, quotient, divisor or remainder. */
const remainderMissing: GeneratorDef = {
  id: 'remainder-missing',
  title: 'Hiányzó adat a maradékos osztásban',
  levels: [2, 3],
  generate(rng, level): Question {
    const b = rng.int(3, level === 2 ? 9 : 18);
    const q = rng.int(2, level === 2 ? 9 : 20);
    const r = rng.int(0, b - 1);
    const a = b * q + r;
    const kind = level === 2 ? rng.pick(['dividend', 'remainder'] as const) : rng.pick(['dividend', 'remainder', 'quotient', 'divisor'] as const);
    if (kind === 'dividend') {
      return {
        prompt: tex`A maradékos osztásban az osztó $${num(b)}$, a hányados $${num(q)}$, a maradék $${num(r)}$. Mennyi az osztandó?`,
        answer: { type: 'number', value: a },
        inputLabel: 'osztandó =',
        hint: 'Az osztandó = osztó · hányados + maradék.',
        solution: [
          tex`$a = b \cdot q + r$`,
          tex`$a = ${num(b)} \cdot ${num(q)} + ${num(r)} = ${num(b * q)} + ${num(r)} = ${num(a)}$.`,
          `Az osztandó **${num(a)}**.`,
        ],
      };
    }
    if (kind === 'remainder') {
      return {
        prompt: tex`A maradékos osztásban az osztandó $${num(a)}$, az osztó $${num(b)}$, a hányados $${num(q)}$. Mennyi a maradék?`,
        answer: { type: 'number', value: r },
        inputLabel: 'maradék =',
        hint: 'Az osztandóból vond ki az osztó és a hányados szorzatát!',
        solution: [
          tex`$r = a - b \cdot q$`,
          tex`$r = ${num(a)} - ${num(b)} \cdot ${num(q)} = ${num(a)} - ${num(b * q)} = ${num(r)}$.`,
          `A maradék **${num(r)}**.`,
        ],
      };
    }
    if (kind === 'quotient') {
      return {
        prompt: tex`A maradékos osztásban az osztandó $${num(a)}$, az osztó $${num(b)}$, a maradék $${num(r)}$. Mennyi a hányados?`,
        answer: { type: 'number', value: q },
        inputLabel: 'hányados =',
        hint: 'Előbb vond ki az osztandóból a maradékot, aztán oszd el az osztóval!',
        solution: [
          tex`$a - r = b \cdot q$`,
          tex`$${num(a)} - ${num(r)} = ${num(a - r)}$, és $${num(a - r)} : ${num(b)} = ${num(q)}$.`,
          `A hányados **${num(q)}**.`,
        ],
      };
    }
    return {
      prompt: tex`A maradékos osztásban az osztandó $${num(a)}$, a hányados $${num(q)}$, a maradék $${num(r)}$. Mennyi az osztó?`,
      answer: { type: 'number', value: b },
      inputLabel: 'osztó =',
      hint: 'Az osztandóból vond ki a maradékot, aztán oszd el a hányadossal!',
      solution: [
        tex`$a - r = b \cdot q$`,
        tex`$${num(a)} - ${num(r)} = ${num(a - r)}$, és $${num(a - r)} : ${num(q)} = ${num(b)}$.`,
        `Az osztó **${num(b)}**.`,
      ],
    };
  },
};

/** True/false statements about 0, 1 and when a subtraction or division is possible in N₀. */
const zeroOne: GeneratorDef = {
  id: 'zero-one',
  title: 'A 0 és az 1 szerepe, műveletek N₀-ban',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const a = rng.int(2, 20);
    type Statement = { text: string; value: boolean; why: string };
    const pool: Statement[] =
      level === 1
        ? [
            { text: tex`$${num(a)} + 0 = ${num(a)}$`, value: true, why: 'A 0-t hozzáadva a szám nem változik.' },
            { text: tex`$${num(a)} + 0 = 0$`, value: false, why: 'Az összeg maga a szám, nem 0.' },
            { text: tex`$${num(a)} \cdot 1 = ${num(a)}$`, value: true, why: '1-gyel szorozva a szám nem változik.' },
            { text: tex`$${num(a)} \cdot 1 = 1$`, value: false, why: '1-gyel szorozva a szám önmaga marad.' },
            { text: tex`$${num(a)} \cdot 0 = 0$`, value: true, why: 'Bármely szám 0-szorosa 0.' },
            { text: tex`$${num(a)} \cdot 0 = ${num(a)}$`, value: false, why: '0-szorosa minden számnak 0.' },
            { text: tex`$0 + ${num(a)} = ${num(a)}$`, value: true, why: 'A 0 hozzáadása nem változtat.' },
            { text: tex`$0 + ${num(a)} = 0$`, value: false, why: 'Az összeg maga a szám.' },
            { text: tex`$1 \cdot ${num(a)} = ${num(a)}$`, value: true, why: 'Az 1-gyel szorzás nem változtat.' },
            { text: tex`$1 \cdot ${num(a)} = 1$`, value: false, why: 'Az eredmény a szám, nem 1.' },
          ]
        : level === 2
          ? [
              { text: tex`$${num(a)} - 0 = ${num(a)}$`, value: true, why: 'A 0 kivonása nem változtat.' },
              { text: tex`$${num(a)} - 0 = 0$`, value: false, why: 'A 0 kivonása után a szám marad.' },
              { text: tex`$${num(a)} - ${num(a)} = 0$`, value: true, why: 'Ugyanazt kivonva 0 marad.' },
              { text: tex`$${num(a)} - ${num(a)} = ${num(a)}$`, value: false, why: 'Ugyanazt kivonva 0 marad.' },
              { text: tex`$0 - ${num(a)} = ${num(a)}$`, value: false, why: 'N₀-ban 0-ból nem vonhatunk ki nála nagyobbat.' },
              { text: tex`$${num(a)} : 1 = ${num(a)}$`, value: true, why: '1-gyel osztva a szám nem változik.' },
              { text: tex`$${num(a)} : 1 = 1$`, value: false, why: 'Az eredmény a szám, nem 1.' },
              { text: tex`$${num(a)} : ${num(a)} = 1$`, value: true, why: 'Ugyanazzal a számmal osztva 1 az eredmény.' },
              { text: tex`$0 : ${num(a)} = 0$`, value: true, why: 'A 0-t elosztva 0 lesz.' },
              { text: tex`$${num(a)} : 0 = 0$`, value: false, why: '0-val nem osztunk.' },
            ]
          : [
              { text: tex`${Article(num(a))} $${num(a)} - ${num(a + 1)}$ kivonás elvégezhető N₀-ban.`, value: false, why: 'A kisebbítendő kisebb a kivonandónál.' },
              { text: tex`${Article(num(a + 1))} $${num(a + 1)} - ${num(a)}$ kivonás elvégezhető N₀-ban.`, value: true, why: 'A kisebbítendő nagyobb a kivonandónál.' },
              { text: tex`A $0 - ${num(a)}$ kivonás elvégezhető N₀-ban.`, value: false, why: '0-ból nem vonhatunk ki pozitív számot N₀-ban.' },
              { text: tex`${Article(num(a))} $${num(a)} - 0$ kivonás elvégezhető N₀-ban.`, value: true, why: 'Nullát kivonva a szám nem változik.' },
              { text: tex`${Article(num(a))} $${num(a)} : 0$ osztás elvégezhető.`, value: false, why: '0-val nem osztunk.' },
              { text: tex`A $0 : ${num(a)}$ osztás elvégezhető.`, value: true, why: 'A 0 osztható bármely nem 0 számmal.' },
              { text: tex`${Article(num(a))} $${num(a)} : 1$ osztás elvégezhető.`, value: true, why: '1-gyel minden szám osztható.' },
              { text: tex`${Article(num(a + 1))} $${num(a + 1)} : ${num(a)}$ osztás maradék nélkül elvégezhető.`, value: false, why: `${num(a + 1)} nem többszöröse ${num(a)}-${suffix(a, 'nak', 'nek')}.` },
              { text: tex`${Article(num(a))} $${num(a)} : ${num(a + 1)}$ osztás maradék nélkül elvégezhető.`, value: false, why: 'Az osztandó kisebb az osztónál.' },
              { text: tex`${Article(num(a))} $${num(a)} : ${num(a)}$ osztás maradék nélkül elvégezhető.`, value: true, why: 'Ugyanazzal a számmal osztva az eredmény 1.' },
              { text: tex`A $0 : 0$ osztás elvégezhető.`, value: false, why: 'A 0 : 0 nem értelmezett.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: level === 3 ? 'Gondold át, mikor végezhető el a kivonás vagy az osztás N₀-ban!' : 'Gondold át a 0 és az 1 szerepét!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

/** Everyday division-with-remainder word problems. */
const word: GeneratorDef = {
  id: 'word',
  title: 'Szöveges feladatok maradékos osztással',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['groups', 'bus', 'eggs'] as const);
    if (kind === 'bus') {
      const k = rng.int(8, 18);
      const q = rng.int(2, 6);
      const r = rng.int(1, k - 1);
      const n = k * q + r;
      return {
        prompt: tex`Egy kirándulásra ${num(n)} gyerek megy. Egy buszba ${num(k)} gyerek fér. Hány buszra van szükség?`,
        answer: { type: 'number', value: q + 1 },
        inputLabel: 'busz =',
        hint: 'A maradék gyerekeknek is kell még egy busz.',
        solution: [
          tex`$${num(n)} : ${num(k)} = ${num(q)}$, marad ${num(r)}.`,
          tex`${Article(num(q))} $${num(q)}$ tele busz mellé ${article(num(r))} $${num(r)}$ gyereknek is kell egy busz.`,
          `Összesen **${num(q + 1)} busz** kell.`,
        ],
      };
    }
    const k = kind === 'groups' ? rng.pick([3, 4, 5, 6]) : rng.int(6, 12);
    const q = rng.int(4, 9);
    const r = rng.int(1, k - 1);
    const n = k * q + r;
    if (kind === 'groups') {
      const wordK = { 3: 'hármas', 4: 'négyes', 5: 'ötös', 6: 'hatos' }[k];
      return {
        prompt: tex`Egy osztályban ${num(n)} tanuló van. A tanulókat ${wordK} csoportokba osztják őket. Hány teljes csoport lesz, és hány tanuló marad ki?`,
        answer: {
          type: 'numbers',
          fields: [
            { label: 'teljes csoport', value: q },
            { label: 'maradó tanuló', value: r },
          ],
        },
        hint: 'Oszd el a tanulók számát a csoportlétszámmal!',
        solution: [
          tex`$${num(n)} : ${num(k)} = ${num(q)}$, marad ${num(r)}.`,
          `Lesz **${num(q)} teljes csoport**, és **${num(r)} tanuló** marad ki.`,
        ],
      };
    }
    return {
      prompt: tex`Egy dobozba ${num(k)} tojás fér. ${num(n)} tojásból hány tele doboz lesz, és hány tojás marad?`,
      answer: {
        type: 'numbers',
        fields: [
          { label: 'tele doboz', value: q },
          { label: 'maradó tojás', value: r },
        ],
      },
      hint: 'Oszd el a tojások számát a doboz kapacitásával!',
      solution: [
        tex`$${num(n)} : ${num(k)} = ${num(q)}$, marad ${num(r)}.`,
        `Lesz **${num(q)} tele doboz**, és **${num(r)} tojás** marad.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-03',
  goals: [
    'megnevezni a négy alapművelet tagjait és eredményét,',
    'használni a kommutativitást (felcserélhetőséget), az asszociativitást (csoportosíthatóságot) és a disztributivitást (széttagolhatóságot),',
    'tudni, mi a szerepe a 0-nak és az 1-nek,',
    'maradékosan osztani és ellenőrizni az eredményt.',
  ],
  parts: [
    {
      title: 'A műveletek és tagjaik',
      steps: [
        {
          type: 'theory',
          title: 'Négy alapművelet',
          body: 'A műveleteknek nevük van a tagjaikra és az eredményükre is. A táblázat segít eligazodni.',
          figure: termsTable,
          remember: 'összeg · különbség · szorzat · hányados',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $8 \\cdot 6 = 48$ egyenlőségben mi a neve a $6$-nak?',
            answer: textChoice('tényező', ['szorzat', 'osztó', 'összeadandó']),
            hint: 'Milyen művelet ez? Hogyan hívjuk a szorzás tagjait?',
            solution: ['A művelet szorzás.', 'A szorzás tagjai a **tényezők**, az eredmény a **szorzat**.'],
          },
        },
        {
          type: 'example',
          title: 'A kisebbítendő',
          problem: 'A $15 - 7 = 8$ egyenlőségben melyik a kisebbítendő?',
          steps: [
            { text: 'A kivonásban a kisebbítendő az, amiből kivonunk.' },
            { text: 'Tehát a kisebbítendő a $15$; a kivonandó $7$, a különbség $8$.' },
          ],
          answer: 'A kisebbítendő **15**.',
        },
        { type: 'practice', generator: 'terms', level: 1, count: 2 },
        { type: 'practice', generator: 'terms', level: 2 },
      ],
    },
    {
      title: 'A műveletek tulajdonságai',
      steps: [
        {
          type: 'theory',
          title: 'Kommutativitás, asszociativitás, disztributivitás',
          body: 'Az összeadás és a szorzás **kommutatív (felcserélhető)**. A zárójelek csoportosítása **asszociatív (csoportosítható)**, a zárójel felbontása **disztributív (széttagolható)**.',
          figure: distributiveFigure,
          remember: 'kommutativitás · asszociativitás · disztributivitás',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik tulajdonságot használtuk?\n\n$7 \\cdot (10 + 2) = 7 \\cdot 10 + 7 \\cdot 2$',
            answer: textChoice('disztributivitás (széttagolhatóság)', ['kommutativitás (felcserélhetőség)', 'asszociativitás (csoportosíthatóság)']),
            hint: 'Mi történt a zárójellel?',
            solution: ['A zárójelben lévő összeget tagonként szoroztuk meg.', 'Ez a **disztributivitás (széttagolhatóság)**.'],
          },
        },
        {
          type: 'example',
          title: 'Ügyes szorzás',
          problem: 'Számítsd ki ügyesen! $25 \\cdot 17 \\cdot 4$',
          steps: [
            { text: 'A $25 \\cdot 4 = 100$ kerek szorzat.' },
            { text: 'Ezért $100 \\cdot 17 = 1700$.' },
          ],
          answer: 'Az eredmény **1700**.',
        },
        { type: 'practice', generator: 'laws', level: 1 },
        { type: 'practice', generator: 'mental', level: 1 },
        { type: 'practice', generator: 'mental', level: 2 },
      ],
    },
    {
      title: 'A 0 és az 1 szerepe',
      steps: [
        {
          type: 'theory',
          title: 'Nulla és egy',
          body: 'Bármely számhoz $0$-t adva a szám nem változik. $1$-gyel szorozva sem. **Nullával osztani nem lehet!**',
          remember: '$a + 0 = a$ · $a \\cdot 1 = a$ · $a : 0$ nem értelmezett',
        },
        {
          type: 'theory',
          title: 'Mikor végezhető el?',
          body: 'N₀-ban a kivonás akkor végezhető el, ha a kisebbítendő legalább akkora, mint a kivonandó. Az osztásnál az osztó nem lehet 0.',
          remember: '$a - b$: $a \\ge b$ · $a : b$: $b \\ne 0$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$7 : 0 = 0$',
            answer: { type: 'truefalse', value: false },
            hint: 'El lehet osztani nullával?',
            solution: ['Nullával nem osztunk, a $7 : 0$ nem értelmezett.', 'Az állítás **hamis**.'],
          },
        },
        { type: 'practice', generator: 'zero-one', level: 1 },
        { type: 'practice', generator: 'zero-one', level: 2 },
        { type: 'practice', generator: 'missing', level: 1 },
      ],
    },
    {
      title: 'Maradékos osztás',
      steps: [
        {
          type: 'theory',
          title: 'A maradékos osztás',
          body: 'Ha az osztás nem jön ki maradék nélkül, a legnagyobb többszörösig osztunk. A maradék mindig kisebb az osztónál.',
          figure: remainderFigure,
          remember: '$a = b \\cdot q + r$, $0 \\le r < b$',
        },
        {
          type: 'example',
          title: 'Oszd el maradékosan!',
          problem: 'Oszd el maradékosan: $47 : 6$',
          steps: [
            { text: '$6 \\cdot 7 = 42$, ez a legnagyobb többszörös, amely legfeljebb $47$.' },
            { text: '$47 - 42 = 5$, tehát $47 = 6 \\cdot 7 + 5$.' },
            { text: 'A maradék $5$, és $0 \\le 5 < 6$. ✓' },
          ],
          answer: 'A hányados **7**, a maradék **5**.',
        },
        { type: 'practice', generator: 'remainder', level: 1 },
        { type: 'practice', generator: 'remainder', level: 2 },
        { type: 'practice', generator: 'remainder-missing', level: 2 },
        { type: 'practice', generator: 'remainder', level: 3 },
        { type: 'practice', generator: 'word', level: 3 },
      ],
    },
    {
      title: 'Ügyes számolás és gyakorlás',
      steps: [
        {
          type: 'example',
          title: 'Szorzás 99-cel',
          problem: 'Számítsd ki ügyesen! $99 \\cdot 7$',
          steps: [
            { text: '$99 = 100 - 1$' },
            { text: '$100 \\cdot 7 - 1 \\cdot 7 = 700 - 7$' },
            { text: '$700 - 7 = 693$' },
          ],
          answer: 'Az eredmény **693**.',
        },
        { type: 'practice', generator: 'mental', level: 3 },
        { type: 'practice', generator: 'missing', level: 2 },
        { type: 'practice', generator: 'missing', level: 3 },
        { type: 'practice', generator: 'laws', level: 2 },
        { type: 'practice', generator: 'remainder-missing', level: 3 },
      ],
    },
  ],
  generators: [terms, laws, mental, missing, remainder, remainderMissing, zeroOne, word],
  miniTest: {
    items: [
      { generator: 'terms', level: 1 },
      { generator: 'laws', level: 2 },
      { generator: 'mental', level: 2 },
      { generator: 'zero-one', level: 2 },
      { generator: 'remainder', level: 2 },
      { generator: 'remainder-missing', level: 3 },
      { generator: 'word', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'terms', level: 1 },
    { generator: 'mental', level: 1 },
    { generator: 'zero-one', level: 1 },
    { generator: 'remainder', level: 1 },
    { generator: 'missing', level: 1 },
    { generator: 'laws', level: 2 },
    { generator: 'word', level: 3 },
  ],
});
