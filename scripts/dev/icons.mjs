/**
 * Renders public/icon.svg and public/icon-maskable.svg to the PNG app icons (192, 512,
 * maskable 512, apple-touch 180). Run after changing the logo: `node scripts/dev/icons.mjs`
 * (optional argument: another output folder, ending in /).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from './pw.mjs';

const pub = fileURLToPath(new URL('../../public/', import.meta.url));
const out = process.argv[2] ?? pub;
const jobs = [
  ['icon.svg', 'icon-192.png', 192, true],
  ['icon.svg', 'icon-512.png', 512, true],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512, false],
  ['icon-maskable.svg', 'apple-touch-icon.png', 180, false],
];
const b = await launch();
for (const [src, dst, size, transparent] of jobs) {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const svg = readFileSync(pub + src, 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await p.screenshot({ path: out + dst, omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  await p.close();
}
await b.close();
