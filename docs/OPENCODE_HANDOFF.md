# Handoff: writing the lessons with OpenCode

The app is finished: engine, screens, design, offline support and publishing all work. What is
left is **content**: 104 of the 107 lessons are `todo` (see `CONTENT_STATUS.md`). This file is
for two readers: **you** (one-time setup on your computer) and **OpenCode** (the daily workflow).

The live site is **https://janosapro.github.io/math-app/**. Every push to the `master` branch
on GitHub rebuilds and publishes it within about two minutes. GitHub runs `npm run check` first
and refuses to publish if it fails. But **anything that passes the checks goes live**, wrong math
included. So the rule below is: *OpenCode commits locally; it pushes only after you have looked
at the lesson.*

---

## Part 1 — for you: bring your computer up to date (once)

So far OpenCode only worked in your local folder. In the meantime a lot happened on GitHub
(design, sounds, lesson parts, the new name Zsebmatek, publishing). Your local folder is out of
date. Pick **one** of the two ways.

### A) Fresh copy (simplest, recommended)
```
git clone https://github.com/JanosApro/math-app.git zsebmatek
cd zsebmatek
npm install
```
Use this new `zsebmatek` folder from now on. Keep the old folder until you are sure nothing in
it is missing. Everything that was ever pushed is on GitHub, including `materials/`.

### B) Update the old folder
In the old project folder:
```
git status
```
- If it says *nothing to commit, working tree clean*: run `git pull origin master`.
- If it lists changed files: they are older than what is on GitHub. Put them aside with
  `git stash`, then `git pull origin master`.
- If `git pull` reports *diverged* or a *conflict*: stop and use way A instead.

Then run `npm install`. New packages were added (the fonts).

### Check that it works
```
npm run check     # must end with "✔ OK"
npm run dev       # then open http://localhost:5173
```

### Pushing to GitHub from your computer
The first `git push` may ask you to log in. GitHub does **not** accept your account password
there. Either install the GitHub CLI and run `gh auth login` once (easiest), or create a
*personal access token* (GitHub → Settings → Developer settings → Tokens) and paste it when
asked for the password.

---

## Part 2 — the prompt to give OpenCode

**Start with a pilot of three lessons of different difficulty** before writing many. Review
them carefully, then decide whether the model's quality is good enough or whether the
geometry and word-problem lessons need a stronger model or more review.

```
Read AGENTS.md, docs/OPENCODE_HANDOFF.md (Part 3) and CONTENT_GUIDE.md. Then write these three
lessons, one at a time, following the workflow in Part 3 exactly. Use the three finished
lessons as models (src/content/grade-7/pitagorasz/01-bizonyitas-alapok.ts,
src/content/grade-5/tortek-2/01-osszeadas-kivonas.ts,
src/content/grade-8/henger-kup-gomb/03-henger-terfogata.ts).
  1. g5-termeszetes-szamok-1-03   (arithmetic)
  2. g5-mertani-alapfogalmak-01   (geometry with figures)
  3. g5-tortek-3-01               (percent, word problems, a chart)
Commit each lesson separately. Do NOT push. After each lesson, tell me the preview link and
list anything you were unsure about.
```

For later batches, replace the list: *"write the next 3 `todo` lessons of grade 5 in
CONTENT_STATUS.md order"*, or name them.

---

## Part 3 — workflow for OpenCode (one lesson)

0. **Start of a session:** `git pull origin master`. Never work on another branch; never
   rewrite history (`git push --force`, `git rebase -i`, `git reset --hard` are forbidden).
1. **Read the scope.** Find the subtopic's row in `CONTENT_STATUS.md` (the *Scope* column says
   what to cover and which exercise types). Read the matching chapter in
   `docs/curriculum-grade-N.md` and `docs/materials-grade-N.md`. Look at the textbook screenshots
   in `materials/` for structure and style only. **Never copy their text or exercises.**
2. **Find the file name.** In `src/content/grade-N/topics.json` find `id`, the topic `folder` and
   the subtopic `file`. Create `src/content/grade-N/<folder>/<file>.ts`.
3. **Write the lesson** exactly as `CONTENT_GUIDE.md` says:
   - 3–5 parts, each about 5 minutes;
   - short texts (screens must fit a phone);
   - every answer computed by code;
   - figures that follow the numbers;
   - Hungarian suffixes after computed numbers made with `suffix` / `harmony` / `article` from
     `src/kit.ts`;
   - import only from `src/kit.ts`.
4. `npm run check -- --only=<id>` until **0 errors and 0 warnings**. Never silence a warning by
   weakening the content (e.g. removing a figure); fix the cause.
5. `npm run samples -- <id>` prints example questions with the correct answer, the hint and the
   solution. **Recompute every answer yourself.** Check that the prompt, the figure labels, the
   units, the hint, the solution steps and the answer all agree. More seeds: `--n=6`. One
   generator: `--gen=<id> --level=2`. This is the step the checker cannot do for you. Take it
   seriously: a wrong answer key marks children's correct answers as wrong.
6. Set `"status": "draft"` for this subtopic in `topics.json`, then `npm run status`.
7. `npm run check` (everything) and `npm run build` must both pass.
8. Commit **only this lesson's files**: the new `.ts` file, `topics.json`, `CONTENT_STATUS.md`.
   ```
   git add src/content/grade-N/<folder>/<file>.ts src/content/grade-N/topics.json CONTENT_STATUS.md
   git commit -m "Lesson <id>: <short Hungarian title>"
   ```
9. **Do not push.** Report to the teacher:
   - the preview link `http://localhost:5173/#/dev/preview/<id>` (they run `npm run dev`);
   - what you were unsure about (math, wording, scope).
10. When the teacher says the lesson is OK: set `"status": "done"`, `npm run status`, commit
    (`Lesson <id>: reviewed`), then `git push origin master`.
    - If the push is rejected because GitHub has newer commits: `git pull --rebase origin master`,
      run `npm run check` again, then push.
    - If the teacher asks for changes: fix them, repeat steps 4–8, report again.

### What the checker cannot see (check these yourself every time)
- **The math itself.** A formula that is consistently wrong passes every automatic test.
- Prompt ↔ answer ↔ figure ↔ units consistency (cm vs cm², labels vs numbers in the text).
- Solution steps that really lead to the stored answer, with the same numbers.
- Natural, simple Hungarian for 10–14-year-olds (the style of the three finished lessons).
- The lesson covers its scope and nothing from later grades; difficulty rises L1 → L2 → L3.
- Wrong answer options in multiple choice are *typical student mistakes*, never two equal options.

### Rules
- Lesson work touches only `src/content/` + `CONTENT_STATUS.md` (via `npm run status`). Do not
  edit the engine, the UI or the scripts. If something is missing (a figure option, an answer
  type), stop and tell the teacher instead.
- One subtopic per commit. Never commit `node_modules/` or `dist/` (they are git-ignored).
- All student-facing text is Hungarian; code and comments are English.

---

## If something goes wrong
- `npm run check` fails on a file you did not touch → `git pull origin master`, `npm install`,
  and try again. If it still fails, tell the teacher.
- The live site did not update after a push → GitHub → the repository → **Actions** tab →
  "Deploy to GitHub Pages". A red ✗ means a check failed; the log says which.
- Something looks broken on a phone but fine on the computer → students' phones keep an offline
  copy. Close and reopen the app (it updates on the next start).
