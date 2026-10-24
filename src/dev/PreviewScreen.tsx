/**
 * Route #/dev/preview/<id> (dev builds only): any subtopic — or the demo lesson `dev-demo`
 * (src/dev/demoLesson.ts) — in the real LessonPlayer, in preview mode (nothing is saved).
 *
 * The 🛠 button in the top bar opens the dev tools: jump to any step, start the mini test
 * directly, and see the current question's answer + what to type (also on `window.__mkQuestion`
 * for browser automation).
 */
import { useEffect, useState } from 'react';
import type { GradeTopics, LessonStep, SubtopicModule, TopicMeta } from '../engine/types';
import { canonicalInput, formatAnswer } from '../engine/answers';
import { findSubtopic, topicColor } from '../content/catalog';
import { getGradeTopics, gradeOfSubtopic, hasModule, loadSubtopic } from '../content/registry';
import { LessonPlayer } from '../lesson/LessonPlayer';
import { LessonMessage } from '../lesson/LessonScreen';
import { useCurrentQuestion } from '../lesson/devHook';
import { Rich, RichInline } from '../ui/Rich';
import { navigate } from '../ui/router';
import { t } from '../i18n/hu';
import './dev.css';

export const DEMO_ID = 'dev-demo';

interface Loaded {
  id: string;
  module: SubtopicModule;
  title: string;
  status: string;
  grade?: number;
  topics?: GradeTopics;
  topic?: TopicMeta;
  color?: string;
}

const STEP_ICON: Record<LessonStep['type'], string> = { theory: '📘', example: '✏️', check: '❓', practice: '🏋️', explore: '🎚️' };

/** One line per step for the jump list. */
function stepSummary(step: LessonStep): string {
  switch (step.type) {
    case 'theory':
      return step.title ?? step.body.slice(0, 50);
    case 'example':
      return step.title ?? step.problem.slice(0, 50);
    case 'explore':
      return step.title ?? step.body.slice(0, 50);
    case 'check':
      return `${step.question.answer.type} · ${step.question.prompt.replace(/\n+/g, ' ').slice(0, 60)}`;
    case 'practice':
      return `${step.generator} · L${step.level}${(step.count ?? 1) > 1 ? ` ×${step.count}` : ''}`;
  }
}

/** The current question's correct answer and the exact text to type (dev helper). */
function CurrentAnswer() {
  const cur = useCurrentQuestion();
  if (!cur) return <p className="muted dev-small">Most nincs kérdés a képernyőn.</p>;
  const a = canonicalInput(cur.question.answer);
  const typed =
    a.type === 'text'
      ? a.text
      : a.type === 'fields'
        ? a.texts.join(' | ')
        : a.type === 'choice'
          ? `opció #${a.index + 1} (eredeti sorrend)`
          : a.type === 'truefalse'
            ? (a.value ? t.input.trueLabel : t.input.falseLabel)
            : a.type === 'order'
              ? 'a megadott sorrend'
              : 'a megadott párok';
  return (
    <div className="dev-preview-answer">
      <div>
        <span className="dev-small muted">Helyes válasz:</span> <RichInline text={formatAnswer(cur.question.answer)} />
      </div>
      <div>
        <span className="dev-small muted">Begépelve:</span> <code>{typed}</code>
      </div>
      <div className="dev-small muted">
        {cur.question.answer.type} · seed {cur.seed}
      </div>
    </div>
  );
}

