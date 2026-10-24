import type { GallerySection } from './types';

export const section: GallerySection = {
  title: 'Koordináta-rendszer (coordinate)',
  types: ['coordinate'],
  entries: [
    {
      title: 'Pontok koordinátákkal és vetületekkel',
      figure: {
        type: 'coordinate',
        x: [-1, 6],
        y: [-1, 5],
        points: [
          { at: [2, 3], label: 'A', showCoords: true, projections: true },
          { at: [5, 1], label: 'B', showCoords: true },
        ],
      },
    },
    {
      title: 'Mind a négy síknegyed',
      figure: {
        type: 'coordinate',
        x: [-5, 5],
        y: [-5, 5],
        points: [
          { at: [3, 2], label: 'P', showCoords: true },
          { at: [-4, 3], label: 'Q', showCoords: true },
          { at: [-2, -3], label: 'R', showCoords: true },
          { at: [4, -4], label: 'S', showCoords: true },
        ],
      },
    },
    {
      title: 'Két pont távolsága (Pitagorasz) — derékszögű segédháromszög',
      figure: {
        type: 'coordinate',
        x: [-1, 7],
        y: [-1, 6],
        points: [
          { at: [1, 1], label: 'A' },
          { at: [5, 4], label: 'B' },
        ],
        distances: [{ from: [1, 1], to: [5, 4], labels: { dx: '4', dy: '3', d: 'd = ?' } }],
      },
    },
    {
      title: 'Távolság negatív koordinátákkal',
      figure: {
        type: 'coordinate',
        x: [-6, 4],
        y: [-5, 4],
        points: [
          { at: [-4, -3], label: 'C', showCoords: true },
          { at: [2, 3], label: 'D', showCoords: true },
        ],
        distances: [{ from: [-4, -3], to: [2, 3], labels: { dx: '6', dy: '6', d: 'd = 6√2' } }],
      },
    },
    {
      title: 'Nagy tartomány: −20…20, 5-ös lépés',
      figure: {
        type: 'coordinate',
        x: [-20, 20],
        y: [-20, 20],
        step: 5,
        points: [
          { at: [15, 10], label: 'M', showCoords: true },
          { at: [-10, -15], label: 'N', showCoords: true },
        ],
        segments: [{ from: [15, 10], to: [-10, -15], dashed: true }],
      },
    },
    {
      title: 'Nem egész lépésköz: 0,5',
      figure: {
        type: 'coordinate',
        x: [-1, 3],
        y: [-1, 2],
        step: 0.5,
        points: [{ at: [1.5, 0.5], label: 'E', showCoords: true }],
      },
    },
    {
      title: 'Egyenes arányosság: y = 2x és y = 0,5x',
      figure: {
        type: 'coordinate',
        x: [-4, 4],
        y: [-4, 4],
        functions: [
          { kind: 'linear', k: 2, label: 'y = 2x' },
          { kind: 'linear', k: 0.5, label: 'y = 0,5x', color: 'orange' },
        ],
      },
    },
    {
      title: 'Lineáris függvények: meredek, lapos, csökkenő',
      figure: {
        type: 'coordinate',
        x: [-5, 5],
        y: [-5, 5],
        functions: [
          { kind: 'linear', k: 5, n: -2, label: 'y = 5x − 2' },
          { kind: 'linear', k: 0.1, n: 3, label: 'y = 0,1x + 3', color: 'green' },
          { kind: 'linear', k: -1, n: 1, label: 'y = −x + 1', color: 'purple', dashed: true },
        ],
      },
    },
    {
      title: 'Konstans függvény és függőleges egyenes',
      figure: {
        type: 'coordinate',
        x: [-4, 4],
        y: [-3, 4],
        functions: [
          { kind: 'linear', k: 0, n: 2, label: 'y = 2' },
          { kind: 'vertical', x: -2, label: 'x = −2', color: 'teal' },
        ],
      },
    },
    {
      title: 'Fordított arányosság: y = 6/x (mindkét ág)',
      figure: {
        type: 'coordinate',
        x: [-7, 7],
        y: [-7, 7],
        functions: [{ kind: 'inverse', k: 6, label: 'y = 6/x' }],
      },
    },
    {
      title: 'Fordított arányosság csak pozitív ágon, pontokkal',
      note: 'positiveOnly: true (sebesség–idő)',
      figure: {
        type: 'coordinate',
        x: [0, 12],
        y: [0, 12],
        axisLabels: ['v', 't'],
        functions: [{ kind: 'inverse', k: 12, positiveOnly: true, label: 't = 12/v', color: 'red' }],
        points: [
          { at: [2, 6], projections: true },
          { at: [4, 3], projections: true },
          { at: [6, 2], projections: true },
        ],
      },
    },
    {
      title: 'Sokszög csúcsnevekkel, kitöltve',
      figure: {
        type: 'coordinate',
        x: [-1, 7],
        y: [-1, 5],
        polygons: [{ points: [[1, 1], [6, 1], [5, 4], [2, 4]], fill: true, vertexLabels: ['A', 'B', 'C', 'D'] }],
      },
    },
    {
      title: 'Háromszög tükrözése az y tengelyre (két sokszög)',
      figure: {
        type: 'coordinate',
        x: [-6, 6],
        y: [-1, 5],
        polygons: [
          { points: [[1, 1], [4, 1], [2, 4]], fill: true, vertexLabels: ['A', 'B', 'C'] },
          { points: [[-1, 1], [-4, 1], [-2, 4]], fill: 'orange', color: 'orange', vertexLabels: ['A′', 'B′', 'C′'] },
        ],
      },
    },
    {
      title: 'Rács nélkül, O kezdőpont, üres pont',
      figure: {
        type: 'coordinate',
        x: [-2, 5],
        y: [-2, 4],
        grid: false,
        originLabel: 'O',
        points: [
          { at: [3, 2], label: 'P', hollow: true },
          { at: [1, 3], label: 'Q', color: 'highlight' },
        ],
      },
    },
    {
      title: 'Csak a pozitív síknegyed (a tartomány a 0-t mindig tartalmazza)',
      figure: {
        type: 'coordinate',
        x: [2, 9],
        y: [1, 6],
        points: [{ at: [7, 5], label: 'K', showCoords: true }],
        segments: [{ from: [3, 2], to: [7, 5], label: '5', color: 'highlight' }],
      },
    },
  ],
};
