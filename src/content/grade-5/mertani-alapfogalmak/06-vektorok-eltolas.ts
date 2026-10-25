/**
 * 5. osztály › Mértani alapfogalmak › 6. Vektorok. A párhuzamos eltolás
 *
 * Geometry lesson: directed segment and vector (direction, orientation, magnitude), equal
 * and opposite vectors, translation of points, segments and simple figures, and the
 * properties of a translation. Vectors are drawn with a dot at the start and an arrowhead
 * at the end. Every figure follows the generated vector and point.
 */
import {
  defineSubtopic,
  num,
  tex,
  textChoice,
  type Figure,
  type FigColor,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type Rng,
  type XY,
  article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: arrows and grid figures
// ---------------------------------------------------------------------------------------------

const at = (x: number, y: number): XY => [x, y];

/** Hungarian colour name → figure colour. */
const colorKey = (name: string): FigColor => (name === 'narancssárga' ? 'orange' : name === 'zöld' ? 'green' : 'purple');

/** One vector: arrow from a to b, a dot at the start, a label near the middle. */
function vectorPart(prefix: string, a: XY, b: XY, label: string, color: FigColor = 'accent'): { points: Record<string, XY>; items: GeoItem[] } {
  return {
    points: { [`${prefix}A`]: a, [`${prefix}B`]: b },
    items: [
      { kind: 'segment', from: `${prefix}A`, to: `${prefix}B`, arrow: 'end', color },
      { kind: 'point', at: `${prefix}A`, label: false, color },
      { kind: 'label', at: at((a[0] + b[0]) / 2 + 0.25, (a[1] + b[1]) / 2 + 0.35), text: label, color, size: 'small' },
    ],
  };
}

/** A point with its name. */
function pointPart(name: string, p: XY, labelDir: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' = 'ne', color: FigColor = 'ink'): { points: Record<string, XY>; items: GeoItem[] } {
  return {
    points: { [name]: p },
    items: [{ kind: 'point', at: name, labelDir, color }],
  };
}

/** A unit grid with fixed corners, plus the given parts. */
function gridFigure(parts: { points: Record<string, XY>; items: GeoItem[] }[], w = 10, h = 8): Figure {
  const points: Record<string, XY> = { __c1: at(0, 0), __c2: at(w, h), __c3: at(0, h), __c4: at(w, 0) };
  const items: GeoItem[] = [];
  for (const p of parts) {
    Object.assign(points, p.points);
    items.push(...p.items);
  }
  return { type: 'geometry', grid: true, points, items };
}

/** "jobbra 3, fel 2" for a vector. */
function vectorText(dx: number, dy: number): string {
  const parts: string[] = [];
  if (dx > 0) parts.push(`jobbra ${num(dx)}`);
  else if (dx < 0) parts.push(`balra ${num(-dx)}`);
  else parts.push('vízszintesen nem lép');
  if (dy > 0) parts.push(`fel ${num(dy)}`);
  else if (dy < 0) parts.push(`le ${num(-dy)}`);
  else parts.push('függőlegesen nem lép');
  return parts.join(', ');
}

// --- static figures --------------------------------------------------------------------------

const oneVectorFigure: Figure = gridFigure([
  vectorPart('v', at(2, 2), at(6, 2), 'v'),
  pointPart('O', at(0, 0), 'sw', 'highlight'),
]);

/** v and an equal, an opposite and a longer vector. */
const equalVectorsFigure: Figure = gridFigure([
  vectorPart('v', at(1, 7), at(4, 8), 'v'),
  vectorPart('a', at(1, 5), at(4, 6), 'a'),
  vectorPart('b', at(6, 5), at(3, 4), 'b'),
  vectorPart('c', at(1, 2), at(5, 3), 'c'),
]);

/** A triangle, the vector and three candidate images. */
function translationFigure(level: 1 | 2, colors: { correct: FigColor; wrong1: FigColor; wrong2: FigColor } = { correct: 'orange', wrong1: 'green', wrong2: 'purple' }): Figure {
  const v = at(3, 3);
  const original = level === 1 ? [at(1, 1), at(3, 1), at(2, 3)] : [at(1, 1), at(3, 1), at(3, 3), at(1, 3)];
  const shift = (dx: number, dy: number) => original.map((q): XY => [q[0] + dx, q[1] + dy]);
  const correct = shift(v[0], v[1]);
  const wrong1 = shift(v[0], 0);
  const wrong2 = shift(0, v[1]);
  const labels = level === 1 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
  const dirs = level === 1 ? (['sw', 'se', 'n'] as const) : (['sw', 'se', 'ne', 'nw'] as const);
  return gridFigure([
    {
      points: {},
      items: [
        { kind: 'polygon', points: original.map((_, i) => `o${i}`), fill: 'blue', color: 'blue', vertexLabels: false },
        { kind: 'polygon', points: correct.map((_, i) => `c${i}`), fill: colors.correct, color: colors.correct, vertexLabels: false },
        { kind: 'polygon', points: wrong1.map((_, i) => `w1${i}`), fill: colors.wrong1, color: colors.wrong1, vertexLabels: false },
        { kind: 'polygon', points: wrong2.map((_, i) => `w2${i}`), fill: colors.wrong2, color: colors.wrong2, vertexLabels: false },
      ],
    },
    {
      points: Object.fromEntries([
        ...original.map((q, i) => [`o${i}`, q]),
        ...correct.map((q, i) => [`c${i}`, q]),
        ...wrong1.map((q, i) => [`w1${i}`, q]),
        ...wrong2.map((q, i) => [`w2${i}`, q]),
      ]),
      items: labels.map((label, i) => ({ kind: 'point' as const, at: `o${i}`, label, labelDir: dirs[i] })),
    },
    vectorPart('v', at(7, 1), at(7 + v[0], 1 + v[1]), 'v'),
    pointPart('O', at(0, 0), 'sw', 'highlight'),
  ]);
}

const triangleTranslationFigure: Figure = translationFigure(1);
const squareTranslationFigure: Figure = translationFigure(2);

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Translate a point by a vector: MC on the grid or coordinates. */
const translatePoint: GeneratorDef = {
  id: 'translate-point',
  title: 'Pont eltolása vektorral',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const dx = rng.int(1, 3);
      const dy = rng.int(1, 2);
      const p: XY = at(rng.int(1, 4), rng.int(1, 3));
      const target: XY = [p[0] + dx, p[1] + dy];
      const wrongs: XY[] = [
        [p[0] + dx, p[1]],
        [p[0], p[1] + dy],
        [p[0] + dy, p[1] + dx],
      ];
      const unique: XY[] = [];
      for (const q of [target, ...wrongs]) {
        if (!unique.some((u) => u[0] === q[0] && u[1] === q[1])) unique.push(q);
      }
      while (unique.length < 4) unique.push([target[0] + unique.length, target[1]]);
      const shuffled = rng.shuffle(unique);
      const labels = ['A', 'B', 'C', 'D'];
      const candidates = shuffled.map((q, i) => ({ at: q, label: labels[i] }));
      const correct = candidates[shuffled.findIndex((q) => q[0] === target[0] && q[1] === target[1])].label;
      return {
        prompt: 'A rácson $O$ az origó. A $v$ vektorral eltoljuk a $P$ pontot. Melyik pont a $P$ képe?',
        figure: gridFigure([
          vectorPart('v', at(1, 7), at(1 + dx, 7 + dy), 'v'),
          pointPart('O', at(0, 0), 'sw', 'highlight'),
          pointPart('P', p, 'sw'),
          ...candidates.map((c) => pointPart(c.label, c.at, 'ne')),
        ]),
        answer: textChoice(`$${correct}$`, labels.filter((l) => l !== correct).map((l) => `$${l}$`)),
        hint: 'A vektor minden pontot ugyanannyival mozdít el: a $P$-ből ugyanazt a lépést tedd meg, mint a vektor.',
        solution: [
          tex`A $v$ vektor: ${vectorText(dx, dy)}.`,
          tex`A $P$ pontból ugyanennyit lépünk: ${vectorText(dx, dy)}.`,
          tex`A $P$ képe ${article(correct)} **$${correct}$** jelű pont.`,
        ],
      };
    }
    if (level === 2) {
      const dx = rng.int(2, 4);
      const dy = -rng.int(1, 2);
      const p: XY = at(rng.int(1, 3), rng.int(4, 6));
      const target: XY = [p[0] + dx, p[1] + dy];
      return {
        prompt: tex`A rácson $O$ az origó, a $P$ pont koordinátái $(${num(p[0])}; ${num(p[1])})$. A $v$ vektor ${vectorText(dx, dy)}. Add meg a $P$ eltolt képének koordinátáit!`,
        figure: gridFigure([
          vectorPart('v', at(1, 7), at(1 + dx, 7 + dy), 'v'),
          pointPart('O', at(0, 0), 'sw', 'highlight'),
          pointPart('P', p, 'sw'),
        ]),
        answer: {
          type: 'numbers',
          fields: [
            { label: '$x =$', value: target[0] },
            { label: '$y =$', value: target[1] },
          ],
        },
        hint: 'A vektor koordinátáit add hozzá a $P$ koordinátáihoz.',
        solution: [
          tex`$P(${num(p[0])}; ${num(p[1])})$, a vektor: ${vectorText(dx, dy)}.`,
          tex`$x = ${num(p[0])} ${dx < 0 ? '-' : '+'} ${num(Math.abs(dx))} = ${num(target[0])}$, $y = ${num(p[1])} ${dy < 0 ? '-' : '+'} ${num(Math.abs(dy))} = ${num(target[1])}$.`,
          tex`A kép koordinátái: **$x = ${num(target[0])}$, $y = ${num(target[1])}$**.`,
        ],
      };
    }
    const dx = -rng.int(2, 3);
    const dy = -rng.int(1, 2);
    const a: XY = at(rng.int(7, 8), rng.int(6, 7));
    const b: XY = [a[0] + dx, a[1] + dy];
    const p: XY = at(rng.int(7, 8), rng.int(2, 3));
    const target: XY = [p[0] + dx, p[1] + dy];
    return {
      prompt: tex`A rácson $O$ az origó, a $P$ pont koordinátái $(${num(p[0])}; ${num(p[1])})$. A $v$ vektor az $A$ pontból a $B$ pontba mutat. Add meg a $P$ eltolt képének koordinátáit!`,
      figure: gridFigure([
        vectorPart('v', a, b, 'v'),
        { points: { A: a, B: b }, items: [{ kind: 'label', at: at(a[0] + 0.25, a[1] + 0.35), text: 'A', color: 'accent', size: 'small' }, { kind: 'label', at: at(b[0] - 0.2, b[1] - 0.35), text: 'B', color: 'accent', size: 'small' }] },
        pointPart('O', at(0, 0), 'sw', 'highlight'),
        pointPart('P', p, 'sw'),
      ]),
      answer: {
        type: 'numbers',
        fields: [
          { label: '$x =$', value: target[0] },
          { label: '$y =$', value: target[1] },
        ],
      },
      hint: 'Olvasd le a vektort: hány egységet kell jobbra/balra és fel/le lépni?',
      solution: [
        tex`Az $A$ pontból a $B$ pontba ${vectorText(dx, dy)} kell lépni; ez a $v$ vektor.`,
        tex`$P(${num(p[0])}; ${num(p[1])})$, ezért ${vectorText(dx, dy)}.`,
        tex`A kép koordinátái: **$x = ${num(target[0])}$, $y = ${num(target[1])}$**.`,
      ],
    };
  },
};

