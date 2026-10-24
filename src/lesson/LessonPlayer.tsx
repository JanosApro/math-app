/**
 * The lesson player: start screen → steps (theory / example / explore / check / practice)
 * → "Jöhet a minidolgozat!" → mini test → celebration.
 *
 *   <LessonPlayer module={mod} title="…" grade={7} topics={topics} topic={topic} color="#3b6fe0" onExit={…} />
 *
 * `preview` (dev) disables every write to the progress store (step, XP, test result).
 * `initialStep` skips the start screen (dev preview: jump to a step or straight to the test).
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { GradeTopics, SubtopicModule, TopicMeta } from '../engine/types';
import { seedOf } from '../engine/session';
import { flatten, recommendedNext } from '../content/catalog';
import { addXp, completedCount, isCompleted, recordTestResult, saveLessonStep, streakOf, type TestOutcome } from '../state/progress';
import { getState, gradeProgress } from '../state/store';
import { XP } from '../state/xp';
import { Dialog } from '../ui/Dialog';
import { Rich } from '../ui/Rich';
import { TopicIcon } from '../ui/TopicIcon';
import { navigate } from '../ui/router';
import { t } from '../i18n/hu';
import { Celebration } from './Celebration';
import { MiniTest, ReviewList, type TestResult } from './MiniTest';
import { LessonFooter, LessonTopBar, scrollTop, StepChip, useEnterKey } from './parts';
import { CheckView, ExampleView, ExploreView, PracticeView, TheoryView } from './steps';
import './lesson.css';

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
  /** Skip the start screen and open this step (or the mini test). */
  initialStep?: number | 'test';
  /** Extra content at the right end of the top bar (dev preview tools). */
  topExtra?: ReactNode;
}

type Phase = 'start' | 'steps' | 'toTest' | 'test' | 'done';

interface Done {
  result: TestResult;
  outcome: TestOutcome;
  lessonXp: number;
}

