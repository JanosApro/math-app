/**
 * Content validation — the engine behind `npm run check`, `npm run status` and the /dev page.
 *
 * Environment-independent: no Vite APIs, no DOM. Runs in Node (via tsx, scripts/check.ts)
 * and in the browser (the /dev page runs it in chunks so the UI stays responsive).
 *
 * Three layers, each returning a flat list of issues:
 *   validateCatalogStructure — grades.json ↔ topics.json ↔ daily.json ↔ module files
 *   validateModule           — one subtopic module: structure, RichText, figures, static questions
 *   stressTestModule         — generated questions: N seeds per generator × level
 *
 * `where` names the place: a subtopic id (module issues), 'grade-7/topics.json' (catalog issues),
 * 'gallery/shapes · "Rombusz"' (gallery issues) or '<subtopicId>/<generatorId> L2 seed 41'
 * (stress issues). The CLI maps subtopic ids to file paths for its report.
 */
import katex from 'katex';
import type {
  AnswerSpec,
  DailyConfig,
  Difficulty,
  GeneratorDef,
  GradeInfo,
  GradeTopics,
  LessonStep,
  Question,
  RichText,
  SubtopicMeta,
  SubtopicModule,
} from '../engine/types';
import { mathSegments, richTextProblems } from '../engine/richtext';
import { canonicalInput, checkAnswer, formatAnswer } from '../engine/answers';
import { parseExpression } from '../engine/polynomial';
import { checkFigure } from '../figures/index';
import { createRng } from '../engine/rng';
import type { GallerySection } from './gallery/types';

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------

export interface ValidationIssue {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

/** A module file loaded by the caller (browser: registry; Node: fs + tsx import). */
export interface ModuleEntry {
  /** Any path that ends with `grade-N/<topic folder>/<NN>-<name>.ts`. */
  path: string;
  module: SubtopicModule;
}

/** All catalog data of one grade folder under src/content. */
export interface GradeData {
  /** Folder name, e.g. 'grade-7'. */
  folder: string;
  topics: GradeTopics;
  daily?: DailyConfig;
  /** Module files found in this grade's folder (orphan files included). */
  modules: ModuleEntry[];
}

export interface CatalogInput {
  grades: GradeInfo[];
  gradesData: GradeData[];
}

const isSevere = (i: ValidationIssue) => i.level === 'error';

/** True if the list contains at least one error. */
export const hasErrors = (issues: ValidationIssue[]): boolean => issues.some(isSevere);

/** Counts errors/warnings of a list. */
export function countIssues(issues: readonly ValidationIssue[]): { errors: number; warnings: number } {
  let errors = 0;
  let warnings = 0;
  for (const i of issues) i.level === 'error' ? errors++ : warnings++;
  return { errors, warnings };
}

// ---------------------------------------------------------------------------------------------
// RichText and figure checks
// ---------------------------------------------------------------------------------------------

/** KaTeX render cache — many generated prompts repeat, render each unique formula once. */
const katexErrors = new Map<string, string | null>();

function katexProblem(latex: string): string | null {
  let err = katexErrors.get(latex);
  if (err === undefined) {
    try {
      katex.renderToString(latex, { throwOnError: true, strict: 'ignore' });
      err = null;
    } catch (e) {
      err = (e as Error).message.split('\n')[0].slice(0, 140);
    }
    katexErrors.set(latex, err);
  }
  return err;
}

/** All problems of one RichText: syntax traps (richTextProblems) + KaTeX parse of every formula. */
export function checkRichText(text: string): string[] {
  const problems = richTextProblems(text);
  for (const latex of mathSegments(text)) {
    const err = katexProblem(latex);
    if (err) problems.push(`KaTeX error in "$${latex}$": ${err}`);
  }
  return problems;
}

/** Adds one issue per RichText problem; `label` says which part of the lesson it is. */
function addRich(issues: ValidationIssue[], where: string, label: string, text: string | undefined | null): void {
  if (typeof text !== 'string') return;
  for (const p of checkRichText(text)) issues.push({ level: 'error', where, message: `${label}: ${p}` });
}

/** checkFigure errors → error issues, warnings → warning issues (aggregated). */
function addFigure(issues: ValidationIssue[], where: string, fig: unknown, label: string): void {
  if (!fig || typeof fig !== 'object') return;
  const res = checkFigure(fig as never);
  for (const e of res.errors) issues.push({ level: 'error', where, message: `${label} figure: ${e}` });
  for (const w of res.warnings) issues.push({ level: 'warning', where, message: `${label} figure: ${w}` });
}

// ---------------------------------------------------------------------------------------------
// Deep scan: NaN / Infinity / undefined inside the generated question object
// ---------------------------------------------------------------------------------------------

const MAX_SCAN_DEPTH = 12;

function scanBadValues(value: unknown, path: string, out: string[], depth: number): void {
  if (depth > MAX_SCAN_DEPTH) return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) out.push(`${path} is ${value}`);
  } else if (Array.isArray(value)) {
    value.forEach((x, i) => {
      if (x === undefined) out.push(`${path}[${i}] is undefined`);
      else scanBadValues(x, `${path}[${i}]`, out, depth + 1);
    });
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) scanBadValues(v, `${path}.${k}`, out, depth + 1);
  }
}