/** Magnitude of a vector by counting grid units. */
const vectorMagnitude: GeneratorDef = {
  id: 'vector-magnitude',
  title: 'A vektor nagysága',
  levels: [1, 2],
  generate(rng, level): Question {
    const horizontal = rng.chance(0.6);
    const len = rng.int(3, 8);
    const a: XY = horizontal ? at(1, 2) : at(2, 1);
    const b: XY = horizontal ? at(1 + len, 2) : at(2, 1 + len);
    const scale = level === 2 ? rng.int(2, 5) : 1;
    return {
      prompt:
        level === 1
          ? 'Hány egység hosszú a $v$ vektor?'
          : tex`A rácson $1$ egység $${num(scale)}$ cm. Hány centiméter hosszú a $v$ vektor?`,
      figure: gridFigure([vectorPart('v', a, b, 'v'), pointPart('O', at(0, 0), 'sw', 'highlight')]),
      answer: { type: 'number', value: len * scale, unit: level === 1 ? 'egység' : 'cm' },
      inputLabel: '$|v| =$',
      hint: 'Számold meg, hány rácsot fed le a vektor!',
      solution: [
        tex`A vektor ${num(len)} rácsegységet fed le.`,
        level === 1
          ? tex`A hossza **${num(len)} egység**.`
          : tex`$1$ egység $${num(scale)}$ cm, ezért $${num(len)} \cdot ${num(scale)} = ${num(len * scale)}$ cm.`,
        level === 1 ? 'A vektor nagysága a hosszával egyenlő.' : tex`A vektor hossza **${num(len * scale)} cm**.`,
      ],
    };
  },
};