function DevTools({ data, onJump, onClose }: { data: Loaded; onJump: (to: number | 'test' | 'start') => void; onClose: () => void }) {
  return (
    <div className="dev-preview-panel" role="region" aria-label="Fejlesztői eszközök">
      <div className="dev-preview-head">
        <div>
          <strong>{data.title}</strong>
          <div className="dev-small muted">
            {data.id} · {data.status} · előnézet (nem ment semmit)
          </div>
        </div>
        <button type="button" className="icon-btn" aria-label={t.common.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <CurrentAnswer />
      <div className="dev-preview-jumps">
        <button type="button" className="btn btn-small btn-ghost" onClick={() => onJump('start')}>
          Kezdőképernyő
        </button>
        <button type="button" className="btn btn-small" onClick={() => onJump('test')}>
          📝 Minidolgozat
        </button>
      </div>
      <ol className="dev-preview-steps">
        {data.module.steps.map((s, i) => (
          <li key={i}>
            <button type="button" className="dev-preview-step" onClick={() => onJump(i)}>
              <span className="dev-preview-step-no">{i + 1}.</span>
              <span aria-hidden="true">{STEP_ICON[s.type]}</span>
              <span className="dev-preview-step-type">{s.type}</span>
              <span className="dev-preview-step-text">
                <Rich text={stepSummary(s)} className="lesson-inline-rich" />
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="dev-links">
        <a className="btn btn-small btn-ghost" href="#/dev">
          /dev
        </a>
        <a className="btn btn-small btn-ghost" href="#/dev/gallery">
          Galéria
        </a>
        {data.grade !== undefined && (
          <a className="btn btn-small btn-ghost" href={`#/lesson/${encodeURIComponent(data.id)}`}>
            Igazi lecke ›
          </a>
        )}
      </div>
    </div>
  );
}

export default function PreviewScreen({ subtopicId }: { subtopicId: string }) {
  const [state, setState] = useState<{ id: string; data?: Loaded; error?: string } | null>(null);
  const [jump, setJump] = useState<{ n: number; to: number | 'test' | 'start' }>({ n: 0, to: 'start' });
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState(null);
    setJump({ n: 0, to: 'start' });
    const done = (data: Loaded) => !cancelled && setState({ id: subtopicId, data });
    const fail = (e: Error) => {
      console.error(e);
      if (!cancelled) setState({ id: subtopicId, error: e.message });
    };
    if (subtopicId === DEMO_ID) {
      import('./demoLesson').then((m) => done({ id: DEMO_ID, module: m.default, title: 'Demó lecke (minden lépés- és választípus)', status: 'demo' }), fail);
    } else {
      const grade = gradeOfSubtopic(subtopicId);
      const topics = grade !== undefined ? getGradeTopics(grade) : undefined;
      const found = topics ? findSubtopic(topics, subtopicId) : undefined;
      if (grade === undefined || !topics || !found) fail(new Error(`Ismeretlen leckeazonosító: ${subtopicId}`));
      else if (!hasModule(grade, subtopicId)) fail(new Error(`Ehhez a leckéhez nincs modulfájl: ${found.topic.folder}/${found.sub.file}.ts`));
      else
        loadSubtopic(grade, subtopicId).then(
          (module) =>
            done({ id: subtopicId, module, title: found.sub.title, status: found.sub.status, grade, topics, topic: found.topic, color: topicColor(topics, found.topic) }),
          fail,
        );
    }
    return () => {
      cancelled = true;
    };
  }, [subtopicId]);

  const back = () => navigate({ name: 'dev' });
  if (state?.error && state.id === subtopicId) return <LessonMessage icon="⚠️" title={t.lesson.loadError} text={state.error} onBack={back} />;
  if (!state?.data || state.id !== subtopicId) return <div className="page muted">{t.common.loading}</div>;
  const data = state.data;

  const onJump = (to: number | 'test' | 'start') => {
    setJump((j) => ({ n: j.n + 1, to }));
    setToolsOpen(false);
  };

  return (
    <>
      <LessonPlayer
        key={`${data.id}:${jump.n}`}
        module={data.module}
        title={data.title}
        grade={data.grade}
        topics={data.topics}
        topic={data.topic}
        color={data.color}
        preview
        onExit={back}
        initialStep={jump.to === 'start' ? undefined : jump.to}
        topExtra={
          <button
            type="button"
            className={`icon-btn dev-preview-toggle${toolsOpen ? ' is-open' : ''}`}
            aria-expanded={toolsOpen}
            aria-label="Fejlesztői eszközök"
            title="Fejlesztői eszközök"
            onClick={() => setToolsOpen((o) => !o)}
          >
            🛠
          </button>
        }
      />
      {toolsOpen && <DevTools data={data} onJump={onJump} onClose={() => setToolsOpen(false)} />}
    </>
  );
}