// ---------------------------------------------------------------------------------------------
// One question: texts, answer spec, canonical check, figure, deep scan
// ---------------------------------------------------------------------------------------------

function validateAnswerSpec(spec: AnswerSpec, where: string, issues: ValidationIssue[]): void {
  switch (spec.type) {
    case 'number':
      if (!Number.isFinite(spec.value)) issues.push({ level: 'error', where, message: `number answer value is ${spec.value}` });
      checkPrecision(spec.precision, where, 'number answer', issues);
      if (spec.tolerance !== undefined && (!Number.isFinite(spec.tolerance) || spec.tolerance < 0)) {
        issues.push({ level: 'error', where, message: `number answer tolerance must be ≥ 0 (got ${spec.tolerance})` });
      }
      break;
    case 'numbers':
      if (spec.fields.length === 0) issues.push({ level: 'error', where, message: 'numbers answer has no fields' });
      spec.fields.forEach((f, i) => {
        if (!Number.isFinite(f.value)) issues.push({ level: 'error', where, message: `field ${i + 1} value is ${f.value}` });
        checkPrecision(f.precision, where, `field ${i + 1}`, issues);
      });
      break;
    case 'expression':
      try {
        if (!parseExpression(spec.value)) {
          issues.push({ level: 'error', where, message: `expression answer cannot be parsed: "${spec.value}"` });
        }
      } catch (e) {
        issues.push({ level: 'error', where, message: `expression answer cannot be parsed: "${spec.value}" (${(e as Error).message})` });
      }
      break;
    case 'fraction':
      if (!Number.isInteger(spec.den) || spec.den <= 0) {
        issues.push({ level: 'error', where, message: `fraction denominator must be a positive integer (got ${spec.den})` });
      }
      if (!Number.isInteger(spec.num)) issues.push({ level: 'error', where, message: `fraction numerator must be an integer (got ${spec.num})` });
      break;
    case 'root':
      if (!Number.isInteger(spec.radicand) || spec.radicand < 1) {
        issues.push({ level: 'error', where, message: `root radicand must be an integer ≥ 1 (got ${spec.radicand})` });
      }
      if (!Number.isInteger(spec.coef)) issues.push({ level: 'error', where, message: `root coefficient must be an integer (got ${spec.coef})` });
      if (spec.den !== undefined && (!Number.isInteger(spec.den) || spec.den <= 0)) {
        issues.push({ level: 'error', where, message: `root denominator must be a positive integer (got ${spec.den})` });
      }
      break;
    case 'choice': {
      const options = spec.options ?? [];
      if (options.length < 2) issues.push({ level: 'error', where, message: 'choice answer needs at least 2 options' });
      if (!Number.isInteger(spec.correct) || spec.correct < 0 || spec.correct >= options.length) {
        issues.push({ level: 'error', where, message: `choice correct index ${spec.correct} out of range (0…${options.length - 1})` });
      }
      findDuplicates(options.map((o) => o.trim())).forEach((d) =>
        issues.push({ level: 'error', where, message: `duplicate choice options: "${d}"` }),
      );
      break;
    }
    case 'truefalse':
      break;
    case 'order': {
      const items = spec.items ?? [];
      if (items.length < 2) issues.push({ level: 'error', where, message: 'order answer needs at least 2 items' });
      findDuplicates(items.map((o) => o.trim())).forEach((d) =>
        issues.push({ level: 'warning', where, message: `duplicate order items: "${d}"` }),
      );
      break;
    }
    case 'match': {
      const pairs = spec.pairs ?? [];
      if (pairs.length < 2) issues.push({ level: 'error', where, message: 'match answer needs at least 2 pairs' });
      findDuplicates(pairs.map(([l]) => l.trim())).forEach((d) =>
        issues.push({ level: 'error', where, message: `duplicate match left items: "${d}"` }),
      );
      findDuplicates(pairs.map(([, r]) => r.trim())).forEach((d) =>
        issues.push({ level: 'error', where, message: `duplicate match right items: "${d}" — matching is ambiguous` }),
      );
      break;
    }
  }
}

