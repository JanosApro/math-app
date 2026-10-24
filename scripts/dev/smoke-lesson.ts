/**
 * LEGACY quick smoke test of ONE lesson — `npm run check` (scripts/check.ts, task 03) now covers
 * everything this does, for all modules. Kept for a fast single-lesson loop while iterating:
 *   npx tsx scripts/dev/smoke-lesson.ts   (edit the import below to point at another lesson)
 */
import mod from '../../src/content/grade-7/pitagorasz/01-bizonyitas-alapok';
import { checkAnswer, canonicalInput } from '../../src/engine/answers';
import { createRng } from '../../src/engine/rng';
import { checkFigure } from '../../src/figures/index';
import { richTextProblems } from '../../src/engine/richtext';
import katex from 'katex';
import { mathSegments } from '../../src/engine/richtext';
const issues = new Map<string, number>();
const note = (k: string) => issues.set(k, (issues.get(k) ?? 0) + 1);
const texts = (q: any) => [q.prompt, q.hint, ...q.solution, q.inputLabel ?? '', ...(q.answer.options ?? [])];
const checkText = (where: string, s: string) => {
  for (const p of richTextProblems(s)) note(`${where}: ${p}`);
  for (const m of mathSegments(s)) { try { katex.renderToString(m, { throwOnError: true, strict: 'ignore' }); } catch (e) { note(`${where}: katex ${(e as Error).message.slice(0, 80)}`); } }
};
for (const g of mod.generators) for (const lvl of g.levels) {
  const prompts = new Set<string>();
  for (let seed = 1; seed <= 300; seed++) {
    let q;
    try { q = g.generate(createRng(seed), lvl); } catch (e) { note(`${g.id} L${lvl} threw ${(e as Error).message}`); continue; }
    prompts.add(q.prompt);
    const r = checkAnswer(q.answer, canonicalInput(q.answer));
    if (!r.correct) note(`${g.id} L${lvl} canonical fails ${JSON.stringify(q.answer).slice(0, 80)}`);
    for (const s of texts(q)) checkText(`${g.id} L${lvl}`, s);
    if (q.figure) { const f = checkFigure(q.figure); for (const e of f.errors) note(`${g.id} L${lvl} figure: ${e}`); }
  }
  console.log(`${g.id} L${lvl}: ${prompts.size} distinct prompts`);
}
for (const [i, st] of mod.steps.entries()) {
  const anyst = st as any;
  for (const s of [anyst.body, anyst.title, anyst.remember, anyst.problem, anyst.answer, ...(anyst.steps?.map((x: any) => x.text) ?? [])].filter(Boolean)) checkText(`step ${i}`, s);
  if (anyst.question) for (const s of texts(anyst.question)) checkText(`step ${i}`, s);
  const fig = anyst.figure ?? anyst.question?.figure;
  if (fig) { const f = checkFigure(fig); for (const e of f.errors) note(`step ${i} figure: ${e}`); }
  if (st.type === 'explore') for (const a of [1, 3, 8]) for (const b of [1, 4, 8]) { const r = st.render({ a, b }); checkText(`explore`, r.text); if (r.figure) for (const e of checkFigure(r.figure).errors) note(`explore fig ${e}`); }
}
console.log(issues.size ? [...issues].map(([k, n]) => `${n}× ${k}`).join('\n') : 'NO ISSUES');
