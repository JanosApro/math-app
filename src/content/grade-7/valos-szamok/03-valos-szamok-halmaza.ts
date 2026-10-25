/**
 * 7. osztály › Valós számok › 3. R, a valós számok halmaza
 *
 * x² = 2 has no rational solution (no proof), Q ∪ I = R, finite/periodic decimals vs infinite
 * non-periodic ones, π, the real number line, √n between consecutive integers, N ⊂ Z ⊂ Q ⊂ R,
 * comparing and ordering real numbers with roots.
 */
import {
  article,
  choice,
  defineSubtopic,
  num,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

type SetName = 'N' | 'Z' | 'Q' | 'I';

/** The four set labels, used in both the prompt options and the explanations. */
const SET_LABEL: Record<SetName, string> = {
  N: '$\\mathbb{N}$ (természetes számok)',
  Z: '$\\mathbb{Z}$ (egész számok)',
  Q: '$\\mathbb{Q}$ (racionális számok)',
  I: '$\\mathbb{I}$ (irracionális számok)',
};

/** A number-line point used to locate √n. */
function rootOnLine(n: number): Figure {
  const k = Math.floor(Math.sqrt(n));
  return {
    type: 'numberLine',
    min: Math.max(0, k - 1),
    max: k + 2,
    step: 1,
    points: [{ value: Math.sqrt(n), label: 'A', color: 'highlight' }],
  };
}

const SET_ORDER: SetName[] = ['N', 'Z', 'Q', 'I'];

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Which is the narrowest set containing the number? */
const classify: GeneratorDef = {
  id: 'classify',
  title: 'Melyik számhalmazba tartozik?',
  levels: [1, 2],
  generate(rng, level): Question {
    type Item = { text: string; set: SetName; why: string };
    const l1: Item[] = [
      { text: '$7$', set: 'N', why: 'A $7$ természetes szám.' },
      { text: '$0$', set: 'Z', why: 'A $0$ egész szám, de nem természetes szám (a természetes számok: $1, 2, 3, \ldots$).' },
      { text: '$-4$', set: 'Z', why: 'A $-4$ egész szám, de nem természetes.' },
      { text: '$0,25$', set: 'Q', why: '$0,25 = \\frac{1}{4}$, két egész szám hányadosa.' },
      { text: '$\\frac{3}{4}$', set: 'Q', why: 'A tört két egész szám hányadosa, tehát racionális.' },
      { text: '$-\\frac{2}{5}$', set: 'Q', why: 'A negatív tört is racionális.' },
      { text: '$\\sqrt{2}$', set: 'I', why: '$\\sqrt{2}$ nem írható fel két egész szám hányadosaként.' },
      { text: '$\\sqrt{5}$', set: 'I', why: '$\\sqrt{5}$ irracionális szám.' },
      { text: '$-\\sqrt{3}$', set: 'I', why: 'A negatív gyök is irracionális.' },
    ];
    const l2: Item[] = [
      { text: '$-\\sqrt{9}$', set: 'Z', why: '$\\sqrt{9} = 3$, ezért $-\\sqrt{9} = -3$, ami egész szám.' },
      { text: '$\\sqrt{16}$', set: 'N', why: '$\\sqrt{16} = 4$, ami természetes szám.' },
      { text: '$\\sqrt{100}$', set: 'N', why: '$\\sqrt{100} = 10$, ami természetes szám.' },
      { text: '$-\\sqrt{16}$', set: 'Z', why: '$\\sqrt{16} = 4$, ezért $-\\sqrt{16} = -4$, ami egész.' },
      { text: '$0,333\\ldots$', set: 'Q', why: 'A szakaszos tizedes tört felírható törtként: $\\frac{1}{3}$.' },
      { text: '$0,121212\\ldots$', set: 'Q', why: 'A szakaszos tizedes tört racionális: $\\frac{4}{33}$.' },
      { text: '$\\pi$', set: 'I', why: 'A $\\pi$ tizedes alakja végtelen és nem szakaszos.' },
      { text: '$1,414213\\ldots$', set: 'I', why: 'Ez a $\\sqrt{2}$ közelítő alakja: végtelen, nem szakaszos.' },
      { text: '$0,1010010001\\ldots$', set: 'I', why: 'A tizedes alak nem szakaszos, ezért irracionális.' },
      { text: '$2,75$', set: 'Q', why: '$2,75 = \\frac{11}{4}$, tehát racionális.' },
    ];
    rng.next(); // spread the first picks of small seeds
    const item = rng.pick(level === 1 ? l1 : l2);
    return {
      prompt: tex`Melyik a legszűkebb számhalmaz, amelybe ${item.text} tartozik?`,
      answer: choice(
        rng,
        SET_LABEL[item.set],
        SET_ORDER.filter((s) => s !== item.set).map((s) => SET_LABEL[s]),
      ),
      hint: 'A legszűkebb halmazt keresd: $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$.',
      solution: [item.why, `A legszűkebb halmaz: **${SET_LABEL[item.set]}**.`],
    };
  },
};

/** Put four real numbers in increasing order. L2 includes roots. */
const sortNumbers: GeneratorDef = {
  id: 'sort',
  title: 'Valós számok rendezése',
  levels: [1, 2],
  generate(rng, level): Question {
    type Item = { text: string; value: number };
    const l1: Item[] = [
      { text: '$-\\frac{3}{2}$', value: -1.5 },
      { text: '$-1$', value: -1 },
      { text: '$-0,75$', value: -0.75 },
      { text: '$-0,5$', value: -0.5 },
      { text: '$0$', value: 0 },
      { text: '$0,25$', value: 0.25 },
      { text: '$\\frac{3}{4}$', value: 0.75 },
      { text: '$1$', value: 1 },
      { text: '$1,5$', value: 1.5 },
      { text: '$\\frac{5}{2}$', value: 2.5 },
    ];
    const l2: Item[] = [
      { text: '$-\\sqrt{5}$', value: -Math.sqrt(5) },
      { text: '$-2$', value: -2 },
      { text: '$-\\sqrt{2}$', value: -Math.sqrt(2) },
      { text: '$-1$', value: -1 },
      { text: '$0$', value: 0 },
      { text: '$\\frac{1}{2}$', value: 0.5 },
      { text: '$\\sqrt{2}$', value: Math.SQRT2 },
      { text: '$\\sqrt{3}$', value: Math.sqrt(3) },
      { text: '$2$', value: 2 },
      { text: '$\\frac{5}{2}$', value: 2.5 },
    ];
    const picked = rng.sample(level === 1 ? l1 : l2, 4).sort((a, b) => a.value - b.value);
    const roots = picked.filter((p) => p.text.includes('sqrt'));
    return {
      prompt: 'Rendezd növekvő sorrendbe a számokat!',
      answer: { type: 'order', items: picked.map((p) => p.text), direction: 'A legkisebbtől a legnagyobbig' },
      hint:
        level === 1
          ? 'A negatív számok kisebbek a pozitívoknál. A törteket és a tizedes törteket össze lehet hasonlítani.'
          : 'A negatív számok kisebbek. A gyököknél használj közelítő értéket, például $\\sqrt{2} \\approx 1,41$.',
      solution: [
        ...(roots.length > 0
          ? [`Közelítő értékek: ${roots.map((p) => `${p.text} $\\approx ${num(p.value, 2)}$`).join(', ')}.`]
          : ['A negatív számok kisebbek a pozitívoknál; a törteket és a tizedes törteket össze lehet hasonlítani.']),
        `A sorrend: ${picked.map((p) => p.text).join(' < ')}.`,
        `A legkisebb: **${picked[0].text}**, a legnagyobb: **${picked[3].text}**.`,
      ],
    };
  },
};

/** √n between consecutive integers, with the point shown on a number line. */
const sqrtLine: GeneratorDef = {
  id: 'sqrt-line',
  title: 'Hol van √n a számegyenesen?',
  levels: [1, 2],
  generate(rng, level): Question {
    let n: number;
    do {
      n = level === 1 ? rng.int(2, 40) : rng.int(41, 150);
    } while (Math.round(Math.sqrt(n)) ** 2 === n);
    const k = Math.floor(Math.sqrt(n));
    return {
      prompt: tex`A számegyenesen az $A$ pont a $\sqrt{${num(n)}}$ helyén van. Melyik két szomszédos egész szám közé esik?`,
      figure: rootOnLine(n),
      answer: {
        type: 'numbers',
        fields: [
          { label: '$a =$', value: k },
          { label: '$b =$', value: k + 1 },
        ],
      },
      hint: tex`Keresd meg a két szomszédos négyzetszámot, amelyek közé ${article(n)} $${num(n)}$ esik.`,
      solution: [
        tex`$${num(k)}^2 = ${num(k * k)}$ és $${num(k + 1)}^2 = ${num((k + 1) * (k + 1))}$`,
        tex`Mivel $${num(k * k)} < ${num(n)} < ${num((k + 1) * (k + 1))}$, ezért $${num(k)} < \sqrt{${num(n)}} < ${num(k + 1)}$.`,
        tex`A $\sqrt{${num(n)}}$ tehát ${article(k)} **${num(k)} és ${num(k + 1)}** közé esik.`,
      ],
    };
  },
};

/** True/false statements about decimal expansions and π. */
const decimalTF: GeneratorDef = {
  id: 'decimal-tf',
  title: 'Tizedes alak: racionális vagy irracionális?',
  levels: [1, 2],
  generate(rng, level): Question {
    type Pair = { statement: string; value: boolean; why: string };
    const l1: Pair[] = [
      { statement: 'A $0,25$ véges tizedes tört, ezért racionális.', value: true, why: '$0,25 = \\frac{1}{4}$, két egész szám hányadosa.' },
      { statement: 'A $0,333\\ldots$ végtelen szakaszos tizedes tört, ezért racionális.', value: true, why: 'A szakaszos tizedes tört felírható törtként: $\\frac{1}{3}$.' },
      { statement: 'Minden végtelen tizedes tört irracionális.', value: false, why: 'A végtelen szakaszos tizedes törtek racionálisak, például $0,333\\ldots$.' },
      { statement: 'A $\\sqrt{2}$ tizedes alakja véges.', value: false, why: '$\\sqrt{2} = 1,414213\\ldots$, végtelen és nem szakaszos.' },
      { statement: 'A $0,121212\\ldots$ racionális szám.', value: true, why: 'Szakaszos tizedes tört, ezért felírható törtként.' },
      { statement: 'A $0,5$ irracionális szám.', value: false, why: '$0,5 = \\frac{1}{2}$, tehát racionális.' },
      { statement: 'A $0,75$ véges tizedes tört, ezért racionális.', value: true, why: '$0,75 = \\frac{3}{4}$, két egész szám hányadosa.' },
      { statement: 'A $\\frac{2}{5}$ tizedes alakja $0,4$, ami véges.', value: true, why: '$\\frac{2}{5} = 0,4$, véges tizedes tört.' },
      { statement: 'A $0,999\\ldots$ irracionális szám.', value: false, why: '$0,999\\ldots = 1$, ami természetes szám.' },
      { statement: 'A $\\sqrt{16}$ tizedes alakja véges.', value: true, why: '$\\sqrt{16} = 4$, véges tizedes tört.' },
    ];
    const l2: Pair[] = [
      { statement: 'A $\\pi$ tizedes alakja végtelen és nem szakaszos, ezért irracionális.', value: true, why: '$\\pi = 3,14159\\ldots$, a számjegyek nem ismétlődnek szakaszosan.' },
      { statement: 'A $3,14$ pontosan a $\\pi$ értéke.', value: false, why: '$\\pi = 3,14159\\ldots$, a $3,14$ csak közelítő érték.' },
      { statement: 'A $\\frac{1}{3}$ tizedes alakja $0,333\\ldots$, tehát racionális.', value: true, why: 'A tört két egész szám hányadosa, a tizedes alakja szakaszos.' },
      { statement: 'A $-\\frac{2}{5}$ tizedes alakja $-0,4$, ami véges.', value: true, why: '$-\\frac{2}{5} = -0,4$, véges tizedes tört.' },
      { statement: 'A $0,1010010001\\ldots$ szakaszos tizedes tört.', value: false, why: 'A számjegyek között egyre több nulla van; a tizedes alak nem szakaszos.' },
      { statement: 'Minden racionális szám tizedes alakja véges.', value: false, why: 'Lehet végtelen szakaszos is, például $\\frac{1}{3} = 0,333\\ldots$.' },
      { statement: 'A $\\sqrt{9}$ irracionális szám.', value: false, why: '$\\sqrt{9} = 3$, ami természetes szám.' },
      { statement: 'A $0,272727\\ldots$ szakaszos tizedes tört.', value: true, why: 'A $27$ ismétlődik, ezért szakaszos.' },
      { statement: 'A $0,272727\\ldots$ irracionális szám.', value: false, why: 'A szakaszos tizedes törtek racionálisak, például $\\frac{3}{11}$.' },
      { statement: 'A $\\sqrt{2}$ racionális szám.', value: false, why: '$1,414213\\ldots$ végtelen, nem szakaszos.' },
      { statement: 'A $\\sqrt{25}$ racionális szám.', value: true, why: '$\\sqrt{25} = 5$, ami természetes szám.' },
      { statement: 'A $-\\pi$ racionális szám.', value: false, why: 'A $\\pi$ irracionális, az ellentettje is az.' },
    ];
    rng.next(); // spread the first picks of small seeds
    const item = rng.pick(level === 1 ? l1 : l2);
    return {
      prompt: `Igaz vagy hamis?\n\n**${item.statement}**`,
      answer: { type: 'truefalse', value: item.value },
      hint: 'A véges vagy szakaszos tizedes tört racionális; a végtelen, nem szakaszos irracionális.',
      solution: [item.why, item.value ? 'Az állítás **igaz**.' : 'Az állítás **hamis**.'],
    };
  },
};

/** Which of two real numbers is larger? */
const compare: GeneratorDef = {
  id: 'compare',
  title: 'Melyik a nagyobb?',
  levels: [1, 2],
  generate(rng, level): Question {
    type Pair = { a: string; av: number; b: string; bv: number; why: string };
    const l1: Pair[] = [
      { a: '$\\frac{3}{4}$', av: 0.75, b: '$0,7$', bv: 0.7, why: '$0,75 > 0,7$' },
      { a: '$-2$', av: -2, b: '$-2,5$', bv: -2.5, why: '$-2 > -2,5$, mert a $-2$ közelebb van a nullához.' },
      { a: '$0,6$', av: 0.6, b: '$\\frac{2}{3}$', bv: 2 / 3, why: '$0,6 < 0,666\\ldots$, ezért $0,6 < \\frac{2}{3}$.' },
      { a: '$3$', av: 3, b: '$\\sqrt{8}$', bv: Math.sqrt(8), why: '$3^2 = 9 > 8 = (\\sqrt{8})^2$, ezért $3 > \\sqrt{8}$.' },
      { a: '$-\\frac{1}{2}$', av: -0.5, b: '$-0,4$', bv: -0.4, why: '$-0,5 < -0,4$.' },
    ];
    const l2: Pair[] = [
      { a: '$\\sqrt{10}$', av: Math.sqrt(10), b: '$3,2$', bv: 3.2, why: '$3,2^2 = 10,24 > 10$, ezért $\\sqrt{10} < 3,2$.' },
      { a: '$\\sqrt{2}$', av: Math.SQRT2, b: '$1,4$', bv: 1.4, why: '$1,4^2 = 1,96 < 2$, ezért $\\sqrt{2} > 1,4$.' },
      { a: '$\\sqrt{50}$', av: Math.sqrt(50), b: '$7$', bv: 7, why: '$7^2 = 49 < 50$, ezért $\\sqrt{50} > 7$.' },
      { a: '$\\frac{4}{3}$', av: 4 / 3, b: '$1,3$', bv: 1.3, why: '$\\frac{4}{3} = 1,333\\ldots > 1,3$.' },
      { a: '$-\\sqrt{5}$', av: -Math.sqrt(5), b: '$-2,2$', bv: -2.2, why: '$-\\sqrt{5} \\approx -2,236 < -2,2$.' },
      { a: '$\\sqrt{7}$', av: Math.sqrt(7), b: '$2,6$', bv: 2.6, why: '$2,6^2 = 6,76 < 7$, ezért $\\sqrt{7} > 2,6$.' },
      { a: '$\\sqrt{7}$', av: Math.sqrt(7), b: '$2,65$', bv: 2.65, why: '$2,65^2 = 7,0225 > 7$, ezért $\\sqrt{7} < 2,65$.' },
    ];
    const item = rng.pick(level === 1 ? l1 : l2);
    const swap = rng.chance(0.5);
    const left = swap ? item.b : item.a;
    const right = swap ? item.a : item.b;
    const leftV = swap ? item.bv : item.av;
    const rightV = swap ? item.av : item.bv;
    const correct = leftV > rightV ? left : right;
    const other = leftV > rightV ? right : left;
    return {
      prompt: tex`Melyik a nagyobb? ${left} vagy ${right}`,
      answer: textChoice(correct, [other, 'egyenlők']),
      hint: 'Pozitív számoknál emeld négyzetre mindkettőt; negatívoknál figyelj az irányra!',
      solution: [
        tex`A két szám: ${left} és ${right}.`,
        item.why,
        tex`A nagyobb szám: **${correct}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-03',
  goals: [
    'megérteni, miért vannak irracionális számok,',
    'felismerni a racionális és irracionális számokat,',
    'elhelyezni a valós számokat a számegyenesen,',
    'összehasonlítani és rendezni valós számokat.',
  ],
  parts: [
    {
      title: 'Racionális és irracionális számok',
      steps: [
        {
          type: 'theory',
          title: 'Az $x^2 = 2$ rejtélye',
          body: 'Nincs olyan tört, amelynek a négyzete pontosan $2$. Az ilyen számokat irracionálisnak nevezzük.',
          remember: '$\\sqrt{2}$ nem írható fel két egész szám hányadosaként.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**Az $x^2 = 2$ egyenletnek van racionális megoldása.**',
            answer: { type: 'truefalse', value: false },
            hint: 'Próbálj törtekkel közelíteni: $1,4^2 = 1,96$, $1,5^2 = 2,25$.',
            solution: ['A racionális számok négyzete nem ad pontosan $2$-t.', 'A megoldás $\\sqrt{2}$, ami irracionális. Az állítás **hamis**.'],
          },
        },
        {
          type: 'theory',
          title: 'R = Q ∪ I',
          body: 'A racionális számok ($\\mathbb{Q}$) és az irracionális számok ($\\mathbb{I}$) együtt adják a valós számokat: $\\mathbb{R} = \\mathbb{Q} \\cup \\mathbb{I}$.',
          remember: '$\\mathbb{R} = \\mathbb{Q} \\cup \\mathbb{I}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Párosítsd a számokat a legszűkebb halmazukkal!',
            answer: {
              type: 'match',
              pairs: [
                ['$5$', '$\\mathbb{N}$'],
                ['$-3$', '$\\mathbb{Z}$'],
                ['$\\frac{4}{7}$', '$\\mathbb{Q}$'],
                ['$\\sqrt{3}$', '$\\mathbb{I}$'],
              ],
            },
            hint: 'A természetes számok a legszűkebb halmaz; a törtek racionálisak; a nem négyzetszám gyökök irracionálisak.',
            solution: ['$5 \\in \\mathbb{N}$, $-3 \\in \\mathbb{Z}$, $\\frac{4}{7} \\in \\mathbb{Q}$, $\\sqrt{3} \\in \\mathbb{I}$.'],
          },
        },
        { type: 'practice', generator: 'classify', level: 1, count: 2 },
      ],
    },
    {
      title: 'Tizedes törtek és π',
      steps: [
        {
          type: 'theory',
          title: 'Milyen a tizedes alak?',
          body: 'A racionális szám tizedes alakja véges vagy végtelen szakaszos. Az irracionális számé végtelen, de nem szakaszos.',
          remember: 'Véges vagy szakaszos → racionális.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A $\\pi$ racionális szám, mert $3,14$ a közelítő értéke.**',
            answer: { type: 'truefalse', value: false },
            hint: 'A $3,14$ csak közelítés. Milyen a $\\pi$ tizedes alakja?',
            solution: ['$\\pi = 3,14159\\ldots$, végtelen és nem szakaszos.', 'Ezért a $\\pi$ irracionális. Az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Véges tizedes tört',
          problem: 'Racionális-e a $0,25$?',
          steps: [
            { text: '$0,25 = \\frac{25}{100}$' },
            { text: '$= \\frac{1}{4}$' },
          ],
          answer: 'Igen, a $0,25$ racionális.',
        },
        { type: 'practice', generator: 'decimal-tf', level: 1, count: 2 },
        {
          type: 'theory',
          title: 'A π',
          body: 'A $\\pi$ a kör kerületének és átmérőjének aránya. Értéke $3,14159\\ldots$, végtelen, nem szakaszos — tehát irracionális.',
          remember: '$\\pi \\approx 3,14$, de $\\pi \\ne 3,14$',
        },
        { type: 'practice', generator: 'classify', level: 2, count: 2 },
      ],
    },
    {
      title: 'A számegyenes és a halmazok',
      steps: [
        {
          type: 'theory',
          title: 'Egymásba ágyazott halmazok',
          body: 'Minden természetes szám egész, minden egész racionális, minden racionális valós: $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$.',
          remember: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik állítás igaz?',
            answer: textChoice('$\\mathbb{N} \\subset \\mathbb{Z}$', ['$\\mathbb{Z} \\subset \\mathbb{N}$', '$\\mathbb{Q} \\subset \\mathbb{Z}$', '$\\mathbb{I} \\subset \\mathbb{Q}$']),
            hint: 'A természetes számok az egészek részei; az irracionális számok nem racionálisak.',
            solution: ['Minden természetes szám egész, ezért $\\mathbb{N} \\subset \\mathbb{Z}$.', 'A másik három állítás hamis.'],
          },
        },
        {
          type: 'theory',
          title: 'Hol van a $\\sqrt{5}$?',
          body: 'A $\\sqrt{5}$ a $2$ és a $3$ közé esik, mert $2^2 = 4 < 5 < 9 = 3^2$.',
          figure: { type: 'numberLine', min: 1, max: 4, step: 1, points: [{ value: Math.sqrt(5), label: '√5', color: 'highlight' }] },
          remember: '$2 < \\sqrt{5} < 3$',
        },
        { type: 'practice', generator: 'sqrt-line', level: 1, count: 2 },
        { type: 'practice', generator: 'sqrt-line', level: 2 },
      ],
    },
    {
      title: 'Összehasonlítás és rendezés',
      steps: [
        {
          type: 'theory',
          title: 'Hogyan hasonlítsunk?',
          body: 'Pozitív számoknál a négyzetre emelés megőrzi a sorrendet: ha $a < b$, akkor $a^2 < b^2$. Így a gyököket is össze lehet hasonlítani.',
          remember: 'Ha $a, b \\ge 0$: $a < b \\iff a^2 < b^2$',
        },
        {
          type: 'example',
          title: 'Melyik nagyobb?',
          problem: 'Melyik nagyobb: $\\sqrt{8}$ vagy $3$?',
          steps: [
            { text: '$3^2 = 9$ és $(\\sqrt{8})^2 = 8$' },
            { text: '$8 < 9$, ezért $\\sqrt{8} < 3$' },
          ],
          answer: 'A $3$ a nagyobb.',
        },
        { type: 'practice', generator: 'compare', level: 1, count: 2 },
        { type: 'practice', generator: 'compare', level: 2 },
        { type: 'practice', generator: 'sort', level: 1 },
        { type: 'practice', generator: 'sort', level: 2 },
      ],
    },
  ],
  generators: [classify, sortNumbers, sqrtLine, decimalTF, compare],
  miniTest: {
    items: [
      { generator: 'classify', level: 1 },
      { generator: 'classify', level: 2 },
      { generator: 'decimal-tf', level: 1 },
      { generator: 'sqrt-line', level: 1 },
      { generator: 'compare', level: 2 },
      { generator: 'sort', level: 1 },
      { generator: 'sort', level: 2 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'classify', level: 1 },
    { generator: 'decimal-tf', level: 1 },
    { generator: 'sqrt-line', level: 1 },
    { generator: 'sqrt-line', level: 2 },
    { generator: 'compare', level: 1 },
    { generator: 'sort', level: 1 },
    { generator: 'sort', level: 2 },
  ],
});
