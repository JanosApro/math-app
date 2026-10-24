/**
 * The content validator CLI — `npm run check`. See docs/tasks/03-dev-tools.md.
 *
 *   tsx scripts/check.ts [--seeds=N] [--only=<subtopicId>] [--quiet]
 *
 * - loads the catalog JSON with fs, imports every subtopic module (+ src/dev/demoLesson.ts
 *   if present) with tsx, and runs the checks from src/dev/validate.ts;
 * - validates every gallery section in src/dev/gallery/;
 * - warns when CONTENT_STATUS.md is out of date;
 * - prints a grouped report with a summary table and timing; exit code 1 on any error.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import type { DailyConfig, GradeInfo, GradeTopics, SubtopicModule } from '../src/engine/types';
import {
  checkGallerySection,
  countIssues,
  stressTestModule,
  validateCatalogStructure,
  validateModule,
  type GradeData,
  type ModuleEntry,
  type ValidationIssue,
} from '../src/dev/validate';
import { generateStatusMd } from './status';
import type { GallerySection } from '../src/dev/gallery/types';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const CONTENT = join(ROOT, 'src/content');

// ---------------------------------------------------------------------------------------------
// CLI options
// ---------------------------------------------------------------------------------------------

const args = process.argv.slice(2);
const seedsArg = /^--seeds=(\d+)$/.exec(args.find((a) => a.startsWith('--seeds=')) ?? '');
const SEEDS = seedsArg ? Number(seedsArg[1]) : 500;
const onlyArg = /^--only=(.+)$/.exec(args.find((a) => a.startsWith('--only=')) ?? '');
const ONLY = onlyArg ? onlyArg[1] : undefined;
const QUIET = args.includes('--quiet');

const ms = (t0: number) => `${(performance.now() - t0).toFixed(0)} ms`;

/** Loads a .ts module with tsx. */
async function importModule(path: string): Promise<SubtopicModule> {
  const mod = (await import(pathToFileURL(path).href)) as { default: SubtopicModule };
  if (!mod.default) throw new Error(`${path} has no default export`);
  return mod.default;
}

// ---------------------------------------------------------------------------------------------
// Load the catalog (fs) and the modules (tsx)
// ---------------------------------------------------------------------------------------------