function checkPrecision(precision: number | undefined, where: string, label: string, issues: ValidationIssue[]): void {
  if (precision !== undefined && (!Number.isInteger(precision) || precision < 0 || precision > 6)) {
    issues.push({ level: 'error', where, message: `${label} precision must be an integer 0–6 (got ${precision})` });
  }
}

/** Strings that appear more than once. */
function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  return [...dupes];
}

/** Texts, answer spec, canonical-input check, formatAnswer, figure and deep scan of one question. */
export function validateQuestion(q: Question, where: string, issues: ValidationIssue[]): void {
  // Texts (prompt and hint are required; inputLabel is optional)
  if (typeof q.prompt !== 'string' || q.prompt.trim() === '') issues.push({ level: 'error', where, message: 'prompt is empty' });
  else addRich(issues, where, 'prompt', q.prompt);
  if (typeof q.hint !== 'string' || q.hint.trim() === '') issues.push({ level: 'error', where, message: 'hint is empty' });
  else addRich(issues, where, 'hint', q.hint);
  if (typeof q.inputLabel === 'string' && q.inputLabel.trim() !== '') addRich(issues, where, 'inputLabel', q.inputLabel);
  if (!Array.isArray(q.solution) || q.solution.length === 0) {
    issues.push({ level: 'error', where, message: 'solution is empty' });
  } else {
    q.solution.forEach((s, i) => {
      if (typeof s !== 'string' || s.trim() === '') issues.push({ level: 'error', where, message: `solution step ${i + 1} is empty` });
      else addRich(issues, where, `solution ${i + 1}`, s);
    });
  }
  // Option-ish RichTexts
  const spec = q.answer as AnswerSpec & { options?: RichText[]; items?: RichText[]; pairs?: [RichText, RichText][]; direction?: RichText };
  for (const o of spec.options ?? []) addRich(issues, where, 'option', o);
  for (const o of spec.items ?? []) addRich(issues, where, 'order item', o);
  if (spec.direction) addRich(issues, where, 'order direction', spec.direction);
  for (const [l, r] of spec.pairs ?? []) {
    addRich(issues, where, 'match left', l);
    addRich(issues, where, 'match right', r);
  }
  // Answer spec
  if (!q.answer || typeof q.answer.type !== 'string') {
    issues.push({ level: 'error', where, message: 'answer spec is missing' });
    return;
  }
  validateAnswerSpec(q.answer, where, issues);
  // The canonical answer must pass its own checker
  try {
    const res = checkAnswer(q.answer, canonicalInput(q.answer));
    if (!res.correct) {
      issues.push({
        level: 'error',
        where,
        message: `the canonical answer does not pass its own checker (answer: ${JSON.stringify(q.answer).slice(0, 120)})`,
      });
    }
  } catch (e) {
    issues.push({ level: 'error', where, message: `checkAnswer threw on the canonical input: ${(e as Error).message}` });
  }
  // formatAnswer must be renderable RichText
  try {
    addRich(issues, where, 'formatAnswer', formatAnswer(q.answer));
  } catch (e) {
    issues.push({ level: 'error', where, message: `formatAnswer threw: ${(e as Error).message}` });
  }
  // Figure
  addFigure(issues, where, q.figure, 'question');
  // Deep scan
  const bad: string[] = [];
  scanBadValues(q, 'question', bad, 0);
  for (const b of bad) issues.push({ level: 'error', where, message: b });
}

// ---------------------------------------------------------------------------------------------
// Module structure: steps, generators, mini test, daily
// ---------------------------------------------------------------------------------------------

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Sampled slider value sets for explore steps: min / middle / max per slider. */
function sliderSamples(min: number, max: number, step: number): number[] {
  const values = [min, max];
  if (step > 0) {
    const mid = min + step * Math.round((max - min) / 2 / step);
    values.splice(1, 0, Math.min(max, Math.max(min, mid)));
  }
  return [...new Set(values.filter(Number.isFinite))];
}

/** A few slider combinations (at most 9), e.g. (1,3,8) × (1,4,8) as in the smoke test. */
function exploreCombinations(step: { sliders: { name: string; min: number; max: number; step: number }[] }): Record<string, number>[] {
  let combos: Record<string, number>[] = [{}];
  for (const s of step.sliders) {
    const next: Record<string, number>[] = [];
    for (const c of combos) for (const v of sliderSamples(s.min, s.max, s.step)) next.push({ ...c, [s.name]: v });
    combos = next.slice(0, 9);
  }
  return combos;
}

/**
 * One subtopic module: structure, RichText, static figures and questions.
 * `sub` is the topics.json row (undefined for extra modules like src/dev/demoLesson.ts).
 */
