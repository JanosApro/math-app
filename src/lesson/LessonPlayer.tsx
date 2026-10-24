/**
 * The lesson player. A lesson is 3–5 short parts and a mini test:
 *
 *   overview (goals + the part list) → part (its steps one by one) → "part done" (XP, streak)
 *   → next part … → "Jöhet a minidolgozat!" → mini test → celebration
 *
 *   <LessonPlayer module={mod} title="…" grade={7} topics={topics} topic={topic} color="#3b6fe0" onExit={…} />
 *
 * Every finished part is saved (`recordPartDone`: XP bonus + the day counts for the streak).
 * `preview` (dev) disables every write to the progress store. `initial` skips the overview
 * (dev preview: jump to a part / step or straight to the test).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { GradeTopics, LessonStep, SubtopicModule, TopicMeta } from '../engine/types';
import { seedOf } from '../engine/session';
import { recommendedNext } from '../content/catalog';
import { addXp, isCompleted, recordPartDone, recordTestResult, streakOf, type PartOutcome, type TestOutcome } from '../state/progress';
import { getState, gradeProgress, useAppState } from '../state/store';
import { XP } from '../state/xp';
import { Dialog } from '../ui/Dialog';
import { InfoButton } from '../ui/InfoButton';
import { Rich, RichInline } from '../ui/Rich';
import { TopicIcon } from '../ui/TopicIcon';
import { navigate } from '../ui/router';
import { t } from '../i18n/hu';
import { Celebration } from './Celebration';
import { MiniTest, ReviewList, type TestResult } from './MiniTest';
import { LessonFooter, LessonTopBar, scrollTop, useEnterKey } from './parts';
import { CheckView, ExampleView, ExploreView, PracticeView, TheoryView } from './steps';
import './lesson.css';

/** Where the player starts (dev preview). */
export type PlayerStart = { part: number; step?: number } | 'test';

export interface LessonPlayerProps {
  module: SubtopicModule;
  /** Subtopic title (topics.json). */
  title: string;
  /** Grade of the subtopic; undefined for the dev demo lesson (nothing is saved then). */
  grade?: number;
  topics?: GradeTopics;
  topic?: TopicMeta;
  /** Topic color (CSS color) — set as `--topic` on the root. */
  color?: string;
  /** Dev preview: no progress, XP or test results are saved. */
  preview?: boolean;
  /** ✕ / "Vissza a térképre". */
  onExit: () => void;
  /** Skip the overview: open this part (and step) or the mini test. */
  initial?: PlayerStart;
  /** Extra content at the right end of the top bar (dev preview tools). */
  topExtra?: ReactNode;
}

type Phase = 'overview' | 'part' | 'partDone' | 'toTest' | 'test' | 'done';

interface Done {
  result: TestResult;
  outcome: TestOutcome;
  lessonXp: number;
}

/** Number of questions in a part (checks + practice items). */
export function partQuestionCount(steps: LessonStep[]): number {
  return steps.reduce((n, st) => n + (st.type === 'check' ? 1 : st.type === 'practice' ? Math.max(1, st.count ?? 1) : 0), 0);
}

