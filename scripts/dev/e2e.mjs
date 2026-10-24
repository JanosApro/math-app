/**
 * End-to-end check of the whole app in Chromium, against a running DEV server (`npm run dev`):
 *
 *   node scripts/dev/e2e.mjs [--url=http://localhost:5173/] [--width=375] [--dark] [--shots=screenshots-tmp/e2e]
 *
 * 1. the demo lesson (#/dev/preview/dev-demo): every step type, every answer type right and wrong,
 *    an "almost" (not simplified) answer, a parse error, mini test fail → retry → pass;
 * 2. the student flow: onboarding → grade 7 → the recommended lesson (Pythagoras) with a failed
 *    and a passed mini test → soft-locked lesson → warning dialog → "Mégis megnyitom" → daily
 *    challenge → streak in the header and the profile calendar → export → clear storage →
 *    import → progress restored.
 * Prints one line per check; exit code 1 if a check fails or the page logged an error.
 * Needs a Chromium (see pw.mjs). Takes about a minute.
 */
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { answer, clickMain, freshQuestion, freshState, noHScroll, openPage, playSteps, playTest, shot, skipQuestion, sleep, STORAGE_KEY, tapText } from './drive.mjs';

const arg = (name, def) => (process.argv.find((a) => a.startsWith(`--${name}=`)) ?? `=${def}`).split('=').slice(1).join('=');
const BASE = arg('url', 'http://localhost:5173/');
const WIDTH = Number(arg('width', '375'));
const DARK = process.argv.includes('--dark');
const SHOTS = arg('shots', '');

const results = [];
const check = (ok, msg) => {
  results.push(ok);
  console.log(`${ok ? '  ✔' : '  ✖'} ${msg}`);
};

