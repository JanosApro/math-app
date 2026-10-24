import type { GallerySection } from './types';

const MONTHS = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];

export const section: GallerySection = {
  title: 'Diagramok és táblázatok (barChart, lineChart, pieChart, pictogram, table)',
  types: ['barChart', 'lineChart', 'pieChart', 'pictogram', 'table'],
  entries: [
    // ------------------------------------------------------------------ bar chart
    {
      title: 'Oszlopdiagram értékekkel',
      figure: {
        type: 'barChart',
        categories: ['H', 'K', 'Sze', 'Cs', 'P'],
        series: [{ values: [3, 5, 2, 6, 4] }],
        yLabel: 'tanulók száma',
        showValues: true,
      },
    },
    {
      title: 'Jegyek gyakorisága, tengelyfeliratokkal',
      figure: {
        type: 'barChart',
        categories: ['1', '2', '3', '4', '5'],
        series: [{ values: [1, 4, 7, 9, 5] }],
        xLabel: 'jegy',
        yLabel: 'gyakoriság',
      },
    },
    {
      title: '12 hónap, tizedes értékek',
      note: 'Rövid hónapnevek; ha nem férnek el, függőlegesek lesznek.',
      figure: {
        type: 'barChart',
        categories: MONTHS,
        series: [{ values: [42, 38, 45.5, 51, 68, 85, 72, 60, 55, 49, 52, 47] }],
        yLabel: 'csapadék (mm)',
      },
    },
    {
      title: 'Hosszú kategórianevek (tördelés)',
      figure: {
        type: 'barChart',
        categories: ['magyar nyelv', 'matematika', 'testnevelés', 'képzőművészet', 'földrajz'],
        series: [{ values: [6, 9, 7, 3, 2] }],
        yLabel: 'szavazat',
        showValues: true,
      },
    },
    {
      title: 'Hosszú nevek vízszintes oszlopokkal',
      figure: {
        type: 'barChart',
        horizontal: true,
        categories: ['labdarúgás', 'kosárlabda', 'asztalitenisz', 'úszás', 'kézilabda és röplabda'],
        series: [{ values: [12, 8, 5, 7, 4] }],
        yLabel: 'tanulók száma',
        showValues: true,
      },
    },
    {
      title: 'Több adatsor, jelmagyarázat',
      figure: {
        type: 'barChart',
        categories: ['alma', 'körte', 'szilva', 'barack'],
        series: [
          { name: '7.a', values: [8, 5, 3, 6] },
          { name: '7.b', values: [6, 7, 2, 4] },
          { name: '7.c', values: [9, 3, 4, 5] },
        ],
        yLabel: 'tanulók száma',
      },
    },
    {
      title: 'Nulla értékek',
      figure: {
        type: 'barChart',
        categories: ['0', '1', '2', '3', '4', '5'],
        series: [{ values: [0, 3, 0, 5, 2, 0] }],
        xLabel: 'testvérek száma',
        yLabel: 'tanulók',
        showValues: true,
      },
    },
    {
      title: 'Nagy számok (12 500)',
      figure: {
        type: 'barChart',
        categories: ['2021', '2022', '2023', '2024'],
        series: [{ values: [12500, 9800, 11200, 7400] }],
        yLabel: 'eladott autók (db)',
        showValues: true,
      },
    },
    {
      title: 'Negatív értékek (hőmérséklet)',
      figure: {
        type: 'barChart',
        categories: ['dec.', 'jan.', 'febr.', 'márc.', 'ápr.'],
        series: [{ values: [-2, -5.5, -1, 4, 11] }],
        yLabel: '°C',
        showValues: true,
      },
    },
    {
      title: 'Vízszintes, két adatsor',
      figure: {
        type: 'barChart',
        horizontal: true,
        categories: ['Szabadka', 'Zenta', 'Topolya', 'Magyarkanizsa'],
        series: [
          { name: 'fiúk', values: [14, 9, 11, 6] },
          { name: 'lányok', values: [12, 10, 8, 7] },
        ],
        yLabel: 'versenyzők száma',
        showValues: true,
      },
    },
    {
      title: 'Kis méret, sok adatsor értékekkel',
      figure: {
        type: 'barChart',
        size: 'small',
        categories: ['I.', 'II.', 'III.'],
        series: [
          { name: '2023', values: [4, 6, 5], color: 'teal' },
          { name: '2024', values: [5, 8, 7], color: 'orange' },
        ],
        showValues: true,
      },
    },
    // ------------------------------------------------------------------ line chart
    {
      title: 'Vonaldiagram: hőmérséklet egy nap alatt',
      figure: {
        type: 'lineChart',
        categories: ['6 h', '9 h', '12 h', '15 h', '18 h', '21 h'],
        series: [{ values: [8, 12, 17, 19, 15, 11] }],
        yLabel: 'hőmérséklet (°C)',
        showValues: true,
      },
    },
    {
      title: '12 hónap, két adatsor',
      figure: {
        type: 'lineChart',
        categories: MONTHS,
        series: [
          { name: '2024', values: [-1, 2, 7, 12, 17, 21, 23, 23, 18, 12, 6, 1] },
          { name: '2025', values: [1, 3, 9, 13, 16, 22, 25, 24, 17, 11, 7, 2] },
        ],
        yLabel: '°C',
      },
    },
    {
      title: 'Kinagyított tengely (yMin), tengelytöréssel',
      figure: {
        type: 'lineChart',
        categories: ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek'],
        series: [{ values: [52, 53.5, 53, 54.5, 55] }],
        yMin: 50,
        yLabel: 'testtömeg (kg)',
        showValues: true,
      },
    },
    {
      title: 'Negatív értékek, minden pont felirattal',
      figure: {
        type: 'lineChart',
        categories: MONTHS,
        series: [{ values: [-4, -2, 3, 9, 14, 18, 20, 19, 15, 9, 3, -1] }],
        yLabel: '°C',
        showValues: true,
      },
    },
    {
      title: 'Három adatsor, saját skála (yMax, yStep)',
      figure: {
        type: 'lineChart',
        categories: ['1. hét', '2. hét', '3. hét', '4. hét'],
        series: [
          { name: 'Anna', values: [20, 35, 30, 45] },
          { name: 'Bence', values: [15, 20, 40, 35] },
          { name: 'Csilla', values: [30, 25, 25, 50] },
        ],
        yMax: 60,
        yStep: 10,
        yLabel: 'pont',
        xLabel: 'hét',
      },
    },
    // ------------------------------------------------------------------ pie chart
    {
      title: 'Kördiagram százalékokkal',
      figure: {
        type: 'pieChart',
        slices: [
          { label: 'labdarúgás', value: 10 },
          { label: 'kosárlabda', value: 6 },
          { label: 'úszás', value: 3 },
          { label: 'tenisz', value: 1 },
        ],
      },
    },
    {
      title: 'Sok szelet, 2%-os és 1%-os szelet kívül',
      figure: {
        type: 'pieChart',
        slices: [
          { label: 'busz', value: 31 },
          { label: 'gyalog', value: 24 },
          { label: 'autó', value: 18 },
          { label: 'bicikli', value: 12 },
          { label: 'roller', value: 8 },
          { label: 'vonat', value: 4 },
          { label: 'lovaskocsi', value: 2 },
          { label: 'egyéb', value: 1 },
        ],
      },
    },
    {
      title: 'Értékek a szeleteken (show: value)',
      figure: {
        type: 'pieChart',
        slices: [
          { label: 'piros', value: 12 },
          { label: 'kék', value: 9 },
          { label: 'zöld', value: 6 },
          { label: 'sárga', value: 3 },
        ],
        show: 'value',
      },
    },
    {
      title: 'Nevek a szeleteken (show: label), jelmagyarázat nélkül',
      figure: {
        type: 'pieChart',
        slices: [
          { label: 'alvás', value: 9 },
          { label: 'iskola', value: 6 },
          { label: 'tanulás', value: 2 },
          { label: 'játék', value: 3 },
          { label: 'evés', value: 1.5 },
          { label: 'egyéb', value: 2.5 },
        ],
        show: 'label',
      },
    },
    {
      title: 'Harmadok (33,3%), nulla érték, saját színek',
      figure: {
        type: 'pieChart',
        size: 'small',
        slices: [
          { label: 'igen', value: 1, color: 'good' },
          { label: 'nem', value: 1, color: 'bad' },
          { label: 'nem tudom', value: 1, color: 'muted' },
          { label: 'nem válaszolt', value: 0 },
        ],
      },
    },
    // ------------------------------------------------------------------ pictogram
    {
      title: 'Képdiagram törtrész szimbólumokkal',
      figure: {
        type: 'pictogram',
        rows: [
          { label: '5.a', value: 25 },
          { label: '5.b', value: 40 },
          { label: '5.c', value: 15 },
          { label: '5.d', value: 32 },
        ],
        unit: 10,
        unitLabel: 'tanuló',
      },
    },
    {
      title: 'Emberke szimbólum, értékekkel',
      figure: {
        type: 'pictogram',
        rows: [
          { label: 'hétfő', value: 120 },
          { label: 'kedd', value: 80 },
          { label: 'szerda', value: 150 },
          { label: 'csütörtök', value: 50 },
        ],
        unit: 20,
        symbol: 'person',
        unitLabel: '= 20 látogató',
        showValues: true,
        color: 'purple',
      },
    },
    {
      title: 'Csillag, szív, négyzet',
      figure: {
        type: 'pictogram',
        rows: [
          { label: 'csillag', value: 3.5 },
          { label: 'kedvenc', value: 2.25 },
        ],
        unit: 1,
        symbol: 'star',
        color: 'orange',
      },
    },
    {
      title: 'Szív szimbólum',
      figure: {
        type: 'pictogram',
        rows: [
          { label: 'Kati', value: 6 },
          { label: 'Peti', value: 9 },
        ],
        unit: 2,
        symbol: 'heart',
        color: 'red',
        unitLabel: 'like',
      },
    },
    {
      title: 'Sok szimbólum (tördelés), négyzet',
      figure: {
        type: 'pictogram',
        rows: [
          { label: 'Belgrád', value: 380 },
          { label: 'Újvidék', value: 145 },
          { label: 'Szabadka', value: 90 },
        ],
        unit: 10,
        symbol: 'square',
        unitLabel: 'ezer lakos',
      },
    },
    // ------------------------------------------------------------------ table
    {
      title: 'Gyakorisági táblázat kiemeléssel',
      figure: {
        type: 'table',
        header: ['Jegy', 1, 2, 3, 4, 5],
        rows: [['Gyakoriság', 1, 4, 7, 9, 5]],
        rowHeaders: true,
        highlight: [[0, 4]],
      },
    },
    {
      title: 'Tizedes törtek, több sor',
      figure: {
        type: 'table',
        header: ['Hónap', 'Csapadék (mm)', 'Napsütés (óra)'],
        rows: [
          ['január', 42.5, 71],
          ['február', 38, 98.5],
          ['március', 45.25, 152],
          ['április', 51, 190],
        ],
        rowHeaders: true,
        highlight: [
          [2, 1],
          [3, 2],
        ],
      },
    },
    {
      title: 'Széles táblázat (10 oszlop) és üres cellák',
      figure: {
        type: 'table',
        header: ['x', -4, -3, -2, -1, 0, 1, 2, 3, 4],
        rows: [
          ['y', 12, 9, 6, 3, 0, -3, '', '', ''],
          ['y²', 16, 9, 4, 1, 0, 1, 4, '?', 16],
        ],
        rowHeaders: true,
        highlight: [[1, 8]],
      },
    },
    {
      title: 'Fejléc nélkül, nagy számok',
      figure: {
        type: 'table',
        rows: [
          ['Belgrád', 1197714],
          ['Újvidék', 368967],
          ['Szabadka', 123550],
        ],
        rowHeaders: true,
      },
    },
  ],
};
