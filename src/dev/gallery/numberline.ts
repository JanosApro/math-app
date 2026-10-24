import type { GallerySection } from './types';

export const section: GallerySection = {
  title: 'Számegyenes (numberLine)',
  types: ['numberLine'],
  entries: [
    {
      title: 'Egész számok, pontok betűvel',
      figure: { type: 'numberLine', min: -5, max: 5, step: 1, points: [{ value: -3, label: 'A' }, { value: 2, label: 'B' }] },
    },
    {
      title: 'Negyedek törtként (nevező 4)',
      figure: { type: 'numberLine', min: 0, max: 2, step: 1, subdivisions: 4, tickLabels: 'all', fractionDenominator: 4, points: [{ value: 0.75, label: 'P' }] },
    },
    {
      title: 'Törtek a pontoknál, nem minden osztásnál szám',
      figure: { type: 'numberLine', min: 0, max: 3, step: 1, subdivisions: 3, points: [{ value: 1 / 3, label: 'A' }, { value: 5 / 3, label: 'B' }, { value: 8 / 3, label: 'C' }] },
    },
    {
      title: 'Tizedek: 0,1-es lépésköz',
      figure: { type: 'numberLine', min: 0, max: 1, step: 0.1, points: [{ value: 0.3, label: 'A' }, { value: 0.85, label: 'B', color: 'highlight' }] },
    },
    {
      title: 'Tizedek kisebb osztással (1-esek, 10 részre)',
      figure: { type: 'numberLine', min: 2, max: 4, step: 1, subdivisions: 10, points: [{ value: 2.7, label: '2,7' }, { value: 3.25, label: '3,25', below: true }] },
    },
    {
      title: 'Negatív számok és ellentett',
      figure: { type: 'numberLine', min: -6, max: 6, step: 1, points: [{ value: -4, label: '−4' }, { value: 4, label: '4' }], jumps: [{ from: 0, to: -4, label: '4 egység' }, { from: 0, to: 4, label: '4 egység' }] },
    },
    {
      title: 'Összeadás ugrásokkal: −2 + 5 = 3',
      figure: { type: 'numberLine', min: -4, max: 5, step: 1, points: [{ value: -2 }, { value: 3, color: 'good' }], jumps: [{ from: -2, to: 3 }] },
    },
    {
      title: 'Két ugrás egymás után: 4 − 6 + 3',
      figure: { type: 'numberLine', min: -3, max: 5, step: 1, jumps: [{ from: 4, to: -2 }, { from: -2, to: 1, color: 'green' }] },
    },
    {
      title: 'Zárt intervallum [−2; 3]',
      figure: { type: 'numberLine', min: -4, max: 5, step: 1, intervals: [{ from: -2, to: 3 }] },
    },
    {
      title: 'Nyílt és félig nyílt intervallum',
      figure: {
        type: 'numberLine',
        min: -3,
        max: 6,
        step: 1,
        intervals: [
          { from: -2, to: 1, fromClosed: false, toClosed: false, label: ']−2; 1[' },
          { from: 2, to: 5, toClosed: false, label: '[2; 5[' },
        ],
      },
    },
    {
      title: 'Félegyenesek: x ≥ 1 és x < −1',
      figure: {
        type: 'numberLine',
        min: -4,
        max: 4,
        step: 1,
        intervals: [
          { from: 1, to: Infinity, label: 'x ≥ 1' },
          { from: -Infinity, to: -1, toClosed: false, label: 'x < −1' },
        ],
      },
    },
    {
      title: 'Nagy számok: ezresek',
      figure: { type: 'numberLine', min: 0, max: 10000, step: 1000, points: [{ value: 3500, label: 'A' }, { value: 7250, label: 'B' }] },
    },
    {
      title: 'Csak a végpontok számozva, üres pont',
      figure: { type: 'numberLine', min: 0, max: 1, step: 1, subdivisions: 8, tickLabels: 'ends', points: [{ value: 5 / 8, label: '?', open: true }] },
    },
    {
      title: 'Saját számozás (listával)',
      figure: { type: 'numberLine', min: -10, max: 10, step: 1, tickLabels: [-10, -5, 0, 5, 10], points: [{ value: -7, label: 'A' }, { value: 6, label: 'B' }] },
    },
  ],
};
