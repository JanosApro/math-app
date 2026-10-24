/**
 * Route #/lesson/<subtopicId>: finds the subtopic, loads its module and runs the LessonPlayer.
 * Lessons without content (status todo / no module file) show a friendly "készül" screen.
 */
import { useEffect, useState } from 'react';
import type { SubtopicModule } from '../engine/types';
import { findSubtopic, topicColor } from '../content/catalog';
import { getGradeTopics, gradeOfSubtopic, hasModule, loadSubtopic } from '../content/registry';
import { navigate } from '../ui/router';
import { t } from '../i18n/hu';
import { LessonPlayer } from './LessonPlayer';
import './lesson.css';

export function LessonMessage({ icon, title, text, onBack }: { icon: string; title: string; text?: string; onBack: () => void }) {
  return (
    <div className="lesson">
      <main className="lesson-main">
        <div className="lesson-card lesson-message anim-slide-up">
          <div className="lesson-result-emoji" aria-hidden="true">
            {icon}
          </div>
          <h2 className="lesson-title">{title}</h2>
          {text && <p className="lesson-body muted">{text}</p>}
          <button type="button" className="btn" onClick={onBack}>
            {t.test.backToMap}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function LessonScreen({ subtopicId }: { subtopicId: string }) {
  const grade = gradeOfSubtopic(subtopicId);
  const topics = grade !== undefined ? getGradeTopics(grade) : undefined;
  const found = topics ? findSubtopic(topics, subtopicId) : undefined;
  const ready = !!found && found.sub.status !== 'todo' && grade !== undefined && hasModule(grade, subtopicId);
  const [state, setState] = useState<{ id: string; module?: SubtopicModule; error?: string } | null>(null);

  useEffect(() => {
    if (!ready || grade === undefined) return;
    let cancelled = false;
    setState(null);
    loadSubtopic(grade, subtopicId).then(
      (module) => !cancelled && setState({ id: subtopicId, module }),
      (e: Error) => {
        console.error(e);
        if (!cancelled) setState({ id: subtopicId, error: e.message });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [ready, grade, subtopicId]);

  const back = () => navigate({ name: 'map' });
  if (!found || !topics || grade === undefined) return <LessonMessage icon="🧭" title={t.lesson.loadError} onBack={back} />;
  if (!ready) return <LessonMessage icon="🛠️" title={found.sub.title} text={t.lesson.notReady} onBack={back} />;
  if (state?.error && state.id === subtopicId) return <LessonMessage icon="⚠️" title={t.lesson.loadError} text={import.meta.env.DEV ? state.error : undefined} onBack={back} />;
  if (!state?.module || state.id !== subtopicId) return <div className="page muted">{t.common.loading}</div>;

  return (
    <LessonPlayer
      key={subtopicId}
      module={state.module}
      title={found.sub.title}
      grade={grade}
      topics={topics}
      topic={found.topic}
      color={topicColor(topics, found.topic)}
      onExit={back}
    />
  );
}
