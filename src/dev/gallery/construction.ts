import type { GallerySection } from './types';

const c70 = Math.cos((70 * Math.PI) / 180);
const s70 = Math.sin((70 * Math.PI) / 180);

export const section: GallerySection = {
  title: 'Szerkesztések (construction)',
  types: ['construction'],
  entries: [
    {
      title: 'Szakasz felezőmerőlegese',
      note: 'intersections: két kör metszéspontjai (pick: above/below), egyenesek metszéspontja; compass ív a metszéspontokon át',
      figure: {
        type: 'construction',
        points: { A: [0, 0], B: [5, 0] },
        intersections: {
          P: { circles: [['A', 3.5], ['B', 3.5]] },
          Q: { circles: [['A', 3.5], ['B', 3.5]], pick: 'below' },
          F: { lines: [['A', 'B'], ['P', 'Q']] },
        },
        given: [
          { kind: 'segment', from: 'A', to: 'B' },
          { kind: 'point', at: 'A' },
          { kind: 'point', at: 'B' },
        ],
        steps: [
          { caption: 'Körzőnyílásunk legyen nagyobb az $AB$ szakasz felénél. $A$ körül ívet rajzolunk.', items: [{ kind: 'compass', center: 'A', through: ['P', 'Q'] }] },
          { caption: 'Ugyanekkora körzőnyílással $B$ körül is ívet rajzolunk.', items: [{ kind: 'compass', center: 'B', through: ['P', 'Q'] }] },
          { caption: 'A két ív metszéspontjai $P$ és $Q$.', items: [{ kind: 'point', at: 'P', labelDir: 'nw' }, { kind: 'point', at: 'Q', labelDir: 'sw' }] },
          {
            caption: 'A $PQ$ egyenes az $AB$ szakasz **felezőmerőlegese**: merőleges $AB$-re, és felezi azt az $F$ pontban.',
            items: [
              { kind: 'line', through: ['P', 'Q'], label: 'f', color: 'accent' },
              { kind: 'angle', vertex: 'F', from: 'B', to: 'P', right: true },
              { kind: 'segment', from: 'A', to: 'F', ticks: 1 },
              { kind: 'segment', from: 'F', to: 'B', ticks: 1 },
              { kind: 'point', at: 'F', labelDir: 'sw' },
            ],
          },
        ],
      },
    },
    {
      title: 'Szögfelező',
      note: 'kör és egyenes metszéspontja (near), rombusz negyedik csúcsa; dupla ív az egyenlő szögeken',
      figure: {
        type: 'construction',
        points: { O: [0, 0], A: [6, 0], B: [6 * c70, 6 * s70] },
        intersections: {
          X: { circle: ['O', 2.6], line: ['O', 'A'], near: 'A' },
          Y: { circle: ['O', 2.6], line: ['O', 'B'], near: 'B' },
          Z: { circles: [['X', 2.6], ['Y', 2.6]], near: 'A' },
        },
        given: [
          { kind: 'ray', from: 'O', through: 'A' },
          { kind: 'ray', from: 'O', through: 'B' },
          { kind: 'point', at: 'O', labelDir: 'sw' },
        ],
        steps: [
          { caption: 'A szög csúcsa, $O$ körül ívet rajzolunk, amely mindkét szárat metszi: $X$ és $Y$.', items: [{ kind: 'compass', center: 'O', through: ['X', 'Y'] }, { kind: 'point', at: 'X', labelDir: 's' }, { kind: 'point', at: 'Y', labelDir: 'w' }] },
          { caption: '$X$ és $Y$ körül ugyanakkora sugárral íveket rajzolunk; ezek a $Z$ pontban metszik egymást.', items: [{ kind: 'compass', center: 'X', through: ['Z'] }, { kind: 'compass', center: 'Y', through: ['Z'] }, { kind: 'point', at: 'Z' }] },
          {
            caption: 'Az $OZ$ félegyenes a **szögfelező**: két egyenlő részre osztja a szöget.',
            items: [
              { kind: 'ray', from: 'O', through: 'Z', color: 'accent', label: 'f' },
              { kind: 'angle', vertex: 'O', from: 'A', to: 'Z', label: 'α', color: 'accent' },
              { kind: 'angle', vertex: 'O', from: 'Z', to: 'B', label: 'α', color: 'accent' },
            ],
          },
        ],
      },
    },
    {
      title: 'Merőleges bocsátása egy pontból egy egyenesre',
      note: 'egyenes a teljes ábra szélességében; két metszéspont balra/jobbra; talppont',
      figure: {
        type: 'construction',
        points: { E1: [-1, 0], E2: [6, 0], P: [2.4, 3] },
        intersections: {
          X: { circle: ['P', 3.8], line: ['E1', 'E2'], pick: 'left' },
          Y: { circle: ['P', 3.8], line: ['E1', 'E2'], pick: 'right' },
          Q: { circles: [['X', 3.2], ['Y', 3.2]], pick: 'below' },
          T: { lines: [['E1', 'E2'], ['P', 'Q']] },
        },
        given: [
          { kind: 'line', through: ['E1', 'E2'], label: 'e' },
          { kind: 'point', at: 'P' },
        ],
        steps: [
          { caption: '$P$ körül olyan ívet rajzolunk, amely az $e$ egyenest két pontban metszi: $X$ és $Y$.', items: [{ kind: 'compass', center: 'P', through: ['X', 'Y'] }, { kind: 'point', at: 'X', labelDir: 'sw' }, { kind: 'point', at: 'Y', labelDir: 'se' }] },
          { caption: '$X$ és $Y$ körül egyenlő sugarú íveket rajzolunk az egyenes másik oldalán; metszéspontjuk $Q$.', items: [{ kind: 'compass', center: 'X', through: ['Q'] }, { kind: 'compass', center: 'Y', through: ['Q'] }, { kind: 'point', at: 'Q' }] },
          {
            caption: 'A $PQ$ egyenes merőleges $e$-re. A talppont $T$.',
            items: [
              { kind: 'line', through: ['P', 'Q'], color: 'accent', label: 'm' },
              { kind: 'angle', vertex: 'T', from: 'E2', to: 'P', right: true },
              { kind: 'point', at: 'T', labelDir: 'nw' },
            ],
          },
        ],
      },
    },
    {
      title: '√2 szerkesztése a számegyenesen',
      note: 'numberLine: számegyenes a pontok egységeiben; ív a számegyenesig',
      figure: {
        type: 'construction',
        numberLine: { min: -1, max: 2 },
        points: { O: [0, 0], E: [1, 0], K: [1, 1] },
        intersections: { S: { circle: ['O', 'K'], line: ['O', 'E'], near: 'E' } },
        given: [],
        steps: [
          {
            caption: 'Az $1$-nél merőlegest állítunk a számegyenesre, és felmérjük rá az egységet.',
            items: [
              { kind: 'segment', from: 'E', to: 'K', label: '1' },
              { kind: 'angle', vertex: 'E', from: 'K', to: 'O', right: true },
              { kind: 'point', at: 'K', label: false },
            ],
          },
          { caption: 'Az $OK$ szakasz egy egységnyi befogójú derékszögű háromszög átfogója: $\\sqrt{1^2 + 1^2} = \\sqrt{2}$.', items: [{ kind: 'segment', from: 'O', to: 'K', label: '√2', color: 'accent' }] },
          { caption: 'Körzővel $0$ körül, $OK$ sugárral ívet rajzolunk a számegyenesig.', items: [{ kind: 'compass', center: 'O', through: ['K', 'S'], extend: 8 }] },
          { caption: 'Az ív a $\\sqrt{2}$-nek megfelelő pontban metszi a számegyenest.', items: [{ kind: 'point', at: 'S', label: '√2', labelDir: 'se', color: 'highlight' }] },
        ],
      },
    },
    {
      title: 'Háromszög szerkesztése három oldalból',
      note: 'compass ívek számmal megadott sugárral; a háromszög oldalai az utolsó lépésben',
      figure: {
        type: 'construction',
        points: { A: [0, 0], B: [6, 0] },
        intersections: { C: { circles: [['A', 4], ['B', 5]] } },
        given: [
          { kind: 'segment', from: 'A', to: 'B', label: 'c = 6 cm' },
          { kind: 'point', at: 'A' },
          { kind: 'point', at: 'B' },
        ],
        steps: [
          { caption: '$A$ körül $b = 4$ cm sugarú ívet rajzolunk.', items: [{ kind: 'compass', center: 'A', radius: 4, through: ['C'], extend: 25 }] },
          { caption: '$B$ körül $a = 5$ cm sugarú ívet rajzolunk. A két ív metszéspontja a $C$ csúcs.', items: [{ kind: 'compass', center: 'B', radius: 5, through: ['C'], extend: 25 }, { kind: 'point', at: 'C' }] },
          {
            caption: 'Összekötjük $C$-t $A$-val és $B$-vel.',
            items: [
              { kind: 'segment', from: 'A', to: 'C', label: 'b = 4 cm', color: 'accent' },
              { kind: 'segment', from: 'B', to: 'C', label: 'a = 5 cm', color: 'accent' },
            ],
          },
        ],
      },
    },
    {
      title: '60°-os szög szerkesztése (rácson)',
      note: 'grid; teljes kör körzővel (radius egy ponttal)',
      figure: {
        type: 'construction',
        grid: true,
        points: { O: [0, 0], A: [5, 0] },
        intersections: { X: { circle: ['O', 3], line: ['O', 'A'], near: 'A' }, Y: { circles: [['O', 3], ['X', 3]] } },
        given: [
          { kind: 'ray', from: 'O', through: 'A' },
          { kind: 'point', at: 'O', labelDir: 'sw' },
        ],
        steps: [
          { caption: '$O$ körül tetszőleges sugarú kört rajzolunk; ez a félegyenest $X$-ben metszi.', items: [{ kind: 'compass', center: 'O', radius: 'X' }, { kind: 'point', at: 'X', labelDir: 'se' }] },
          { caption: 'Ugyanezzel a sugárral $X$ körül ívet rajzolunk; a metszéspont $Y$.', items: [{ kind: 'compass', center: 'X', through: ['Y'], extend: 20 }, { kind: 'point', at: 'Y' }] },
          {
            caption: 'Az $OXY$ háromszög szabályos, ezért az $XOY$ szög $60°$-os.',
            items: [
              { kind: 'ray', from: 'O', through: 'Y', color: 'accent' },
              { kind: 'segment', from: 'X', to: 'Y', dashed: true, color: 'muted' },
              { kind: 'angle', vertex: 'O', from: 'X', to: 'Y', label: '60°', color: 'accent', fill: true },
            ],
          },
        ],
      },
    },
  ],
};
