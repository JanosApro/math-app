/**
 * 7. osztály › Valós számok › 7. A kibővített arány
 *
 * Proportion a : b = c : d with the outer/inner terms and a·d = b·c; the extended ratio
 * a : b : c and its simplification; combining a : b and b : c; dividing a quantity in a given
 * ratio; triangle angles in a ratio; alloys; and the extended ratio of inversely proportional
 * quantities. All answers are computed by code.
 */
import {
  article,
  defineSubtopic,
  gcd,
  lcm,
  num,
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

/** A LaTeX ratio, e.g. ratioTex(2, 3, 5) → "$2 : 3 : 5$". */
const ratioTex = (a: number, b: number, c?: number) =>
  c === undefined ? `$${num(a)} : ${num(b)}$` : `$${num(a)} : ${num(b)} : ${num(c)}$`;

/** The greatest common divisor of three positive integers. */
const gcd3 = (a: number, b: number, c: number) => gcd(gcd(a, b), c);

/** A ratio simplified by the gcd of its terms. */
function simplify3(a: number, b: number, c: number): [number, number, number] {
  const g = gcd3(a, b, c) || 1;
  return [a / g, b / g, c / g];
}

/** A value at a position of a ratio, with 'x' for the unknown. */
function ratioWithUnknown(values: number[], missing: number): string {
  const parts = values.map((v, i) => (i === missing ? 'x' : num(v)));
  return parts.length === 3
    ? `$${parts[0]} : ${parts[1]} : ${parts[2]}$`
    : `$${parts[0]} : ${parts[1]} = ${parts[2]} : ${parts[3]}$`;
}

/** A triangle whose angles follow the given ratios. */
function angleTriangle(angles: number[]): Figure {
  const sides = angles.map((a) => Math.round(Math.sin((a * Math.PI) / 180) * 20 * 1000) / 1000);
  return {
    type: 'triangle',
    sides: [sides[0], sides[1], sides[2]],
    angleLabels: { A: 'α', B: 'β', C: 'γ' },
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** The missing term of a proportion a : b = c : d. */
const missingTerm: GeneratorDef = {
  id: 'missing-term',
  title: 'Hiányzó tag az aránypárban',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      if (rng.chance(0.6)) {
        const kg1 = rng.int(2, 6);
        const kg2 = rng.int(2, 9);
        const unitPrice = rng.int(2, 9) * 50;
        const cost1 = kg1 * unitPrice;
        const cost2 = kg2 * unitPrice;
        return {
          prompt: tex`Egy boltban $${num(kg1)}$ kg alma $${num(cost1)}$ Ft-ba kerül. Mennyibe kerül $${num(kg2)}$ kg ugyanabból az almából?`,
          answer: { type: 'number', value: cost2, unit: 'Ft' },
          hint: 'Az ár és a mennyiség egyenesen arányos. Előbb számítsd ki 1 kg árát!',
          solution: [
            tex`A megfelelő arány: $${num(kg1)} : ${num(cost1)} = ${num(kg2)} : x$.`,
            tex`$x = ${num(cost1)} : ${num(kg1)} \cdot ${num(kg2)} = ${num(unitPrice)} \cdot ${num(kg2)} = ${num(cost2)}$`,
            tex`A keresett ár **${num(cost2)} Ft**.`,
          ],
        };
      }
      const perServing = rng.int(2, 4);
      const portions1 = rng.pick([2, 3, 4, 6]);
      const portions2 = rng.int(4, 12);
      const eggs1 = perServing * portions1;
      const eggs2 = perServing * portions2;
      return {
        prompt: tex`Egy recept $${num(portions1)}$ adagra $${num(eggs1)}$ tojást ír. Hány tojás kell $${num(portions2)}$ adaghoz?`,
        answer: { type: 'number', value: eggs2, unit: 'db' },
        hint: 'A tojások száma egyenesen arányos az adagok számával. Előbb számítsd ki egy adag tojásigényét!',
        solution: [
          tex`A megfelelő arány: $${num(portions1)} : ${num(eggs1)} = ${num(portions2)} : x$.`,
          tex`$x = ${num(eggs1)} : ${num(portions1)} \cdot ${num(portions2)} = ${num(perServing)} \cdot ${num(portions2)} = ${num(eggs2)}$`,
          tex`A keresett mennyiség **${num(eggs2)} tojás**.`,
        ],
      };
    }

    let values: number[];
    if (level === 1) {
      const p = rng.int(2, 7);
      const q = rng.int(2, 7);
      const m = rng.int(2, 5);
      values = [p, q, p * m, q * m];
    } else {
      const p = rng.int(2, 7);
      const q = rng.int(2, 7);
      const f = rng.pick([0.5, 1.5, 2.5]);
      const m = rng.int(2, 4);
      values = [p * f, q * f, p * f * m, q * f * m];
    }
    const missing = rng.int(0, 3);
    const answerValue = values[missing];
    const outer = missing === 0 || missing === 3;
    const [a, b, c, d] = values;
    const left = missing === 0 ? tex`x \cdot ${num(d)}` : missing === 1 ? tex`${num(a)} \cdot ${num(d)}` : missing === 2 ? tex`${num(a)} \cdot ${num(d)}` : tex`${num(a)} \cdot x`;
    const right = missing === 0 ? tex`${num(b)} \cdot ${num(c)}` : missing === 1 ? tex`x \cdot ${num(c)}` : missing === 2 ? tex`${num(b)} \cdot x` : tex`${num(b)} \cdot ${num(c)}`;
    const quotient =
      missing === 0
        ? tex`${num(b)} \cdot ${num(c)} : ${num(d)}`
        : missing === 1
          ? tex`${num(a)} \cdot ${num(d)} : ${num(c)}`
          : missing === 2
            ? tex`${num(a)} \cdot ${num(d)} : ${num(b)}`
            : tex`${num(b)} \cdot ${num(c)} : ${num(a)}`;
    return {
      prompt: `Mennyi a hiányzó ${outer ? 'kültag' : 'beltag'}? ${ratioWithUnknown(values, missing)}`,
      answer: { type: 'number', value: answerValue },
      inputLabel: '$x =$',
      hint: 'A kültagok szorzata egyenlő a beltagok szorzatával: $a \\cdot d = b \\cdot c$.',
      solution: [
        `A kültagok: ${missing === 0 ? `$x$ és $${num(d)}$` : missing === 3 ? `$${num(a)}$ és $x$` : `$${num(a)}$ és $${num(d)}$`}; a beltagok: ${missing === 1 ? `$x$ és $${num(c)}$` : missing === 2 ? `$${num(b)}$ és $x$` : `$${num(b)}$ és $${num(c)}$`}.`,
        tex`A szorzatok egyenlők: $${left} = ${right}$`,
        tex`$x = ${quotient} = ${num(answerValue)}$`,
        tex`A hiányzó ${outer ? 'kültag' : 'beltag'} **${num(answerValue)}**.`,
      ],
    };
  },
};

/** Simplify an extended ratio (integer terms at L1, decimal terms at L2). */
const simplifyRatio: GeneratorDef = {
  id: 'simplify-ratio',
  title: 'Kibővített arány egyszerűsítése',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 2) {
      const [p, q, r] = rng.pick([
        [1, 3, 5],
        [3, 5, 7],
        [1, 5, 7],
        [3, 7, 9],
        [5, 7, 9],
        [1, 3, 7],
        [1, 5, 9],
        [3, 5, 11],
        [5, 9, 11],
        [1, 7, 9],
        [3, 7, 11],
        [5, 7, 13],
      ] as [number, number, number][]);
      const a = p / 2;
      const b = q / 2;
      const c = r / 2;
      const correct = ratioTex(p, q, r);
      const wrongs = [
        ratioTex(a, b, c),
        ratioTex(a * 10, b * 10, c * 10),
        ratioTex(2 * a, b, c),
      ];
      return {
        prompt: `Írd fel egész számokkal, a legegyszerűbb alakban! ${ratioTex(a, b, c)}`,
        answer: textChoice(correct, wrongs),
        hint: 'Először szorozd meg mindhárom tagot ugyanazzal a számmal, hogy egész számokat kapj!',
        solution: [
          tex`Szorozzuk meg mindhárom tagot $${num(2)}$${'-' + suffix(2, 'vel', 'vel')}: $${num(a)} : ${num(b)} : ${num(c)} = ${num(p)} : ${num(q)} : ${num(r)}$.`,
          tex`Ez már a legegyszerűbb egész arány: **$${num(p)} : ${num(q)} : ${num(r)}$**.`,
        ],
      };
    }
    const [p, q, r] = rng.pick([
      [2, 3, 4],
      [1, 2, 3],
      [3, 4, 5],
      [2, 3, 5],
      [1, 3, 5],
      [2, 5, 7],
      [3, 5, 7],
      [1, 4, 5],
    ] as [number, number, number][]);
    const m = rng.pick([2, 3, 4, 5, 6]);
    const a = p * m;
    const b = q * m;
    const c = r * m;
    const [sa, sb, sc] = simplify3(a, b, c);
    const correct = ratioTex(sa, sb, sc);
    const wrongs = [ratioTex(a, b, c), ratioTex(sa, sb, c), ratioTex(a, sb, sc)];
    return {
      prompt: `Írd fel a legegyszerűbb alakban! ${ratioTex(a, b, c)}`,
      answer: textChoice(correct, wrongs),
      hint: 'Mindhárom tagot ugyanazzal a közös osztóval kell elosztani.',
      solution: [
        tex`A három tag közös osztója $${num(m)}$: $${num(a)} = ${num(m)} \cdot ${num(p)}$, $${num(b)} = ${num(m)} \cdot ${num(q)}$, $${num(c)} = ${num(m)} \cdot ${num(r)}$.`,
        tex`$${num(a)} : ${num(b)} : ${num(c)} = ${num(p)} : ${num(q)} : ${num(r)}$`,
        tex`A legegyszerűbb alak: **$${num(sa)} : ${num(sb)} : ${num(sc)}$**.`,
      ],
    };
  },
};