/** Which vector is equal to / the opposite of v? Random v, random layout. */
const equalVectors: GeneratorDef = {
  id: 'equal-vectors',
  title: 'Egyenlő és ellentett vektorok',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    let v: XY;
    do v = at(rng.int(-3, 3), rng.int(-2, 2));
    while (Math.abs(v[0]) + Math.abs(v[1]) < 2 || v[0] === 0 || Math.abs(v[0]) === Math.abs(v[1]));
    // typical mistakes: the opposite, a vector of another direction, one of the same length turned by 90°
    const skew = at(v[0] + Math.sign(v[0]), v[1] === 0 ? 1 : 0);
    const turned = at(-v[1], v[0]);
    const roles: { key: string; vec: XY }[] = [
      { key: 'equal', vec: v },
      { key: 'opposite', vec: at(-v[0], -v[1]) },
      { key: 'skew', vec: skew },
      ...(level === 3 ? [{ key: 'turned', vec: turned }] : []),
    ];
    // cells of 4 × 3 grid units; each arrow starts at the corner that keeps it inside its cell
    const cells = rng.shuffle([0, 1, 2, 3, 4, 5]);
    const place = (vec: XY, cell: number) => {
      const col = cell % 3;
      const row = Math.floor(cell / 3);
      const from = at(1 + col * 4 + (vec[0] >= 0 ? 0 : 3), 1 + row * 3 + (vec[1] >= 0 ? 0 : 2));
      return { from, to: at(from[0] + vec[0], from[1] + vec[1]) };
    };
    const labels = rng.shuffle(['a', 'b', 'c', 'd'].slice(0, roles.length));
    const placed = roles.map((r, i) => ({ ...r, label: labels[i], ...place(r.vec, cells[i + 1]) }));
    const vPlace = place(v, cells[0]);
    const asked = level === 2 ? 'opposite' : 'equal';
    const correct = placed.find((p) => p.key === asked)!.label;
    return {
      prompt: level === 2 ? 'Melyik vektor ellentettje a $v$ vektornak?' : 'Melyik vektor egyenlő a $v$ vektorral?',
      figure: gridFigure([vectorPart('v', vPlace.from, vPlace.to, 'v', 'highlight'), ...placed.map((p) => vectorPart(p.label, p.from, p.to, p.label))], 13, 7),
      answer: textChoice(`$${correct}$`, labels.filter((l) => l !== correct).map((l) => `$${l}$`)),
      hint: 'Egyenlő: ugyanaz az irány, ugyanaz az irányítás és ugyanakkora nagyság. Ellentett: ugyanakkora, de ellenkező irányítás.',
      solution: [
        tex`A $v$ vektor: ${vectorText(v[0], v[1])}.`,
        level === 2
          ? tex`Az ellentettje ugyanakkora, de visszafelé mutat: ${vectorText(-v[0], -v[1])}.`
          : tex`Az egyenlő vektor ugyanígy mutat: ${vectorText(v[0], v[1])}.`,
        tex`A helyes válasz: **$${correct}$**.`,
      ],
    };
  },
};

