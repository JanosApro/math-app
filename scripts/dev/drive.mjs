/**
 * Helpers for driving the app in Chromium (used by e2e.mjs; dev only, never shipped).
 *
 * The lesson player exposes the question on screen as `window.__mkQuestion` in dev builds, so
 * the helpers can answer it right or wrong — by tapping the on-screen keypad or by typing.
 */
import { mkdirSync } from 'node:fs';
import { launch } from './pw.mjs';

export const STORAGE_KEY = 'matek-kaland:v1';

/** A fresh saved state with the grade already chosen (skips onboarding). */
export const freshState = (grade = 7) =>
  JSON.stringify({ version: 1, grade, nickname: '', settings: { sound: false, reduceMotion: false, theme: 'auto' }, grades: {} });

/**
 * Opens a page. `state`: a JSON string written to localStorage before the first load, or null to
 * start empty (onboarding). Console errors and page errors are collected in `errors`.
 */
export async function openPage({ width = 375, height = 800, dark = false, state } = {}) {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`PAGE ERROR: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`CONSOLE ERROR: ${m.text()}`));
  if (state !== undefined) {
    await page.addInitScript(
      ([key, s]) => {
        if (sessionStorage.getItem('__mk-init')) return;
        sessionStorage.setItem('__mk-init', '1');
        if (s === null) localStorage.removeItem(key);
        else localStorage.setItem(key, s);
      },
      [STORAGE_KEY, state],
    );
  }
  return { browser, ctx, page, errors };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let shotNo = 0;
/** Screenshot into `dir` (skipped when dir is empty). */
export async function shot(page, dir, name, fullPage = false) {
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  shotNo++;
  await page.screenshot({ path: `${dir}/${String(shotNo).padStart(3, '0')}-${name}.png`, fullPage });
}

/** The main (rightmost) button of the action bar or the feedback sheet. */
export async function clickMain(page) {
  await page.locator('.lesson-footer .lesson-main-btn, .lesson-sheet .btn-block').last().click();
}

export const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

const KEY_ARIA = {
  ',': 'tizedesvessző',
  '/': 'törtvonal',
  ' ': 'vegyes szám (szóköz)',
  '√': 'gyökjel',
  '^': 'hatvány',
  '(': 'nyitó zárójel',
  ')': 'záró zárójel',
  '+': 'plusz',
  '·': 'szorzás',
  '-': 'mínusz',
  π: 'pí',
};

/** Taps the on-screen keypad. */
export async function tapText(page, text) {
  for (const ch of text) await page.locator(`.kp-key[aria-label="${KEY_ARIA[ch] ?? ch}"]`).first().click();
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const plain = (v, p) => (p !== undefined ? v.toFixed(p) : String(Math.round(v * 1e9) / 1e9)).replace('.', ',');

/** What a student types for a text answer (mirrors canonicalInput in src/engine/answers.ts). */
function typedAnswer(spec, right) {
  switch (spec.type) {
    case 'number':
      return right ? plain(spec.value, spec.precision) : String(Math.round(spec.value) + 7);
    case 'expression':
      return right ? spec.value.replace(/\*/g, '·') : `${(spec.vars ?? spec.value.match(/[a-zπ]/) ?? ['x'])[0]}+1`;
    case 'fraction': {
      // a different value (n+1)/d — not an equivalent fraction, which would only get the "simplify it" notice
      if (!right) return `${spec.num + 1}/${spec.den}`;
      const g = gcd(spec.num, spec.den) || 1;
      const n = spec.num / g;
      const d = spec.den / g;
      if (d === 1) return String(n);
      if (spec.form === 'mixed' && Math.abs(n) > d) return `${Math.trunc(n / d)} ${Math.abs(n % d)}/${d}`;
      return `${n}/${d}`;
    }
    case 'root': {
      if (!right) return `${Math.abs(spec.coef) + 1}√${spec.radicand + 1}`;
      const den = spec.den ?? 1;
      const g = gcd(spec.coef, den) || 1;
      const c = spec.coef / g;
      const d = den / g;
      const body = spec.radicand === 1 ? String(Math.abs(c)) : `${Math.abs(c) === 1 ? '' : Math.abs(c)}√${spec.radicand}`;
      return `${c < 0 ? '-' : ''}${body}${d === 1 ? '' : `/${d}`}`;
    }
  }
  return '';
}

/**
 * Answers the question on screen. mode 'correct' | 'wrong'; via 'tap' (keypad) | 'keyboard'.
 * Returns the answer type.
 */
let lastSeed = null;

/**
 * The question on screen that has not been answered by `answer()` yet. window.__mkQuestion is set
 * in an effect right after a question renders, so wait until it shows a new seed.
 */
export async function freshQuestion(page) {
  const handle = await page
    .waitForFunction((prev) => (window.__mkQuestion && window.__mkQuestion.seed !== prev ? window.__mkQuestion : null), lastSeed, { timeout: 5000 })
    .catch(() => null);
  const cur = handle ? await handle.jsonValue() : null;
  if (!cur) throw new Error('no new question on screen (window.__mkQuestion — is this a dev build?)');
  return cur;
}

/** Marks the question on screen as handled (call it before jumping away from an unanswered question). */
export async function skipQuestion(page) {
  lastSeed = await page.evaluate(() => window.__mkQuestion?.seed ?? null);
}

export async function answer(page, mode = 'correct', via = 'tap') {
  const cur = await freshQuestion(page);
  lastSeed = cur.seed;
  const spec = cur.question.answer;
  const right = mode === 'correct';
  const type = async (text) => {
    // a physical keyboard has no π / √ key: the app maps p → π and g/r/s/v → √
    if (via === 'keyboard') await page.keyboard.type(text.replace(/·/g, '*').replace(/π/g, 'p').replace(/√/g, 'g'));
    else await tapText(page, text);
  };
  switch (spec.type) {
    case 'number':
    case 'expression':
    case 'fraction':
    case 'root':
      await type(typedAnswer(spec, right));
      break;
    case 'numbers':
      for (let i = 0; i < spec.fields.length; i++) {
        await page.locator('.kp-display-field').nth(i).click();
        const f = spec.fields[i];
        await type(plain(right || i > 0 ? f.value : f.value + 3, f.precision));
      }
      break;
    case 'choice':
      await page.locator(`.kp-choice[data-index="${right ? spec.correct : (spec.correct + 1) % spec.options.length}"]`).click();
      break;
    case 'truefalse':
      await page.locator(spec.value === right ? '.kp-tf-true' : '.kp-tf-false').click();
      break;
    case 'order': {
      const idx = [...spec.items.keys()];
      if (!right) idx.reverse();
      for (const i of idx) await page.locator(`.kp-order-item[data-index="${i}"]`).click();
      break;
    }
    case 'match': {
      const n = spec.pairs.length;
      for (let l = 0; l < n; l++) {
        await page.locator(`.kp-match-item[data-left="${l}"]`).click();
        await page.locator(`.kp-match-item[data-right="${right ? l : (l + 1) % n}"]`).click();
      }
      break;
    }
  }
  return spec.type;
}

/** Answers + checks + continues the question on screen; returns 'good' | 'bad' (the verdict shown). */
export async function answerAndContinue(page, mode = 'correct', via = 'tap') {
  await answer(page, mode, via);
  await clickMain(page);
  await sleep(150);
  const verdict = (await page.locator('.lesson-sheet-good').count()) ? 'good' : 'bad';
  await clickMain(page);
  return verdict;
}

/**
 * Plays the lesson on screen from its first step to the "Jöhet a minidolgozat!" card.
 * `onQuestion(type, i)` may return 'wrong' to answer that question wrong. Returns counts.
 */
export async function playSteps(page, onQuestion = () => 'correct', via = 'tap') {
  let questions = 0;
  let unexpected = 0;
  for (let guard = 0; guard < 300; guard++) {
    await sleep(60);
    if (await page.locator('.lesson-totest').count()) break;
    if (await page.locator('.lesson-qcard').count()) {
      const cur = await freshQuestion(page);
      const mode = onQuestion(cur.question.answer.type, questions) ?? 'correct';
      const verdict = await answerAndContinue(page, mode, via);
      if ((verdict === 'good') !== (mode === 'correct')) unexpected++;
      questions++;
    } else {
      // examples: reveal every step first
      for (let i = 0; i < 12 && (await page.locator('.lesson-problem').count()) && !(await page.locator('.lesson-example-answer').count()); i++) {
        await clickMain(page);
        await sleep(30);
      }
      await clickMain(page);
    }
  }
  return { questions, unexpected };
}

/** Runs the mini test on screen; the first `wrong` items are answered wrong. */
export async function playTest(page, wrong = 0, via = 'tap') {
  for (let i = 0; i < 12; i++) {
    await sleep(80);
    if (!(await page.locator('.lesson-qcard').count())) break;
    await answer(page, i < wrong ? 'wrong' : 'correct', via);
    await clickMain(page);
  }
  await sleep(300);
}
