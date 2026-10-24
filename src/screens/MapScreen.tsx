/**
 * The map of a grade (route #/): year goal + daily challenge cards, then every topic as a
 * chapter section with its winding trail of lessons (MapTrail).
 *
 * Node taps: soon → toast "készül"; softLocked → SoftLockDialog; otherwise → the lesson.
 * The recommended next lesson is scrolled into view when the map opens.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { GradeTopics, TopicMeta } from '../engine/types';
import { flatten, nodeState, recommendedNext, topicColor, topicCompleted } from '../content/catalog';
import { getGradeTopics, hasModule, loadSubtopic } from '../content/registry';
import { t } from '../i18n/hu';
import { gradeStreak } from '../state/progress';
import { schoolYearProgress, todayBelgrade } from '../state/dates';
import { gradeProgress, useAppState, type GradeProgress } from '../state/store';
import { FlagIcon, TrophyIcon } from '../ui/AppShellIcons';
import { SoftLockDialog } from '../ui/SoftLockDialog';
import { TopicIcon } from '../ui/TopicIcon';
import { showToast } from '../ui/Toast';
import { navigate, routeToHash } from '../ui/router';
import { MapTrail, type TrailNode } from './MapTrail';
import { devOpenAll, withAllOpen } from './devFlags';
import './screens.css';
import './map.css';

function YearGoal({ done, total, today }: { done: number; total: number; today: string }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  const plan = schoolYearProgress(today);
  const expected = Math.round(plan * total);
  const allDone = total > 0 && done >= total;
  return (
    <section className="map-card map-goal" aria-labelledby="map-goal-title">
      <div className="map-card-head">
        <span className="map-card-icon map-goal-icon" aria-hidden="true">
          <FlagIcon size={20} />
        </span>
        <h2 id="map-goal-title" className="map-card-title">
          {t.map.yearGoal}
        </h2>
        <span className="map-goal-count">{t.map.yearGoalText(done, total)}</span>
      </div>
      <div className="map-goal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t.map.yearGoal}>
        <div className={`pbar-fill${done === 0 ? ' is-zero' : ''}`} style={{ width: `${pct}%` }} />
        {!allDone && plan > 0 && plan < 1 && (
          <span className="map-goal-marker" style={{ left: `${plan * 100}%` }} title={t.map.yearGoalMarker} aria-hidden="true" />
        )}
      </div>
      <p className="map-goal-note">{allDone ? t.map.yearGoalDone : t.map.yearGoalPace(expected)}</p>
    </section>
  );
}

function DailyCard({ gp, today }: { gp: GradeProgress; today: string }) {
  const streak = useMemo(() => gradeStreak(gp, today), [gp, today]);
  const rec = gp.daily[today];
  return (
    <section className={`map-card map-daily${rec ? ' is-done' : ''}`} aria-labelledby="map-daily-title">
      <div className={`map-daily-fire${streak.current === 0 ? ' is-zero' : ''}`} aria-hidden="true">
        <span className="map-daily-emoji">🔥</span>
        <span className="map-daily-num">{streak.current}</span>
      </div>
      <div className="map-daily-body">
        <h2 id="map-daily-title" className="map-card-title">
          {t.daily.title}
        </h2>
        <p className="map-daily-text">
          <span className="sr-only">{t.shell.streakAria(streak.current)}. </span>
          {rec ? t.daily.todayResult(rec.correct, rec.total) : t.shell.dailyPending}
        </p>
        <a className={`btn btn-small${rec ? ' btn-soft' : ''}`} href={routeToHash({ name: 'daily' })}>
          {rec ? `↻ ${t.daily.practiceAgain}` : t.daily.start}
        </a>
      </div>
    </section>
  );
}

/** Number of parts per lesson, filled in as the started lessons' modules load (cached). */
const partTotals = new Map<string, number>();

function usePartTotals(grade: number, ids: string[]): ReadonlyMap<string, number> {
  const [, setVersion] = useState(0);
  const key = ids.join(',');
  useEffect(() => {
    let cancelled = false;
    for (const id of ids) {
      if (partTotals.has(id) || !hasModule(grade, id)) continue;
      loadSubtopic(grade, id).then(
        (m) => {
          partTotals.set(id, m.parts.length);
          if (!cancelled) setVersion((v) => v + 1);
        },
        () => {},
      );
    }
    return () => {
      cancelled = true;
    };
  }, [grade, key]);
  return partTotals;
}