async function loadCatalog(): Promise<{ grades: GradeInfo[]; gradesData: GradeData[]; demoLesson?: ModuleEntry }> {
  const grades = JSON.parse(readFileSync(join(CONTENT, 'grades.json'), 'utf8')) as GradeInfo[];
  const gradesData: GradeData[] = [];
  for (const folder of readdirSync(CONTENT).filter((f) => /^grade-\d+$/.test(f)).sort()) {
    const topicsPath = join(CONTENT, folder, 'topics.json');
    if (!existsSync(topicsPath)) continue;
    const topics = JSON.parse(readFileSync(topicsPath, 'utf8')) as GradeTopics;
    const dailyPath = join(CONTENT, folder, 'daily.json');
    const daily = existsSync(dailyPath) ? (JSON.parse(readFileSync(dailyPath, 'utf8')) as DailyConfig) : undefined;
    const modules: ModuleEntry[] = [];
    for (const topicFolder of readdirSync(join(CONTENT, folder), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()) {
      const topicDir = join(CONTENT, folder, topicFolder);
      for (const file of readdirSync(topicDir).filter((f) => f.endsWith('.ts')).sort()) {
        const path = join(topicDir, file);
        modules.push({ path, module: await importModule(path) });
      }
    }
    gradesData.push({ folder, topics, daily, modules });
  }
  let demoLesson: ModuleEntry | undefined;
  const demoPath = join(ROOT, 'src/dev/demoLesson.ts');
  if (existsSync(demoPath)) demoLesson = { path: demoPath, module: await importModule(demoPath) };
  return { grades, gradesData, demoLesson };
}

/** Loads all gallery sections (src/dev/gallery/*.ts except types.ts). */
async function loadGallery(): Promise<{ name: string; section: GallerySection }[]> {
  const dir = join(ROOT, 'src/dev/gallery');
  const out: { name: string; section: GallerySection }[] = [];
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'types.ts')
    .sort()) {
    const mod = (await import(pathToFileURL(join(dir, file)).href)) as { section: GallerySection };
    if (mod.section) out.push({ name: file.replace(/\.ts$/, ''), section: mod.section });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------

const CHECK = '✔';
const CROSS = '✖';
const WARN = '⚠';

function printIssues(issues: ValidationIssue[], indent: string): void {
  for (const i of issues) {
    if (QUIET && i.level === 'warning') continue;
    console.log(`${indent}${i.level === 'error' ? CROSS : WARN} ${i.where} — ${i.message}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------

async function main(): Promise<number> {
  const t0 = performance.now();
  console.log(`Matek Kaland — content check (seeds: ${SEEDS}${ONLY ? `, only: ${ONLY}` : ''})\n`);
  const allIssues: ValidationIssue[] = [];

  // --- catalog + modules ---
  const tLoad = performance.now();
  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (e) {
    console.error(`${CROSS} could not load the content: ${(e as Error).message}`);
    return 1;
  }
  const subtopicCount = catalog.gradesData.reduce(
    (n, g) => n + g.topics.topics.reduce((m, t) => m + t.subtopics.length, 0),
    0,
  );
  const moduleCount = catalog.gradesData.reduce((n, g) => n + g.modules.length, 0) + (catalog.demoLesson ? 1 : 0);
  console.log(`Loaded ${catalog.gradesData.length} grades · ${subtopicCount} subtopics · ${moduleCount} modules (${ms(tLoad)})`);

  // 1. Catalog structure
  const tCatalog = performance.now();
  const catalogIssues = validateCatalogStructure({ grades: catalog.grades, gradesData: catalog.gradesData });
  allIssues.push(...catalogIssues);
  const catalogCounts = countIssues(catalogIssues);
  console.log(
    `\nCatalog ${catalogCounts.errors ? CROSS : CHECK} ${catalogCounts.errors} errors, ${catalogCounts.warnings} warnings (${ms(tCatalog)})`,
  );
  printIssues(catalogIssues, '  ');

  // 2. Modules: structure + stress test
  const tModules = performance.now();
  const summaryRows: { id: string; file: string; status: string; generators: number; errors: number; warnings: number; stress: string }[] = [];
  console.log('\nModules');
  for (const data of catalog.gradesData) {
    // expected path suffix → subtopic row (module files may also be orphans)
    const subs = data.topics.topics.flatMap((topic) =>
      topic.subtopics.map((sub) => ({ sub, suffix: `${data.folder}/${topic.folder}/${sub.file}.ts` })),
    );
    for (const entry of data.modules) {
      const sub = subs.find((s) => entry.path.replace(/\\/g, '/').endsWith(s.suffix))?.sub;
      const relPath = entry.path.slice(ROOT.length + 1);
      const structure: ValidationIssue[] = [];
      validateModule(entry.module, sub, structure);
      const stress: ValidationIssue[] = [];
      let stressNote = '—';
      if (!ONLY || entry.module.id === ONLY) {
        stress.push(...stressTestModule(entry.module, SEEDS));
        const units = (entry.module.generators ?? []).reduce((n, g) => n + g.levels.length, 0);
        if (units > 0) stressNote = `${units} × ${SEEDS} seeds`;
      }
      const issues = [...structure, ...stress];
      allIssues.push(...issues);
      const counts = countIssues(issues);
      const stressCounts = countIssues(stress);
      console.log(
        `  ${counts.errors ? CROSS : CHECK} ${relPath} — ${entry.module.id} (${sub?.status ?? 'extra'}) · ${
          (entry.module.generators ?? []).length
        } generators · ${stressNote}${stressCounts.warnings ? ` · ${stressCounts.warnings} stress warnings` : ''}`,
      );
      printIssues(issues, '    ');
      summaryRows.push({
        id: entry.module.id,
        file: relPath,
        status: sub?.status ?? 'extra',
        generators: (entry.module.generators ?? []).length,
        errors: counts.errors,
        warnings: counts.warnings,
        stress: stressNote === '—' ? 'skipped' : stressCounts.errors ? CROSS : CHECK,
      });
    }
  }
  if (catalog.demoLesson) {
    const issues: ValidationIssue[] = [];
    validateModule(catalog.demoLesson.module, undefined, issues);
    allIssues.push(...issues);
    console.log(`  ${countIssues(issues).errors ? CROSS : CHECK} src/dev/demoLesson.ts — ${catalog.demoLesson.module.id} (demo)`);
    printIssues(issues, '    ');
  }
  const moduleCountWithIssues = summaryRows.length; // one row per loaded module
  console.log(`  (${moduleCountWithIssues} modules checked, ${ms(tModules)})`);

  // 3. Gallery sections
  const tGallery = performance.now();
  console.log('\nGallery');
  const gallery = await loadGallery();
  for (const { name, section } of gallery) {
    const issues = checkGallerySection(section, `gallery/${name}`);
    allIssues.push(...issues);
    const counts = countIssues(issues);
    console.log(`  ${counts.errors ? CROSS : CHECK} gallery/${name}.ts — "${section.title}" · ${section.entries.length} entries`);
    printIssues(issues, '    ');
  }
  console.log(`  (${gallery.length} sections, ${ms(tGallery)})`);

  // 4. CONTENT_STATUS.md freshness
  const statusNote = (): void => {
    const current = existsSync(join(ROOT, 'CONTENT_STATUS.md')) ? readFileSync(join(ROOT, 'CONTENT_STATUS.md'), 'utf8') : '';
    const generated = generateStatusMd(
      catalog!.grades,
      catalog!.gradesData.map((g) => ({ folder: g.folder, data: g.topics })),
    );
    if (current === generated) {
      console.log(`  ${CHECK} CONTENT_STATUS.md is up to date`);
    } else {
      console.log(`  ${WARN} CONTENT_STATUS.md is out of date — run \`npm run status\``);
      allIssues.push({ level: 'warning', where: 'CONTENT_STATUS.md', message: 'out of date — run `npm run status`' });
    }
  };
  console.log('\nDocs');
  statusNote();

  // --- summary ---
  const totals = countIssues(allIssues);
  console.log('\nSummary');
  if (summaryRows.length) {
    console.log('| subtopic | status | generators | errors | warnings | stress |');
    console.log('|---|---|---|---|---|---|');
    for (const r of summaryRows) {
      console.log(`| ${r.id} | ${r.status} | ${r.generators} | ${r.errors} | ${r.warnings} | ${r.stress} |`);
    }
  }
  console.log(
    `\n${totals.errors} error(s), ${totals.warnings} warning(s) · total ${((performance.now() - t0) / 1000).toFixed(1)} s`,
  );
  if (totals.errors > 0) {
    console.log(`\n${CROSS} FAILED — fix the errors above.`);
    return 1;
  }
  console.log(`\n${CHECK} OK${totals.warnings ? ' (with warnings)' : ''}`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
