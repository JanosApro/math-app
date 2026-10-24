/**
 * Route #/daily: today's challenge for the grade (same questions for every student of the grade,
 * seeded by the Belgrade date). No hints; the solution is shown after a wrong answer.
 * The first completion of the day gives XP and keeps the streak; replays are practice only.
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Question, SubtopicModule } from '../engine/types';
import { eligibleDailySubtopics, generateQuestion, planDaily } from '../engine/session';
import { findSubtopic, topicColor } from '../content/catalog';
import { getDailyConfig, getGradeTopics, hasModule, loadSubtopic } from '../content/registry';
import { recordDaily, streakOf, type DailyOutcome } from '../state/progress';
import { gradeProgress, useAppState } from '../state/store';
import { formatDateHu, todayBelgrade } from '../state/dates';
import { Dialog } from '../ui/Dialog';
import { navigate } from '../ui/router';
import { t } from '../i18n/hu';
import { Celebration } from './Celebration';
import { LessonMessage } from './LessonScreen';
import { InfoButton } from '../ui/InfoButton';
import { LessonFooter, LessonTopBar, scrollTop, StepChip, useEnterKey } from './parts';
import { QuestionRunner } from './QuestionRunner';
import './lesson.css';

interface DailyQuestion {
  question: Question;
  seed: number;
  subtopicTitle: string;
  color?: string;
}

type Phase = 'intro' | 'run' | 'result';

export default function DailyScreen({ grade }: { grade: number }) {
  const today = useMemo(() => todayBelgrade(), []);
  const topics = getGradeTopics(grade);
  const eligible = useMemo(
    () => (topics ? eligibleDailySubtopics(topics, getDailyConfig(grade), (id) => hasModule(grade, id)) : []),
    [topics, grade],
  );
  const [modules, setModules] = useState<Map<string, SubtopicModule> | null>(null);
  const record = useAppState((s) => gradeProgress(s, grade).daily[today]);
  const streak = useAppState((s) => streakOf(s, grade, today).current);

  const [phase, setPhase] = useState<Phase>('intro');
  const [practice, setPractice] = useState(false);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [outcome, setOutcome] = useState<DailyOutcome | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(eligible.map((id) => loadSubtopic(grade, id).then((m) => [id, m] as const))).then((rs) => {
      if (cancelled) return;
      const map = new Map<string, SubtopicModule>();
      for (const r of rs) {
        if (r.status === 'fulfilled') map.set(r.value[0], r.value[1]);
        else console.error(r.reason);
      }
      setModules(map);
    });
    return () => {
      cancelled = true;
    };
  }, [eligible, grade]);

  const questions = useMemo<DailyQuestion[]>(() => {
    if (!modules || !topics) return [];
    const plan = planDaily(grade, today, eligible.filter((id) => modules.has(id)), modules);
    const out: DailyQuestion[] = [];
    for (const item of plan) {
      try {
        const question = generateQuestion(modules.get(item.subtopicId)!, item.ref, item.seed);
        const f = findSubtopic(topics, item.subtopicId);
        out.push({ question, seed: item.seed, subtopicTitle: f?.sub.title ?? '', color: f ? topicColor(topics, f.topic) : undefined });
      } catch (e) {
        console.error(e);
      }
    }
    return out;
  }, [modules, topics, grade, today, eligible]);

  useEffect(scrollTop, [phase, index]);

  const exit = () => navigate({ name: 'map' });
  const n = questions.length;

  const start = (asPractice: boolean) => {
    setPractice(asPractice);
    setIndex(0);
    setCorrect(0);
    setOutcome(null);
    setPhase('run');
  };

  const answered = (ok: boolean) => {
    const c = correct + (ok ? 1 : 0);
    setCorrect(c);
    if (index + 1 < n) {
      setIndex(index + 1);
      return;
    }
    if (!practice) setOutcome(recordDaily(grade, today, c, n));
    setPhase('result');
  };

  if (!topics || eligible.length === 0) return <LessonMessage icon="📅" title={t.daily.title} text={t.daily.noContent} onBack={exit} />;
  if (!modules) return <div className="page muted">{t.common.loading}</div>;
  if (n === 0) return <LessonMessage icon="📅" title={t.daily.title} text={t.daily.noContent} onBack={exit} />;

  const progress = phase === 'intro' ? 0 : phase === 'run' ? index / n : 1;
  let body: JSX.Element;
  if (phase === 'intro') {
    body = record ? (
      <DoneToday correct={record.correct} total={record.total} streak={streak} onPractice={() => start(true)} onExit={exit} />
    ) : (
      <Intro today={today} count={n} streak={streak} onStart={() => start(false)} />
    );
  } else if (phase === 'run') {
    const q = questions[index];
    body = (
      <div className="lesson-stage" key={`${practice}:${index}`} style={q.color ? ({ '--topic': q.color } as CSSProperties) : undefined}>
        {practice && <div className="lesson-practice-banner">{t.daily.practiceMode}</div>}
        <QuestionRunner
          question={q.question}
          seed={q.seed}
          mode="daily"
          onDone={(r) => answered(r.correct)}
        />
      </div>
    );
  } else {
    body = (
      <div className="lesson-stage">
        <Celebration
          title={practice ? t.daily.result(correct, n) : t.daily.complete}
          subtitle={practice ? t.daily.practiceMode : undefined}
          xp={practice ? undefined : outcome?.xpGained ?? 0}
          score={{ correct, total: n }}
          streak={practice ? undefined : { current: outcome?.streak.current ?? streak }}
          milestone={outcome?.milestone}
          actions={
            <>
              <button type="button" className="btn btn-ghost lesson-side-btn" onClick={() => start(true)}>
                ↻ {t.daily.practiceAgain}
              </button>
              <button type="button" className="btn lesson-main-btn" onClick={exit}>
                {t.celebrate.next}
              </button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="lesson lesson-daily">
      <LessonTopBar progress={progress} onClose={() => (phase === 'run' ? setQuitOpen(true) : exit())}>
        <span className="lesson-top-streak" title={t.streak.current}>
          <span aria-hidden="true">🔥</span> {streak}
        </span>
      </LessonTopBar>
      <main className="lesson-main">{body}</main>
      <Dialog
        open={quitOpen}
        title={t.daily.quitTitle}
        onClose={() => setQuitOpen(false)}
        actions={
          <>
            <button type="button" className="btn" onClick={() => setQuitOpen(false)}>
              {t.lesson.stay}
            </button>
            <button type="button" className="btn btn-ghost" onClick={exit}>
              {t.lesson.quit}
            </button>
          </>
        }
      >
        <p>{t.daily.quitBody}</p>
      </Dialog>
    </div>
  );
}

function StreakHero({ streak }: { streak: number }) {
  return (
    <div className={`lesson-streak-hero${streak === 0 ? ' is-zero' : ''}`}>
      <span className="lesson-streak-fire" aria-hidden="true">
        🔥
      </span>
      <span className="lesson-streak-num">{streak}</span>
      <span className="lesson-streak-label">{t.streak.current}</span>
    </div>
  );
}

function Intro({ today, count, streak, onStart }: { today: string; count: number; streak: number; onStart: () => void }) {
  useEnterKey(onStart);
  return (
    <div className="lesson-stage">
      <div className="lesson-card lesson-daily-intro">
        <StreakHero streak={streak} />
        <h1 className="lesson-start-title">
          {t.daily.title}
          <InfoButton title={t.daily.title}>
            <p>{t.daily.intro}</p>
            <p>{t.streak.explain}</p>
          </InfoButton>
        </h1>
        <p className="lesson-daily-date muted">
          {formatDateHu(today)} · {t.daily.questions(count)}
        </p>
      </div>
      <LessonFooter>
        <button type="button" className="btn lesson-main-btn" onClick={onStart}>
          {t.daily.start}
        </button>
      </LessonFooter>
    </div>
  );
}

function DoneToday({ correct, total, streak, onPractice, onExit }: { correct: number; total: number; streak: number; onPractice: () => void; onExit: () => void }) {
  return (
    <div className="lesson-stage">
      <div className="lesson-card lesson-daily-intro">
        <StreakHero streak={streak} />
        <h1 className="lesson-start-title">
          {t.daily.doneToday}
          <InfoButton title={t.daily.title}>
            <p>{t.daily.doneTodayBody}</p>
          </InfoButton>
        </h1>
        <p className="lesson-body">{t.daily.todayResult(correct, total)}</p>
      </div>
      <LessonFooter>
        <button type="button" className="btn btn-ghost lesson-side-btn" onClick={onExit}>
          {t.test.backToMap}
        </button>
        <button type="button" className="btn lesson-main-btn" onClick={onPractice}>
          ↻ {t.daily.practiceAgain}
        </button>
      </LessonFooter>
    </div>
  );
}
