/**
 * The /dev page (dev builds only): content validation report + sample viewer.
 * The validation runs in the browser in chunks (see src/dev/validate.ts) so the UI stays
 * responsive; the same code powers `npm run check` on the CLI.
 */
import { useEffect, useMemo, useState } from 'react';
import { GRADES, allModulePaths, getDailyConfig, getGradeTopics, importModule } from '../content/registry';
import type { Difficulty, GeneratorDef, SubtopicMeta, SubtopicModule } from '../engine/types';
import { canonicalInput, checkAnswer, formatAnswer } from '../engine/answers';
import { createRng } from '../engine/rng';
import { FigureView } from '../figures/FigureView';
import { Rich } from '../ui/Rich';
import { navigate } from '../ui/router';
import {
  countIssues,
  stressTestGenerator,
  validateCatalogStructure,
  validateModule,
  type GradeData,
  type ModuleEntry,
  type ValidationIssue,
} from './validate';
import './dev.css';

const TICK = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

interface ModuleInfo {
  path: string;
  module: SubtopicModule;
  sub?: SubtopicMeta;
  grade: number;
  topicTitle: string;
}

interface DevState {
  phase: 'loading' | 'ready' | 'stressing' | 'error';
  modules: ModuleInfo[];
  issues: ValidationIssue[];
  stressIssues: ValidationIssue[];
  progress: { label: string; done: number; total: number } | null;
  error?: string;
}

const INITIAL: DevState = { phase: 'loading', modules: [], issues: [], stressIssues: [], progress: null };

/** Subtopic id that an issue belongs to ('g7-pitagorasz-01/hypotenuse L2' → g7-pitagorasz-01). */
function issueSubtopic(issue: ValidationIssue): string | undefined {
  return /^g\d+-[a-z0-9-]+-\d\d/.exec(issue.where)?.[0];
}

