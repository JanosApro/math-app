/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 7. Egyenlőtlenségek az N₀ halmazon
 *
 * Inequalities with <, >, ≤, ≥ in N₀; how a sum / difference / product / quotient changes when
 * an operand changes (bar-model rules); solving one-step inequalities and describing the solution
 * set (listed when finite, or "x > 8" when infinite); "legalább / legfeljebb" money problems.
 * Grade 5 uses only non-negative numbers, so every count is a count in N₀ (including 0).
 */
import {
  article,
  defineSubtopic,
  num,
  tex,
  textChoice,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** Instrumental suffix after a numeral, with assimilation: 2-vel, 3-mal, 5-tel, 8-cal … */
function instrumental(n: number): string {
  const forms: Record<number, string> = { 2: 'vel', 3: 'mal', 4: 'gyel', 5: 'tel', 6: 'tal', 7: 'tel', 8: 'cal', 9: 'cel' };
  return forms[n] ?? 'val';
}

/** A comma-separated range for a solution list, with an ellipsis when it is long. */
function rangeText(from: number, to: number): string {
  if (to - from <= 8) return Array.from({ length: to - from + 1 }, (_, i) => num(from + i)).join(', ');
  return `${num(from)}, ${num(from + 1)}, ${num(from + 2)}, \\ldots, ${num(to)}`;
}

type BoundAsk = 'count' | 'largest' | 'smallest';

interface BoundOpts {
  /** The inequality itself, already formatted as RichText with $…$. */
  relation: string;
  /** The boundary of the solution set (x < c, x ≤ c, x > c, x ≥ c). */
  boundary: number;
  strict: boolean;
  direction: 'upper' | 'lower';
  ask: BoundAsk;
  hint: string;
  /** The rearrangement step, e.g. "$x < 12 - 7 = 5$". */
  rearrange: string;
}

/**
 * Builds a "solve the inequality" question. Upper bounds have finitely many solutions in N₀
 * (0 … c), lower bounds have infinitely many (c, c + 1, …).
 */
function boundQuestion(o: BoundOpts): Question {
  const askText =
    o.ask === 'count' ? 'Hány megoldása van N₀-ban?' : o.ask === 'largest' ? 'Mi a legnagyobb megoldás?' : 'Mi a legkisebb megoldás?';
  let answer: number;
  let listLine: string;
  let resultLine: string;
  if (o.direction === 'upper') {
    const count = o.strict ? o.boundary : o.boundary + 1;
    const largest = o.strict ? o.boundary - 1 : o.boundary;
    answer = o.ask === 'count' ? count : largest;
    listLine = tex`N₀-ban a megoldások: $${rangeText(0, largest)}$.`;
    resultLine =
      o.ask === 'count'
        ? tex`Tehát **${num(count)} megoldás** van.`
        : tex`A legnagyobb megoldás **${num(largest)}**.`;
  } else {
    const smallest = o.strict ? o.boundary + 1 : o.boundary;
    answer = smallest;
    listLine = tex`N₀-ban a megoldások: $${num(smallest)}, ${num(smallest + 1)}, ${num(smallest + 2)}, \ldots$`;
    resultLine = tex`A legkisebb megoldás **${num(smallest)}**.`;
  }
  return {
    prompt: `Oldd meg az egyenlőtlenséget!\n\n${o.relation}\n\n${askText}`,
    answer: { type: 'number', value: answer },
    inputLabel: o.ask === 'count' ? 'Megoldások száma' : '$x =$',
    hint: o.hint,
    solution: [o.rearrange, listLine, resultLine],
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Is the given number a solution? (true/false) */
const satisfies: GeneratorDef = {
  id: 'satisfies',
  title: 'Megoldása-e a szám az egyenlőtlenségnek?',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const sign = rng.pick(['<', '>', '\\le', '\\ge'] as const);
      const c = rng.int(3, 12);
      const k = rng.int(0, c + 2);
      const relation = tex`$x ${sign} ${num(c)}$`;
      const value = sign === '<' ? k < c : sign === '>' ? k > c : sign === '\\le' ? k <= c : k >= c;
      const shownSign = sign; // already LaTeX: <, >, \le or \ge
      return {
        prompt: tex`Megoldása-e ${article(k)} $${num(k)}$ a következő egyenlőtlenségnek?\n\n${relation}`,
        answer: { type: 'truefalse', value },
        hint: 'Helyettesítsd be a számot az $x$ helyére, és hasonlítsd össze!',
        solution: [
          tex`Helyettesítsük be: $${num(k)} ${shownSign} ${num(c)}$.`,
          value
            ? tex`Az állítás igaz, tehát a $${num(k)}$ **megoldás**.`
            : tex`Az állítás nem igaz, tehát a $${num(k)}$ **nem megoldás**.`,
        ],
      };
    }
    const kind = rng.pick(['add', 'sub', 'mul', 'div'] as const);
    if (kind === 'add') {
      const a = rng.int(2, 10);
      const c = rng.int(2, 10);
      const b = a + c;
      const k = rng.int(0, c + 2);
      return {
        prompt: tex`Megoldása-e ${article(k)} $${num(k)}$ a következő egyenlőtlenségnek?\n\n$x + ${num(a)} < ${num(b)}$`,
        answer: { type: 'truefalse', value: k + a < b },
        hint: 'Helyettesítsd be a számot az $x$ helyére, és számold ki a bal oldalt!',
        solution: [
          tex`Bal oldal: $${num(k)} + ${num(a)} = ${num(k + a)}$.`,
          k + a < b
            ? tex`$${num(k + a)} < ${num(b)}$ igaz, tehát a $${num(k)}$ **megoldás**.`
            : tex`$${num(k + a)} < ${num(b)}$ nem igaz, tehát a $${num(k)}$ **nem megoldás**.`,
        ],
      };
    }
    if (kind === 'sub') {
      const a = rng.int(2, 10);
      const b = rng.int(2, 10);
      const c = a + b;
      const k = rng.int(a, c + 2); // keep x − a non-negative, as in N₀
      return {
        prompt: tex`Megoldása-e ${article(k)} $${num(k)}$ a következő egyenlőtlenségnek?\n\n$x - ${num(a)} \ge ${num(b)}$`,
        answer: { type: 'truefalse', value: k - a >= b },
        hint: 'Helyettesítsd be a számot az $x$ helyére, és számold ki a bal oldalt!',
        solution: [
          tex`Bal oldal: $${num(k)} - ${num(a)} = ${num(k - a)}$.`,
          k - a >= b
            ? tex`$${num(k - a)} \ge ${num(b)}$ igaz, tehát a $${num(k)}$ **megoldás**.`
            : tex`$${num(k - a)} \ge ${num(b)}$ nem igaz, tehát a $${num(k)}$ **nem megoldás**.`,
        ],
      };
    }
    if (kind === 'mul') {
      const a = rng.int(2, 6);
      const c = rng.int(2, 8);
      const b = a * c;
      const k = rng.int(0, c + 1);
      return {
        prompt: tex`Megoldása-e ${article(k)} $${num(k)}$ a következő egyenlőtlenségnek?\n\n$${num(a)} \cdot x \le ${num(b)}$`,
        answer: { type: 'truefalse', value: a * k <= b },
        hint: 'Helyettesítsd be a számot, és számold ki a szorzatot!',
        solution: [
          tex`Bal oldal: $${num(a)} \cdot ${num(k)} = ${num(a * k)}$.`,
          a * k <= b
            ? tex`$${num(a * k)} \le ${num(b)}$ igaz, tehát a $${num(k)}$ **megoldás**.`
            : tex`$${num(a * k)} \le ${num(b)}$ nem igaz, tehát a $${num(k)}$ **nem megoldás**.`,
        ],
      };
    }
    const a = rng.int(2, 6);
    const b = rng.int(2, 8);
    const s = rng.int(0, b + 1);
    const k = a * s;
    return {
      prompt: tex`Megoldása-e ${article(k)} $${num(k)}$ a következő egyenlőtlenségnek?\n\n$x : ${num(a)} > ${num(b)}$`,
      answer: { type: 'truefalse', value: s > b },
      hint: 'Helyettesítsd be a számot, és végezd el az osztást!',
      solution: [
        tex`Bal oldal: $${num(k)} : ${num(a)} = ${num(s)}$.`,
        s > b
          ? tex`$${num(s)} > ${num(b)}$ igaz, tehát a $${num(k)}$ **megoldás**.`
          : tex`$${num(s)} > ${num(b)}$ nem igaz, tehát a $${num(k)}$ **nem megoldás**.`,
      ],
    };
  },
};

/** How does the result change when an operand changes? */
const change: GeneratorDef = {
  id: 'change',
  title: 'Az eredmény változása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(10, 60);
      const b = rng.int(10, 60);
      const n = rng.int(2, 9);
      const kind = rng.pick(['sum-up', 'sum-down', 'sum-both'] as const);
      const old = a + b;
      const inc = `${num(n)}-${instrumental(n)}`;
      if (kind === 'sum-up') {
        return {
          prompt: tex`A $${num(a)} + ${num(b)}$ összegben az egyik tagot ${num(n)}-${instrumental(n)} növeljük. Hogyan változik az összeg?`,
          answer: textChoice(`${inc} nő`, [`${inc} csökken`, 'nem változik', 'a kétszeresére nő']),
          hint: 'Írd fel a régi és az új összeget, és hasonlítsd össze!',
          solution: [
            tex`Régi összeg: $${num(a)} + ${num(b)} = ${num(old)}$.`,
            tex`Új összeg: $(${num(a)} + ${num(n)}) + ${num(b)} = ${num(a + n + b)}$.`,
            tex`A különbség $${num(n)}$, tehát az összeg **${num(n)}-${instrumental(n)} nő**.`,
          ],
        };
      }
      if (kind === 'sum-down') {
        return {
          prompt: tex`A $${num(a)} + ${num(b)}$ összegben az egyik tagot ${num(n)}-${instrumental(n)} csökkentjük. Hogyan változik az összeg?`,
          answer: textChoice(`${inc} csökken`, [`${inc} nő`, 'nem változik', 'a felére csökken']),
          hint: 'Írd fel a régi és az új összeget, és hasonlítsd össze!',
          solution: [
            tex`Régi összeg: $${num(a)} + ${num(b)} = ${num(old)}$.`,
            tex`Új összeg: $(${num(a)} - ${num(n)}) + ${num(b)} = ${num(a - n + b)}$.`,
            tex`A különbség $${num(n)}$, tehát az összeg **${num(n)}-${instrumental(n)} csökken**.`,
          ],
        };
      }
      return {
        prompt: tex`A $${num(a)} + ${num(b)}$ összegben az egyik tagot ${num(n)}-${instrumental(n)} növeljük, a másikat ${num(n)}-${instrumental(n)} csökkentjük. Hogyan változik az összeg?`,
        answer: textChoice('nem változik', [`${inc} nő`, `${inc} csökken`, 'a kétszeresére nő']),
        hint: 'Az egyik tag nő, a másik ugyanannyival csökken. Mi lesz az új összeg?',
        solution: [
          tex`Régi összeg: $${num(a)} + ${num(b)} = ${num(old)}$.`,
          tex`Új összeg: $(${num(a)} + ${num(n)}) + (${num(b)} - ${num(n)}) = ${num(old)}$.`,
          'Az összeg **nem változik**.',
        ],
      };
    }
    if (level === 2) {
      const a = rng.int(45, 90);
      const b = rng.int(10, 30);
      const n = rng.int(2, 9);
      const kind = rng.pick(['minuend-up', 'subtrahend-up', 'both-up', 'minuend-down'] as const);
      const old = a - b;
      const inc = `${num(n)}-${instrumental(n)}`;
      if (kind === 'minuend-up') {
        return {
          prompt: tex`A $${num(a)} - ${num(b)}$ különbségben a kisebbítendőt ${num(n)}-${instrumental(n)} növeljük. Hogyan változik a különbség?`,
          answer: textChoice(`${inc} nő`, [`${inc} csökken`, 'nem változik', 'a kétszeresére nő']),
          hint: 'A kisebbítendő nő, a kivonandó nem változik.',
          solution: [
            tex`Régi különbség: $${num(a)} - ${num(b)} = ${num(old)}$.`,
            tex`Új különbség: $(${num(a)} + ${num(n)}) - ${num(b)} = ${num(a + n - b)}$.`,
            tex`A különbség **${num(n)}-${instrumental(n)} nő**.`,
          ],
        };
      }
      if (kind === 'subtrahend-up') {
        return {
          prompt: tex`A $${num(a)} - ${num(b)}$ különbségben a kivonandót ${num(n)}-${instrumental(n)} növeljük. Hogyan változik a különbség?`,
          answer: textChoice(`${inc} csökken`, [`${inc} nő`, 'nem változik', 'a felére csökken']),
          hint: 'Ha többet vonunk ki, a különbség kisebb lesz.',
          solution: [
            tex`Régi különbség: $${num(a)} - ${num(b)} = ${num(old)}$.`,
            tex`Új különbség: $${num(a)} - (${num(b)} + ${num(n)}) = ${num(a - b - n)}$.`,
            tex`A különbség **${num(n)}-${instrumental(n)} csökken**.`,
          ],
        };
      }
      if (kind === 'both-up') {
        return {
          prompt: tex`A $${num(a)} - ${num(b)}$ különbségben a kisebbítendőt és a kivonandót is ${num(n)}-${instrumental(n)} növeljük. Hogyan változik a különbség?`,
          answer: textChoice('nem változik', [`${inc} nő`, `${inc} csökken`, 'a kétszeresére nő']),
          hint: 'Mindkét szám ugyanannyival nő. Írd fel az új különbséget!',
          solution: [
            tex`Régi különbség: $${num(a)} - ${num(b)} = ${num(old)}$.`,
            tex`Új különbség: $(${num(a)} + ${num(n)}) - (${num(b)} + ${num(n)}) = ${num(a - b)}$.`,
            'A különbség **nem változik**.',
          ],
        };
      }
      return {
        prompt: tex`A $${num(a)} - ${num(b)}$ különbségben a kisebbítendőt ${num(n)}-${instrumental(n)} csökkentjük. Hogyan változik a különbség?`,
        answer: textChoice(`${inc} csökken`, [`${inc} nő`, 'nem változik', 'a felére csökken']),
        hint: 'A kisebbítendő csökken, a kivonandó nem változik.',
        solution: [
          tex`Régi különbség: $${num(a)} - ${num(b)} = ${num(old)}$.`,
          tex`Új különbség: $(${num(a)} - ${num(n)}) - ${num(b)} = ${num(a - n - b)}$.`,
          tex`A különbség **${num(n)}-${instrumental(n)} csökken**.`,
        ],
      };
    }
    const kind = rng.pick(['product-double', 'product-triple', 'quotient-dividend', 'quotient-divisor'] as const);
    if (kind === 'product-double' || kind === 'product-triple') {
      const a = rng.int(3, 12);
      const b = rng.int(3, 12);
      const m = kind === 'product-double' ? 2 : 3;
      const old = a * b;
      return {
        prompt: tex`A $${num(a)} \cdot ${num(b)}$ szorzatban az egyik tényezőt a ${m === 2 ? 'kétszeresére' : 'háromszorosára'} növeljük. Hogyan változik a szorzat?`,
        answer:
          m === 2
            ? textChoice('a szorzat a kétszeresére nő', ['a szorzat a felére csökken', 'nem változik', 'a szorzat 2-vel nő'])
            : textChoice('a szorzat a háromszorosára nő', ['a szorzat a harmadára csökken', 'nem változik', 'a szorzat 3-mal nő']),
        hint: 'Írd fel a régi és az új szorzatot!',
        solution: [
          tex`Régi szorzat: $${num(a)} \cdot ${num(b)} = ${num(old)}$.`,
          tex`Új szorzat: $${num(m)} \cdot ${num(a)} \cdot ${num(b)} = ${num(m * old)}$.`,
          m === 2 ? 'A szorzat **a kétszeresére nő**.' : 'A szorzat **a háromszorosára nő**.',
        ],
      };
    }
    const b = rng.int(2, 9);
    const q = kind === 'quotient-divisor' ? rng.pick([2, 4, 6, 8, 10]) : rng.int(2, 9);
    const a = b * q;
    if (kind === 'quotient-dividend') {
      return {
        prompt: tex`A $${num(a)} : ${num(b)}$ hányadosban az osztandót a kétszeresére növeljük. Hogyan változik a hányados?`,
        answer: textChoice('a hányados a kétszeresére nő', ['a hányados a felére csökken', 'nem változik', 'a hányados 2-vel nő']),
        hint: 'Írd fel a régi és az új hányadost!',
        solution: [
          tex`Régi hányados: $${num(a)} : ${num(b)} = ${num(q)}$.`,
          tex`Új hányados: $(${num(2)} \cdot ${num(a)}) : ${num(b)} = ${num(2 * q)}$.`,
          'A hányados **a kétszeresére nő**.',
        ],
      };
    }
    return {
      prompt: tex`A $${num(a)} : ${num(b)}$ hányadosban az osztót a kétszeresére növeljük. Hogyan változik a hányados?`,
      answer: textChoice('a hányados a felére csökken', ['a hányados a kétszeresére nő', 'nem változik', 'a hányados 2-vel csökken']),
      hint: 'Ha kétszer akkora osztóval osztunk, a hányados kisebb lesz.',
      solution: [
        tex`Régi hányados: $${num(a)} : ${num(b)} = ${num(q)}$.`,
        tex`Új hányados: $${num(a)} : (${num(2)} \cdot ${num(b)}) = ${num(q / 2)}$.`,
        'A hányados **a felére csökken**.',
      ],
    };
  },
};