/** Label direction for a vertex: away from the centre of the shape. */
function awayFrom(q: XY, shape: XY[]): 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' {
  const cx = shape.reduce((t, r) => t + r[0], 0) / shape.length;
  const cy = shape.reduce((t, r) => t + r[1], 0) / shape.length;
  const [dx, dy] = [q[0] - cx, q[1] - cy];
  const v = dy > 0.3 ? 'n' : dy < -0.3 ? 's' : '';
  const h = dx > 0.3 ? 'e' : dx < -0.3 ? 'w' : '';
  return ((v + h) || 'n') as 'n';
}

/** A random triangle or convex quadrilateral with integer vertices in [0, 2] × [0, 2]. */
function smallShape(rng: Rng, n: 3 | 4): XY[] {
  for (;;) {
    const pts: XY[] = n === 3 ? [at(0, 0), at(2, rng.int(0, 1)), at(rng.int(0, 2), 2)] : [at(0, rng.int(0, 1)), at(2, 0), at(rng.int(1, 2), 2), at(0, 2)];
    const area2 = pts.reduce((sum, q, i) => sum + q[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * q[1], 0);
    if (Math.abs(area2) >= 3) return rng.chance(0.5) ? pts.map((q): XY => [2 - q[0], q[1]]) : pts;
  }
}

/** Translation of a triangle or quadrilateral: which coloured copy is the image? */
const translateFigure: GeneratorDef = {
  id: 'translate-figure',
  title: 'Alakzat eltolása',
  levels: [1, 2],
  generate(rng, level): Question {
    // level 1: a triangle moved up and sideways; level 2: a quadrilateral, also moved down
    const n = level === 1 ? 3 : 4;
    const dx = rng.int(3, 5) * rng.sign();
    const dy = level === 1 ? 3 : 3 * rng.sign();
    // shapes live in the band y ∈ [1, 6], the vector is drawn above them, in y ∈ [8, 11]
    const x0 = dx > 0 ? 1 : 1 - dx;
    const y0 = dy > 0 ? 1 : 4;
    const original = smallShape(rng, n).map((q): XY => [x0 + q[0], y0 + q[1]]);
    const shift = (sx: number, sy: number) => original.map((q): XY => [q[0] + sx, q[1] + sy]);
    const [correctColor, wrongAColor, wrongBColor] = rng.shuffle(['narancssárga', 'zöld', 'lila']);
    const poly = (pts: XY[], prefix: string, color: FigColor) => ({
      points: Object.fromEntries(pts.map((q, i) => [`${prefix}${i}`, q])),
      items: [{ kind: 'polygon' as const, points: pts.map((_, i) => `${prefix}${i}`), fill: color, color, vertexLabels: false as const }],
    });
    const labels = n === 3 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
    const noun = n === 3 ? 'háromszög' : 'négyszög';
    const name = labels.join('');
    const vFrom = at(dx > 0 ? 1 : 1 - dx, dy > 0 ? 8 : 11);
    return {
      prompt: tex`Melyik színű ${noun} ${article(name)} $${name}$ ${noun} eltolt képe a $v$ vektorral?`,
      figure: gridFigure(
        [
          poly(original, 'o', 'blue'),
          poly(shift(dx, dy), 'c', colorKey(correctColor)),
          poly(shift(dx, 0), 'wa', colorKey(wrongAColor)),
          poly(shift(0, dy), 'wb', colorKey(wrongBColor)),
          { points: {}, items: labels.map((label, i) => ({ kind: 'point' as const, at: `o${i}`, label, labelDir: awayFrom(original[i], original) })) },
          vectorPart('v', vFrom, at(vFrom[0] + dx, vFrom[1] + dy), 'v', 'highlight'),
        ],
        Math.abs(dx) + 4,
        12,
      ),
      answer: textChoice(`a ${correctColor}`, [`a ${wrongAColor}`, `a ${wrongBColor}`]),
      hint: 'A vektor minden csúcsot ugyanannyival mozdít el. Olvasd le: hányat lép jobbra vagy balra, és hányat fel vagy le?',
      solution: [
        tex`A $v$ vektor: ${vectorText(dx, dy)}.`,
        `A ${wrongAColor} alakzat csak vízszintesen, a ${wrongBColor} csak függőlegesen tolódott el.`,
        `A ${correctColor} alakzat minden csúcsa ${vectorText(dx, dy)} lépett: a helyes kép a **${correctColor}** alakzat.`,
      ],
    };
  },
};

/** True/false statements about vectors and translation. */
type Statement = { text: string; value: boolean; why: string };

const translationTf: GeneratorDef = {
  id: 'translation-tf',
  title: 'Igaz-hamis állítások a vektorokról',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: Statement[] =
      level === 1
        ? [
            { text: 'A vektor egy irányított szakasz.', value: true, why: 'A vektor kezdő- és végponttal rendelkező irányított szakasz.' },
            { text: 'A vektornak van iránya, irányítása és nagysága.', value: true, why: 'Ez a vektor három jellemzője.' },
            { text: 'Az $AB→$ és a $BA→$ ugyanaz a vektor.', value: false, why: 'Ellenkező irányba mutatnak, ezért ellentett vektorok.' },
            { text: 'Az $AB→$ és a $BA→$ ellentett vektorok.', value: true, why: 'Ugyanakkora, de ellenkező irányítású vektorok.' },
            { text: 'A vektor nagysága a szakasz hossza.', value: true, why: 'A vektor hossza a nagysága.' },
            { text: 'A párhuzamos eltolás megtartja az alakzat alakját és méretét.', value: true, why: 'Az eltolás nem változtatja meg az alakot és a méretet.' },
            { text: 'Az eltolás után a szakasz képe ugyanabba az irányba áll, mint az eredeti.', value: true, why: 'A képszakasz ugyanabba az irányba áll.' },
            { text: 'A vektor egy pont.', value: false, why: 'A vektor irányított szakasz, nem pont.' },
            { text: 'Két vektor egyenlő, ha ugyanolyan hosszú.', value: false, why: 'Az iránynak és az irányításnak is egyeznie kell.' },
            { text: 'A $v→$ és a $−v→$ nagysága egyenlő.', value: true, why: 'Az ellentett vektor ugyanakkora.' },
          ]
        : level === 2
          ? [
              { text: 'Két vektor egyenlő, ha ugyanaz az irányuk, az irányításuk és a nagyságuk.', value: true, why: 'Ez az egyenlő vektorok definíciója.' },
              { text: 'Az ellentett vektor ugyanakkora, de ellenkező irányítású.', value: true, why: 'Az ellentett vektor a $-v$. ' },
              { text: 'A párhuzamos eltolásnál minden pont ugyanabba az irányba mozdul el.', value: true, why: 'Minden pont ugyanazzal a vektorral tolódik.' },
              { text: 'A párhuzamos eltolás megfordítja az alakzatot.', value: false, why: 'Az eltolás megtartja az irányítást.' },
              { text: 'A kör eltolt képe kör.', value: true, why: 'Az eltolás megtartja az alakzatot.' },
              { text: 'A négyzet eltolt képe négyzet.', value: true, why: 'Az eltolás megtartja az alakzatot.' },
              { text: 'A háromszög eltolt képe ugyanolyan alakú és méretű.', value: true, why: 'Az eltolás nem változtat sem az alakon, sem a méreten.' },
              { text: 'A vektor irányítása a nyíl iránya.', value: true, why: 'A nyíl mutatja az irányítást.' },
              { text: 'A vektor kezdőpontját pötty jelöli.', value: true, why: 'A rajzon a kezdőpontot kis pont jelöli.' },
              { text: 'Az eltolás után a szakasz és a képe mindig metszi egymást.', value: false, why: 'A kép párhuzamos az eredetivel; nem feltétlenül metszi.' },
            ]
          : [
              { text: 'Ha két vektor egyenlő, akkor a nagyságuk is egyenlő.', value: true, why: 'Az egyenlő vektorok nagysága egyenlő.' },
              { text: 'Ha két vektor nagysága egyenlő, akkor a két vektor egyenlő.', value: false, why: 'Az irány és az irányítás is számít.' },
              { text: 'Az $AB→$ vektor kezdőpontja $A$, végpontja $B$.', value: true, why: 'A nyíl $A$-ból $B$ felé mutat.' },
              { text: 'A vektor nyílhegye a végpontot jelöli.', value: true, why: 'A nyíl a végpontban van.' },
              { text: 'Ha egy pontot a $v→$ vektorral eltolunk, majd a képét a $−v→$ vektorral, visszakapjuk az eredeti pontot.', value: true, why: 'A két eltolás kioltja egymást.' },
              { text: 'Ha egy alakzatot kétszer egymás után ugyanazzal a vektorral tolunk el, az olyan, mintha kétszer akkora vektorral toltuk volna el.', value: true, why: 'A két egyforma lépés együtt kétszer akkora lépés ugyanabba az irányba.' },
              { text: 'Az eltolásnál a szakasz képe ugyanolyan hosszú.', value: true, why: 'A hosszúság nem változik.' },
              { text: 'Az eltolásnál a szög nagysága változik.', value: false, why: 'A szögek nagysága változatlan marad.' },
              { text: 'A $v→$ és a $−v→$ ugyanabba az irányba mutat.', value: false, why: 'Ellenkező irányba mutatnak.' },
              { text: 'Az eltolásnál a képpont és az eredeti pont távolsága a vektor nagysága.', value: true, why: 'Minden pont a vektorral mozdul el.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át a vektor jellemzőit és az eltolás tulajdonságait!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-06',
  goals: [
    'felismerni a vektor irányát, irányítását és nagyságát,',
    'megkülönböztetni az egyenlő és az ellentett vektorokat,',
    'pontot és alakzatot eltolni egy vektorral,',
    'leolvasni a vektort a rácson.',
  ],
  parts: [
    {
      title: 'Irányított szakasz, vektor',
      steps: [
        {
          type: 'theory',
          title: 'A vektor',
          body: 'A vektor irányított szakasz: a kezdőpontját pötty, a végpontját nyíl jelöli. Van iránya, irányítása és nagysága.',
          figure: oneVectorFigure,
          remember: '$|v|$ = a vektor nagysága',
        },
        {
          type: 'check',
          question: {
            prompt: 'A vektornak van iránya, irányítása és nagysága.',
            figure: oneVectorFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg a nyilat és a hosszát!',
            solution: ['A vektor jellemzői: irány, irányítás és nagyság.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'A vektor nagysága',
          problem: 'Hány egység hosszú az ábrán látható $v$ vektor?',
          figure: oneVectorFigure,
          steps: [
            { text: 'A vektor vízszintesen 4 rácsot fed le.' },
            { text: 'A hossza tehát 4 egység.' },
          ],
          answer: 'A $v$ vektor **4 egység** hosszú.',
        },
        { type: 'practice', generator: 'vector-magnitude', level: 1, count: 2 },
        { type: 'practice', generator: 'translation-tf', level: 1 },
      ],
    },
    {
      title: 'Egyenlő és ellentett vektorok',
      steps: [
        {
          type: 'theory',
          title: 'Egyenlő, ellentett',
          body: 'Két vektor egyenlő, ha az irányuk, az irányításuk és a nagyságuk is egyenlő. Az ellentett vektor ugyanakkora, de ellenkező irányba mutat.',
          figure: equalVectorsFigure,
          remember: 'Egyenlő: ugyanaz az irány, irányítás, nagyság.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Az $AB→$ és a $BA→$ ellentett vektorok.',
            answer: { type: 'truefalse', value: true },
            hint: 'Ugyanakkora a hosszuk, de ellenkező irányba mutatnak.',
            solution: ['Az $AB→$ és a $BA→$ ugyanakkora, de ellenkező irányítású, ezért ellentett vektorok.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Egyenlő vagy ellentett?',
          problem: 'Melyik vektor egyenlő a $v$ vektorral, és melyik az ellentettje?',
          figure: equalVectorsFigure,
          steps: [
            { text: 'A $v$ vektor jobbra 3, fel 1.' },
            { text: 'Az $a$ vektor is jobbra 3, fel 1: egyenlő.' },
            { text: 'A $b$ vektor balra 3, le 1: ellentett.' },
          ],
          answer: 'Az $a$ **egyenlő**, a $b$ **ellentett**.',
        },
        { type: 'practice', generator: 'equal-vectors', level: 1 },
        { type: 'practice', generator: 'equal-vectors', level: 2 },
        { type: 'practice', generator: 'equal-vectors', level: 3 },
        { type: 'practice', generator: 'translation-tf', level: 2 },
      ],
    },
    {
      title: 'Párhuzamos eltolás',
      steps: [
        {
          type: 'theory',
          title: 'Az eltolás',
          body: 'A párhuzamos eltolásnál minden pont ugyanabba az irányba mozdul el ugyanakkora vektorral. Az alakzat és a méret nem változik.',
          figure: triangleTranslationFigure,
          remember: 'Az eltolás megtartja az alakot és a méretet.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A párhuzamos eltolás megtartja az alakzat alakját és méretét.',
            figure: triangleTranslationFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Hasonlítsd össze az eredeti és az eltolt háromszöget!',
            solution: ['Az eltolás nem változtatja meg az alakot és a méretet.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Pont eltolása',
          problem: 'A $P(1; 2)$ pontot eltoljuk a $v$ vektorral: jobbra 3, fel 2. Add meg a kép koordinátáit!',
          figure: gridFigure([
            vectorPart('v', at(1, 7), at(4, 9), 'v'),
            pointPart('O', at(0, 0), 'sw', 'highlight'),
            pointPart('P', at(1, 2), 'sw'),
          ], 10, 9),
          steps: [
            { text: '$x = 1 + 3 = 4$' },
            { text: '$y = 2 + 2 = 4$' },
          ],
          answer: 'A kép koordinátái: **$x = 4$, $y = 4$**.',
        },
        { type: 'practice', generator: 'translate-point', level: 1 },
        { type: 'practice', generator: 'translate-point', level: 2 },
        { type: 'practice', generator: 'translate-figure', level: 1 },
      ],
    },
    {
      title: 'Eltolás a gyakorlatban',
      steps: [
        {
          type: 'theory',
          title: 'A vektor leolvasása',
          body: 'A vektort a rácson is leolvashatod: számold meg, hány egységet lép jobbra vagy balra, és hányat fel vagy le.',
          figure: oneVectorFigure,
          remember: 'A nyíl a kezdőponttól a végpontig mutat.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $v→$ és a $−v→$ ugyanabba az irányba mutat.',
            answer: { type: 'truefalse', value: false },
            hint: 'Az ellentett vektor éppen ellenkező irányba mutat.',
            solution: ['Az ellentett vektor ugyanakkora, de ellenkező irányítású.', 'Az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Alakzat eltolása',
          problem: 'Melyik színű háromszög az $ABC$ háromszög eltolt képe a $v$ vektorral?',
          figure: triangleTranslationFigure,
          steps: [
            { text: 'A $v$ vektor jobbra 3, fel 3.' },
            { text: 'A zöld csak vízszintesen, a lila csak függőlegesen tolódott.' },
            { text: 'A narancssárga minden csúcsa jobbra 3, fel 3 lépett.' },
          ],
          answer: 'A kép a **narancssárga** háromszög.',
        },
        { type: 'practice', generator: 'translate-point', level: 3 },
        { type: 'practice', generator: 'translate-figure', level: 2 },
        { type: 'practice', generator: 'vector-magnitude', level: 2 },
        { type: 'practice', generator: 'translation-tf', level: 3 },
      ],
    },
  ],
  generators: [translatePoint, vectorMagnitude, equalVectors, translateFigure, translationTf],
  miniTest: {
    items: [
      { generator: 'vector-magnitude', level: 1 },
      { generator: 'translation-tf', level: 1 },
      { generator: 'equal-vectors', level: 1 },
      { generator: 'translate-point', level: 2 },
      { generator: 'translate-figure', level: 1 },
      { generator: 'equal-vectors', level: 2 },
      { generator: 'translation-tf', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'vector-magnitude', level: 1 },
    { generator: 'translation-tf', level: 1 },
    { generator: 'equal-vectors', level: 1 },
    { generator: 'translate-point', level: 1 },
    { generator: 'translate-figure', level: 1 },
    { generator: 'translate-point', level: 2 },
    { generator: 'equal-vectors', level: 2 },
  ],
});