export function LessonPlayer({ module, title, grade, topics, topic, color, preview, onExit, initial, topExtra }: LessonPlayerProps) {
  const parts = module.parts;
  const saving = !preview && grade !== undefined;
  const saved = useAppState((s) => (grade !== undefined && !preview ? gradeProgress(s, grade).subtopics[module.id] : undefined));
  // parts finished in this session too (the only record in preview mode)
  const [sessionDone, setSessionDone] = useState<number[]>([]);
  const savedParts = saved?.parts;
  const partsDone = useMemo(() => [...new Set([...(savedParts ?? []), ...sessionDone])].sort((a, b) => a - b), [savedParts, sessionDone]);

  const [phase, setPhase] = useState<Phase>(() => (initial === undefined ? 'overview' : initial === 'test' ? 'test' : 'part'));
  const [part, setPart] = useState(() => (initial && initial !== 'test' ? Math.max(0, Math.min(parts.length - 1, initial.part)) : 0));
  const [index, setIndex] = useState(() => (initial && initial !== 'test' ? Math.max(0, Math.min(parts[Math.min(parts.length - 1, initial.part)].steps.length - 1, initial.step ?? 0)) : 0));
  const [nonce, setNonce] = useState(() => Date.now());
  const [sub, setSub] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [quitOpen, setQuitOpen] = useState(false);
  const [partResult, setPartResult] = useState<{ outcome: PartOutcome; xp: number } | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const partXp = useRef(0);
  const lessonXp = useRef(0);

  useEffect(scrollTop, [phase, part, index]);

  const steps = parts[part]?.steps ?? [];
  const testN = module.miniTest.items.length;
  const progress =
    phase === 'part'
      ? (index + sub) / Math.max(1, steps.length)
      : phase === 'test'
        ? testProgress
        : phase === 'overview'
          ? partsDone.length / (parts.length + 1)
          : 1;

  const onXp = (n: number) => {
    if (n <= 0) return;
    partXp.current += n;
    lessonXp.current += n;
    if (saving) addXp(grade!, n);
  };

  const startPart = (p: number) => {
    setNonce(Date.now());
    partXp.current = 0;
    setPart(p);
    setIndex(0);
    setSub(0);
    setPhase('part');
  };

  const finishPart = () => {
    let outcome: PartOutcome;
    if (saving) outcome = recordPartDone(grade!, module.id, part);
    else {
      const s = grade !== undefined ? streakOf(getState(), grade) : { current: 0, best: 0, doneToday: false };
      outcome = { firstTime: true, xpGained: XP.partComplete, streak: s, streakExtended: false };
    }
    setSessionDone((d) => (d.includes(part) ? d : [...d, part]));
    setPartResult({ outcome, xp: partXp.current + outcome.xpGained });
    lessonXp.current += outcome.xpGained;
    setPhase('partDone');
  };

  const next = () => {
    setSub(0);
    if (index + 1 < steps.length) setIndex(index + 1);
    else finishPart();
  };

  /** After a part: the next unfinished part (later ones first), or the mini test. */
  const doneNow = new Set(partsDone);
  const nextPart = (() => {
    for (let p = part + 1; p < parts.length; p++) if (!doneNow.has(p)) return p;
    for (let p = 0; p < parts.length; p++) if (!doneNow.has(p)) return p;
    return -1;
  })();

  const onPass = (result: TestResult) => {
    let outcome: TestOutcome;
    if (saving && topics) outcome = recordTestResult(grade!, topics, module.id, result.percent, result.passPercent);
    else {
      const first = !(grade !== undefined && isCompleted(getState(), grade, module.id));
      outcome = { passed: true, percent: result.percent, firstCompletion: first, xpGained: first ? XP.lessonComplete : XP.lessonReplay };
    }
    setDone({ result, outcome, lessonXp: lessonXp.current });
    setPhase('done');
  };
  const onFail = (result: TestResult) => {
    if (saving && topics) recordTestResult(grade!, topics, module.id, result.percent, result.passPercent);
  };

  const askQuit = () => {
    if (phase === 'overview' || phase === 'done' || phase === 'partDone') onExit();
    else setQuitOpen(true);
  };

  const style = color ? ({ '--topic': color } as CSSProperties) : undefined;
  let body: JSX.Element;
  switch (phase) {
    case 'overview':
      body = (
        <Overview
          module={module}
          title={title}
          topic={topic}
          partsDone={partsDone}
          completed={!!saved?.completedAt}
          bestPercent={saved?.bestPercent}
          onPart={startPart}
          onTest={() => setPhase('toTest')}
        />
      );
      break;
    case 'part': {
      const step = steps[index];
      const key = `${nonce}:${part}:${index}`;
      let view: JSX.Element;
      switch (step.type) {
        case 'theory':
          view = <TheoryView key={key} step={step} onNext={next} />;
          break;
        case 'example':
          view = <ExampleView key={key} step={step} onNext={next} />;
          break;
        case 'explore':
          view = <ExploreView key={key} step={step} onNext={next} />;
          break;
        case 'check':
          view = <CheckView key={key} step={step} seed={seedOf('check', module.id, nonce, part, index)} onXp={onXp} onNext={next} />;
          break;
        case 'practice':
          view = <PracticeView key={key} module={module} step={step} stepIndex={part * 100 + index} nonce={nonce} onXp={onXp} onNext={next} onSubProgress={setSub} />;
          break;
      }
      body = (
        <div key={key} className="lesson-stage">
          {view}
        </div>
      );
      break;
    }
    case 'partDone': {
      const r = partResult!;
      const allDone = nextPart === -1;
      body = (
        <div className="lesson-stage">
          <Celebration
            title={t.lesson.partDoneTitle(part + 1)}
            xp={r.xp}
            streak={r.outcome.streak.current > 0 ? r.outcome.streak : undefined}
            milestone={r.outcome.milestone}
            sound={r.outcome.milestone ? 'chapterComplete' : 'partComplete'}
            size="part"
            actions={
              <>
                <button type="button" className="btn btn-ghost lesson-side-btn" onClick={() => setPhase('overview')}>
                  {t.lesson.backToLesson}
                </button>
                <button type="button" className="btn lesson-main-btn" onClick={() => (allDone ? setPhase('toTest') : startPart(nextPart))}>
                  {allDone ? t.lesson.toTestBtn : t.lesson.nextPart(nextPart + 1)}
                </button>
              </>
            }
          >
            <PartDots count={parts.length} done={doneNow} current={part} completed={!!saved?.completedAt} />
          </Celebration>
        </div>
      );
      break;
    }
    case 'toTest':
      body = <ToTest module={module} onStart={() => setPhase('test')} />;
      break;
    case 'test':
      body = (
        <div className="lesson-stage">
          <MiniTest module={module} onPass={onPass} onFail={onFail} onExit={onExit} onProgress={setTestProgress} />
        </div>
      );
      break;
    case 'done':
      body = <LessonDone done={done!} grade={grade} topics={topics} topic={topic} color={color} moduleId={module.id} saving={saving} onExit={onExit} />;
      break;
  }

  return (
    <div className="lesson" style={style}>
      <LessonTopBar progress={progress} onClose={askQuit}>
        {(phase === 'part' || phase === 'partDone') && (
          <span className="lesson-top-part" title={parts[part]?.title}>
            {t.lesson.part(part + 1)}
            <span className="lesson-top-part-of">/{parts.length}</span>
          </span>
        )}
        {phase === 'test' && (
          <span className="lesson-top-part" title={t.test.title}>
            <span aria-hidden="true">📝 </span>
            <span className="sr-only">{t.test.title}: </span>
            {Math.min(testN, Math.round(testProgress * testN) + 1)}
            <span className="lesson-top-part-of">/{testN}</span>
          </span>
        )}
        {topExtra}
      </LessonTopBar>
      <main className="lesson-main">{body}</main>
      <Dialog
        open={quitOpen}
        title={t.lesson.quitTitle}
        onClose={() => setQuitOpen(false)}
        actions={
          <>
            <button type="button" className="btn" onClick={() => setQuitOpen(false)}>
              {t.lesson.stay}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setQuitOpen(false);
                onExit();
              }}
            >
              {t.lesson.quit}
            </button>
          </>
        }
      >
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

