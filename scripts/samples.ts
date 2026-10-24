/**
 * Prints sample questions of one lesson as plain text — for checking the math by reading, without
 * a browser (`npm run samples -- <subtopicId>`). Every generator × level gets a few seeds: prompt,
 * figure summary, the correct answer (and what to type), hint and worked solution. The lesson's
 * fixed check questions are printed too.
 *
 *   npm run samples -- g7-pitagorasz-01                 3 seeds per generator × level
 *   npm run samples -- g7-pitagorasz-01 --n=6 --gen=hypotenuse --level=2 --seed=100
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Question, SubtopicModule } from '../src/engine/types';
import { canonicalInput, formatAnswer } from '../src/engine/answers';
import { generateQuestion } from '../src/engine/session';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const id = args.find((a) => !a.startsWith('--'));
const N = Number(opt('n') ?? 3);
const START = Number(opt('seed') ?? 1);
const GEN = opt('gen');
const LEVEL = opt('level') ? Number(opt('level')) : undefined;

if (!id) {
  console.error('usage: npm run samples -- <subtopicId> [--n=3] [--gen=<generatorId>] [--level=1|2|3] [--seed=1]');
  process.exit(1);
}

async function findModule(subtopicId: string): Promise<SubtopicModule> {
  if (subtopicId === 'dev-demo') return ((await import(pathToFileURL(join(ROOT, 'src/dev/demoLesson.ts')).href)) as { default: SubtopicModule }).default;
  const content = join(ROOT, 'src/content');
  for (const grade of readdirSync(content).filter((f) => /^grade-\d+$/.test(f))) {
    for (const folder of readdirSync(join(content, grade), { withFileTypes: true }).filter((d) => d.isDirectory())) {
      for (const file of readdirSync(join(content, grade, folder.name)).filter((f) => f.endsWith('.ts'))) {
        const path = join(content, grade, folder.name, file);
        if (!existsSync(path)) continue;
        const mod = ((await import(pathToFileURL(path).href)) as { default?: SubtopicModule }).default;
        if (mod?.id === subtopicId) return mod;
      }
    }
  }
  throw new Error(`no module with id "${subtopicId}" under src/content/`);
}

/** A one-line summary of a figure: its type and the labels/numbers it shows. */
function figureSummary(fig: unknown): string {
  if (!fig) return '';
  const json = JSON.stringify(fig);
  return json.length > 300 ? `${json.slice(0, 300)}…` : json;
}

function printQuestion(q: Question, indent = '    '): void {
  const lines = [
    `prompt:   ${q.prompt.replace(/\n/g, ' ⏎ ')}`,
    q.inputLabel ? `label:    ${q.inputLabel}` : '',
    q.figure ? `figure:   ${figureSummary(q.figure)}` : '',
    `answer:   ${formatAnswer(q.answer).replace(/\n/g, ' ')}`,
    `type in:  ${JSON.stringify(canonicalInput(q.answer))}`,
    `hint:     ${q.hint}`,
    ...q.solution.map((s, i) => `${i === 0 ? 'solution: ' : '          '}${i + 1}. ${s.replace(/\n/g, ' ⏎ ')}`),
  ].filter(Boolean);
  console.log(lines.map((l) => indent + l).join('\n'));
}

const mod = await findModule(id);
console.log(`${mod.id} — ${mod.generators.length} generator(s), ${mod.parts.length} part(s)\n`);

if (!GEN) {
  mod.parts.forEach((part, p) =>
    part.steps.forEach((step, s) => {
      if (step.type !== 'check') return;
      console.log(`[part ${p + 1}, step ${s + 1}] fixed check question`);
      printQuestion(step.question);
      console.log('');
    }),
  );
}

for (const g of mod.generators) {
  if (GEN && g.id !== GEN) continue;
  for (const level of g.levels) {
    if (LEVEL !== undefined && level !== LEVEL) continue;
    for (let k = 0; k < N; k++) {
      const seed = START + k;
      console.log(`[${g.id} · L${level} · seed ${seed}] ${g.title}`);
      try {
        printQuestion(generateQuestion(mod, { generator: g.id, level }, seed));
      } catch (e) {
        console.log(`    ERROR: ${(e as Error).message}`);
      }
      console.log('');
    }
  }
}