/** Combine a : b and b : c into a : b : c. */
const combineRatios: GeneratorDef = {
  id: 'combine-ratios',
  title: 'Két arány összekapcsolása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const max = level === 1 ? 4 : 9;
    let p = rng.int(1, max);
    let q = rng.int(2, max);
    while (p === q || gcd(p, q) !== 1) q = rng.int(2, max);
    let r = rng.int(1, max);
    let s = rng.int(2, max);
    while (r === s || gcd(r, s) !== 1) s = rng.int(2, max);
    const L = lcm(q, r);
    const A = p * (L / q);
    const B = L;
    const C = s * (L / r);
    const [a, b, c] = simplify3(A, B, C);
    const fruit = level === 3;
    const labels = fruit ? ['alma =', 'körte =', 'szilva ='] : ['$a =$', '$b =$', '$c =$'];
    const prompt = fruit
      ? `Az alma és a körte aránya $${num(p)} : ${num(q)}$, a körte és a szilva aránya $${num(r)} : ${num(s)}$. Add meg az alma : körte : szilva arányt a legkisebb egész számokkal!`
      : `Az $a : b = ${num(p)} : ${num(q)}$ és $b : c = ${num(r)} : ${num(s)}$. Add meg a legegyszerűbb $a : b : c$ arányt!`;
    return {
      prompt,
      answer: {
        type: 'numbers',
        fields: [
          { label: labels[0], value: a },
          { label: labels[1], value: b },
          { label: labels[2], value: c },
        ],
      },
      hint: tex`A közös $b$ tagot mindkét arányban ugyanazzal a számmal kell szerepeltetni: keresd meg $${num(q)}$ és $${num(r)}$ legkisebb közös többszörösét!`,
      solution: [
        tex`A közös taghoz: $[${num(q)}; ${num(r)}] = ${num(L)}$.`,
        tex`$a : b = ${num(p)} : ${num(q)} = ${num(A)} : ${num(B)}$`,
        tex`$b : c = ${num(r)} : ${num(s)} = ${num(B)} : ${num(C)}$`,
        tex`Tehát $a : b : c = ${num(A)} : ${num(B)} : ${num(C)}${A === a && B === b && C === c ? '' : ` = ${num(a)} : ${num(b)} : ${num(c)}`}$.`,
        tex`A legegyszerűbb arány: **$${num(a)} : ${num(b)} : ${num(c)}$**.`,
      ],
    };
  },
};