function TopicSection({
  topics,
  topic,
  index,
  gp,
  totals,
  recommendedId,
  onOpen,
}: {
  topics: GradeTopics;
  topic: TopicMeta;
  index: number;
  gp: GradeProgress;
  totals: ReadonlyMap<string, number>;
  recommendedId?: string;
  onOpen: (id: string) => void;
}) {
  const completed = (id: string) => !!gp.subtopics[id]?.completedAt;
  const acknowledged = (id: string) => !!gp.subtopics[id]?.skipAck;
  const flat = flatten(topics);
  const nodes: TrailNode[] = topic.subtopics.map((sub, i) => {
    const state = nodeState(topics, sub.id, completed, acknowledged);
    const p = gp.subtopics[sub.id];
    const doneParts = p?.parts?.length ?? 0;
    const inProgress = !p?.completedAt && doneParts > 0 && state !== 'soon';
    return {
      id: sub.id,
      title: sub.title,
      number: i + 1,
      globalIndex: flat.findIndex((f) => f.sub.id === sub.id),
      state,
      inProgress,
      parts: inProgress ? { done: doneParts, total: totals.get(sub.id) } : undefined,
      bubble: sub.id === recommendedId ? (inProgress ? t.map.continueHere : t.map.startHere) : undefined,
    };
  });
  const doneCount = topic.subtopics.filter((s) => completed(s.id)).length;
  const chapterDone = topicCompleted(topic, completed);
  const total = topic.subtopics.length;
  return (
    <section className={`map-topic${chapterDone ? ' is-done' : ''}`} style={{ '--topic': topicColor(topics, topic) } as CSSProperties} aria-labelledby={`topic-${topic.id}`}>
      <header className="map-topic-head">
        <span className="map-topic-icon" aria-hidden="true">
          <TopicIcon name={topic.icon} size={30} />
        </span>
        <div className="map-topic-text">
          <span className="map-topic-chapter">{t.map.chapterLabel(index + 1)}</span>
          <h2 id={`topic-${topic.id}`} className="map-topic-title">
            {topic.title}
          </h2>
          <div className="map-topic-progress">
            <div className="map-topic-bar" aria-hidden="true">
              <div className="map-topic-fill" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
            </div>
            <span className="map-topic-count">{t.map.topicProgress(doneCount, total)}</span>
          </div>
        </div>
        {chapterDone && (
          <span className="map-topic-trophy" title={t.map.topicDone}>
            <TrophyIcon size={22} />
            <span className="sr-only">{t.map.topicDone}</span>
          </span>
        )}
      </header>
      <MapTrail nodes={nodes} chapterDone={chapterDone} onOpen={onOpen} />
    </section>
  );
}

export default function MapScreen({ grade }: { grade: number }) {
  const raw = getGradeTopics(grade);
  const topics = useMemo(() => (raw && devOpenAll() ? withAllOpen(raw) : raw), [raw]);
  const gp = useAppState((s) => gradeProgress(s, grade));
  const today = useMemo(() => todayBelgrade(), []);
  const [locked, setLocked] = useState<string | null>(null);
  const scrolled = useRef(false);

  const flat = useMemo(() => (topics ? flatten(topics) : []), [topics]);
  const recommended = useMemo(() => (topics ? recommendedNext(topics, (id) => !!gp.subtopics[id]?.completedAt) : undefined), [topics, gp]);
  const done = flat.filter((f) => gp.subtopics[f.sub.id]?.completedAt).length;
  const started = flat.filter((f) => !gp.subtopics[f.sub.id]?.completedAt && (gp.subtopics[f.sub.id]?.parts?.length ?? 0) > 0).map((f) => f.sub.id);
  const totals = usePartTotals(grade, started);

  const scrollToRecommended = (smooth: boolean, focus = false) => {
    if (!recommended) return;
    const el = document.querySelector<HTMLElement>(`[data-node-id="${recommended.sub.id}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight - 90) el.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
    if (focus) el.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (scrolled.current) return;
    scrolled.current = true;
    // after the trail has been laid out
    requestAnimationFrame(() => scrollToRecommended(false));
  }, []);

  if (!topics || topics.topics.length === 0) {
    return (
      <div className="page">
        <div className="card map-empty">{t.map.noLessonsYet}</div>
      </div>
    );
  }

  const open = (id: string) => {
    const f = flat.find((x) => x.sub.id === id);
    if (!f) return;
    const state = nodeState(
      topics,
      id,
      (x) => !!gp.subtopics[x]?.completedAt,
      (x) => !!gp.subtopics[x]?.skipAck,
    );
    if (state === 'soon') showToast(t.map.noContentYet);
    else if (state === 'softLocked') setLocked(id);
    else navigate({ name: 'lesson', subtopicId: id });
  };

  const anyOpenable = flat.some((f) => f.sub.status !== 'todo');
  return (
    <div className="page map">
      <h1 className="sr-only">
        {t.nav.map} – {t.common.grade(grade)}
      </h1>
      <div className="map-cards">
        <YearGoal done={done} total={flat.length} today={today} />
        <DailyCard gp={gp} today={today} />
      </div>
      {!anyOpenable && <p className="map-empty card">{t.map.noLessonsYet}</p>}
      {topics.topics.map((topic, i) => (
        <TopicSection key={topic.id} topics={topics} topic={topic} index={i} gp={gp} totals={totals} recommendedId={recommended?.sub.id} onOpen={open} />
      ))}
      <SoftLockDialog
        grade={grade}
        topics={topics}
        subtopicId={locked}
        onClose={() => setLocked(null)}
        onBackToRecommended={() => {
          setLocked(null);
          requestAnimationFrame(() => scrollToRecommended(true, true));
        }}
      />
    </div>
  );
}
