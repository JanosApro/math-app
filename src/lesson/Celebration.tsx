/**
 * Celebration screen: confetti, XP count-up, score, grade progress, streak; a bigger version
 * with a badge for a completed chapter or a streak milestone.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { TopicIcon } from '../ui/TopicIcon';
import { playSound, type SoundName } from '../ui/sound';
import { t } from '../i18n/hu';
import { Confetti, CountUp, LessonFooter } from './parts';

export interface CelebrationProps {
  title: string;
  subtitle?: ReactNode;
  /** XP earned (counts up). */
  xp?: number;
  score?: { correct: number; total: number; percent?: number };
  /** Completed chapter → big celebration with the chapter badge. */
  chapter?: { title: string; color: string; icon?: string };
  /** Streak milestone (7, 30, 100) → big celebration with a streak badge. */
  milestone?: number;
  /** Grade progress (completed lessons / all lessons). */
  progress?: { done: number; total: number };
  streak?: { current: number };
  children?: ReactNode;
  /** Footer buttons, primary last. */
  actions: ReactNode;
  /** Default: the chapter/streak fanfare for big celebrations, the lesson fanfare otherwise. */
  sound?: SoundName;
}

/** Simple star medal in the topic color (no mascots). */
function StarMedal() {
  return (
    <svg className="lesson-medal" viewBox="0 0 120 120" aria-hidden="true">
      <g className="lesson-medal-rays">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="57" y="2" width="6" height="16" rx="3" transform={`rotate(${i * 30} 60 60)`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="38" className="lesson-medal-disc" />
      <path
        className="lesson-medal-star"
        d="M60 36l7.1 14.4 15.9 2.3-11.5 11.2 2.7 15.8L60 72.2 45.8 79.7l2.7-15.8L37 52.7l15.9-2.3z"
      />
    </svg>
  );
}

export function Celebration({ title, subtitle, xp, score, chapter, milestone, progress, streak, children, actions, sound }: CelebrationProps) {
  const big = !!chapter || !!milestone;
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playSound(sound ?? (chapter || milestone ? 'chapterComplete' : 'lessonComplete'));
  }, [sound, chapter, milestone]);
  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <>
      <Confetti count={big ? 110 : 60} />
      <div className={`lesson-card lesson-celebrate${big ? ' is-big' : ''}`}>
        <div className="lesson-celebrate-art anim-pop">
          {chapter ? (
            <div className="lesson-badge" style={{ '--badge': chapter.color } as CSSProperties}>
              <TopicIcon name={chapter.icon} size={64} />
            </div>
          ) : milestone ? (
            <div className="lesson-badge lesson-badge-streak">
              <span className="lesson-badge-fire" aria-hidden="true">
                🔥
              </span>
              <span className="lesson-badge-num">{milestone}</span>
            </div>
          ) : (
            <StarMedal />
          )}
        </div>
        <h1 className="lesson-celebrate-title">{title}</h1>
        {chapter && <p className="lesson-celebrate-sub">{t.celebrate.chapterBadge(chapter.title)}</p>}
        {milestone && <p className="lesson-celebrate-sub">{t.celebrate.streakMilestone(milestone)}</p>}
        {subtitle && <div className="lesson-celebrate-sub">{subtitle}</div>}

        <div className="lesson-stats">
          {xp !== undefined && (
            <div className="lesson-stat lesson-stat-xp">
              <span className="lesson-stat-value">
                +<CountUp value={xp} /> {t.common.xp}
              </span>
              <span className="lesson-stat-label">{t.celebrate.xpEarned}</span>
            </div>
          )}
          {score && (
            <div className="lesson-stat lesson-stat-score">
              <span className="lesson-stat-value">{score.percent !== undefined ? `${score.percent}%` : t.common.of(score.correct, score.total)}</span>
              <span className="lesson-stat-label">{t.test.score(score.correct, score.total)}</span>
            </div>
          )}
          {streak && (
            <div className="lesson-stat lesson-stat-streak">
              <span className="lesson-stat-value">
                <span aria-hidden="true">🔥</span> {t.streak.days(streak.current)}
              </span>
              <span className="lesson-stat-label">{t.streak.current}</span>
            </div>
          )}
        </div>

        {progress && (
          <div className="lesson-year">
            <div className="lesson-year-head">
              <span>{t.celebrate.yearProgress}</span>
              <span className="muted">{t.map.yearGoalText(progress.done, progress.total)}</span>
            </div>
            <div className="lesson-year-bar" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
              <div className="lesson-year-fill" style={{ width: `${Math.max(pct, progress.done > 0 ? 2 : 0)}%` }} />
            </div>
          </div>
        )}
        <p className="lesson-keep-going">{t.celebrate.keepGoing}</p>
        {children}
      </div>
      <LessonFooter>{actions}</LessonFooter>
    </>
  );
}