/** One dot per part + the test: ✓ done, ● current, ○ to do. */
function PartDots({ count, done, current, completed }: { count: number; done: Set<number>; current: number; completed: boolean }) {
  return (
    <div className="lesson-partdots" aria-label={t.lesson.partsProgress(done.size, count)}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`lesson-partdot${done.has(i) ? ' is-done' : ''}${i === current ? ' is-current' : ''}`} aria-hidden="true">
          {done.has(i) ? '✓' : i + 1}
        </span>
      ))}
      <span className={`lesson-partdot lesson-partdot-test${completed ? ' is-done' : ''}`} aria-hidden="true">
        📝
      </span>
    </div>
  );
}

function Overview({
  module,
  title,
  topic,
  partsDone,
  completed,
  bestPercent,
  onPart,
  onTest,
}: {
  module: SubtopicModule;
  title: string;
  topic?: TopicMeta;
  partsDone: number[];
  completed: boolean;
  bestPercent?: number;
  onPart: (p: number) => void;
  onTest: () => void;
}) {
  const parts = module.parts;
  const firstOpen = parts.findIndex((_, i) => !partsDone.includes(i));
  // main button: the first unfinished part, else the mini test (or practice again when completed)
  const main =
    firstOpen >= 0
      ? { label: partsDone.length === 0 ? t.lesson.start : t.lesson.continuePart(firstOpen + 1), go: () => onPart(firstOpen) }
      : completed
        ? { label: t.lesson.replay, go: () => onPart(0) }
        : { label: t.lesson.toTestBtn, go: onTest };
  useEnterKey(main.go);
  return (
    <div className="lesson-stage">
      <div className="lesson-card lesson-start">
        {topic && (
          <div className="lesson-start-topic">
            <span className="lesson-start-icon">
              <TopicIcon name={topic.icon} size={26} />
            </span>
            {topic.title}
          </div>
        )}
        <h1 className="lesson-start-title">
          {title}
          <InfoButton title={t.lesson.goals}>
            <ul className="lesson-goals-list">
              {module.goals.map((g, i) => (
                <li key={i}>
                  <Rich text={g} />
                </li>
              ))}
            </ul>
          </InfoButton>
        </h1>
        {completed && (
          <div className="lesson-start-done">
            <span aria-hidden="true">✓</span> {t.lesson.completedBefore}
            {bestPercent !== undefined && <> · {bestPercent}%</>}
          </div>
        )}
      </div>

      <ol className="lesson-partlist" aria-label={t.lesson.parts}>
        {parts.map((p, i) => {
          const isDone = partsDone.includes(i);
          const isNext = i === firstOpen;
          return (
            <li key={i}>
              <button type="button" className={`lesson-partrow${isDone ? ' is-done' : ''}${isNext ? ' is-next' : ''}`} onClick={() => onPart(i)}>
                <span className="lesson-partrow-num" aria-hidden="true">
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="lesson-partrow-text">
                  <span className="lesson-partrow-title">
                    <span className="sr-only">{t.lesson.part(i + 1)}: </span>
                    <RichInline text={p.title} />
                  </span>
                  <span className="sr-only">
                    {' – '}
                    {t.lesson.partQuestions(partQuestionCount(p.steps))}
                    {isDone && <> · {t.lesson.partDone}</>}
                    {isNext && <> · {t.lesson.partNext}</>}
                  </span>
                </span>
                <span className="lesson-partrow-go" aria-hidden="true">
                  {isNext ? '▶' : '›'}
                </span>
              </button>
            </li>
          );
        })}
        <li>
          <button type="button" className={`lesson-partrow lesson-partrow-test${completed ? ' is-done' : ''}${firstOpen < 0 && !completed ? ' is-next' : ''}`} onClick={onTest}>
            <span className="lesson-partrow-num" aria-hidden="true">
              📝
            </span>
            <span className="lesson-partrow-text">
              <span className="lesson-partrow-title">{t.test.title}</span>
              {bestPercent !== undefined && <span className="lesson-partrow-meta">{t.lesson.testBest(bestPercent)}</span>}
            </span>
            <span className="lesson-partrow-go" aria-hidden="true">
              ›
            </span>
          </button>
        </li>
      </ol>
      <LessonFooter>
        <button type="button" className="btn lesson-main-btn" onClick={main.go}>
          {main.label}
        </button>
      </LessonFooter>
    </div>
  );
}

