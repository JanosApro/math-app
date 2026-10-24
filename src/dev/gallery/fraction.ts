import type { GallerySection } from './types';

export const section: GallerySection = {
  title: 'Törtmodell és szalagmodell (fractionModel, barModel)',
  types: ['fractionModel', 'barModel'],
  entries: [
    {
      title: 'Kör (pizza): 3/4',
      figure: { type: 'fractionModel', shape: 'circle', parts: 4, shaded: 3, label: '3/4' },
    },
    {
      title: 'Kör 8 részre, narancs: 5/8',
      figure: { type: 'fractionModel', shape: 'circle', parts: 8, shaded: 5, color: 'orange', label: '5/8' },
    },
    {
      title: 'Szalag (csokoládé): 2/5',
      figure: { type: 'fractionModel', shape: 'bar', parts: 5, shaded: 2, label: '2/5' },
    },
    {
      title: 'Téglalap rács (rows nélkül: 3 × 4): 7/12',
      note: 'rows default: a √parts-hoz legközelebbi osztó',
      figure: { type: 'fractionModel', shape: 'rect', parts: 12, shaded: 7, color: 'green', label: '7/12' },
    },
    {
      title: '10 × 10-es rács: 37%',
      note: 'nem tört alakú címke → sima szöveg',
      figure: { type: 'fractionModel', shape: 'rect', parts: 100, rows: 10, shaded: 37, color: 'purple', label: '37%' },
    },
    {
      title: 'Áltört körökkel: 7/4 = 1 3/4',
      note: 'shaded > parts → több egész egymás mellett; vegyes szám címke',
      figure: { type: 'fractionModel', shape: 'circle', parts: 4, shaded: 7, label: '1 3/4' },
    },
    {
      title: 'Áltört szalagokkal: 5/3',
      note: 'a szalag-egészek egymás alatt',
      figure: { type: 'fractionModel', shape: 'bar', parts: 3, shaded: 5, color: 'teal', label: '5/3' },
    },
    {
      title: 'Áltört rácsokkal: 11/6 (2 sor)',
      figure: { type: 'fractionModel', shape: 'rect', parts: 6, rows: 2, shaded: 11, label: '11/6' },
    },
    {
      title: 'Egy egész (parts: 1)',
      figure: { type: 'fractionModel', shape: 'circle', parts: 1, shaded: 1, label: '1' },
    },
    {
      title: 'Semmi sincs színezve, 12 szelet',
      figure: { type: 'fractionModel', shape: 'circle', parts: 12, shaded: 0, label: '0/12' },
    },
    {
      title: 'Szélsőséges: 6 egész (16/3)',
      note: 'legfeljebb 6 egész; 4–6 egész két sorban',
      figure: { type: 'fractionModel', shape: 'circle', parts: 3, shaded: 16, label: '16/3', size: 'large' },
    },
    {
      title: 'Szélsőséges: 24 részes szalag, kicsi',
      figure: { type: 'fractionModel', shape: 'bar', parts: 24, shaded: 10, size: 'small', label: '10/24' },
    },
    {
      title: 'Szalagmodell: a + b = 120',
      figure: { type: 'barModel', rows: [{ segments: [{ value: 70, label: 'a' }, { value: 50, label: 'b' }] }], total: { label: '120' } },
    },
    {
      title: 'Az összeg változása (5. osztály stílus)',
      note: 'két sor, kék a, piros b, zöld n; kapcsos zárójelek mindkét soron',
      figure: {
        type: 'barModel',
        rows: [
          { segments: [{ value: 5, label: 'a', color: 'blue' }, { value: 3, label: 'b', color: 'red' }, { value: 2, label: 'n', color: 'green' }] },
          { segments: [{ value: 8, label: 'a + b', color: 'purple' }, { value: 2, label: 'n', color: 'green' }] },
        ],
        braces: [
          { row: 0, segments: [1, 2], label: 'b + n', side: 'above' },
          { row: 1, label: '(a + b) + n' },
        ],
      },
    },
    {
      title: 'Összehasonlítás: mennyivel több?',
      note: 'sorcímkék; a kapcsos zárójel span-je túlnyúlik a sor végén (a különbség)',
      figure: {
        type: 'barModel',
        rows: [
          { label: 'Anna', segments: [{ value: 350, label: '350 din', color: 'blue' }] },
          { label: 'Béla', segments: [{ value: 350, label: '350 din', color: 'blue' }, { value: 150, unknown: true }] },
        ],
        braces: [{ row: 0, span: [350, 500], label: '150 din', color: 'highlight' }],
        total: { label: '? din', row: 1 },
      },
    },
    {
      title: 'Ismeretlen darab (szalag maradéka)',
      figure: {
        type: 'barModel',
        rows: [{ segments: [{ value: 35, label: '0,35 m', color: 'red' }, { value: 40, label: '0,4 m', color: 'orange' }, { value: 45, unknown: true }] }],
        total: { label: '1,2 m' },
      },
    },
    {
      title: 'Törtek a szalagban (lecke stílus)',
      note: "'a/b' címkék emeletes törtként; 'muted' a maradék",
      figure: {
        type: 'barModel',
        rows: [
          { label: '1/2', segments: [{ value: 3, label: '3/6', color: 'blue' }, { value: 3, color: 'muted' }] },
          { label: '1/3', segments: [{ value: 2, label: '2/6', color: 'red' }, { value: 4, color: 'muted' }] },
        ],
        total: { label: '1 egész' },
      },
    },
    {
      title: 'Túl hosszú címke a darab fölé kerül',
      figure: {
        type: 'barModel',
        rows: [{ segments: [{ value: 4, label: 'tej 4 dl' }, { value: 3, label: '3/10' }, { value: 93, label: 'víz' }] }],
        total: { label: '10 dl', side: 'above' },
      },
    },
    {
      title: 'Több kapcsos zárójel egy oldalon (szintek)',
      note: 'az egymást átfedő zárójelek egy szinttel lejjebb kerülnek',
      figure: {
        type: 'barModel',
        rows: [{ segments: [{ value: 2, label: 'x' }, { value: 2, label: 'x' }, { value: 2, label: 'x' }, { value: 5, label: '5' }] }],
        braces: [
          { segments: [0, 2], label: '3x' },
          { segments: [3, 3], label: '5' },
          { label: '3x + 5 = 23' },
        ],
      },
    },
    {
      title: 'Egyenlő részek, sok sor (napok)',
      figure: {
        type: 'barModel',
        rows: [
          { label: '1. nap', segments: [{ value: 1, label: 'x', color: 'teal' }] },
          { label: '2. nap', segments: [{ value: 1, label: 'x', color: 'teal' }, { value: 1, label: 'x', color: 'teal' }] },
          { label: '3. nap', segments: [{ value: 1, label: 'x', color: 'teal' }, { value: 1, label: 'x', color: 'teal' }, { value: 1, label: 'x', color: 'teal' }] },
        ],
        braces: [{ row: 2, label: '3x' }, { row: 0, side: 'above', label: 'x' }],
      },
    },
  ],
};
