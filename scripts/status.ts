/**
 * Regenerates CONTENT_STATUS.md from src/content/grade-N/topics.json.
 *
 *   npm run status          rewrite the file
 *   npm run status --check  only report whether it would change (exit 1 if it would)
 *
 * `scripts/check.ts` imports generateStatusMd to warn when the file is out of date.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GradeInfo, GradeTopics, SubtopicMeta, TopicMeta } from '../src/engine/types';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const CONTENT = resolve(ROOT, 'src/content');
const STATUS_FILE = resolve(ROOT, 'CONTENT_STATUS.md');

/** One grade folder + its topics.json (paired by the caller). */
export interface GradeTopicsEntry {
  folder: string;
  data: GradeTopics;
}

/** A table cell: escape pipes, flatten line breaks. */
const cell = (s: string | undefined): string => (s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();

/** The intro of CONTENT_STATUS.md — keep in sync with the hand-written original. */
const INTRO = `# Content status

Every subtopic of the app. Pick the next \`todo\` row, write the lesson by following \`CONTENT_GUIDE.md\`.

- \`todo\` — no content yet; shown to students as "Hamarosan…" and cannot be opened.
- \`draft\` — content exists and is visible to students, but is not fully reviewed.
- \`done\` — finished and checked (see the checklist in CONTENT_GUIDE.md).

The status itself lives in \`src/content/grade-N/topics.json\`. This file is generated from those files
by \`npm run status\` — to change a status or scope, edit topics.json and run it again.
**Scope** = what the lesson must cover (inferred from the official curriculum and the textbook's chapter lists).`;

/** Renders the whole CONTENT_STATUS.md content from the catalog data. */
export function generateStatusMd(grades: GradeInfo[], topics: GradeTopicsEntry[]): string {
  const sections: string[] = [];
  for (const grade of grades) {
    const entry = topics.find((t) => t.data.grade === grade.grade);
    if (!entry) continue;
    const subs = entry.data.topics.flatMap((topic: TopicMeta) =>
      topic.subtopics.map((sub: SubtopicMeta) => ({ topic, sub })),
    );
    const count = (status: string) => subs.filter((s) => s.sub.status === status).length;
    const lines: string[] = [];
    lines.push(
      `## Grade ${grade.grade}  (${subs.length} subtopics: ${count('done')} done, ${count('draft')} draft, ${count('todo')} todo)`,
      '',
      '| ID | Topic | Subtopic | Status | Scope |',
      '|---|---|---|---|---|',
    );
    for (const { topic, sub } of subs) {
      lines.push(`| \`${sub.id}\` | ${cell(topic.title)} | ${cell(sub.title)} | ${sub.status} | ${cell(sub.scope)} |`);
    }
    sections.push(lines.join('\n'));
  }
  return `${[INTRO, ...sections].join('\n\n')}\n`;
}

function readCatalog(): { grades: GradeInfo[]; topics: GradeTopicsEntry[] } {
  const grades = JSON.parse(readFileSync(resolve(CONTENT, 'grades.json'), 'utf8')) as GradeInfo[];
  const topics: GradeTopicsEntry[] = [];
  for (const folder of readdirSync(CONTENT).filter((f) => /^grade-\d+$/.test(f)).sort()) {
    const file = resolve(CONTENT, folder, 'topics.json');
    if (existsSync(file)) topics.push({ folder, data: JSON.parse(readFileSync(file, 'utf8')) as GradeTopics });
  }
  return { grades, topics };
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const { grades, topics } = readCatalog();
  const generated = generateStatusMd(grades, topics);
  if (!existsSync(STATUS_FILE)) {
    if (checkOnly) {
      console.log('CONTENT_STATUS.md is missing.');
      process.exit(1);
    }
    writeFileSync(STATUS_FILE, generated, 'utf8');
    console.log('CONTENT_STATUS.md created.');
    return;
  }
  const current = readFileSync(STATUS_FILE, 'utf8');
  if (current === generated) {
    console.log('CONTENT_STATUS.md is up to date.');
    return;
  }
  if (checkOnly) {
    console.log('CONTENT_STATUS.md is out of date — run `npm run status`.');
    process.exit(1);
  }
  writeFileSync(STATUS_FILE, generated, 'utf8');
  const currentSubs = (current.match(/^\| `g\d/gm) ?? []).length;
  const generatedSubs = (generated.match(/^\| `g\d/gm) ?? []).length;
  console.log(`CONTENT_STATUS.md rewritten (${generatedSubs} subtopics, was ${currentSubs}).`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
