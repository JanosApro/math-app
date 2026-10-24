/**
 * One view per lesson step type: theory, example, explore, check, practice.
 * Every view renders its card(s) and its own footer, and calls `onNext` when done.
 * No step-type labels: the card's own title and the top bar are enough (screens must fit a phone).
 */
import { useMemo, useState } from 'react';
import type { CheckStep, ExampleStep, ExploreStep, PracticeStep, Question, SubtopicModule, TheoryStep } from '../engine/types';
import type { Figure } from '../figures/types';
import { generateQuestion, seedOf } from '../engine/session';
import { num } from '../engine/format';
import { FigureView } from '../figures/FigureView';
import { Rich, RichInline } from '../ui/Rich';
import { t } from '../i18n/hu';
import { LessonFooter, useEnterKey } from './parts';
import { QuestionRunner, type QuestionResult } from './QuestionRunner';

// ---------------------------------------------------------------------------------------------

export function TheoryView({ step, onNext }: { step: TheoryStep; onNext: () => void }) {
  useEnterKey(onNext);
  return (
    <>
      <div className="lesson-card">
        {step.title && (
          <h2 className="lesson-title">
            <RichInline text={step.title} />
          </h2>
        )}
        <Rich text={step.body} className="lesson-body" />
        {step.figure && <FigureView figure={step.figure} />}
        {step.remember && (
          <div className="lesson-remember">
            <span className="lesson-remember-icon" aria-hidden="true">
              ★
            </span>
            <span className="sr-only">{t.lesson.remember}: </span>
            <Rich text={step.remember} />
          </div>
        )}
      </div>
      <LessonFooter>
        <button type="button" className="btn lesson-main-btn" onClick={onNext}>
          {t.common.continue}
        </button>
      </LessonFooter>
    </>
  );
}

// ---------------------------------------------------------------------------------------------

export function ExampleView({ step, onNext }: { step: ExampleStep; onNext: () => void }) {
  const [shown, setShown] = useState(0);
  const total = step.steps.length;
  const done = shown >= total;
  // the latest revealed step with its own figure replaces the example's figure
  let figure: Figure | undefined = step.figure;
  for (let i = 0; i < shown; i++) if (step.steps[i].figure) figure = step.steps[i].figure;
  const next = () => (done ? onNext() : setShown(shown + 1));
  useEnterKey(next);
  return (
    <>
      <div className={`lesson-card lesson-example${shown > 0 ? ' is-solving' : ''}`}>
        {step.title && (
          <h2 className="lesson-title">
            <RichInline text={step.title} />
          </h2>
        )}
        <div className="lesson-problem">
          <Rich text={step.problem} />
        </div>
        {figure && <FigureView figure={figure} />}
        {shown > 0 && (
          <div className="lesson-example-steps">
            <ol aria-label={t.lesson.solution}>
              {step.steps.slice(0, shown).map((s, i) => (
                <li key={i} className="anim-slide-up">
                  <Rich text={s.text} />
                </li>
              ))}
            </ol>
          </div>
        )}
        {done && (
          <div className="lesson-example-answer anim-pop">
            <span className="lesson-example-answer-icon" aria-hidden="true">
              ✓
            </span>
            <Rich text={step.answer} />
          </div>
        )}
      </div>
      <LessonFooter>
        {!done && shown < total - 1 && (
          <button type="button" className="btn btn-ghost lesson-side-btn" onClick={() => setShown(total)}>
            {t.lesson.showAll}
          </button>
        )}
        <button type="button" className="btn lesson-main-btn" onClick={next}>
          {t.common.continue}
          {!done && <span className="lesson-btn-count">{t.common.of(shown + 1, total)}</span>}
        </button>
      </LessonFooter>
    </>
  );
}

// ---------------------------------------------------------------------------------------------