/** One-step inequalities with addition / subtraction. */
const solveAddSub: GeneratorDef = {
  id: 'solve-add-sub',
  title: 'Összeadásos és kivonásos egyenlőtlenség',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const kinds =
      level === 1
        ? (['add-lt', 'add-le', 'sub-lt', 'sub2-le'] as const)
        : (['add-lt', 'add-le', 'add-gt', 'add-ge', 'sub-lt', 'sub-ge', 'sub2-le', 'sub2-gt'] as const);
    const kind = rng.pick(kinds);
    const askUpper: BoundAsk = level === 1 ? 'largest' : rng.pick(['count', 'largest'] as const);
    const askLower: BoundAsk = 'smallest';
    if (kind === 'add-lt' || kind === 'add-le' || kind === 'add-gt' || kind === 'add-ge') {
      const a = rng.int(2, level === 1 ? 9 : 15);
      const c = rng.int(1, level === 1 ? 9 : 15);
      const b = a + c;
      const relation = tex`$x + ${num(a)} ${kind === 'add-lt' ? '<' : kind === 'add-le' ? '\\le' : kind === 'add-gt' ? '>' : '\\ge'} ${num(b)}$`;
      const rearrange = tex`$x ${kind === 'add-lt' ? '<' : kind === 'add-le' ? '\\le' : kind === 'add-gt' ? '>' : '\\ge'} ${num(b)} - ${num(a)} = ${num(c)}$`;
      return boundQuestion({
        relation,
        boundary: c,
        strict: kind === 'add-lt' || kind === 'add-gt',
        direction: kind === 'add-gt' || kind === 'add-ge' ? 'lower' : 'upper',
        ask: kind === 'add-gt' || kind === 'add-ge' ? askLower : askUpper,
        hint: 'Az összegből vond ki az ismert tagot, és figyeld az egyenlőtlenség jelét!',
        rearrange,
      });
    }
    if (kind === 'sub-lt' || kind === 'sub-ge') {
      const a = rng.int(2, level === 1 ? 8 : 12);
      const c = a + rng.int(2, level === 1 ? 8 : 15);
      const b = c - a;
      const relation = tex`$x - ${num(a)} ${kind === 'sub-lt' ? '<' : '\\ge'} ${num(b)}$`;
      const rearrange = tex`$x ${kind === 'sub-lt' ? '<' : '\\ge'} ${num(b)} + ${num(a)} = ${num(c)}$`;
      return boundQuestion({
        relation,
        boundary: c,
        strict: kind === 'sub-lt',
        direction: kind === 'sub-lt' ? 'upper' : 'lower',
        ask: kind === 'sub-lt' ? askUpper : askLower,
        hint: 'A különbséghez add hozzá a kivonandót!',
        rearrange,
      });
    }
    const b = rng.int(2, level === 1 ? 9 : 15);
    const c = rng.int(2, level === 1 ? 9 : 15);
    const a = b + c;
    const relation = tex`$${num(a)} - x ${kind === 'sub2-le' ? '\\le' : '>'} ${num(b)}$`;
    const rearrange = tex`$x ${kind === 'sub2-le' ? '\\ge' : '<'} ${num(a)} - ${num(b)} = ${num(c)}$`;
    return boundQuestion({
      relation,
      boundary: c,
      strict: kind === 'sub2-gt',
      direction: kind === 'sub2-le' ? 'lower' : 'upper',
      ask: kind === 'sub2-le' ? askLower : askUpper,
      hint: 'A kisebbítendőből vond ki a különbséget, és figyeld a jel irányát!',
      rearrange,
    });
  },
};

