import type { GallerySection } from './types';

export const section: GallerySection = {
  title: 'Testhálók (net)',
  types: ['net'],
  entries: [
    {
      title: 'Kocka hálója',
      figure: { type: 'net', of: 'cube', a: 3, labels: { a: 'a = 3 cm' } },
    },
    {
      title: 'Kocka hálója, egyszínű lapok',
      note: 'colorFaces: false',
      figure: { type: 'net', of: 'cube', a: 2, colorFaces: false },
    },
    {
      title: 'Téglatest hálója',
      figure: { type: 'net', of: 'cuboid', a: 5, b: 3, c: 2, labels: { a: 'a = 5 cm', b: 'b = 3 cm', c: 'c = 2 cm' } },
    },
    {
      title: 'Magas téglatest hálója',
      figure: { type: 'net', of: 'cuboid', a: 2, b: 2, c: 7, labels: { a: '2', b: '2', c: '7' } },
    },
    {
      title: 'Háromoldalú hasáb hálója',
      figure: { type: 'net', of: 'triangularPrism', a: 3, h: 5, labels: { a: 'a = 3 cm', h: 'H = 5 cm' } },
    },
    {
      title: 'Négyzet alapú gúla hálója (oldallap magassága)',
      figure: { type: 'net', of: 'squarePyramid', a: 4, s: 5, labels: { a: 'a = 4 cm', s: 's = 5 cm' } },
    },
    {
      title: 'Lapos gúla hálója: s alig nagyobb, mint a/2',
      figure: { type: 'net', of: 'squarePyramid', a: 6, s: 3.5, labels: { a: 'a', s: 's' } },
    },
    {
      title: 'Henger hálója (a téglalap hossza 2rπ)',
      figure: { type: 'net', of: 'cylinder', r: 2, h: 5, labels: { r: 'r = 2 cm', h: 'H = 5 cm', a: '2rπ' } },
    },
    {
      title: 'Lapos henger hálója: r = 3, H = 1',
      figure: { type: 'net', of: 'cylinder', r: 3, h: 1, labels: { r: 'r', h: 'H' } },
    },
    {
      title: 'Kúp hálója (körcikk: 360° · r / s)',
      figure: { type: 'net', of: 'cone', r: 3, s: 5, labels: { r: 'r = 3 cm', s: 's = 5 cm' } },
    },
    {
      title: 'Hegyes kúp hálója: r = 1, s = 6',
      figure: { type: 'net', of: 'cone', r: 1, s: 6, labels: { r: 'r', s: 's' } },
    },
    {
      title: 'Széles kúp hálója: r = 4, s = 5 (288°-os körcikk)',
      figure: { type: 'net', of: 'cone', r: 4, s: 5, labels: { s: 's' } },
    },
  ],
};