/** Divide a quantity in a given ratio. */
const divideSum: GeneratorDef = {
  id: 'divide-sum',
  title: 'Felosztás adott arányban',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const [p, q, r] = rng.pick([
        [2, 3, 7],
        [2, 4, 9],
        [3, 4, 8],
        [1, 4, 5],
        [2, 5, 8],
      ] as [number, number, number][]);
      const s = p + q + r;
      const m = rng.int(10, 60) * 10;
      const total = s * m;
      const diff = (r - p) * m;
      return {
        prompt: `Három testvér ${num(total)} Ft-ot oszt el egymás között $${num(p)} : ${num(q)} : ${num(r)}$ arányban. Mennyivel kap többet a legnagyobb rész a legkisebbnél?`,
        answer: { type: 'number', value: diff, unit: 'Ft' },
        hint: 'Előbb számítsd ki, mennyi egy arányos rész, aztán a legnagyobb és a legkisebb rész különbségét!',
        solution: [
          tex`A részek összege $${num(p)} + ${num(q)} + ${num(r)} = ${num(s)}$.`,
          tex`Egy rész: $${num(total)} : ${num(s)} = ${num(m)}$ Ft.`,
          tex`A legkisebb rész $${num(p)} \cdot ${num(m)} = ${num(p * m)}$ Ft, a legnagyobb $${num(r)} \cdot ${num(m)} = ${num(r * m)}$ Ft.`,
          tex`A különbség: $${num(r * m)} - ${num(p * m)} = ${num(diff)}$ Ft.`,
          tex`A legnagyobb rész **${num(diff)} Ft-tal** nagyobb a legkisebbnél.`,
        ],
      };
    }
    if (level === 2) {
      const [p, q, r] = rng.pick([
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
        [1, 3, 5],
        [2, 3, 5],
        [1, 2, 5],
      ] as [number, number, number][]);
      const s = p + q + r;
      const m = rng.int(10, 80) * 10;
      const total = s * m;
      const ask = rng.int(0, 2);
      const parts = [p * m, q * m, r * m];
      const ordinal = ['az első', 'a második', 'a harmadik'][ask];
      return {
        prompt: `Ossz el ${num(total)} Ft-ot $${num(p)} : ${num(q)} : ${num(r)}$ arányban! Mennyi ${ordinal} rész?`,
        answer: { type: 'number', value: parts[ask], unit: 'Ft' },
        hint: tex`A részek arányosak: összesen $${num(p)} + ${num(q)} + ${num(r)}$ rész van. Előbb egy rész értékét számítsd ki!`,
        solution: [
          tex`A részek összege $${num(p)} + ${num(q)} + ${num(r)} = ${num(s)}$.`,
          tex`Egy rész: $${num(total)} : ${num(s)} = ${num(m)}$ Ft.`,
          tex`${ordinal[0].toUpperCase()}${ordinal.slice(1)} rész $${num([p, q, r][ask])} \cdot ${num(m)} = ${num(parts[ask])}$ Ft.`,
          tex`A keresett rész **${num(parts[ask])} Ft**.`,
        ],
      };
    }
    const [p, q] = rng.pick([
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [3, 5],
      [1, 3],
      [4, 5],
    ] as [number, number][]);
    const s = p + q;
    const m = rng.int(10, 90) * 10;
    const total = s * m;
    const askSecond = rng.chance(0.5);
    const answerValue = askSecond ? q * m : p * m;
    return {
      prompt: `Ossz el ${num(total)} Ft-ot $${num(p)} : ${num(q)}$ arányban! Mennyi ${askSecond ? 'a második' : 'az első'} rész?`,
      answer: { type: 'number', value: answerValue, unit: 'Ft' },
      hint: tex`A részek összesen $${num(p)} + ${num(q)}$ egyenlő részt tesznek ki. Előbb egy rész értékét határozd meg!`,
      solution: [
        tex`A részek összege $${num(p)} + ${num(q)} = ${num(s)}$.`,
        tex`Egy rész: $${num(total)} : ${num(s)} = ${num(m)}$ Ft.`,
        tex`${askSecond ? 'A második' : 'Az első'} rész $${num(askSecond ? q : p)} \cdot ${num(m)} = ${num(answerValue)}$ Ft.`,
        tex`A keresett rész **${num(answerValue)} Ft**.`,
      ],
    };
  },
};