export default function DevScreen() {
  const [state, setState] = useState<DevState>(INITIAL);

  // ---- load modules + run the default validation in chunks -------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const entries: ModuleEntry[] = [];
        const importIssues: ValidationIssue[] = [];
        for (const path of allModulePaths()) {
          try {
            entries.push({ path, module: await importModule(path) });
          } catch (e) {
            importIssues.push({ level: 'error', where: path, message: `import failed: ${(e as Error).message}` });
          }
        }

        const gradesData: GradeData[] = [];
        const modules: ModuleInfo[] = [];
        for (const g of GRADES) {
          const topics = getGradeTopics(g.grade);
          if (!topics) continue;
          const gradeModules = entries.filter((e) => e.path.startsWith(`./grade-${g.grade}/`));
          gradesData.push({ folder: `grade-${g.grade}`, topics, daily: getDailyConfig(g.grade), modules: gradeModules });
          for (const topic of topics.topics) {
            for (const sub of topic.subtopics) {
              const suffix = `./grade-${g.grade}/${topic.folder}/${sub.file}.ts`;
              const entry = gradeModules.find((e) => e.path === suffix);
              if (entry) modules.push({ path: entry.path, module: entry.module, sub, grade: g.grade, topicTitle: topic.title });
            }
          }
        }
        if (cancelled) return;
        setState((s) => ({ ...s, modules: modules.sort((a, b) => a.module.id.localeCompare(b.module.id)) }));

        // 1) catalog structure (fast, synchronous)
        const catalogIssues = [...importIssues, ...validateCatalogStructure({ grades: GRADES, gradesData })];

        // 2) module structure + rich text + figures, one module per tick
        const total = entries.length;
        let done = 0;
        const moduleIssues: ValidationIssue[] = [];
        for (const entry of entries) {
          const sub = modules.find((m) => m.path === entry.path)?.sub;
          validateModule(entry.module, sub, moduleIssues);
          done++;
          if (cancelled) return;
          if (done % 2 === 0 || done === total) {
            setState((s) => ({ ...s, issues: [...catalogIssues, ...moduleIssues], progress: { label: 'Modulok ellenőrzése', done, total } }));
            await TICK();
          }
        }
        if (cancelled) return;
        setState((s) => ({ ...s, phase: 'ready', issues: [...catalogIssues, ...moduleIssues], progress: null }));
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, phase: 'error', error: (e as Error).message, progress: null }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- stress test (button) --------------------------------------------------------------
  async function runStress(seeds: number) {
    if (state.phase === 'stressing') return;
    setState((s) => ({ ...s, phase: 'stressing', stressIssues: [], progress: { label: `Stresszteszt (${seeds} seed)`, done: 0, total: 1 } }));
    const out: ValidationIssue[] = [];
    const units: { mod: SubtopicModule; gen: GeneratorDef; level: Difficulty }[] = [];
    for (const m of state.modules) for (const gen of m.module.generators) for (const level of gen.levels) units.push({ mod: m.module, gen, level });
    let done = 0;
    for (const unit of units) {
      out.push(...stressTestGenerator(unit.mod.id, unit.gen, unit.level, seeds));
      done++;
      setState((s) => ({ ...s, stressIssues: [...out], progress: { label: `Stresszteszt (${seeds} seed)`, done, total: units.length } }));
      await TICK();
    }
    setState((s) => ({ ...s, phase: 'ready', stressIssues: out, progress: null }));
  }

  const issues = useMemo(() => [...state.issues, ...state.stressIssues], [state.issues, state.stressIssues]);
  const counts = countIssues(issues);
  const issuesBySub = useMemo(() => {
    const map = new Map<string, ValidationIssue[]>();
    for (const i of issues) {
      const key = issueSubtopic(i) ?? 'catalog';
      const list = map.get(key) ?? [];
      list.push(i);
      map.set(key, list);
    }
    return map;
  }, [issues]);

  return (
    <div className="dev-page">
      <div className="dev-top">
        <h1>Zsebmatek · fejlesztői oldal</h1>
        <div className="dev-links">
          <button type="button" className="btn btn-small btn-ghost" onClick={() => navigate({ name: 'devGallery' })}>
            Ábragaléria
          </button>
          <button type="button" className="btn btn-small btn-ghost" onClick={() => navigate({ name: 'devPreview', subtopicId: 'dev-demo' })}>
            Demó lecke
          </button>
          <button type="button" className="btn btn-small btn-ghost" onClick={() => navigate({ name: 'map' })}>
            ← App
          </button>
        </div>
      </div>

      {/* ---- validation summary ---- */}
      <section className="dev-card">
        <h2>Tartalom-ellenőrzés</h2>
        {state.phase === 'error' && <p className="dev-issue-error">Hiba történt: {state.error}</p>}
        {state.progress && (
          <>
            <div className="muted" style={{ fontSize: '0.88rem' }}>
              {state.progress.label} — {state.progress.done} / {state.progress.total}
            </div>
            <div className="dev-progress">
              <div style={{ width: `${Math.round((100 * state.progress.done) / Math.max(1, state.progress.total))}%` }} />
            </div>
          </>
        )}
        {state.phase !== 'loading' && !state.progress && (
          <>
            <div className="dev-controls" style={{ marginBottom: '0.5rem' }}>
              {counts.errors > 0 ? (
                <span className="dev-count dev-count-bad">✖ {counts.errors} hiba</span>
              ) : (
                <span className="dev-count dev-count-ok">✔ nincs hiba</span>
              )}
              {counts.warnings > 0 && <span className="dev-count dev-count-warn">⚠ {counts.warnings} figyelmeztetés</span>}
              <span className="dev-count dev-count-muted">{state.modules.length} modul betöltve</span>
              <span style={{ flex: 1 }} />
              <button type="button" className="btn btn-small btn-ghost" disabled={state.phase === 'stressing'} onClick={() => runStress(100)}>
                Stresszteszt · 100
              </button>
              <button type="button" className="btn btn-small" disabled={state.phase === 'stressing'} onClick={() => runStress(500)}>
                Stresszteszt · 500
              </button>
              {state.stressIssues.length > 0 && (
                <span className="dev-count dev-count-muted">utolsó stresszteszt: {countIssues(state.stressIssues).errors} hiba / {countIssues(state.stressIssues).warnings} figy.</span>
              )}
            </div>
          </>
        )}
      </section>

      {/* ---- subtopic list ---- */}
      <section className="dev-card">
        <h2>Altemák</h2>
        {GRADES.map((g) => {
          const topics = getGradeTopics(g.grade);
          if (!topics) return null;
          const gradeModules = state.modules.filter((m) => m.grade === g.grade);
          if (gradeModules.length === 0 && topics.topics.every((t) => t.subtopics.every((s) => s.status === 'todo'))) {
            // no content at all yet — collapse to one line
            return (
              <p key={g.grade} className="muted" style={{ margin: '0.4rem 0' }}>
                {g.label}: minden altema <em>todo</em> — nincs még tartalom.
              </p>
            );
          }
          return (
            <div key={g.grade}>
              <h3>
                {g.label}{' '}
                <span className="muted" style={{ fontWeight: 400 }}>
                  ({gradeModules.length} modul)
                </span>
              </h3>
              {topics.topics.map((topic) => (
                <div key={topic.id}>
                  <div className="dev-topic" style={{ color: topic.color ?? undefined }}>
                    {topic.title}
                  </div>
                  {topic.subtopics.map((sub) => (
                    <SubtopicRow
                      key={sub.id}
                      sub={sub}
                      module={state.modules.find((m) => m.module.id === sub.id)?.module}
                      issues={issuesBySub.get(sub.id) ?? []}
                    />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </section>

      {/* ---- issue report ---- */}
      {issues.length > 0 && (
        <section className="dev-card">
          <h2>Részletes jelentés</h2>
          <IssueReport issues={issues} />
        </section>
      )}

      {/* ---- sample viewer ---- */}
      {state.modules.length > 0 && (
        <section className="dev-card">
          <h2>Feladat-előnézet</h2>
          <SampleViewer modules={state.modules} />
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Subtopic row
// ---------------------------------------------------------------------------------------------

function SubtopicRow({ sub, module, issues }: { sub: SubtopicMeta; module?: SubtopicModule; issues: ValidationIssue[] }) {
  const counts = countIssues(issues);
  return (
    <div className="dev-sub">
      <div className="dev-sub-main">
        <span className={`dev-badge dev-badge-${sub.status}`}>{sub.status}</span>
        <span className="dev-sub-title">{sub.title}</span>
        {module ? (
          <span className="dev-count dev-count-ok">modul ✔ · {module.generators.length} generátor</span>
        ) : (
          <span className="dev-count dev-count-muted">nincs modul</span>
        )}
        {counts.errors > 0 && <span className="dev-count dev-count-bad">✖ {counts.errors}</span>}
        {counts.warnings > 0 && <span className="dev-count dev-count-warn">⚠ {counts.warnings}</span>}
        {module && (
          <a
            className="btn btn-small btn-ghost"
            href={`#/dev/preview/${encodeURIComponent(sub.id)}`}
            onClick={(e) => {
              e.preventDefault();
              navigate({ name: 'devPreview', subtopicId: sub.id });
            }}
          >
            Előnézet
          </a>
        )}
      </div>
      <div className="dev-sub-meta">
        <span>{sub.id}</span>
        <span>
          {sub.file}.ts
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Issue report (catalog + per-subtopic groups)
// ---------------------------------------------------------------------------------------------

function IssueReport({ issues }: { issues: ValidationIssue[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, ValidationIssue[]>();
    for (const i of issues) {
      const key = issueSubtopic(i) ?? 'catalog';
      const list = map.get(key);
      if (list) list.push(i);
      else map.set(key, [i]);
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === 'catalog') return -1;
      if (b[0] === 'catalog') return 1;
      return a[0].localeCompare(b[0]);
    });
  }, [issues]);
  return (
    <div className="dev-issue-list">
      {groups.map(([key, list]) => {
        const counts = countIssues(list);
        return (
          <details key={key} open={counts.errors > 0 && groups.length < 4}>
            <summary>
              {key === 'catalog' ? 'Katalógus (grades.json, topics.json, daily.json)' : key} — {counts.errors} hiba, {counts.warnings} figyelmeztetés
            </summary>
            {list.map((i, idx) => (
              <div key={idx} className={`dev-issue dev-issue-${i.level === 'error' ? 'error' : 'warn'}`}>
                <span>{i.level === 'error' ? '✖' : '⚠'}</span>
                <span className="dev-where">{i.where}</span>
                <span className="dev-msg">{i.message}</span>
              </div>
            ))}
          </details>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Sample viewer: subtopic → generator → level → seed → rendered question
// ---------------------------------------------------------------------------------------------

function SampleViewer({ modules }: { modules: ModuleInfo[] }) {
  const [modId, setModId] = useState(modules[0].module.id);
  const mod = modules.find((m) => m.module.id === modId) ?? modules[0];
  const [genId, setGenId] = useState(mod.module.generators[0].id);
  const gen = mod.module.generators.find((g) => g.id === genId) ?? mod.module.generators[0];
  const [level, setLevel] = useState<Difficulty>(gen.levels[0]);
  const [seed, setSeed] = useState(1);

  const effectiveGen = mod.module.generators.find((g) => g.id === genId) ?? mod.module.generators[0];
  const effectiveLevel = effectiveGen.levels.includes(level) ? level : effectiveGen.levels[0];

  const question = useMemo(() => {
    try {
      return { q: effectiveGen.generate(createRng(seed), effectiveLevel), error: null as string | null };
    } catch (e) {
      return { q: null, error: (e as Error).message };
    }
  }, [effectiveGen, effectiveLevel, seed]);

  const canonical = useMemo(() => {
    if (!question.q) return null;
    try {
      const input = canonicalInput(question.q.answer);
      const res = checkAnswer(question.q.answer, input);
      return { input: describeStudentAnswer(input), ok: res.correct };
    } catch (e) {
      return { input: `— (${(e as Error).message})`, ok: false };
    }
  }, [question.q]);

  return (
    <>
      <div className="dev-controls">
        <select value={modId} onChange={(e) => setModId(e.target.value)} aria-label="Altema">
          {modules.map((m) => (
            <option key={m.module.id} value={m.module.id}>
              {m.module.id}
            </option>
          ))}
        </select>
        <select
          value={effectiveGen.id}
          onChange={(e) => {
            setGenId(e.target.value);
            const g = mod.module.generators.find((x) => x.id === e.target.value);
            if (g) setLevel(g.levels[0]);
          }}
          aria-label="Generátor"
        >
          {mod.module.generators.map((g) => (
            <option key={g.id} value={g.id}>
              {g.id} — {g.title}
            </option>
          ))}
        </select>
        <span className="dev-controls">
          {effectiveGen.levels.map((l) => (
            <button key={l} type="button" className={`btn btn-small ${effectiveLevel === l ? '' : 'btn-ghost'}`} onClick={() => setLevel(l)}>
              L{l}
            </button>
          ))}
        </span>
        <span className="dev-controls">
          <button type="button" className="btn btn-small btn-ghost" onClick={() => setSeed(Math.max(1, seed - 1))} aria-label="Előző seed">
            ‹
          </button>
          <input type="number" min={1} value={seed} onChange={(e) => setSeed(Math.max(1, Math.floor(Number(e.target.value)) || 1))} aria-label="Seed" />
          <button type="button" className="btn btn-small btn-ghost" onClick={() => setSeed(seed + 1)} aria-label="Következő seed">
            ›
          </button>
        </span>
      </div>

      {question.error ? (
        <p className="dev-issue-error" style={{ marginTop: '0.7rem' }}>
          A generátor hibát dobott: {question.error}
        </p>
      ) : (
        question.q && (
          <div className="dev-q">
            <Rich text={question.q.prompt} className="dev-q-prompt" />
            {question.q.figure && <FigureView figure={question.q.figure} />}
            {question.q.inputLabel && (
              <>
                <h3>Bemeneti címke</h3>
                <Rich text={question.q.inputLabel} />
              </>
            )}
            <h3>Helyes válasz</h3>
            <Rich text={formatAnswer(question.q.answer)} />
            {canonical && (
              <p style={{ fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
                Elvárt bemenet: <span className="dev-kbd">{canonical.input}</span>{' '}
                {canonical.ok ? <span className="dev-count dev-count-ok">ellenőrzés ✔</span> : <span className="dev-count dev-count-bad">ellenőrzés ✖</span>}
              </p>
            )}
            <h3>Tipp</h3>
            <Rich text={question.q.hint} />
            <h3>Megoldás</h3>
            <ol>
              {question.q.solution.map((s, i) => (
                <li key={i}>
                  <Rich text={s} />
                </li>
              ))}
            </ol>
            <h3>Answer spec</h3>
            <pre className="dev-json">{JSON.stringify(question.q.answer, null, 2)}</pre>
          </div>
        )
      )}
    </>
  );
}

/** The canonical answer in a compact, human-readable form. */
function describeStudentAnswer(input: ReturnType<typeof canonicalInput>): string {
  switch (input.type) {
    case 'text':
      return input.text;
    case 'fields':
      return input.texts.join(' | ');
    case 'choice':
      return `#${input.index}`;
    case 'truefalse':
      return input.value ? 'Igaz' : 'Hamis';
    case 'order':
      return input.order.join(' → ');
    case 'match':
      return input.rightForLeft.join(' ');
  }
}