// ---------------------------------------------------------------------------------------------
// 1. Demo lesson: every answer type
// ---------------------------------------------------------------------------------------------
async function demoLesson() {
  console.log(`\nDemo lesson (${WIDTH} px${DARK ? ', dark' : ''})`);
  const { browser, page, errors } = await openPage({ width: WIDTH, dark: DARK, state: freshState(7) });
  await page.goto(`${BASE}#/dev/preview/dev-demo`);
  await page.waitForSelector('.lesson-start');
  await clickMain(page);
  const seen = new Set();
  const notices = [];
  // first question of each type: wrong (where it is cheap), and the almost / parse-error cases
  const { questions, unexpected } = await playSteps(page, (type) => {
    const first = !seen.has(type);
    seen.add(type);
    return first && ['number', 'choice', 'order', 'match', 'numbers'].includes(type) ? 'wrong' : 'correct';
  });
  check(questions >= 15 && unexpected === 0, `${questions} questions, every verdict as expected (types: ${[...seen].join(', ')})`);
  check(seen.size === 9, 'all 9 answer types appeared');
  await shot(page, SHOTS, 'demo-totest');
  // "almost" and parse error: jump to the fraction practice with the preview's dev panel
  await page.reload(); // same URL: start the preview again
  await page.waitForSelector('.lesson-start');
  await page.locator('.dev-preview-toggle').click();
  await page.locator('.dev-preview-step', { hasText: 'frac-add · L1' }).click();
  await page.waitForSelector('.lesson-qcard');
  const q = (await freshQuestion(page)).question.answer;
  await tapText(page, `${q.num * 2}/${q.den * 2}`);
  await clickMain(page);
  await sleep(150);
  notices.push(await page.locator('.lesson-notice').textContent());
  await page.locator('.kp-key[aria-label="Mindent töröl"]').click();
  await tapText(page, '1//');
  await clickMain(page);
  await sleep(150);
  notices.push(await page.locator('.lesson-notice').textContent());
  check(/egyszerűsíthető/.test(notices[0] ?? ''), '"almost": an unsimplified fraction gets the "simplify it" notice');
  check(/nem értem/.test(notices[1] ?? ''), 'parse error: "1//" gets the "I don\'t understand" notice');
  // mini test: fail, then pass
  await skipQuestion(page); // the fraction practice question stays unanswered
  await page.locator('.dev-preview-toggle').click();
  await page.locator('.dev-preview-jumps .btn', { hasText: 'Minidolgozat' }).click();
  // wait for the test itself (the practice card that was on screen also matches .lesson-qcard)
  await page.waitForFunction(() => /feladat \//.test(document.querySelector('.lesson-chip')?.textContent ?? ''));
  await playTest(page, 3);
  check((await page.locator('.lesson-review-item').count()) === 3, 'mini test with 3 wrong answers fails and lists them');
  await clickMain(page);
  await playTest(page, 0, 'keyboard');
  check((await page.locator('.lesson-celebrate').count()) === 1, 'retry (typed on the physical keyboard) passes → celebration');
  await shot(page, SHOTS, 'demo-celebration');
  check(errors.length === 0, `no console errors${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  await browser.close();
}

// ---------------------------------------------------------------------------------------------
// 2. The student flow
// ---------------------------------------------------------------------------------------------
async function studentFlow() {
  console.log(`\nStudent flow (${WIDTH} px${DARK ? ', dark' : ''})`);
  const { browser, page, errors } = await openPage({ width: WIDTH, dark: DARK, state: null });
  const saved = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), STORAGE_KEY);

  await page.goto(BASE);
  await page.waitForSelector('.onb');
  check((await page.evaluate(() => location.hash)) === '#/welcome', 'first visit → onboarding');
  await page.locator('.onb-grade', { hasText: '7.' }).click();
  await page.locator('.onb-go').click();
  await page.waitForSelector('.map-topic');
  await shot(page, SHOTS, 'map');

  const rec = page.locator('.st-recommended .node');
  const recId = await rec.getAttribute('data-node-id');
  check(recId === 'g7-pitagorasz-01', `recommended lesson: ${recId}`);
  await rec.click();
  await page.waitForSelector('.lesson-start');
  await clickMain(page);
  const { questions, unexpected } = await playSteps(page);
  check(questions > 10 && unexpected === 0, `lesson played (${questions} questions)`);
  check(await noHScroll(page), 'no horizontal scroll in the lesson');
  await clickMain(page);
  await playTest(page, 3);
  check((await page.locator('.lesson-result').count()) === 1, 'mini test failed → review, retry offered');
  await clickMain(page);
  await playTest(page, 0);
  check((await page.locator('.lesson-celebrate').count()) === 1, 'mini test passed → celebration');
  await shot(page, SHOTS, 'celebration');
  check(!!(await saved()).grades['7'].subtopics['g7-pitagorasz-01'].completedAt, 'completion saved');
  await clickMain(page);
  await page.waitForSelector('.map-topic');

  // soft lock: the dev flag makes "todo" lessons openable, so later nodes are soft-locked
  await page.evaluate(() => localStorage.setItem('matek-kaland:dev-open-all', '1'));
  await page.reload();
  await page.waitForSelector('.map-topic');
  const locked = page.locator('.st-softLocked .node').nth(3);
  const lockedId = await locked.getAttribute('data-node-id');
  await locked.scrollIntoViewIfNeeded();
  await locked.click();
  await page.waitForSelector('.dlg-panel');
  check((await page.locator('.sl-item').count()) > 0, `soft-locked ${lockedId}: warning dialog lists the missing lessons`);
  await shot(page, SHOTS, 'softlock');
  await page.locator('.dlg-actions .btn-ghost').click();
  await page.waitForSelector('.lesson-message, .lesson-start');
  await page.goto(BASE);
  await page.waitForSelector('.map-topic');
  await page.locator(`.node[data-node-id="${lockedId}"]`).click();
  await sleep(400);
  check((await page.locator('.dlg-panel').count()) === 0, '"Mégis megnyitom" remembered: no second warning');
  await page.evaluate(() => localStorage.removeItem('matek-kaland:dev-open-all'));

  // daily challenge + streak
  await page.goto(`${BASE}#/daily`);
  await page.waitForSelector('.lesson-daily-intro');
  await clickMain(page);
  for (let i = 0; i < 10; i++) {
    await sleep(100);
    if (!(await page.locator('.lesson-qcard').count())) break;
    await answer(page, 'correct');
    await clickMain(page);
    await sleep(120);
    await clickMain(page);
  }
  await sleep(300);
  check((await page.locator('.lesson-celebrate').count()) === 1, 'daily challenge completed');
  await page.goto(BASE);
  await page.waitForSelector('.map-topic');
  check((await page.locator('.shell-chip-streak.is-lit .shell-chip-num').textContent()) === '1', 'header streak: 🔥 1');
  await page.goto(`${BASE}#/profile`);
  await page.waitForSelector('.pf');
  check((await page.locator('.pf-cal-day.is-today.is-done').count()) === 1, 'profile calendar marks today');

  // export → clear → import
  const before = await saved();
  await page.goto(`${BASE}#/settings`);
  await page.waitForSelector('.st');
  const dir = mkdtempSync(join(tmpdir(), 'mk-e2e-'));
  const file = join(dir, 'mentes.json');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('.st-buttons .btn').first().click()]);
  await dl.saveAs(file);
  check(JSON.parse(readFileSync(file, 'utf8')).state.grades['7'].xp === before.grades['7'].xp, `export: ${dl.suggestedFilename()}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.onb');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.onb-restore .link-btn').click()]);
  await chooser.setFiles(file);
  await page.waitForSelector('.dlg-panel');
  await page.locator('.dlg-actions .btn').first().click();
  await page.waitForSelector('.map-topic');
  const after = await saved();
  check(JSON.stringify(after.grades) === JSON.stringify(before.grades) && after.grade === 7, 'storage cleared → import restored everything');
  check(await noHScroll(page), 'no horizontal scroll on the map');
  await shot(page, SHOTS, 'restored');
  check(errors.length === 0, `no console errors${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  await browser.close();
}

try {
  await demoLesson();
  await studentFlow();
} catch (e) {
  console.error(e);
  results.push(false);
}
const failed = results.filter((r) => !r).length;
console.log(`\n${failed ? `✖ ${failed} check(s) failed` : `✔ all ${results.length} checks passed`}`);
process.exit(failed ? 1 : 0);