/** Alloy problems: a mass divided in a given ratio. */
const alloy: GeneratorDef = {
  id: 'alloy',
  title: 'Ötvözetek aránya',
  levels: [2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const [p, q, r] = rng.pick([
        [5, 3, 2],
        [3, 2, 1],
        [4, 3, 2],
        [6, 3, 1],
        [5, 4, 1],
      ] as [number, number, number][]);
      const s = p + q + r;
      const m = rng.int(4, 14) * 5;
      const total = s * m;
      return {
        prompt: `${article(total) === 'az' ? 'Az' : 'A'} ${num(total)} g ötvözetben a réz, a cink és a nikkel aránya $${num(p)} : ${num(q)} : ${num(r)}$. Mennyi cink van benne?`,
        answer: { type: 'number', value: q * m, unit: 'g' },
        hint: tex`Az ötvözet összesen $${num(p)} + ${num(q)} + ${num(r)}$ arányos részből áll. Előbb egy rész tömegét számítsd ki!`,
        solution: [
          tex`A részek összege $${num(p)} + ${num(q)} + ${num(r)} = ${num(s)}$.`,
          tex`Egy rész: $${num(total)} : ${num(s)} = ${num(m)}$ g.`,
          tex`A cink $${num(q)}$ ilyen rész: $${num(q)} \cdot ${num(m)} = ${num(q * m)}$ g.`,
          tex`Az ötvözetben **${num(q * m)} g cink** van.`,
        ],
      };
    }
    const [p, q] = rng.pick([
      [5, 3],
      [7, 3],
      [4, 1],
      [3, 2],
      [5, 2],
      [7, 5],
    ] as [number, number][]);
    const s = p + q;
    const m = rng.int(4, 18) * 5;
    const total = s * m;
    return {
      prompt: `${article(total) === 'az' ? 'Az' : 'A'} ${num(total)} g ötvözetben a réz és a cink aránya $${num(p)} : ${num(q)}$. Mennyi réz van benne?`,
      answer: { type: 'number', value: p * m, unit: 'g' },
      hint: tex`Az ötvözet összesen $${num(p)} + ${num(q)}$ arányos részből áll. Előbb egy rész tömegét számítsd ki!`,
      solution: [
        tex`A részek összege $${num(p)} + ${num(q)} = ${num(s)}$.`,
        tex`Egy rész: $${num(total)} : ${num(s)} = ${num(m)}$ g.`,
        tex`A réz $${num(p)}$ ilyen rész: $${num(p)} \cdot ${num(m)} = ${num(p * m)}$ g.`,
        tex`Az ötvözetben **${num(p * m)} g réz** van.`,
      ],
    };
  },
};