export function ExploreView({ step, onNext }: { step: ExploreStep; onNext: () => void }) {
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(step.sliders.map((s) => [s.name, s.value])));
  const rendered = useMemo(() => {
    try {
      return { ok: true as const, ...step.render(values) };
    } catch (e) {
      console.error('explore render failed', e);
      return { ok: false as const };
    }
  }, [step, values]);
  useEnterKey(onNext);
  return (
    <>
      <div className="lesson-card lesson-explore">
        {step.title && (
          <h2 className="lesson-title">
            <RichInline text={step.title} />
          </h2>
        )}
        <Rich text={step.body} className="lesson-body" />
        <div className="lesson-sliders">
          {step.sliders.map((s) => {
            const id = `slider-${s.name}`;
            return (
              <div key={s.name} className="lesson-slider">
                <label htmlFor={id} className="lesson-slider-label">
                  <RichInline text={s.label} />
                  <span className="lesson-slider-value">{num(values[s.name])}</span>
                </label>
                <input
                  id={id}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={values[s.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [s.name]: Number(e.target.value) }))}
                />
              </div>
            );
          })}
        </div>
        {rendered.ok ? (
          <div className="lesson-explore-out">
            {rendered.figure && <FigureView figure={rendered.figure} />}
            <Rich text={rendered.text} className="lesson-explore-text" />
          </div>
        ) : (
          <p className="lesson-notice">{t.figure.error}</p>
        )}
      </div>
      <LessonFooter>
        <button type="button" className="btn lesson-main-btn" onClick={onNext}>
          {t.common.continue}
        </button>
      </LessonFooter>
    </>
  );
}

// ---------------------------------------------------------------------------------------------

export function CheckView({
  step,
  seed,
  onXp,
  onNext,
}: {
  step: CheckStep;
  seed: number;
  onXp: (n: number) => void;
  onNext: () => void;
}) {
  return (
    <QuestionRunner
      question={step.question}
      seed={seed}
      mode="lesson"
      onChecked={(r) => onXp(r.xp)}
      onDone={onNext}
    />
  );
}

// ---------------------------------------------------------------------------------------------

interface PracticeItem {
  /** index used in the seed; re-queued items get fresh indices after `count` */
  k: number;
  requeued: boolean;
}

/** Generates a question; a broken generator shows an error card instead of crashing the lesson. */
function safeGenerate(mod: SubtopicModule, step: PracticeStep, seed: number): { q: Question } | { error: string } {
  try {
    return { q: generateQuestion(mod, { generator: step.generator, level: step.level }, seed) };
  } catch (e) {
    console.error(e);
    return { error: (e as Error).message };
  }
}

export function PracticeView({
  module,
  step,
  stepIndex,
  nonce,
  onXp,
  onNext,
  onSubProgress,
}: {
  module: SubtopicModule;
  step: PracticeStep;
  stepIndex: number;
  nonce: number;
  onXp: (n: number) => void;
  onNext: () => void;
  /** 0..1 progress inside this step (for the top bar). */
  onSubProgress?: (p: number) => void;
}) {
  const count = Math.max(1, step.count ?? 1);
  const [queue, setQueue] = useState<PracticeItem[]>(() => Array.from({ length: count }, (_, k) => ({ k, requeued: false })));
  const [pos, setPos] = useState(0);
  const item = queue[pos];
  const seed = seedOf('practice', module.id, nonce, stepIndex, item.k);
  const gen = useMemo(() => safeGenerate(module, step, seed), [module, step, seed]);

  const done = (r: QuestionResult | null) => {
    let q = queue;
    if (r && !r.correct && !item.requeued) {
      // a wrong item comes back ONCE as a fresh variant at the end of this practice step
      q = [...queue, { k: count + queue.filter((x) => x.requeued).length, requeued: true }];
      setQueue(q);
    }
    if (pos + 1 < q.length) {
      setPos(pos + 1);
      onSubProgress?.((pos + 1) / q.length);
    } else onNext();
  };

  if ('error' in gen) {
    return (
      <>
        <div className="lesson-card">
          <p className="lesson-notice">{t.lesson.generatorError}</p>
          {import.meta.env.DEV && <pre className="lesson-dev-error">{gen.error}</pre>}
        </div>
        <LessonFooter>
          <button type="button" className="btn lesson-main-btn" onClick={() => done(null)}>
            {t.common.continue}
          </button>
        </LessonFooter>
      </>
    );
  }
  return (
    <QuestionRunner
      key={`${pos}:${seed}`}
      question={gen.q}
      seed={seed}
      mode="lesson"
      willRequeue={!item.requeued}
      onChecked={(r) => onXp(r.xp)}
      onDone={done}
    />
  );
}