/** One-step inequalities with multiplication / division. */
const solveMulDiv: GeneratorDef = {
  id: 'solve-mul-div',
  title: 'Szorzásos és osztásos egyenlőtlenség',
  levels: [2, 3],
  generate(rng, level): Question {
    const kinds =
      level === 2
        ? (['mul-le', 'mul-gt', 'div-lt', 'div-ge'] as const)
        : (['mul-lt', 'mul-le', 'mul-gt', 'mul-ge', 'div-lt', 'div-le', 'div-gt', 'div-ge'] as const);
    const kind = rng.pick(kinds);
    const askUpper: BoundAsk = rng.pick(['count', 'largest'] as const);
    if (kind.startsWith('mul')) {
      const a = rng.int(2, level === 2 ? 6 : 9);
      const c = rng.int(2, level === 2 ? 8 : 12);
      const b = a * c;
      const sign = kind === 'mul-lt' ? '<' : kind === 'mul-le' ? '\\le' : kind === 'mul-gt' ? '>' : '\\ge';
      const relation = tex`$${num(a)} \cdot x ${sign} ${num(b)}$`;
      const rearrange = tex`$x ${sign} ${num(b)} : ${num(a)} = ${num(c)}$`;
      return boundQuestion({
        relation,
        boundary: c,
        strict: kind === 'mul-lt' || kind === 'mul-gt',
        direction: kind === 'mul-gt' || kind === 'mul-ge' ? 'lower' : 'upper',
        ask: kind === 'mul-gt' || kind === 'mul-ge' ? 'smallest' : askUpper,
        hint: 'A szorzatot oszd el az ismert tényezővel!',
        rearrange,
      });
    }
    const a = rng.int(2, level === 2 ? 6 : 9);
    const b = rng.int(2, level === 2 ? 8 : 12);
    const c = a * b;
    const sign = kind === 'div-lt' ? '<' : kind === 'div-le' ? '\\le' : kind === 'div-gt' ? '>' : '\\ge';
    const relation = tex`$x : ${num(a)} ${sign} ${num(b)}$`;
    const rearrange = tex`$x ${sign} ${num(b)} \cdot ${num(a)} = ${num(c)}$`;
    return boundQuestion({
      relation,
      boundary: c,
      strict: kind === 'div-lt' || kind === 'div-gt',
      direction: kind === 'div-gt' || kind === 'div-ge' ? 'lower' : 'upper',
      ask: kind === 'div-gt' || kind === 'div-ge' ? 'smallest' : askUpper,
      hint: 'Az osztást szorzással alakítsd át!',
      rearrange,
    });
  },
};