export function validateModule(mod: SubtopicModule, sub: SubtopicMeta | undefined, issues: ValidationIssue[]): void {
  const where = mod.id;
  if (!mod.id || typeof mod.id !== 'string') {
    issues.push({ level: 'error', where: '??', message: 'module id is missing' });
    return;
  }
  if (sub && mod.id !== sub.id) {
    issues.push({ level: 'error', where: sub.id, message: `module exports id "${mod.id}", topics.json expects "${sub.id}"` });
  }

  // Goals
  if (!Array.isArray(mod.goals) || mod.goals.length === 0) {
    issues.push({ level: 'error', where, message: 'goals is empty' });
  } else {
    mod.goals.forEach((g, i) => {
      if (typeof g !== 'string' || g.trim() === '') issues.push({ level: 'error', where, message: `goal ${i + 1} is empty` });
      else addRich(issues, where, `goal ${i + 1}`, g);
    });
  }

  // Steps
  if (!Array.isArray(mod.steps) || mod.steps.length === 0) {
    issues.push({ level: 'error', where, message: 'steps is empty' });
  }
  const kinds = new Set<string>();
  (mod.steps ?? []).forEach((step: LessonStep, i: number) => {
    const stepWhere = `${where} · step ${i + 1}`;
    kinds.add(step?.type);
    switch (step?.type) {
      case 'theory':
        if (typeof step.body !== 'string' || step.body.trim() === '') issues.push({ level: 'error', where: stepWhere, message: 'theory body is empty' });
        else addRich(issues, stepWhere, 'body', step.body);
        addRich(issues, stepWhere, 'title', step.title);
        addRich(issues, stepWhere, 'remember', step.remember);
        addFigure(issues, stepWhere, step.figure, 'theory');
        break;
      case 'example':
        if (typeof step.problem !== 'string' || step.problem.trim() === '') issues.push({ level: 'error', where: stepWhere, message: 'example problem is empty' });
        else addRich(issues, stepWhere, 'problem', step.problem);
        addRich(issues, stepWhere, 'title', step.title);
        if (!Array.isArray(step.steps) || step.steps.length === 0) {
          issues.push({ level: 'error', where: stepWhere, message: 'example has no solution steps' });
        } else {
          step.steps.forEach((s, j) => {
            if (typeof s.text !== 'string' || s.text.trim() === '') issues.push({ level: 'error', where: stepWhere, message: `example solution step ${j + 1} is empty` });
            else addRich(issues, stepWhere, `example step ${j + 1}`, s.text);
            addFigure(issues, stepWhere, s.figure, `example step ${j + 1}`);
          });
        }
        if (typeof step.answer !== 'string' || step.answer.trim() === '') issues.push({ level: 'error', where: stepWhere, message: 'example answer is empty' });
        else addRich(issues, stepWhere, 'answer', step.answer);
        addFigure(issues, stepWhere, step.figure, 'example');
        break;
      case 'check':
        if (!step.question) issues.push({ level: 'error', where: stepWhere, message: 'check step has no question' });
        else validateQuestion(step.question, stepWhere, issues);
        break;
      case 'practice':
        checkGenRef(mod, { generator: step.generator, level: step.level }, stepWhere, issues);
        if (step.count !== undefined && (!Number.isInteger(step.count) || step.count < 1)) {
          issues.push({ level: 'warning', where: stepWhere, message: `practice count should be ≥ 1 (got ${step.count})` });
        }
        break;
      case 'explore': {
        if (typeof step.body !== 'string' || step.body.trim() === '') issues.push({ level: 'error', where: stepWhere, message: 'explore body is empty' });
        else addRich(issues, stepWhere, 'body', step.body);
        addRich(issues, stepWhere, 'title', step.title);
        if (!Array.isArray(step.sliders) || step.sliders.length === 0) {
          issues.push({ level: 'error', where: stepWhere, message: 'explore has no sliders' });
        } else {
          const names = new Set<string>();
          for (const s of step.sliders) {
            if (names.has(s.name)) issues.push({ level: 'error', where: stepWhere, message: `duplicate slider name "${s.name}"` });
            names.add(s.name);
            if (!(s.min <= s.max)) issues.push({ level: 'error', where: stepWhere, message: `slider "${s.name}": min ${s.min} > max ${s.max}` });
            if (!(s.step > 0)) issues.push({ level: 'error', where: stepWhere, message: `slider "${s.name}": step must be > 0` });
            if (s.value < s.min || s.value > s.max) {
              issues.push({ level: 'warning', where: stepWhere, message: `slider "${s.name}": default value ${s.value} outside [${s.min}, ${s.max}]` });
            }
            if (typeof s.label !== 'string' || s.label.trim() === '') issues.push({ level: 'error', where: stepWhere, message: `slider "${s.name}": label is empty` });
            else addRich(issues, stepWhere, `slider "${s.name}" label`, s.label);
          }
          for (const values of exploreCombinations(step)) {
            const r = step.render(values);
            if (typeof r.text !== 'string' || r.text.trim() === '') {
              issues.push({ level: 'error', where: stepWhere, message: `explore render(${JSON.stringify(values)}) text is empty` });
            } else {
              addRich(issues, stepWhere, `explore render(${JSON.stringify(values)})`, r.text);
            }
            addFigure(issues, stepWhere, r.figure, `explore render(${JSON.stringify(values)})`);
          }
        }
        break;
      }
      default:
        issues.push({ level: 'error', where: stepWhere, message: `unknown step type "${(step as { type?: string })?.type}"` });
    }
  });
  for (const kind of ['theory', 'example', 'practice'] as const) {
    if (!kinds.has(kind)) issues.push({ level: 'warning', where, message: `no ${kind} step in the lesson` });
  }

  // Generators
  const genIds = new Set<string>();
  const used = new Set<string>();
  for (const gen of mod.generators ?? []) {
    if (!gen?.id) {
      issues.push({ level: 'error', where, message: 'generator without id' });
      continue;
    }
    if (genIds.has(gen.id)) issues.push({ level: 'error', where, message: `duplicate generator id "${gen.id}"` });
    genIds.add(gen.id);
    if (!KEBAB.test(gen.id)) issues.push({ level: 'warning', where, message: `generator id "${gen.id}" is not kebab-case` });
    if (typeof gen.title !== 'string' || gen.title.trim() === '') issues.push({ level: 'warning', where, message: `generator "${gen.id}" has no title` });
    if (!Array.isArray(gen.levels) || gen.levels.length === 0) issues.push({ level: 'error', where: `${where}/${gen.id}`, message: 'no levels' });
    else if (new Set(gen.levels).size !== gen.levels.length) issues.push({ level: 'warning', where: `${where}/${gen.id}`, message: 'duplicate levels' });
  }

  // Mini test + practice refs
  const mini = mod.miniTest;
  if (!mini || !Array.isArray(mini.items) || mini.items.length === 0) {
    issues.push({ level: 'error', where, message: 'miniTest has no items' });
  } else {
    mini.items.forEach((ref, i) => checkGenRef(mod, ref, `${where} · miniTest item ${i + 1}`, issues));
    for (const ref of mini.items) used.add(ref.generator);
    if (mini.items.length < 5 || mini.items.length > 8) {
      issues.push({ level: 'warning', where, message: `miniTest has ${mini.items.length} items (5–8 recommended)` });
    }
    if (new Set(mini.items.map((r) => r.level)).size < 2) {
      issues.push({ level: 'warning', where, message: 'miniTest uses only one level (mix 1–3)' });
    }
    const pass = mini.passPercent ?? 80;
    if (!Number.isInteger(pass) || pass < 1 || pass > 100) {
      issues.push({ level: 'error', where, message: `miniTest passPercent ${pass} is not in 1..100` });
    }
  }
  for (const step of mod.steps ?? []) if (step?.type === 'practice') used.add(step.generator);
  for (const ref of mod.daily ?? []) {
    checkGenRef(mod, ref, `${where} · daily`, issues);
    used.add(ref.generator);
  }
  for (const id of genIds) if (!used.has(id)) issues.push({ level: 'warning', where, message: `generator "${id}" is never used (practice, miniTest or daily)` });
}