/** Triangle angles given in a ratio. */
const triangleAngles: GeneratorDef = {
  id: 'triangle-angles',
  title: 'Háromszög szögei adott arányban',
  levels: [2, 3],
  generate(rng, level): Question {
    const ratios = rng.pick([
      [1, 1, 2],
      [1, 2, 3],
      [1, 3, 5],
      [2, 3, 4],
      [3, 4, 5],
      [1, 4, 5],
      [2, 2, 5],
      [2, 3, 5],
      [2, 3, 7],
      [1, 1, 4],
      [2, 5, 5],
      [3, 5, 7],
      [1, 5, 6],
      [2, 7, 9],
      [4, 5, 9],
      [1, 3, 8],
      [1, 2, 6],
      [2, 3, 10],
      [3, 4, 8],
      [1, 5, 9],
      [1, 1, 10],
      [2, 4, 9],
      [3, 5, 10],
      [4, 5, 6],
      [2, 5, 8],
      [5, 5, 8],
      [1, 1, 7],
      [1, 2, 15],
    ] as [number, number, number][]);
    const s = ratios[0] + ratios[1] + ratios[2];
    const unit = 180 / s;
    const angles = ratios.map((r) => r * unit);
    const largest = Math.max(...angles);
    const smallest = Math.min(...angles);
    const figure = angleTriangle(angles);
    if (level === 3) {
      return {
        prompt: `Egy háromszög szögeinek aránya $${num(ratios[0])} : ${num(ratios[1])} : ${num(ratios[2])}$. Mennyivel nagyobb a legnagyobb szög a legkisebbnél?`,
        figure,
        answer: { type: 'number', value: largest - smallest, unit: '°' },
        hint: tex`A háromszög szögeinek összege $180°$. Előbb számítsd ki az egyes szögeket!`,
        solution: [
          tex`A részek összege $${num(ratios[0])} + ${num(ratios[1])} + ${num(ratios[2])} = ${num(s)}$.`,
          tex`Egy rész: $180° : ${num(s)} = ${num(unit)}°$.`,
          tex`A szögek: $${num(angles[0])}°$, $${num(angles[1])}°$, $${num(angles[2])}°$.`,
          tex`A legnagyobb és a legkisebb különbsége: $${num(largest)}° - ${num(smallest)}° = ${num(largest - smallest)}°$.`,
        ],
      };
    }
    return {
      prompt: `Egy háromszög szögeinek aránya $${num(ratios[0])} : ${num(ratios[1])} : ${num(ratios[2])}$. Mekkora a legnagyobb szög?`,
      figure,
      answer: { type: 'number', value: largest, unit: '°' },
      hint: tex`A háromszög szögeinek összege $180°$. Oszd el $${num(180)}$${'-' + suffix(180, 'at', 'et')} a részek összegével!`,
      solution: [
        tex`A részek összege $${num(ratios[0])} + ${num(ratios[1])} + ${num(ratios[2])} = ${num(s)}$.`,
        tex`Egy rész: $180° : ${num(s)} = ${num(unit)}°$.`,
        tex`A szögek: $${num(angles[0])}°$, $${num(angles[1])}°$, $${num(angles[2])}°$.`,
        tex`A legnagyobb szög **${num(largest)}°**.`,
      ],
    };
  },
};