/** Choose the inequality that describes a "legalább / legfeljebb" story. */
const storyInequality: GeneratorDef = {
  id: 'story-inequality',
  title: 'Egyenlőtlenség felírása szövegből',
  levels: [2, 3],
  generate(rng, level): Question {
    const kind = level === 2 ? rng.pick(['mul-le', 'mul-ge'] as const) : rng.pick(['mul-le', 'mul-ge', 'div-le', 'div-ge'] as const);
    const atLeast = kind.endsWith('ge');
    const budgetWord = atLeast ? 'legalább' : 'legfeljebb';
    if (kind.startsWith('mul')) {
      const boxes = rng.int(2, 9);
      const per = rng.int(2, level === 2 ? 9 : 12);
      const total = boxes * per;
      const sign = atLeast ? '\\ge' : '\\le';
      const correct = tex`$${num(boxes)}x ${sign} ${num(total)}$`;
      const other = atLeast ? '\\le' : '\\ge';
      const wrongs = [tex`$${num(boxes)}x ${other} ${num(total)}$`, tex`$${num(boxes)}x ${atLeast ? '<' : '>'} ${num(total)}$`, tex`$${num(boxes)}x ${atLeast ? '>' : '<'} ${num(total)}$`];
      return {
        prompt: tex`Egy dobozban $x$ szem cukorka van. ${num(boxes)} dobozban ${budgetWord} ${num(total)} szem van. Melyik egyenlőtlenség írja le?`,
        answer: textChoice(correct, wrongs),
        hint: `A „${budgetWord}” szót fordítsd egyenlőtlenségjellé!`,
        solution: [
          tex`A ${num(boxes)} dobozban összesen $${num(boxes)}x$ szem cukorka van.`,
          tex`A „${budgetWord} ${num(total)}” azt jelenti: $${num(boxes)}x ${sign} ${num(total)}$.`,
          atLeast
            ? tex`Innen $x \ge ${num(per)}$.`
            : tex`Innen $x \le ${num(per)}$.`,
        ],
      };
    }
    const friends = rng.int(2, level === 2 ? 4 : 6);
    const each = rng.int(2, level === 2 ? 6 : 9) * 100;
    const total = friends * each;
    const sign = atLeast ? '\\ge' : '\\le';
    const correct = tex`$x : ${num(friends)} ${sign} ${num(each)}$`;
    const other = atLeast ? '\\le' : '\\ge';
    const wrongs = [tex`$x : ${num(friends)} ${other} ${num(each)}$`, tex`$x : ${num(friends)} ${atLeast ? '<' : '>'} ${num(each)}$`, tex`$x : ${num(friends)} ${atLeast ? '>' : '<'} ${num(each)}$`];
    return {
      prompt: tex`Kati $x$ dinárt egyenlően szétosztott ${num(friends)} barátja között, és mindegyik ${budgetWord} ${num(each)} dinárt kapott. Melyik egyenlőtlenség írja le?`,
      answer: textChoice(correct, wrongs),
      hint: `A „${budgetWord}” szót fordítsd egyenlőtlenségjellé!`,
      solution: [
        tex`Egy barát $x : ${num(friends)}$ dinárt kapott.`,
        tex`A „${budgetWord} ${num(each)}” azt jelenti: $x : ${num(friends)} ${sign} ${num(each)}$.`,
        atLeast
          ? tex`Innen $x \ge ${num(total)}$.`
          : tex`Innen $x \le ${num(total)}$.`,
      ],
    };
  },
};

