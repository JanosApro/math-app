/**
 * Developer tool: renders gallery sections to PNG screenshots so figures can be checked
 * without a browser session.
 *
 *   npx tsx scripts/dev/figure-preview.ts <section-module> [outDir] [--dark]
 *   e.g. npx tsx scripts/dev/figure-preview.ts shapes /tmp/fig
 *
 * <section-module> is a file in src/dev/gallery/ exporting `section: GallerySection`.
 * Writes <outDir>/<module>.html and <outDir>/<module>-N.png (one image per 8 figures)
 * and prints validation errors/warnings per figure.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { layoutFigure } from '../../src/figures/index';
import { sceneToSvg, validateScene } from '../../src/figures/scene';
import type { GallerySection } from '../../src/dev/gallery/types';

const [name, outArg, ...flags] = process.argv.slice(2);
if (!name) {
  console.error('usage: figure-preview.ts <section> [outDir] [--dark]');
  process.exit(1);
}
const dark = flags.includes('--dark');
const outDir = resolve(outArg ?? 'screenshots-tmp');
mkdirSync(outDir, { recursive: true });

/** The figure colors, read from the app's theme (src/styles/theme.css), so the preview matches. */
function themeVars(mode: 'light' | 'dark'): string {
  const css = readFileSync(resolve('src/styles/theme.css'), 'utf8');
  const block = (sel: string) => {
    const at = css.indexOf(sel);
    return at < 0 ? '' : css.slice(at, css.indexOf('\n}\n', at));
  };
  const read = (text: string) => Object.fromEntries([...text.matchAll(/\n\s*(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const vars: Record<string, string> = { ...read(block(':root {')), ...(mode === 'dark' ? read(block(":root[data-theme='dark'] {")) : {}) };
  const resolveVar = (v: string, depth = 0): string => (depth < 5 ? v.replace(/var\((--[\w-]+)\)/g, (_, k: string) => resolveVar(vars[k] ?? '', depth + 1)) : v);
  const figs = Object.keys(vars).filter((k) => k.startsWith('--fig-')).map((k) => `${k}:${resolveVar(vars[k])}`);
  return `${figs.join(';')};background:${resolveVar(vars['--surface'])};color:${resolveVar(vars['--text'])}`;
}
const LIGHT = themeVars('light');
const DARK = themeVars('dark');

async function main() {
  const mod = (await import(pathToFileURL(resolve('src/dev/gallery', `${name}.ts`)).href)) as { section: GallerySection };
  const entries = mod.section.entries;
  const cards: string[] = [];
  let failed = 0;
  entries.forEach((e, i) => {
    let svg = '';
    let msg = '';
    try {
      const { scene } = layoutFigure(e.figure);
      const res = validateScene(scene);
      svg = sceneToSvg(scene)
        .replace('<svg ', `<svg style="width:100%;max-width:${Math.round(scene.viewBox.w * 1.35)}px" `)
        .replace(/<text /g, '<text font-family="KaTeX_Main, Times New Roman, serif" style="paint-order:stroke;stroke:var(--fig-paper);stroke-width:4px;stroke-linejoin:round" ');
      if (res.errors.length) failed++;
      msg = [...res.errors.map((x) => `ERROR: ${x}`), ...res.warnings.map((x) => `warn: ${x}`)].join('<br>');
      console.log(`[${i}] ${e.title}: ${res.errors.length ? 'ERRORS ' + res.errors.join('; ') : 'ok'}${res.warnings.length ? ' | warnings: ' + res.warnings.join('; ') : ''}`);
      if (scene.notToScale) msg += '<br><i>nem méretarányos</i>';
    } catch (err) {
      failed++;
      msg = `THREW: ${(err as Error).message}`;
      console.log(`[${i}] ${e.title}: THREW ${(err as Error).message}`);
    }
    cards.push(`<div class="card"><div class="t">[${i}] ${e.title}</div>${svg}<div class="m">${msg}</div></div>`);
  });
  const perPage = 8;
  const pages = Math.ceil(cards.length / perPage);
  for (let p = 0; p < pages; p++) {
    const html = `<!doctype html><meta charset="utf-8"><style>body{${dark ? DARK : LIGHT};font-family:sans-serif;margin:8px}
.grid{display:grid;grid-template-columns:repeat(4,360px);gap:10px}.card{border:1px solid #8884;border-radius:8px;padding:6px}
.t{font-size:12px;font-weight:bold;margin-bottom:4px}.m{font-size:11px;color:#c33}</style><div class="grid">${cards.slice(p * perPage, (p + 1) * perPage).join('')}</div>`;
    const htmlPath = join(outDir, `${name}-${p + 1}.html`);
    writeFileSync(htmlPath, html);
    const png = join(outDir, `${name}-${p + 1}${dark ? '-dark' : ''}.png`);
    const shell = [
      process.env.CHROME_PATH,
      join(homedir(), '.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'),
      '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
      '/opt/pw-browsers/chromium',
      '/usr/bin/chromium',
    ].find((p): p is string => !!p && existsSync(p));
    if (shell) {
      try {
        execFileSync(shell, ['--headless', '--no-sandbox', '--hide-scrollbars', `--screenshot=${png}`, '--window-size=1500,1000', pathToFileURL(htmlPath).href], { stdio: 'ignore', timeout: 30000 });
        console.log(`screenshot: ${png}`);
      } catch (err) {
        console.log(`screenshot failed: ${(err as Error).message}`);
      }
    }
  }
  console.log(`${entries.length} figures, ${failed} with errors`);
}
main();