/** The extended ratio of inversely proportional quantities (gears, taps). */
const inverseRatio: GeneratorDef = {
  id: 'inverse-ratio',
  title: 'Fordítottan arányos mennyiségek aránya',
  levels: [3],
  generate(rng): Question {
    const gears = rng.chance(0.6);
    const values = gears
      ? rng.pick([
          [12, 18, 24],
          [10, 15, 20],
          [8, 12, 16],
          [6, 9, 12],
          [15, 20, 30],
          [12, 16, 24],
          [9, 12, 18],
          [10, 12, 15],
        ] as [number, number, number][])
      : rng.pick([
          [2, 3, 6],
          [2, 4, 8],
          [3, 4, 6],
          [2, 5, 10],
          [3, 5, 15],
          [4, 6, 12],
          [2, 3, 4],
          [3, 6, 9],
          [4, 8, 12],
        ] as [number, number, number][]);
    const [t1, t2, t3] = values;
    const L = lcm(lcm(t1, t2), t3);
    const raw = [L / t1, L / t2, L / t3];
    const [a, b, c] = simplify3(raw[0], raw[1], raw[2]);
    const prompt = gears
      ? `Három fogaskerék fogszáma $${num(t1)}$, $${num(t2)}$, $${num(t3)}$. Milyen arányban fordulnak el ugyanannyi idő alatt? (Legegyszerűbb egész arány!)`
      : `Három csap $${num(t1)}$, $${num(t2)}$ és $${num(t3)}$ óra alatt tölti meg ugyanazt a medencét. Milyen arányban vannak a vízhozamaik? (Legegyszerűbb egész arány!)`;
    return {
      prompt,
      answer: {
        type: 'numbers',
        fields: [
          { label: '$a =$', value: a },
          { label: '$b =$', value: b },
          { label: '$c =$', value: c },
        ],
      },
      hint: gears
        ? 'A fordulatszám és a fogak száma fordítottan arányos: a több fogú kerék lassabban fordul.'
        : 'A vízhozam és az idő fordítottan arányos: amelyik csap rövidebb idő alatt tölti meg a medencét, annak nagyobb a vízhozama.',
      solution: [
        gears
          ? tex`A fordulatszámok a fogak számával fordítottan arányosak: $n_1 : n_2 : n_3 = \frac{1}{${num(t1)}} : \frac{1}{${num(t2)}} : \frac{1}{${num(t3)}}$.`
          : tex`A vízhozamok az időkkel fordítottan arányosak: $q_1 : q_2 : q_3 = \frac{1}{${num(t1)}} : \frac{1}{${num(t2)}} : \frac{1}{${num(t3)}}$.`,
        tex`Szorozzuk meg mindhárom tagot a közös többszörössel (${num(L)}): $${num(raw[0])} : ${num(raw[1])} : ${num(raw[2])}$.`,
        tex`A legkisebb egész arány: **$${num(a)} : ${num(b)} : ${num(c)}$**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. Static checks
// ---------------------------------------------------------------------------------------------

const termsCheck: Question = {
  prompt: 'A $3 : 4 = 9 : 12$ aránypárban melyek a **kültagok**?',
  answer: textChoice('$3$ és $12$', ['$4$ és $9$', '$3$ és $9$', '$4$ és $12$']),
  hint: 'A kültagok az aránypár két szélén állnak, a beltagok középen.',
  solution: ['A kültagok a $3$ és a $12$; a beltagok a $4$ és a $9$.'],
};

const productCheck: Question = {
  prompt: 'Igaz vagy hamis?\n\nA $6 : 8 = 9 : 12$ aránypárban $6 \\cdot 12 = 8 \\cdot 9$.',
  answer: { type: 'truefalse', value: true },
  hint: 'A kültagok szorzata egyenlő a beltagok szorzatával.',
  solution: ['$6 \\cdot 12 = 72$ és $8 \\cdot 9 = 72$, tehát az állítás igaz.'],
};

const simplifyCheck: Question = {
  prompt: 'Melyik a $12 : 18 : 30$ arány legegyszerűbb alakja?',
  answer: textChoice('$2 : 3 : 5$', ['$6 : 9 : 15$', '$2 : 3 : 30$', '$4 : 6 : 10$']),
  hint: 'Mindhárom tagot oszd el ugyanazzal a közös osztóval, a legnagyobbal!',
  solution: ['A legnagyobb közös osztó $6$: $12 : 18 : 30 = 2 : 3 : 5$.'],
};

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-07',
  goals: [
    'felírni és rendezni az aránypárt, és használni a kültag–beltag szorzatot,',
    'egyszerűsíteni a kibővített arányt,',
    'két arányt egyetlen kibővített aránnyá összekapcsolni,',
    'felosztani egy mennyiséget adott arányban.',
  ],
  parts: [
    {
      title: 'Az aránypár',
      steps: [
        {
          type: 'theory',
          title: 'Kültagok és beltagok',
          body: 'Az $a : b = c : d$ aránypárban $a$ és $d$ a **kültagok**, $b$ és $c$ a **beltagok**. A kültagok szorzata egyenlő a beltagok szorzatával.',
          figure: {
            type: 'table',
            header: ['kültag', 'beltag', 'beltag', 'kültag'],
            rows: [['a', 'b', 'c', 'd']],
          },
          remember: '$a : b = c : d$ ↔ $a \\cdot d = b \\cdot c$',
        },
        { type: 'check', question: termsCheck },
        { type: 'check', question: productCheck },
        {
          type: 'example',
          title: 'Hiányzó tag',
          problem: 'Oldd meg! $3 : 4 = 9 : x$',
          steps: [
            { text: 'A kültagok szorzata: $3 \\cdot x$; a beltagoké: $4 \\cdot 9 = 36$.' },
            { text: '$3 \\cdot x = 36$' },
            { text: '$x = 36 : 3 = 12$' },
          ],
          answer: 'A hiányzó kültag $12$.',
        },
        { type: 'practice', generator: 'missing-term', level: 1, count: 2 },
        { type: 'practice', generator: 'missing-term', level: 2 },
      ],
    },
    {
      title: 'A kibővített arány',
      steps: [
        {
          type: 'theory',
          title: 'Kibővített arány',
          body: 'Az $a : b : c$ alakot kibővített aránynak nevezzük. Mindhárom tagot ugyanazzal a számmal szorozhatjuk vagy oszthatjuk: az arány nem változik.',
          remember: '$a : b : c = (ka) : (kb) : (kc)$',
        },
        { type: 'check', question: simplifyCheck },
        {
          type: 'example',
          title: 'Egyszerűsítés',
          problem: 'Írd fel a legegyszerűbb alakban! $12 : 18 : 30$',
          steps: [
            { text: 'A közös osztó $6$.' },
            { text: '$12 : 18 : 30 = 2 : 3 : 5$' },
          ],
          answer: 'A legegyszerűbb alak $2 : 3 : 5$.',
        },
        { type: 'practice', generator: 'simplify-ratio', level: 1 },
        { type: 'practice', generator: 'simplify-ratio', level: 2 },
        { type: 'practice', generator: 'missing-term', level: 3 },
      ],
    },
    {
      title: 'Arányok összekapcsolása',
      steps: [
        {
          type: 'theory',
          title: 'Két arányból egy',
          body: 'Ha $a : b$ és $b : c$ adott, a közös $b$ tagot mindkét arányban ugyanakkora számra hozzuk. Ehhez $b$ két értékének legkisebb közös többszörösét használjuk.',
        },
        {
          type: 'example',
          title: 'Összekapcsolás',
          problem: 'Az $a : b = 2 : 3$ és $b : c = 4 : 5$. Mennyi $a : b : c$?',
          steps: [
            { text: 'A közös $b$: $[3; 4] = 12$.' },
            { text: '$a : b = 2 : 3 = 8 : 12$' },
            { text: '$b : c = 4 : 5 = 12 : 15$' },
            { text: 'Tehát $a : b : c = 8 : 12 : 15$.' },
          ],
          answer: 'A kibővített arány $8 : 12 : 15$.',
        },
        { type: 'practice', generator: 'combine-ratios', level: 1 },
        { type: 'practice', generator: 'combine-ratios', level: 2 },
        { type: 'practice', generator: 'combine-ratios', level: 3 },
      ],
    },
    {
      title: 'Felosztás adott arányban',
      steps: [
        {
          type: 'theory',
          title: 'Felosztás arányban',
          body: 'Ha egy mennyiséget $a : b : c$ arányban osztunk fel, először a részek számát adjuk össze: $a + b + c$. Egy rész értéke a mennyiség osztva ezzel az összeggel.',
          remember: 'egy rész = mennyiség : (a + b + c)',
        },
        {
          type: 'example',
          title: '3600 Ft felosztása',
          problem: 'Ossz el $3600$ Ft-ot $2 : 3 : 4$ arányban!',
          steps: [
            { text: 'A részek összege: $2 + 3 + 4 = 9$.' },
            { text: 'Egy rész: $3600 : 9 = 400$ Ft.' },
            { text: 'A részek: $800$ Ft, $1200$ Ft és $1600$ Ft.' },
          ],
          answer: 'A részek $800$ Ft, $1200$ Ft és $1600$ Ft.',
        },
        { type: 'practice', generator: 'divide-sum', level: 1 },
        { type: 'practice', generator: 'divide-sum', level: 2 },
        { type: 'practice', generator: 'alloy', level: 2 },
      ],
    },
    {
      title: 'Szöveges feladatok',
      steps: [
        {
          type: 'theory',
          title: 'Fordított arány',
          body: 'Ha két mennyiség szorzata állandó, akkor **fordítottan arányosak**. Ilyenkor a nagyobb értékhez kisebb tartozik, és az arány felírásakor a reciprokokat használjuk.',
          remember: 'fordított arány: $1 : 2 : 3$ helyett $\\frac{1}{1} : \\frac{1}{2} : \\frac{1}{3}$',
        },
        {
          type: 'example',
          title: 'Háromszög szögei',
          problem: 'Egy háromszög szögeinek aránya $2 : 3 : 4$. Mekkora a legnagyobb szög?',
          figure: angleTriangle([40, 60, 80]),
          steps: [
            { text: 'A részek összege: $2 + 3 + 4 = 9$.' },
            { text: 'Egy rész: $180° : 9 = 20°$.' },
            { text: 'A szögek: $40°$, $60°$, $80°$.' },
          ],
          answer: 'A legnagyobb szög $80°$.',
        },
        { type: 'practice', generator: 'triangle-angles', level: 2 },
        { type: 'practice', generator: 'divide-sum', level: 3 },
        { type: 'practice', generator: 'alloy', level: 3 },
        { type: 'practice', generator: 'inverse-ratio', level: 3 },
      ],
    },
  ],
  generators: [missingTerm, simplifyRatio, combineRatios, divideSum, alloy, triangleAngles, inverseRatio],
  miniTest: {
    items: [
      { generator: 'missing-term', level: 1 },
      { generator: 'simplify-ratio', level: 1 },
      { generator: 'combine-ratios', level: 2 },
      { generator: 'divide-sum', level: 2 },
      { generator: 'triangle-angles', level: 2 },
      { generator: 'alloy', level: 2 },
      { generator: 'inverse-ratio', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'missing-term', level: 1 },
    { generator: 'simplify-ratio', level: 1 },
    { generator: 'combine-ratios', level: 1 },
    { generator: 'divide-sum', level: 1 },
    { generator: 'triangle-angles', level: 2 },
    { generator: 'alloy', level: 2 },
    { generator: 'inverse-ratio', level: 3 },
  ],
});