/** "Legalább / legfeljebb" everyday problem with an integer answer. */
const storySolve: GeneratorDef = {
  id: 'story-solve',
  title: 'Legalább / legfeljebb szöveges feladat',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['ticket', 'saving', 'notebook', 'box', 'bus'] as const);
    if (kind === 'ticket' || kind === 'notebook') {
      const price = kind === 'ticket' ? rng.int(14, 24) * 50 : rng.int(5, 9) * 50;
      const budget = kind === 'ticket' ? rng.int(8, 16) * 500 : rng.int(15, 30) * 100;
      const q = Math.floor(budget / price);
      const rem = budget - q * price;
      const item = kind === 'ticket' ? 'jegyet' : 'füzetet';
      return {
        prompt: tex`Egy ${kind === 'ticket' ? 'jegy' : 'füzet'} ${num(price)} dinár. Legfeljebb hány ${item} vehet Anna ${num(budget)} dinárból?`,
        answer: { type: 'number', value: q },
        hint: 'Oszd el a pénzt az árral! A maradékot nem lehet újabb darabra költeni.',
        solution: [
          tex`$${num(budget)} : ${num(price)} = ${num(q)}$, marad ${num(rem)} dinár.`,
          rem === 0
            ? tex`A pénz pontosan elég ${num(q)} darabra.`
            : tex`${num(q)} darab ára $${num(q * price)}$ dinár, egy újabb már nem fér bele.`,
          tex`Legfeljebb **${num(q)} ${item}** vehet.`,
        ],
      };
    }
    if (kind === 'saving') {
      const goal = rng.int(10, 30) * 100;
      const already = rng.int(2, 8) * 100;
      const daily = rng.int(2, 6) * 50;
      const need = goal - already;
      const q = Math.ceil(need / daily);
      const exact = need % daily === 0;
      const rem = need - (q - 1) * daily;
      return {
        prompt: tex`Zsófinak ${num(goal)} dinárra van szüksége. Már ${num(already)} dinárja van. Legalább hány napig kell naponta ${num(daily)} dinárt félretennie?`,
        answer: { type: 'number', value: q },
        hint: 'Előbb számold ki, mennyi hiányzik, aztán oszd el a napi összeggel!',
        solution: [
          tex`Hiányzik: $${num(goal)} - ${num(already)} = ${num(need)}$ dinár.`,
          exact
            ? tex`$${num(need)} : ${num(daily)} = ${num(q)}$, nincs maradék.`
            : tex`$${num(need)} : ${num(daily)} = ${num(q - 1)}$, marad ${num(rem)} dinár.`,
          exact
            ? tex`Pontosan **${num(q)} nap** kell.`
            : tex`A maradék miatt még egy nap kell, tehát legalább **${num(q)} nap**.`,
        ],
      };
    }
    if (kind === 'box') {
      const per = rng.int(8, 15);
      const total = rng.int(6, 15) * 10;
      const q = Math.ceil(total / per);
      const exact = total % per === 0;
      const rem = total - (q - 1) * per;
      return {
        prompt: tex`Egy dobozban ${num(per)} tojás van. Legalább hány doboz kell ${num(total)} tojáshoz?`,
        answer: { type: 'number', value: q },
        hint: 'Oszd el a tojások számát az egy dobozban lévővel! Ha maradék van, kell még egy doboz.',
        solution: exact
          ? [tex`$${num(total)} : ${num(per)} = ${num(q)}$, nincs maradék.`, tex`Pontosan **${num(q)} doboz** kell.`]
          : [
              tex`$${num(total)} : ${num(per)} = ${num(q - 1)}$, marad ${num(rem)} tojás.`,
              tex`A maradék tojásoknak is kell doboz, ezért **${num(q)} doboz** kell.`,
            ],
      };
    }
    const capacity = rng.int(30, 50);
    const people = rng.int(12, 30) * 10;
    const q = Math.ceil(people / capacity);
    const exact = people % capacity === 0;
    const rem = people - (q - 1) * capacity;
    return {
      prompt: tex`Egy busz ${num(capacity)} embert szállít. Legalább hány busz kell ${num(people)} embernek?`,
      answer: { type: 'number', value: q },
      hint: 'Oszd el az emberek számát a busz kapacitásával! A maradék embereknek is kell busz.',
      solution: exact
        ? [tex`$${num(people)} : ${num(capacity)} = ${num(q)}$, nincs maradék.`, tex`Pontosan **${num(q)} busz** kell.`]
        : [
            tex`$${num(people)} : ${num(capacity)} = ${num(q - 1)}$, marad ${num(rem)} ember.`,
            tex`A maradék emberek miatt **${num(q)} busz** kell.`,
          ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-07',
  goals: [
    'megérteni a <, >, ≤, ≥ jeleket és a megoldás fogalmát,',
    'megoldani egy- és kétlépéses egyenlőtlenségeket N₀-ban,',
    'leírni a megoldások halmazát: felsorolással vagy „x > 8” alakban,',
    'megoldani „legalább / legfeljebb” szöveges feladatokat.',
  ],
  parts: [
    {
      title: 'Az egyenlőtlenség jelei',
      steps: [
        {
          type: 'theory',
          title: 'Kisebb, nagyobb, legfeljebb, legalább',
          body: 'Az egyenlőtlenség két oldalát $<$, $>$, $\\le$ vagy $\\ge$ kapcsolja össze. A megoldás az a szám, amelyre az állítás igaz. N₀-ban a megoldásokat felsorolhatjuk.',
          figure: {
            type: 'numberLine',
            min: 0,
            max: 8,
            step: 1,
            intervals: [{ from: 0, to: 4, toClosed: false, label: 'x < 4' }],
          },
          remember: '$x < 4$ → $0, 1, 2, 3$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA $4$ megoldása az $x < 4$ egyenlőtlenségnek.',
            answer: { type: 'truefalse', value: false },
            hint: 'Helyettesítsd be a $4$-et, és nézd meg, igaz-e a $4 < 4$ állítás!',
            solution: ['$4 < 4$ nem igaz, tehát a $4$ **nem megoldás**.', 'A megoldások: $0, 1, 2, 3$.'],
          },
        },
        {
          type: 'example',
          title: 'A megoldások felsorolása',
          problem: 'Oldd meg N₀-ban: $x < 4$. Sorold fel a megoldásokat!',
          steps: [
            { text: 'N₀ = $\\{0, 1, 2, 3, \\ldots\\}$.' },
            { text: 'A $4$-nél kisebb nemnegatív egészek: $0, 1, 2, 3$.' },
            { text: 'A $4$ már nem megoldás, mert $4 < 4$ nem igaz.' },
          ],
          answer: 'Négy megoldás van: **0, 1, 2, 3**.',
        },
        { type: 'practice', generator: 'satisfies', level: 1 },
        { type: 'practice', generator: 'satisfies', level: 2 },
      ],
    },
    {
      title: 'Összeg és különbség változása',
      steps: [
        {
          type: 'theory',
          title: 'Hogyan változik az eredmény?',
          body: 'Ha az egyik tagot $7$-tel növeljük, az összeg is $7$-tel nő. Ha az egyik tagot növeljük, a másikat ugyanannyival csökkentjük, az összeg nem változik.',
          figure: {
            type: 'barModel',
            rows: [
              { label: 'régi', segments: [{ value: 40, label: 'a', color: 'blue' }, { value: 25, label: 'b', color: 'red' }] },
              { label: 'új', segments: [{ value: 47, label: 'a + 7', color: 'blue' }, { value: 25, label: 'b', color: 'red' }] },
            ],
            braces: [{ row: 0, label: '65' }, { row: 1, label: '72' }],
            caption: 'Az egyik tag 7-tel nő → az összeg is 7-tel nő.',
          },
          remember: 'tag +7 → összeg +7',
        },
        {
          type: 'theory',
          title: 'A különbség változása',
          body: 'A kisebbítendő növelésével a különbség ugyanannyival nő. A kivonandó növelésével a különbség ugyanannyival csökken. Ha mindkettő ugyanannyival nő, a különbség nem változik.',
          remember: 'kisebbítendő +n → különbség +n\nkivonandó +n → különbség −n',
        },
        {
          type: 'check',
          question: {
            prompt: tex`A $47 + 25$ összegben az első tagot $8$-cal növeljük. Mi lesz az új összeg?`,
            answer: textChoice('$80$', ['$72$', '$64$', '$88$']),
            hint: 'Előbb növeld meg az első tagot, aztán add össze!',
            solution: [tex`Az első tag: $47 + 8 = 55$.`, tex`Az új összeg: $55 + 25 = 80$.`],
          },
        },
        {
          type: 'example',
          title: 'A kivonandó változik',
          problem: tex`A $63 - 28$ különbségben a kivonandót $6$-tal növeljük. Hogyan változik a különbség?`,
          steps: [
            { text: tex`Régi különbség: $63 - 28 = 35$.` },
            { text: tex`Új különbség: $63 - 34 = 29$.` },
            { text: tex`$35 - 29 = 6$, tehát a különbség $6$-tal csökkent.` },
          ],
          answer: 'A különbség **6-tal csökken**.',
        },
        { type: 'practice', generator: 'change', level: 1 },
        { type: 'practice', generator: 'change', level: 2 },
      ],
    },
    {
      title: 'Összeadásos és kivonásos egyenlőtlenségek',
      steps: [
        {
          type: 'theory',
          title: 'Az ismeretlen egyedül',
          body: 'Az egyenlőtlenséget úgy oldjuk meg, hogy az ismeretlen egyedül maradjon. Összeadásnál kivonunk, kivonásnál hozzáadunk. A jel iránya nem változik.',
          remember: '$x + 7 < 12$ → $x < 5$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA $3$ megoldása az $x + 5 < 9$ egyenlőtlenségnek.',
            answer: { type: 'truefalse', value: true },
            hint: 'Helyettesítsd be a $3$-at!',
            solution: [tex`$3 + 5 = 8$`, tex`$8 < 9$ igaz, tehát a $3$ **megoldás**.`],
          },
        },
        {
          type: 'example',
          title: 'Összeadásos egyenlőtlenség',
          problem: 'Oldd meg N₀-ban: $x + 7 < 12$. Hány megoldás van?',
          steps: [
            { text: tex`Kivonjuk a $7$-et: $x < 12 - 7 = 5$.` },
            { text: 'N₀-ban a megoldások: $0, 1, 2, 3, 4$.' },
            { text: 'Az $5$ már nem megoldás, mert $5 < 5$ nem igaz.' },
          ],
          answer: 'Öt megoldás van: **0, 1, 2, 3, 4**.',
        },
        { type: 'practice', generator: 'solve-add-sub', level: 1 },
        { type: 'practice', generator: 'solve-add-sub', level: 2 },
      ],
    },
    {
      title: 'Szorzásos és osztásos egyenlőtlenségek',
      steps: [
        {
          type: 'theory',
          title: 'A szorzat és a hányados változása',
          body: 'Ha egy tényezőt a kétszeresére növelünk, a szorzat is a kétszeresére nő. Az osztandó kétszerezése a hányadost is kétszerezi, az osztóé felezi.',
          remember: 'tényező ×2 → szorzat ×2 · osztó ×2 → hányados :2',
        },
        {
          type: 'theory',
          title: 'Szorzás és osztás',
          body: 'A szorzásnál mindkét oldalt elosztjuk a tényezővel, az osztásnál megszorozzuk az osztóval. Az egyenlőtlenség jelének iránya marad.',
          remember: '$3x \\le 12$ → $x \\le 4$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Hány megoldása van N₀-ban a $3x \\le 12$ egyenlőtlenségnek?',
            answer: { type: 'number', value: 5 },
            inputLabel: 'Megoldások száma',
            hint: 'Oszd el mindkét oldalt $3$-mal, majd sorold fel a megoldásokat!',
            solution: [tex`$3x \le 12$, ezért $x \le 4$.`, 'N₀-ban: $0, 1, 2, 3, 4$ — ez **5 megoldás**.'],
          },
        },
        {
          type: 'example',
          title: 'Szorzásos egyenlőtlenség',
          problem: 'Oldd meg N₀-ban: $4x \\le 20$. Hány megoldás van?',
          steps: [
            { text: tex`Elosztjuk $4$-gyel: $x \le 5$.` },
            { text: 'N₀-ban a megoldások: $0, 1, 2, 3, 4, 5$.' },
          ],
          answer: 'Hat megoldás van: **0, 1, 2, 3, 4, 5**.',
        },
        { type: 'practice', generator: 'solve-mul-div', level: 2 },
        { type: 'practice', generator: 'solve-mul-div', level: 3 },
      ],
    },
    {
      title: 'Legalább, legfeljebb',
      steps: [
        {
          type: 'theory',
          title: 'Legalább és legfeljebb',
          body: 'A „legalább” azt jelenti: $\\ge$, a „legfeljebb” pedig $\\le$. Pénzes feladatnál számold ki, mennyi kell összesen, és hasonlítsd össze a rendelkezésre álló összeggel.',
          remember: 'legalább → $\\ge$ · legfeljebb → $\\le$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Egy dobozban $x$ szem cukorka van. $7$ dobozban legfeljebb $84$ szem van. Melyik egyenlőtlenség írja le?',
            answer: textChoice('$7x \\le 84$', ['$7x < 84$', '$7x \\ge 84$', '$7x > 84$']),
            hint: 'A „legfeljebb” a $\\le$ jelnek felel meg.',
            solution: ['A hét dobozban összesen $7x$ szem van.', 'A „legfeljebb 84” azt jelenti: $7x \\le 84$.', 'Innen $x \\le 12$.'],
          },
        },
        {
          type: 'example',
          title: 'Jegyvásárlás',
          problem: 'Egy jegy $850$ dinár. Legfeljebb hány jegyet vehet Anna $5000$ dinárból?',
          steps: [
            { text: tex`$5000 : 850 = 5$, marad $750$ dinár.` },
            { text: tex`$5$ jegy ára $4250$ dinár; $6$ jegy már $5100$ dinár lenne.` },
          ],
          answer: 'Legfeljebb **5 jegyet** vehet.',
        },
        { type: 'practice', generator: 'story-inequality', level: 2 },
        { type: 'practice', generator: 'story-solve', level: 3 },
        { type: 'practice', generator: 'change', level: 3 },
        { type: 'practice', generator: 'solve-add-sub', level: 3 },
      ],
    },
  ],
  generators: [satisfies, change, solveAddSub, solveMulDiv, storyInequality, storySolve],
  miniTest: {
    items: [
      { generator: 'satisfies', level: 1 },
      { generator: 'change', level: 1 },
      { generator: 'solve-add-sub', level: 1 },
      { generator: 'solve-add-sub', level: 2 },
      { generator: 'solve-mul-div', level: 2 },
      { generator: 'story-inequality', level: 2 },
      { generator: 'story-solve', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'satisfies', level: 1 },
    { generator: 'change', level: 1 },
    { generator: 'solve-add-sub', level: 1 },
    { generator: 'solve-mul-div', level: 2 },
    { generator: 'story-inequality', level: 2 },
    { generator: 'change', level: 2 },
    { generator: 'story-solve', level: 3 },
  ],
});
