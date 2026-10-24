import type { GallerySection } from './types';

export const section: GallerySection = {
  title: 'Testek (solid)',
  types: ['solid'],
  entries: [
    {
      title: 'Kocka, a = 4 cm, csúcsnevek',
      figure: { type: 'solid', shape: 'cube', a: 4, labels: { a: 'a = 4 cm' }, vertexLabels: true },
    },
    {
      title: 'Kocka testátlója, kiemelt háromszög',
      note: "triangle: 'diagonal' + spaceDiagonal + faceDiagonal",
      figure: { type: 'solid', shape: 'cube', a: 3, labels: { a: 'a', faceDiagonal: 'd', spaceDiagonal: 'D' }, triangle: 'diagonal' },
    },
    {
      title: 'Téglatest a, b, c élekkel',
      figure: { type: 'solid', shape: 'cuboid', a: 6, b: 3, c: 4, labels: { a: 'a = 6 cm', b: 'b = 3 cm', c: 'c = 4 cm' } },
    },
    {
      title: 'Téglatest: lapátló a kiemelt alaplapon',
      note: "triangle: 'face', highlight: faceDiagonal",
      figure: { type: 'solid', shape: 'cuboid', a: 5, b: 4, c: 3, labels: { a: '5', b: '4', faceDiagonal: 'e = ?' }, highlight: ['faceDiagonal'], triangle: 'face' },
    },
    {
      title: 'Téglatest testátló, csúcsnevek, kitöltés nélkül',
      note: 'fill: false, vertexLabels: true',
      figure: { type: 'solid', shape: 'cuboid', a: 4, b: 3, c: 5, labels: { spaceDiagonal: 'd' }, vertexLabels: true, fill: false },
    },
    {
      title: 'Lapos téglatest (lemez): 8 × 6 × 0,5',
      figure: { type: 'solid', shape: 'cuboid', a: 8, b: 6, c: 0.5, labels: { a: '8 cm', b: '6 cm', c: '0,5 cm' } },
    },
    {
      title: 'Magas téglatest (torony): 2 × 2 × 10',
      figure: { type: 'solid', shape: 'cuboid', a: 2, b: 2, c: 10, labels: { a: '2 m', c: '10 m' } },
    },
    {
      title: 'Háromoldalú hasáb (n = 3)',
      figure: { type: 'solid', shape: 'prism', base: 'triangle', a: 4, h: 6, labels: { a: 'a = 4 cm', h: 'H = 6 cm' } },
    },
    {
      title: 'Négyzet alapú hasáb (n = 4) alapátlóval',
      figure: { type: 'solid', shape: 'prism', base: 'square', a: 3, h: 5, labels: { a: 'a', h: 'H', baseDiagonal: 'd' } },
    },
    {
      title: 'Téglalap alapú hasáb (b él)',
      figure: { type: 'solid', shape: 'prism', base: 'rectangle', a: 5, b: 2, h: 4, labels: { a: 'a', b: 'b', h: 'H' } },
    },
    {
      title: 'Ötoldalú szabályos hasáb (n = 5)',
      figure: { type: 'solid', shape: 'prism', base: 'regular', n: 5, a: 3, h: 5, labels: { a: 'a = 3 cm', h: 'H = 5 cm' } },
    },
    {
      title: 'Hatoldalú hasáb (n = 6), testátló háromszöggel',
      figure: { type: 'solid', shape: 'prism', base: 'hexagon', a: 2, h: 5, labels: { a: 'a', spaceDiagonal: 'D' }, triangle: 'diagonal' },
    },
    {
      title: 'Nyolcoldalú hasáb (n = 8), csúcsnevek',
      figure: { type: 'solid', shape: 'prism', base: 'regular', n: 8, a: 2, h: 4, vertexLabels: true },
    },
    {
      title: 'Háromoldalú gúla (n = 3)',
      figure: { type: 'solid', shape: 'pyramid', base: 'triangle', a: 5, h: 6, labels: { a: 'a', h: 'H' }, vertexLabels: true },
    },
    {
      title: 'Négyzet alapú gúla: apotéma + oldallap magassága',
      note: "triangle: 'axial' (H, apotéma, s)",
      figure: { type: 'solid', shape: 'pyramid', base: 'square', a: 6, h: 5, labels: { a: 'a = 6 cm', h: 'H', s: 's', apothem: 'a/2' }, triangle: 'axial' },
    },
    {
      title: 'Négyzet alapú gúla: oldalél + alapátló',
      note: "triangle: 'edge'",
      figure: { type: 'solid', shape: 'pyramid', base: 'square', a: 4, h: 6, labels: { edge: 'b = ?', baseDiagonal: 'd', h: 'H' }, highlight: ['edge'], triangle: 'edge' },
    },
    {
      title: 'Téglalap alapú gúla',
      figure: { type: 'solid', shape: 'pyramid', base: 'rectangle', a: 6, b: 4, h: 5, labels: { a: 'a = 6', b: 'b = 4', h: 'H = 5' } },
    },
    {
      title: 'Ötoldalú gúla (n = 5)',
      figure: { type: 'solid', shape: 'pyramid', base: 'regular', n: 5, a: 3, h: 5, labels: { a: 'a', h: 'H' } },
    },
    {
      title: 'Hatoldalú gúla (n = 6) oldaléllel',
      figure: { type: 'solid', shape: 'pyramid', base: 'hexagon', a: 3, h: 6, labels: { a: 'a', edge: 'b' }, vertexLabels: true },
    },
    {
      title: 'Nyolcoldalú gúla (n = 8)',
      figure: { type: 'solid', shape: 'pyramid', base: 'regular', n: 8, a: 2, h: 5, labels: { h: 'H' } },
    },
    {
      title: 'Henger r = 3, H = 7',
      figure: { type: 'solid', shape: 'cylinder', r: 3, h: 7, labels: { r: 'r = 3 cm', h: 'H = 7 cm' } },
    },
    {
      title: 'Henger átmérővel, kiemelt magasság',
      figure: { type: 'solid', shape: 'cylinder', r: 4, h: 6, labels: { d: 'd = 8 cm', h: 'H = ?' }, highlight: ['h'] },
    },
    {
      title: 'Lapos henger (érme): r = 5, H = 0,6',
      figure: { type: 'solid', shape: 'cylinder', r: 5, h: 0.6, labels: { r: 'r = 5 mm', h: 'H = 0,6 mm' } },
    },
    {
      title: 'Magas henger (cső): r = 1, H = 12',
      figure: { type: 'solid', shape: 'cylinder', r: 1, h: 12, labels: { r: 'r', h: 'H' } },
    },
    {
      title: 'Nagyon kicsi sugár: r = 0,2, H = 6',
      figure: { type: 'solid', shape: 'cylinder', r: 0.2, h: 6, labels: { h: 'H = 6 cm' } },
    },
    {
      title: 'Hatalmas számok: r = 1200, H = 900',
      note: 'az arányok a számoktól függetlenek',
      figure: { type: 'solid', shape: 'cylinder', r: 1200, h: 900, labels: { r: 'r = 1200 m', h: 'H = 900 m' } },
    },
    {
      title: 'Hosszú címkék',
      figure: { type: 'solid', shape: 'cylinder', r: 3, h: 5, labels: { r: 'alapkör sugara = 3 cm', h: 'a henger magassága = 5 cm' } },
    },
    {
      title: 'Kúp: r, H, alkotó, tengelymetszet-háromszög',
      note: "triangle: 'axial' (Pitagorasz-tétel a kúpban)",
      figure: { type: 'solid', shape: 'cone', r: 3, h: 4, labels: { r: 'r = 3', h: 'H = 4', s: 's = ?' }, triangle: 'axial' },
    },
    {
      title: 'Kúp átmérővel és sugárral',
      figure: { type: 'solid', shape: 'cone', r: 4, h: 6, labels: { d: 'd', r: 'r' } },
    },
    {
      title: 'Lapos kúp: r = 6, H = 1,5',
      figure: { type: 'solid', shape: 'cone', r: 6, h: 1.5, labels: { r: 'r', h: 'H' } },
    },
    {
      title: 'Hegyes kúp: r = 1, H = 9, csúcsnevek',
      figure: { type: 'solid', shape: 'cone', r: 1, h: 9, labels: { s: 's' }, vertexLabels: true },
    },
    {
      title: 'Gömb sugárral',
      figure: { type: 'solid', shape: 'sphere', r: 3, labels: { r: 'r = 3 cm' } },
    },
    {
      title: 'Gömb sugárral és átmérővel',
      figure: { type: 'solid', shape: 'sphere', r: 5, labels: { r: 'r', d: 'd = 10 cm' }, vertexLabels: true },
    },
    {
      title: 'Nem méretarányos, felirattal',
      figure: { type: 'solid', shape: 'cuboid', a: 30, b: 2, c: 3, labels: { a: '30 m', b: '2 m', c: '3 m' }, notToScale: true, caption: 'Egy úszómedence' },
    },
  ],
};