export function LessonPlayer({ module, title, grade, topics, topic, color, preview, onExit, initialStep, topExtra }: LessonPlayerProps) {
  const steps = module.steps;
  const saving = !preview && grade !== undefined;
  const saved = grade !== undefined && !preview ? gradeProgress(getState(), grade).subtopics[module.id] : undefined;
  const savedStep = saved?.step ?? 0;

  const [phase, setPhase] = useState<Phase>(() => (initialStep === undefined ? 'start' : initialStep === 'test' ? 'test' : 'steps'));
  const [index, setIndex] = useState(() => (typeof initialStep === 'number' ? Math.max(0, Math.min(steps.length - 1, initialStep)) : 0));
  const [nonce, setNonce] = useState(() => Date.now());
  const [sub, setSub] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [quitOpen, setQuitOpen] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const lessonXp = useRef(0);

  // remember the position (resume later)
  useEffect(() => {
    if (!saving) return;
    if (phase === 'steps') saveLessonStep(grade!, module.id, index);
    else if (phase === 'toTest' || phase === 'test') saveLessonStep(grade!, module.id, steps.length);
  }, [saving, grade, module.id, phase, index, steps.length]);

  useEffect(scrollTop, [phase, index]);

  const total = steps.length + 1;
  const progress =
    phase === 'start' ? 0 : phase === 'steps' ? (index + sub) / total : phase === 'toTest' ? steps.length / total : phase === 'test' ? (steps.length + testProgress) / total : 1;

  const onXp = (n: number) => {
    if (n <= 0) return;
    lessonXp.current += n;
    if (saving) addXp(grade!, n);
  };

  const begin = (from: number) => {
    setNonce(Date.now());
    lessonXp.current = 0;
    if (from >= steps.length) setPhase('toTest');
    else {
      setIndex(from);
      setSub(0);
      setPhase('steps');
    }
  };

  const next = () => {
    setSub(0);
    if (index + 1 < steps.length) setIndex(index + 1);
    else setPhase('toTest');
  };

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
    if (phase === 'start' || phase === 'done') onExit();
    else setQuitOpen(true);
  };

  const style = color ? ({ '--topic': color } as CSSProperties) : undefined;
  let body: JSX.Element;
  switch (phase) {
    case 'start':
      body = (
        <StartScreen
          module={module}
          title={title}
          topic={topic}
          savedStep={savedStep}
          completed={!!saved?.completedAt}
          bestPercent={saved?.bestPercent}
          onStart={begin}
        />
      );
      break;
    case 'steps': {
      const step = steps[index];
      const key = `${nonce}:${index}`;
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
          view = <CheckView key={key} step={step} seed={seedOf('check', module.id, nonce, index)} onXp={onXp} onNext={next} />;
          break;
        case 'practice':
          view = <PracticeView key={key} module={module} step={step} stepIndex={index} nonce={nonce} onXp={onXp} onNext={next} onSubProgress={setSub} />;
          break;
      }
      body = (
        <div key={key} className="lesson-stage">
          {view}
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
        <p>{t.lesson.quitConfirm}</p>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

function StartScreen({
  module,
  title,
  topic,
  savedStep,
  completed,
  bestPercent,
  onStart,
}: {
  module: SubtopicModule;
  title: string;
  topic?: TopicMeta;
  savedStep: number;
  completed: boolean;
  bestPercent?: number;
  onStart: (from: number) => void;
}) {
  const canResume = savedStep > 0 && savedStep <= module.steps.length;
  useEnterKey(() => onStart(canResume ? savedStep : 0));
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
        <h1 className="lesson-start-title">{title}</h1>
        {completed && (
          <div className="lesson-start-done">
            <span aria-hidden="true">✓</span> {t.lesson.completedBefore}
            {bestPercent !== undefined && <span className="muted"> · {t.lesson.bestPercent(bestPercent)}</span>}
          </div>
        )}
        <div className="lesson-goals">
          <div className="lesson-goals-title">{t.lesson.goals}</div>
          <ul>
            {module.goals.map((g, i) => (
              <li key={i}>
                <span className="lesson-goal-check" aria-hidden="true">
                  ✓
                </span>
                <Rich text={g} />
              </li>
            ))}
          </ul>
        </div>
        <p className="lesson-start-meta muted">{t.lesson.meta(module.steps.length, module.miniTest.items.length)}</p>
        {canResume && <p className="lesson-start-meta">{t.lesson.resumeAt(Math.min(savedStep + 1, module.steps.length), module.steps.length)}</p>}
      </div>
      <LessonFooter>
        {canResume ? (
          <>
            <button type="button" className="btn btn-ghost lesson-side-btn" onClick={() => onStart(0)}>
              ↺ {t.lesson.restart}
            </button>
            <button type="button" className="btn lesson-main-btn" onClick={() => onStart(savedStep)}>
              {t.lesson.resume}
            </button>
          </>
        ) : (
          <button type="button" className="btn lesson-main-btn" onClick={() => onStart(0)}>
            {t.lesson.start}
          </button>
        )}
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
        <StepChip icon="📝">
          {t.test.title}
          <span className="lesson-chip-count">{t.test.itemCount(module.miniTest.items.length)}</span>
        </StepChip>
        <div className="lesson-result-emoji" aria-hidden="true">
          🎯
        </div>
        <h2 className="lesson-title">{t.lesson.toTest}</h2>
        <p className="lesson-body">{pass === 80 ? t.lesson.toTestBody : t.test.intro(module.miniTest.items.length, pass)}</p>
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
  const progress = grade !== undefined && topics ? { done: completedCount(s, grade), total: flatten(topics).length } : undefined;
  const streak = grade !== undefined ? streakOf(s, grade) : undefined;
  const nextSub =
    saving && grade !== undefined && topics ? recommendedNext(topics, (id) => isCompleted(s, grade, id)) : undefined;
  const chapter = outcome.chapterCompleted;
  useEnterKey(onExit);
  return (
    <div className="lesson-stage">
      <Celebration
        title={chapter ? t.celebrate.chapterDone : t.celebrate.lessonDone}
        chapter={chapter ? { title: chapter.title, color: color ?? 'var(--primary)', icon: chapter.icon ?? topic?.icon } : undefined}
        xp={outcome.xpGained + done.lessonXp}
        score={{ correct: result.correct, total: result.total, percent: result.percent }}
        progress={progress}
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
