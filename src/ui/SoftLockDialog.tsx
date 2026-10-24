/**
 * Friendly "skipping ahead" warning for soft-locked subtopics (PROMPT §3).
 *
 *   <SoftLockDialog grade={7} topics={topics} subtopicId={lockedId}
 *     onClose={() => setLockedId(null)}
 *     onBackToRecommended={() => { setLockedId(null); scrollToRecommended(); }}
 *     onPick={(id) => openNode(id)} />
 *
 * - open while `subtopicId` is not null; lists the uncompleted prerequisites (max 5 + "…és még N"),
 *   each tappable (`onPick`, default: open that lesson);
 * - primary "Vissza az ajánlotthoz" → `onBackToRecommended`;
 * - secondary "Mégis megnyitom" → `acknowledgeSkip` (never warn again for it) → opens the lesson.
 */
import { useMemo, type CSSProperties } from 'react';
import type { GradeTopics } from '../engine/types';
import { findSubtopic, topicColor, unmetPrerequisites } from '../content/catalog';
import { t } from '../i18n/hu';
import { acknowledgeSkip } from '../state/progress';
import { gradeProgress, useAppState } from '../state/store';
import { Dialog } from './Dialog';
import { navigate } from './router';
import { TopicIcon } from './TopicIcon';
import './SoftLockDialog.css';

const MAX_LISTED = 5;

/** A hop over the trail: three checkpoints and an arrow jumping over them. */
function HopArt() {
  return (
    <svg className="sl-art" viewBox="0 0 220 70" aria-hidden="true" focusable="false">
      <path className="sl-art-trail" d="M12 56h196" />
      <circle className="sl-art-node sl-art-from" cx="22" cy="56" r="9" />
      <circle className="sl-art-node" cx="72" cy="56" r="8" />
      <circle className="sl-art-node" cx="112" cy="56" r="8" />
      <circle className="sl-art-node" cx="152" cy="56" r="8" />
      <circle className="sl-art-node sl-art-to" cx="198" cy="56" r="9" />
      <path className="sl-art-hop" d="M26 42C60 2 160 2 192 40" />
      <path className="sl-art-head" d="M181 36.5l11.5 4.5 1.5-12" />
    </svg>
  );
}

export function SoftLockDialog({
  grade,
  topics,
  subtopicId,
  onClose,
  onBackToRecommended,
  onPick,
}: {
  grade: number;
  topics: GradeTopics;
  /** The soft-locked subtopic the student tapped; null = closed. */
  subtopicId: string | null;
  onClose: () => void;
  onBackToRecommended: () => void;
  /** A prerequisite was tapped. Default: close and open that lesson. */
  onPick?: (id: string) => void;
}) {
  const gp = useAppState((s) => gradeProgress(s, grade));
  const target = subtopicId ? findSubtopic(topics, subtopicId) : undefined;
  const missing = useMemo(
    () => (subtopicId ? unmetPrerequisites(topics, subtopicId, (id) => !!gp.subtopics[id]?.completedAt) : []),
    [topics, subtopicId, gp],
  );
  const shown = missing.slice(0, MAX_LISTED);
  const more = missing.length - shown.length;

  function openAnyway() {
    if (!subtopicId) return;
    acknowledgeSkip(grade, subtopicId);
    onClose();
    navigate({ name: 'lesson', subtopicId });
  }

  function pick(id: string) {
    if (onPick) onPick(id);
    else {
      onClose();
      navigate({ name: 'lesson', subtopicId: id });
    }
  }

  return (
    <Dialog
      open={!!target}
      title={t.softLock.title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn" onClick={onBackToRecommended}>
            {t.softLock.backToRecommended}
          </button>
          <button type="button" className="btn btn-ghost" onClick={openAnyway}>
            {t.softLock.openAnyway}
          </button>
        </>
      }
    >
      {target && (
        <div className="sl" style={{ '--topic-src': topicColor(topics, target.topic) } as CSSProperties}>
          <HopArt />
          <div className="sl-target">
            <span className="sl-target-icon">
              <TopicIcon name={target.topic.icon} size={26} />
            </span>
            <span className="sl-target-text">
              <span className="sl-target-topic">{target.topic.title}</span>
              <span className="sl-target-title">{target.sub.title}</span>
            </span>
          </div>
          {shown.length > 0 && (
            <>
              <p className="sl-missing">{t.softLock.missing}</p>
              <ul className="sl-list">
                {shown.map((f) => (
                  <li key={f.sub.id}>
                    <button
                      type="button"
                      className="sl-item"
                      style={{ '--topic-src': topicColor(topics, f.topic) } as CSSProperties}
                      onClick={() => pick(f.sub.id)}
                    >
                      <span className="sl-item-num" aria-hidden="true">
                        {f.indexInTopic + 1}
                      </span>
                      <span className="sl-item-text">
                        <span className="sl-item-title">{f.sub.title}</span>
                        {f.topic.id !== target.topic.id && <span className="sl-item-topic">{f.topic.title}</span>}
                      </span>
                      <span className="sl-item-go" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {more > 0 && <p className="sl-more">{t.softLock.andMore(more)}</p>}
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}
