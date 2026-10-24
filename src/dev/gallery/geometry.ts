import type { GallerySection } from './types';

export const section: GallerySection = {
  title: 'Általános geometria (geometry)',
  types: ['geometry'],
  entries: [
    {
      title: 'Derékszögű háromszög négyzetekkel (Pitagorasz)',
      figure: {
        type: 'geometry',
        points: { A: [4, 0], B: [0, 3], C: [0, 0] },
        items: [
          { kind: 'squareOnSide', from: 'C', to: 'A', side: 'right', fill: 'blue', label: 'b²', grid: true },
          { kind: 'squareOnSide', from: 'B', to: 'C', side: 'right', fill: 'green', label: 'a²', grid: true },
          { kind: 'squareOnSide', from: 'A', to: 'B', side: 'right', fill: 'orange', label: 'c²', grid: true },
          { kind: 'polygon', points: ['A', 'B', 'C'], sideLabels: ['c', 'a', 'b'], fill: true },
          { kind: 'angle', vertex: 'C', from: 'A', to: 'B', right: true },
        ],
      },
    },
    {
      title: 'Pontok, szakaszok, egyenes, félegyenes',
      figure: {
        type: 'geometry',
        points: { A: [0, 0], B: [4, 1], C: [1, 3], D: [5, 3] },
        items: [
          { kind: 'line', through: ['A', 'B'], label: 'e' },
          { kind: 'ray', from: 'C', through: 'D', label: 'f' },
          { kind: 'segment', from: 'A', to: 'C', label: '|AC|', ticks: 1 },
          { kind: 'segment', from: 'B', to: 'D', dashed: true, ticks: 1, color: 'highlight' },
          { kind: 'point', at: 'A' },
          { kind: 'point', at: 'B' },
          { kind: 'point', at: 'C' },
          { kind: 'point', at: 'D' },
        ],
      },
    },
    {
      title: 'Szögek ívvel és címkével',
      figure: {
        type: 'geometry',
        points: { O: [0, 0], A: [5, 0], B: [3, 3.5], C: [-3, 2] },
        items: [
          { kind: 'ray', from: 'O', through: 'A' },
          { kind: 'ray', from: 'O', through: 'B' },
          { kind: 'ray', from: 'O', through: 'C' },
          { kind: 'angle', vertex: 'O', from: 'A', to: 'B', label: 'α', fill: true },
          { kind: 'angle', vertex: 'O', from: 'B', to: 'C', label: 'β', arcs: 2, color: 'highlight' },
          { kind: 'point', at: 'O', labelDir: 's' },
          { kind: 'point', at: 'A' },
          { kind: 'point', at: 'B' },
          { kind: 'point', at: 'C' },
        ],
      },
    },
    {
      title: 'Magasság a háromszögön kívül (tompaszögű)',
      figure: {
        type: 'geometry',
        points: { A: [0, 0], B: [3, 0], C: [5, 3] },
        items: [
          { kind: 'polygon', points: ['A', 'B', 'C'], fill: true, sideLabels: ['c', 'a', 'b'] },
          { kind: 'height', from: 'C', base: ['A', 'B'], label: 'm', footLabel: 'T', color: 'highlight' },
        ],
      },
    },
    {
      title: 'Kör, körív, körcikk',
      figure: {
        type: 'geometry',
        points: { O: [0, 0], P: [3, 0] },
        items: [
          { kind: 'circle', center: 'O', radius: 3 },
          { kind: 'sector', center: 'O', radius: 3, from: 20, to: 100, label: '80°' },
          { kind: 'segment', from: 'O', to: 'P', label: 'r' },
          { kind: 'arc', center: 'O', radius: 3.6, from: 200, to: 300, color: 'highlight', dashed: true },
          { kind: 'point', at: 'O', labelDir: 'sw' },
        ],
      },
    },
    {
      title: 'Párhuzamos jelölés, terület satírozás, rácson',
      figure: {
        type: 'geometry',
        grid: true,
        points: { A: [0, 0], B: [6, 0], C: [5, 3], D: [1, 3] },
        items: [
          { kind: 'region', points: ['A', 'B', 'C', 'D'], fill: 'accent', hatch: true },
          { kind: 'polygon', points: ['A', 'B', 'C', 'D'], sideLabels: ['a', 'b', 'c', 'd'], ticks: [0, 1, 0, 1] },
          { kind: 'parallel', from: 'A', to: 'B' },
          { kind: 'parallel', from: 'D', to: 'C' },
        ],
      },
    },
    {
      title: 'Nagyon lapos háromszög (szélsőséges eset)',
      figure: {
        type: 'geometry',
        points: { A: [0, 0], B: [10, 0], C: [5, 0.4] },
        items: [{ kind: 'polygon', points: ['A', 'B', 'C'], sideLabels: ['c = 10 cm', 'a = 5,02 cm', 'b = 5,02 cm'] }],
      },
    },
    {
      title: 'Hosszú címkék, nagy számok',
      figure: {
        type: 'geometry',
        points: { A: [0, 0], B: [12000, 0], C: [12000, 5000] },
        items: [
          { kind: 'polygon', points: ['A', 'B', 'C'], sideLabels: ['12 000 m', '5000 m', 'átfogó = 13 000 m'] },
          { kind: 'angle', vertex: 'B', from: 'A', to: 'C', right: true },
        ],
      },
    },
    {
      title: 'Apró sugár, nem méretarányos',
      figure: {
        type: 'geometry',
        notToScale: true,
        points: { O: [0, 0], A: [0.02, 0] },
        items: [
          { kind: 'circle', center: 'O', radius: 0.02, fill: true },
          { kind: 'segment', from: 'O', to: 'A', label: 'r = 0,02 mm' },
        ],
      },
    },
  ],
};
