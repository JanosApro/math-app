/**
 * Print generated sample questions of one subtopic — the manual answer check.
 *
 *   npm run samples -- <subtopicId> [--n=3] [--gen=<generatorId>] [--level=2]
 *
 * For every generator × level it prints a few seeds with the prompt, figure JSON, answer spec,
 * hint and worked solution. Recompute the answers yourself; the checker cannot see wrong math.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Difficulty, GradeTopics, SubtopicModule } from '../src/engine/types';
import { createRng } from '../src/engine/rng';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const CONTENT = join(ROOT, 'src/content');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const nArg = /^--n=(\d+)$/.exec(args.find((a) => a.startsWith('--n=')) ?? '');
const genArg = /^--gen=(.+)$/.exec(args.find((a) => a.startsWith('--gen=')) ?? '');
const levelArg = /^--level=([123])$/.exec(args.find((a) => a.startsWith('--level=')) ?? '');
const seeds = nArg ? Math.max(1, Math.min(50, Number(nArg[1]))) : 3;
const onlyGen = genArg?.[1];
const onlyLevel = levelArg ? (Number(levelArg[1]) as Difficulty) : undefined;

if (!id) {
  console.error('usage: npm run samples -- <subtopicId> [--n=3] [--gen=<id>] [--level=2]');
  process.exit(1);
}

interface Found {
  grade: number;
  folder: string;
  file: string;
  title: string;
}

function findSubtopic(subtopicId: string): Found | undefined {
  for (const gradeFolder of readdirSync(CONTENT).filter((f) => /^grade-\d+$/.test(f))) {
    const topicsPath = join(CONTENT, gradeFolder, 'topics.json');
    if (!existsSync(topicsPath)) continue;
    const topics = JSON.parse(readFileSync(topicsPath, 'utf8')) as GradeTopics;
    for (const topic of topics.topics) {
      for (const sub of topic.subtopics) {
        if (sub.id === subtopicId) {
          return {
            grade: topics.grade,
            folder: topic.folder,
            file: sub.file,
            title: sub.title,
          };
        }
      }
    }
  }
  return undefined;
}

const found = findSubtopic(id);
if (!found) {
  console.error(`Unknown subtopic id: ${id}`);
  process.exit(1);
}
const modulePath = join(CONTENT, `grade-${found.grade}`, found.folder, `${found.file}.ts`);
if (!existsSync(modulePath)) {
  console.error(`No module file yet: ${modulePath}`);
  process.exit(1);
}

const mod = ((await import(pathToFileURL(modulePath).href)) as { default: SubtopicModule }).default;
console.log(`# ${mod.id} — ${found.title}`);
console.log(`# ${modulePath}`);
for (const gen of mod.generators) {
  if (onlyGen && gen.id !== onlyGen) continue;
  for (const level of gen.levels) {
    if (onlyLevel !== undefined && onlyLevel !== level) continue;
    console.log(`\n## ${gen.id} L${level} — ${gen.title}`);
    for (let seed = 1; seed <= seeds; seed++) {
      let q;
      try {
        q = gen.generate(createRng(seed), level);
      } catch (e) {
        console.log(`\n--- seed ${seed} ---\nGENERATOR THREW: ${(e as Error).message}`);
        continue;
      }
      console.log(`\n--- seed ${seed} ---`);
      console.log('PROMPT:', q.prompt);
      if (q.figure) console.log('FIGURE:', JSON.stringify(q.figure));
      console.log('ANSWER:', JSON.stringify(q.answer));
      if (q.inputLabel) console.log('INPUT:', q.inputLabel);
      console.log('HINT:', q.hint);
      console.log('SOLUTION:');
      for (const step of q.solution) console.log('  -', step);
    }
  }
}