function ToTest({ module, onStart }: { module: SubtopicModule; onStart: () => void }) {
  useEnterKey(onStart);
  const pass = module.miniTest.passPercent ?? 80;
  return (
    <div className="lesson-stage">
      <div className="lesson-card lesson-totest">
        <div className="lesson-result-emoji" aria-hidden="true">
          🎯
        </div>
        <h2 className="lesson-title">{t.lesson.toTest}</h2>
        <p className="lesson-body muted">{t.test.intro(module.miniTest.items.length, pass)}</p>
      </div>
      <LessonFooter>
        <button type="button" className="btn lesson-main-btn" onClick={onStart}>
          {t.lesson.start}
        </button>
      </LessonFooter>
    </div>
  );
}

function LessonDone({
  done,
  grade,
  topics,
  topic,
  color,
  moduleId,
  saving,
  onExit,
}: {
  done: Done;
  grade?: number;
  topics?: GradeTopics;
  topic?: TopicMeta;
  color?: string;
  moduleId: string;
  saving: boolean;
  onExit: () => void;
}) {
  const { result, outcome } = done;
  const s = getState();
  const streak = grade !== undefined ? streakOf(s, grade) : undefined;
  const nextSub = saving && grade !== undefined && topics ? recommendedNext(topics, (id) => isCompleted(s, grade, id)) : undefined;
  const chapter = outcome.chapterCompleted;
  useEnterKey(onExit);
  return (
    <div className="lesson-stage">
      <Celebration
        title={chapter ? t.celebrate.chapterDone : t.celebrate.lessonDone}
        chapter={chapter ? { title: chapter.title, color: color ?? 'var(--primary)', icon: chapter.icon ?? topic?.icon } : undefined}
        milestone={chapter ? undefined : outcome.milestone}
        xp={outcome.xpGained}
        score={{ correct: result.correct, total: result.total, percent: result.percent }}
        streak={streak && streak.current > 0 ? streak : undefined}
        actions={
          <>
            {nextSub && nextSub.sub.id !== moduleId && (
              <button type="button" className="btn btn-ghost lesson-side-btn" onClick={() => navigate({ name: 'lesson', subtopicId: nextSub.sub.id })}>
                {t.celebrate.nextLesson} ›
              </button>
            )}
            <button type="button" className="btn lesson-main-btn" onClick={onExit}>
              {t.celebrate.next}
            </button>
          </>
        }
      >
        <ReviewList answers={result.answers} />
      </Celebration>
    </div>
  );
}