function checkGenRef(mod: SubtopicModule, ref: { generator: string; level: Difficulty }, where: string, issues: ValidationIssue[]): void {
  const gen = (mod.generators ?? []).find((g) => g.id === ref.generator);
  if (!gen) {
    issues.push({ level: 'error', where, message: `unknown generator "${ref.generator}"` });
    return;
  }
  if (!gen.levels.includes(ref.level)) {
    issues.push({ level: 'error', where, message: `generator "${ref.generator}" does not support level ${ref.level}` });
  }
}

// ---------------------------------------------------------------------------------------------
// Catalog structure: grades.json ↔ topics.json ↔ daily.json ↔ module files
// ---------------------------------------------------------------------------------------------

/** Derives the subtopic id a module file path implies: …/grade-7/pitagorasz/01-alapok.ts → g7-pitagorasz-01. */
export function idFromModulePath(path: string): string | undefined {
  const m = /grade-(\d+)\/([a-z0-9-]+)\/(\d\d)-[a-z0-9-]+\.ts$/.exec(path.replace(/\\/g, '/'));
  return m ? `g${m[1]}-${m[2]}-${m[3]}` : undefined;
}

function detectCycle(graph: Map<string, string[]>): string[] | null {
  const state = new Map<string, 'stack' | 'done'>();
  const stack: string[] = [];
  const dfs = (id: string): string[] | null => {
    state.set(id, 'stack');
    stack.push(id);
    for (const next of graph.get(id) ?? []) {
      const s = state.get(next);
      if (s === 'stack') return stack.slice(stack.indexOf(next));
      if (s === 'done') continue;
      const cycle = dfs(next);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, 'done');
    return null;
  };
  for (const id of graph.keys()) {
    if (state.has(id)) continue;
    const cycle = dfs(id);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * Catalog checks that need no module contents: grades.json ↔ topics folders, topics.json
 * structure, ids and files, prerequisites (exist, no self-reference, no cycles), daily.json
 * ids, module presence per status and id mismatches.
 */
export function validateCatalogStructure(input: CatalogInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const subById = new Map<string, { sub: SubtopicMeta; topicFolder: string; grade: number; status: string }>();
  const moduleByPathSuffix = new Map<string, ModuleEntry>();
  const gradeFolders = new Set<number>();

  // grades.json basics
  const gradeNumbers = new Set<number>();
  for (const g of input.grades) {
    if (!Number.isInteger(g.grade) || g.grade < 1) issues.push({ level: 'error', where: 'grades.json', message: `invalid grade number ${g.grade}` });
    if (gradeNumbers.has(g.grade)) issues.push({ level: 'error', where: 'grades.json', message: `grade ${g.grade} listed twice` });
    gradeNumbers.add(g.grade);
    if (!g.label || !g.label.trim()) issues.push({ level: 'warning', where: 'grades.json', message: `grade ${g.grade} has no label` });
  }

  for (const data of input.gradesData) {
    const whereJson = `${data.folder}/topics.json`;
    const m = /^grade-(\d+)$/.exec(data.folder);
    const folderGrade = m ? Number(m[1]) : undefined;
    if (folderGrade === undefined) issues.push({ level: 'error', where: 'src/content', message: `folder "${data.folder}" does not match grade-N` });
    else {
      gradeFolders.add(folderGrade);
      if (!gradeNumbers.has(folderGrade)) {
        issues.push({ level: 'error', where: whereJson, message: `grade ${folderGrade} is not listed in grades.json — the app ignores the folder` });
      }
      if (data.topics.grade !== folderGrade) {
        issues.push({ level: 'error', where: whereJson, message: `topics.json grade is ${data.topics.grade}, folder is grade-${folderGrade}` });
      }
    }

    // Topic structure
    if (!Array.isArray(data.topics.topics) || data.topics.topics.length === 0) {
      issues.push({ level: 'error', where: whereJson, message: 'no topics' });
      continue;
    }
    const topicIds = new Set<string>();
    for (const topic of data.topics.topics) {
      const topicWhere = `${whereJson} · topic "${topic?.id ?? '?'}"`;
      if (!topic?.id || !topic?.folder || !topic?.title || !Array.isArray(topic.subtopics)) {
        issues.push({ level: 'error', where: topicWhere, message: 'topic needs id, folder, title and subtopics' });
        continue;
      }
      if (topicIds.has(topic.id)) issues.push({ level: 'error', where: whereJson, message: `duplicate topic id "${topic.id}"` });
      topicIds.add(topic.id);
      const expectedTopicId = `g${folderGrade}-${topic.folder}`;
      if (topic.id !== expectedTopicId) {
        issues.push({ level: 'error', where: topicWhere, message: `topic id should be "${expectedTopicId}" (folder: ${topic.folder})` });
      }
      if (!KEBAB.test(topic.folder)) issues.push({ level: 'error', where: topicWhere, message: `topic folder "${topic.folder}" is not kebab-case` });
      if (topic.color && !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(topic.color)) {
        issues.push({ level: 'warning', where: topicWhere, message: `topic color "${topic.color}" is not a hex color` });
      }
      if (topic.icon && !KEBAB.test(topic.icon)) issues.push({ level: 'warning', where: topicWhere, message: `topic icon "${topic.icon}" is not kebab-case` });

      // Subtopic structure
      const files = new Set<string>();
      if (topic.subtopics.length === 0) issues.push({ level: 'error', where: topicWhere, message: 'topic has no subtopics' });
      for (const sub of topic.subtopics) {
        const subWhere = `${topicWhere} · "${sub?.id ?? '?'}"`;
        if (!sub?.id || !sub?.file || !sub?.title || !sub?.status) {
          issues.push({ level: 'error', where: subWhere, message: 'subtopic needs id, file, title and status' });
          continue;
        }
        if (subById.has(sub.id)) {
          issues.push({ level: 'error', where: subWhere, message: `duplicate subtopic id "${sub.id}" (also in another grade/topic)` });
          continue;
        }
        if (!['todo', 'draft', 'done'].includes(sub.status)) {
          issues.push({ level: 'error', where: subWhere, message: `invalid status "${sub.status}"` });
        }
        const expectedId = `g${folderGrade}-${topic.folder}-${sub.file.slice(0, 2)}`;
        if (sub.id !== expectedId) {
          issues.push({ level: 'error', where: subWhere, message: `subtopic id should be "${expectedId}" (file: ${sub.file}.ts)` });
        }
        if (!/^\d\d-[a-z0-9-]+$/.test(sub.file)) {
          issues.push({ level: 'error', where: subWhere, message: `file name "${sub.file}" must look like "NN-name-in-kebab-case"` });
        }
        if (files.has(sub.file)) issues.push({ level: 'error', where: subWhere, message: `duplicate file "${sub.file}.ts" in the topic` });
        files.add(sub.file);
        subById.set(sub.id, { sub, topicFolder: topic.folder, grade: folderGrade!, status: sub.status });
      }
    }

    // Topic-level prerequisites
    const topicGraph = new Map<string, string[]>();
    for (const topic of data.topics.topics) {
      if (topic?.prerequisites) topicGraph.set(topic.id, topic.prerequisites);
    }
    for (const topic of data.topics.topics) {
      if (!topic?.prerequisites) continue;
      const topicWhere = `${whereJson} · topic "${topic.id}"`;
      for (const pid of topic.prerequisites) {
        if (pid === topic.id) issues.push({ level: 'error', where: topicWhere, message: 'topic lists itself as a prerequisite' });
        if (!topicIds.has(pid)) issues.push({ level: 'error', where: topicWhere, message: `prerequisite topic "${pid}" does not exist` });
      }
    }
    const topicCycle = detectCycle(topicGraph);
    if (topicCycle) issues.push({ level: 'error', where: whereJson, message: `prerequisite cycle between topics: ${topicCycle.join(' → ')}` });

    // Subtopic-level prerequisites
    const subGraph = new Map<string, string[]>();
    for (const topic of data.topics.topics) {
      for (const sub of topic?.subtopics ?? []) {
        if (sub?.prerequisites) subGraph.set(sub.id, sub.prerequisites);
      }
    }
    for (const [id, prereqs] of subGraph) {
      for (const pid of prereqs) {
        if (pid === id) issues.push({ level: 'error', where: id, message: 'subtopic lists itself as a prerequisite' });
        if (!subById.has(pid)) issues.push({ level: 'error', where: id, message: `prerequisite "${pid}" does not exist` });
      }
    }
    const subCycle = detectCycle(subGraph);
    if (subCycle) issues.push({ level: 'error', where: whereJson, message: `prerequisite cycle between subtopics: ${subCycle.join(' → ')}` });

    // daily.json
    if (data.daily) {
      const dailyWhere = `${data.folder}/daily.json`;
      const ids = new Set(subById.keys());
      for (const id of data.daily.subtopics) {
        if (!ids.has(id)) issues.push({ level: 'error', where: dailyWhere, message: `"${id}" is not a subtopic of grade ${folderGrade}` });
        else if (subById.get(id)!.status === 'todo') {
          issues.push({ level: 'warning', where: dailyWhere, message: `"${id}" has no content yet (status todo) — the daily challenge skips it` });
        }
      }
    }

    // Module files: index by expected path suffix
    for (const entry of data.modules) {
      const suffixMatch = /((?:^|\/)grade-\d+\/[a-z0-9-]+\/\d\d-[a-z0-9-]+\.ts)$/.exec(entry.path.replace(/\\/g, '/'));
      const suffix = suffixMatch ? suffixMatch[1].replace(/^\//, '') : undefined;
      if (!suffix) {
        issues.push({ level: 'warning', where: 'src/content', message: `module path "${entry.path}" does not look like grade-N/<topic>/<NN>-<name>.ts` });
        continue;
      }
      if (moduleByPathSuffix.has(suffix)) {
        issues.push({ level: 'error', where: 'src/content', message: `two modules share the path …/${suffix}` });
        continue;
      }
      moduleByPathSuffix.set(suffix, entry);
    }
  }

  // grades.json ↔ topics folders both ways
  for (const g of gradeNumbers) {
    if (!gradeFolders.has(g)) issues.push({ level: 'error', where: 'grades.json', message: `grade ${g} has no src/content/grade-${g}/topics.json` });
  }

  // Module presence, id matches, orphans
  for (const { sub, topicFolder, grade, status } of subById.values()) {
    const suffix = `grade-${grade}/${topicFolder}/${sub.file}.ts`;
    const entry = moduleByPathSuffix.get(suffix);
    if (status === 'todo') {
      if (entry) issues.push({ level: 'warning', where: sub.id, message: `status is todo but a module file exists (${sub.file}.ts) — update the status to draft?` });
    } else if (!entry) {
      issues.push({ level: 'error', where: sub.id, message: `status is ${status} but the module file ${suffix} is missing` });
    } else if (entry.module.id !== sub.id) {
      issues.push({ level: 'error', where: sub.id, message: `module exports id "${entry.module.id}", expected "${sub.id}"` });
    }
    if (entry) moduleByPathSuffix.delete(suffix);
  }
  for (const [suffix, entry] of moduleByPathSuffix) {
    issues.push({
      level: 'warning',
      where: idFromModulePath(entry.path) ?? 'src/content',
      message: `module file ${suffix} is not referenced by any subtopic in topics.json`,
    });
  }
  return issues;
}

// ---------------------------------------------------------------------------------------------
// Stress test: generated questions
// ---------------------------------------------------------------------------------------------

export interface StressOptions {
  /** How many seeds per generator × level. */
  seeds: number;
}

/** Issues of one generator × level, aggregated: identical failures collapse to first seed × count. */
export function stressTestGenerator(subId: string, gen: GeneratorDef, level: Difficulty, seeds: number): ValidationIssue[] {
  const whereBase = `${subId}/${gen.id} L${level}`;
  const aggregated = new Map<string, { level: 'error' | 'warning'; message: string; first: number; count: number }>();
  const add = (level: 'error' | 'warning', seed: number, message: string) => {
    const key = `${level}|${message}`;
    const cur = aggregated.get(key);
    if (cur) cur.count++;
    else aggregated.set(key, { level, message, first: seed, count: 1 });
  };

  const distinct = new Set<string>();
  for (let seed = 1; seed <= seeds; seed++) {
    let q: Question;
    try {
      q = gen.generate(createRng(seed), level);
    } catch (e) {
      add('error', seed, `generator threw: ${(e as Error).message}`);
      continue;
    }
    const issues: ValidationIssue[] = [];
    validateQuestion(q, whereBase, issues);
    for (const i of issues) add(i.level, seed, i.message);
    distinct.add(`${q.prompt}\u0000${JSON.stringify(q.answer)}`);
  }
  if (seeds >= 50 && distinct.size < 10) {
    return [
      ...[...aggregated.values()].map((a) => ({
        level: a.level,
        where: `${whereBase} seed ${a.first}`,
        message: a.count > 1 ? `${a.count}× ${a.message}` : a.message,
      })),
      {
        level: 'warning',
        where: whereBase,
        message: `only ${distinct.size} distinct questions in ${seeds} seeds (prompt + answer compared) — add more variety`,
      },
    ];
  }
  return [...aggregated.values()].map((a) => ({
    level: a.level,
    where: `${whereBase} seed ${a.first}`,
    message: a.count > 1 ? `${a.count}× ${a.message}` : a.message,
  }));
}

/** Stress test of a whole module (all generators × levels × seeds). */
export function stressTestModule(mod: SubtopicModule, seeds: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const gen of mod.generators) for (const level of gen.levels) issues.push(...stressTestGenerator(mod.id, gen, level, seeds));
  return issues;
}

/** How many generator × level combinations a module's stress test runs. */
export function stressWorkUnits(mod: SubtopicModule): number {
  return (mod.generators ?? []).reduce((n, g) => n + (g.levels?.length ?? 0), 0);
}

// ---------------------------------------------------------------------------------------------
// Gallery sections
// ---------------------------------------------------------------------------------------------

/** Validates every entry of a gallery section (used by npm run check and the gallery screen). */
export function checkGallerySection(section: GallerySection, where: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!section?.title) issues.push({ level: 'warning', where, message: 'section has no title' });
  if (!Array.isArray(section?.types) || section.types.length === 0) {
    issues.push({ level: 'warning', where, message: 'section lists no figure types' });
  }
  (section?.entries ?? []).forEach((entry, i) => {
    const entryWhere = `${where} · [${i}] "${entry?.title ?? '?'}"`;
    if (!entry?.title) issues.push({ level: 'warning', where: entryWhere, message: 'entry has no title' });
    if (!entry?.figure) {
      issues.push({ level: 'error', where: entryWhere, message: 'entry has no figure' });
      return;
    }
    if (section.types && !section.types.includes(entry.figure.type as never)) {
      issues.push({ level: 'warning', where: entryWhere, message: `figure type "${entry.figure.type}" is not in the section's type list` });
    }
    addFigure(issues, entryWhere, entry.figure, 'gallery');
  });
  return issues;
}
