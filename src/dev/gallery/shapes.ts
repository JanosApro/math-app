import type { GallerySection } from './types';
import type { XY } from '../../figures/types';

/** Rotated right triangle like the Pythagoras lesson's helper (right angle at the 3rd vertex). */
const turned = (a: number, b: number, deg: number): [XY, XY, XY] => {
  const t = (deg * Math.PI) / 180;
  const rot = (x: number, y: number): XY => [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
  return [rot(b, 0), rot(0, a), rot(0, 0)];
};

export const section: GallerySection = {
  title: 'Kész síkidomok (triangle, quadrilateral, regularPolygon, circle)',
  types: ['triangle', 'quadrilateral', 'regularPolygon', 'circle'],
  entries: [
    // ---------------------------------------------------------------- triangle
    {
      title: 'Derékszögű háromszög befogókkal (legs)',
      figure: { type: 'triangle', legs: [3, 4], sideLabels: { a: '3 cm', b: '4 cm', c: 'c = ?' }, highlight: ['c'] },
    },
    {
      title: 'Oldalakból, szögekkel és magassággal',
      figure: { type: 'triangle', sides: [5, 6, 7], angleLabels: { A: 'α', B: 'β', C: 'γ' }, heights: [{ from: 'C', label: 'm', footLabel: 'T' }], sideLabels: { a: 'a', b: 'b', c: 'c' } },
    },
    {
      title: 'Tompaszögű: magasságok a háromszögön kívül',
      note: 'a talppont az oldal meghosszabbításán van (szaggatott)',
      figure: { type: 'triangle', sides: [8, 4, 5], heights: [{ from: 'C', label: 'm' }, { from: 'B', label: 'm′' }], angleLabels: { A: 'α' }, fill: false },
    },
    {
      title: 'Nagyon lapos egyenlő szárú háromszög',
      figure: { type: 'triangle', sides: [5.2, 5.2, 10], ticks: { a: 1, b: 1 }, sideLabels: { a: '5,2 cm', b: '5,2 cm', c: '10 cm' }, angleLabels: { C: 'γ' } },
    },
    {
      title: 'Nagyon hegyes háromszög (kicsi a oldal)',
      figure: { type: 'triangle', sides: [1, 8, 8.5], sideLabels: { a: '1', b: '8', c: '8,5' }, angleLabels: { A: 'α' } },
    },
    {
      title: 'Négyzetek az oldalakon (Pitagorasz)',
      figure: { type: 'triangle', legs: [3, 4], squares: { a: 'a² = 9', b: 'b² = 16', c: 'c² = 25' } },
    },
    {
      title: 'Négyzetek, hosszú címkék, 7–24–25',
      note: 'a lecke square-areas generátora: a kis négyzetbe nem fér a címke',
      figure: { type: 'triangle', legs: [7, 24], squares: { a: '49 cm²', b: '576 cm²', c: '?' } },
    },
    {
      title: 'Négyzetek, a = 1, b = 8 (explore szélső eset)',
      figure: { type: 'triangle', legs: [1, 8], squares: { a: '1', b: '64', c: '65' } },
    },
    {
      title: 'Elforgatott derékszögű háromszög négyzetekkel',
      figure: { type: 'triangle', coords: turned(5, 12, 200), vertices: ['L', 'M', 'K'], rightAngleAt: 'C', squares: { a: '25', b: '144', c: '169' }, sideLabels: { c: 'c = ?' } },
    },
    {
      title: 'Elforgatott háromszög, nevek (coords)',
      figure: { type: 'triangle', coords: turned(3, 5, 200), vertices: ['L', 'M', 'K'], rightAngleAt: 'C', sideLabels: { a: '3 cm', b: '5 cm', c: 'KL = ?' }, highlight: ['c'], fill: true },
    },
    {
      title: 'Átfogóval lent (pose: hypotenuse), magasság az átfogóra',
      figure: { type: 'triangle', legs: [3, 4], pose: 'hypotenuse', heights: [{ from: 'C', label: 'm', footLabel: 'T' }], sideLabels: { a: 'a', b: 'b', c: 'c' } },
    },
    {
      title: 'Súlyvonalak',
      figure: { type: 'triangle', sides: [6, 5, 4], medians: [{ from: 'A', label: 'sₐ' }, { from: 'B', label: 's′' }] },
    },
    {
      title: 'Szabályos háromszög jelölésekkel',
      figure: { type: 'triangle', sides: [4, 4, 4], ticks: { a: 1, b: 1, c: 1 }, angleLabels: { A: '60°', B: '60°', C: '60°' } },
    },
    // ---------------------------------------------------------------- quadrilateral
    {
      title: 'Négyzet átlóval',
      figure: { type: 'quadrilateral', shape: 'square', a: 4, sideLabels: { a: 'a' }, diagonals: { e: 'd' } },
    },
    {
      title: 'Téglalap átlókkal',
      figure: { type: 'quadrilateral', shape: 'rectangle', a: 6, b: 3.5, sideLabels: { a: '6 cm', b: '3,5 cm' }, diagonals: { e: 'e', f: 'f' } },
    },
    {
      title: 'Rombusz átlókkal megadva (e, f)',
      note: 'derékszög jel az átlók metszéspontjában',
      figure: { type: 'quadrilateral', shape: 'rhombus', e: 8, f: 5, diagonals: { e: 'e = 8 cm', f: 'f = 5 cm' }, sideLabels: { a: 'a = ?' }, highlight: ['a'] },
    },
    {
      title: 'Rombusz oldallal és szöggel, kiemelt háromszög',
      figure: { type: 'quadrilateral', shape: 'rhombus', a: 4, angle: 60, angleLabels: { A: 'α' }, diagonals: true, highlightTriangle: ['A', 'O', 'D'] },
    },
    {
      title: 'Paralelogramma magassággal',
      figure: { type: 'quadrilateral', shape: 'parallelogram', a: 6, b: 3, angle: 55, sideLabels: { a: 'a', b: 'b' }, height: { label: 'm' }, angleLabels: { A: 'α' } },
    },
    {
      title: 'Egyenlő szárú trapéz magassággal',
      figure: { type: 'quadrilateral', shape: 'trapezoid', a: 7, c: 3, m: 3, sideLabels: { a: 'a', b: 'b', c: 'c', d: 'd' }, height: { label: 'm' }, ticks: { b: 1, d: 1 } },
    },
    {
      title: 'Derékszögű trapéz (shift: 0)',
      figure: { type: 'quadrilateral', shape: 'trapezoid', a: 6, c: 3.5, m: 3, shift: 0, sideLabels: { a: '6 cm', c: '3,5 cm', d: '3 cm', b: 'b = ?' }, highlight: ['b'], height: { label: 'm' } },
    },
    {
      title: 'Ferde trapéz (negatív shift), kiemelt háromszög a talpponttal',
      figure: { type: 'quadrilateral', shape: 'trapezoid', a: 5, c: 3, m: 2.5, shift: -1, height: { label: 'm' }, highlightTriangle: ['B', 'C', 'T'] },
    },
    {
      title: 'Deltoid átlókkal',
      figure: { type: 'quadrilateral', shape: 'deltoid', e: 7, f: 5, diagonals: { e: 'e', f: 'f' }, sideLabels: { a: 'a', b: 'b' } },
    },
    // ---------------------------------------------------------------- regular polygon
    {
      title: 'Szabályos háromszög (n = 3) középponttal',
      figure: { type: 'regularPolygon', n: 3, sideLabel: 'a', radius: 'rₖ', apothem: 'r', centralAngle: true },
    },
    {
      title: 'Szabályos hatszög (n = 6), jellemző háromszög',
      figure: { type: 'regularPolygon', n: 6, side: 4, sideLabel: 'a', radius: 'rₖ', apothem: 'ρ', centralAngle: '60°' },
    },
    {
      title: 'Szabályos ötszög minden átlóval',
      figure: { type: 'regularPolygon', n: 5, diagonals: 'all', fill: false },
    },
    {
      title: 'Szabályos 12-szög, átlók egy csúcsból, csúcsnevek nélkül',
      figure: { type: 'regularPolygon', n: 12, vertices: false, sideLabel: 'a', diagonals: 'fromOne' },
    },
    {
      title: 'Szabályos nyolcszög, színes kitöltés',
      figure: { type: 'regularPolygon', n: 8, fill: 'teal', center: true, sideLabel: 'a' },
    },
    // ---------------------------------------------------------------- circle
    {
      title: 'Kör sugárral és körcikkel',
      figure: { type: 'circle', r: 3, radius: 'r', sector: { angle: 60, label: '60°' } },
    },
    {
      title: 'Átmérő és húr',
      figure: { type: 'circle', r: 3, diameter: 'd', chord: { angle: 100, label: 'h' } },
    },
    {
      title: 'Érintő a sugár végpontjában',
      figure: { type: 'circle', r: 2.5, radius: 'r', tangent: { at: 40, label: 'e' } },
    },
    {
      title: 'Nagy körcikk (250°) ívcímkével',
      figure: { type: 'circle', r: 3, sector: { angle: 250, label: 'α', arcLabel: 'i' }, radius: 'r' },
    },
    {
      title: 'Minden egyszerre (sugár, átmérő, húr, érintő)',
      figure: { type: 'circle', r: 3, radius: 'r', diameter: 'd', chord: { angle: 70, label: 'h' }, tangent: { at: 120, label: 't' } },
    },
    {
      title: 'Apró sugár, nem méretarányos',
      figure: { type: 'circle', r: 0.05, radius: 'r = 0,05 mm', notToScale: true, centerLabel: 'K' },
    },
  ],
};
