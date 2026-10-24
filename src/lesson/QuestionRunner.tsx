/**
 * One question from "type the answer" to "Tovább": check button, hint, friendly handling of
 * `almost` / parse errors (edit and re-check, no penalty), feedback sheet with praise + XP or
 * the correct answer + worked solution.
 *
 * Modes:
 * - lesson: hint button, feedback sheet, XP (XP.correct / XP.correctWithHint)
 * - daily:  no hint, feedback sheet with the solution after a wrong answer, no per-question XP
 * - test:   no hint, no feedback — the answer is recorded and the test moves on
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CheckResult, Question, StudentAnswer } from '../engine/types';
import { checkAnswer, formatAnswer } from '../engine/answers';
import { XP } from '../state/xp';
import { Rich } from '../ui/Rich';
import { playSound } from '../ui/sound';
import { pickPhrase, t } from '../i18n/hu';
import { QuestionView } from './QuestionView';
import { draftToAnswer, emptyDraft, type AnswerDraft } from './inputs/draft';
import { CountUp, LessonFooter, useEnterKey } from './parts';
import { setCurrentQuestion } from './devHook';

export type RunnerMode = 'lesson' | 'test' | 'daily';

export interface QuestionResult {
  correct: boolean;
  answer: StudentAnswer;
  usedHint: boolean;
  /** XP earned for this question (lesson mode only). */
  xp: number;
}

export interface QuestionRunnerProps {
  question: Question;
  seed: number;
  mode: RunnerMode;
  /** Line above the question (step chip, counter …). */
  header?: ReactNode;
  /** Wrong answer → "Ezt a feladattípust még egyszer megkapod." (practice re-queue). */
  willRequeue?: boolean;
  /** Called as soon as the answer is checked (award XP here). */
  onChecked?: (r: QuestionResult) => void;
  /** Called on "Tovább" (or right after checking in test mode). */
  onDone: (r: QuestionResult) => void;
}

type Notice = 'notSimplified' | 'wrongForm' | 'parseError' | null;

export function QuestionRunner({ question, seed, mode, header, willRequeue, onChecked, onDone }: QuestionRunnerProps) {
  const spec = question.answer;
  const [draft, setDraft] = useState<AnswerDraft>(() => emptyDraft(spec));
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [hadParseError, setHadParseError] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [shakeN, setShakeN] = useState(0);
  const [flash, setFlash] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const answer = useMemo(() => draftToAnswer(spec, draft), [spec, draft]);

  useEffect(() => {
    setCurrentQuestion({ question, seed });
    return () => setCurrentQuestion(null);
  }, [question, seed]);

  const onDraft = (d: AnswerDraft) => {
    setDraft(d);
    if (notice) setNotice(null);
  };

  const check = () => {
    if (!answer || result) return;
    let r: CheckResult;
    try {
      r = checkAnswer(spec, answer);
    } catch (e) {
      console.error('checkAnswer failed', e);
      r = { correct: false, parseError: true };
    }
    if (r.parseError || r.almost) {
      setNotice(r.parseError ? 'parseError' : r.almost!);
      if (r.parseError) setHadParseError(true);
      setShakeN((n) => n + 1);
      return;
    }
    const xp = mode === 'lesson' && r.correct ? (hintOpen || hadParseError ? XP.correctWithHint : XP.correct) : 0;
    const res: QuestionResult = { correct: r.correct, answer, usedHint: hintOpen, xp };
    onChecked?.(res);
    if (mode === 'test') {
      onDone(res);
      return;
    }
    setResult(res);
    playSound(r.correct ? 'correct' : 'wrong');
    if (r.correct) setFlash(true);
    else setShakeN((n) => n + 1);
  };

  useEnterKey(() => (result ? onDone(result) : check()), true);

  const openHint = () => {
    setHintOpen(true);
    requestAnimationFrame(() => hintRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  const verdict = result ? (result.correct ? 'correct' : 'wrong') : null;
  const shakeClass = shakeN === 0 ? '' : shakeN % 2 ? 'lesson-shake-a' : 'lesson-shake-b';
  return (
    <>
      <div className={`lesson-card lesson-qcard${flash ? ' lesson-flash-good' : ''}`} onAnimationEnd={(e) => e.target === e.currentTarget && setFlash(false)}>
        {header}
        <QuestionView question={question} seed={seed} draft={draft} onDraft={onDraft} locked={!!result} verdict={verdict} answerClassName={shakeClass} />
        {notice && (
          <div className="lesson-notice" role="status">
            <span aria-hidden="true">✎</span> {t.feedback[notice]}
          </div>
        )}
        {hintOpen && (
          <div className="lesson-hint anim-slide-up" ref={hintRef}>
            <div className="lesson-hint-title">
              <span aria-hidden="true">💡</span> {t.lesson.hintTitle}
            </div>
            <Rich text={question.hint} />
          </div>
        )}
      </div>
      {!result && (
        <LessonFooter>
          {mode === 'lesson' && (
            <button type="button" className="btn btn-ghost lesson-hint-btn" onClick={openHint} disabled={hintOpen}>
              <span aria-hidden="true">💡</span> {t.lesson.hint}
            </button>
          )}
          <button type="button" className="btn lesson-main-btn" disabled={!answer} onClick={check}>
            {t.common.check}
          </button>
        </LessonFooter>
      )}
      {result && (
        <>
          <div className="lesson-sheet-spacer" aria-hidden="true" />
          <FeedbackSheet question={question} seed={seed} result={result} mode={mode} willRequeue={willRequeue} onContinue={() => onDone(result)} />
        </>
      )}
    </>
  );
}

function Solution({ steps }: { steps: string[] }) {
  return (
    <div className="lesson-solution">
      <div className="lesson-solution-title">{t.feedback.solutionTitle}</div>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>
            <Rich text={s} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FeedbackSheet({
  question,
  seed,
  result,
  mode,
  willRequeue,
  onContinue,
}: {
  question: Question;
  seed: number;
  result: QuestionResult;
  mode: RunnerMode;
  willRequeue?: boolean;
  onContinue: () => void;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
  }, []);
  const good = result.correct;
  return (
    <div className={`lesson-sheet ${good ? 'lesson-sheet-good' : 'lesson-sheet-bad'}`} role="status" aria-live="polite">
      <div className="lesson-sheet-inner">
        <div className="lesson-sheet-scroll">
          <div className="lesson-sheet-head">
            <span className={`lesson-sheet-icon${good ? ' anim-pop' : ''}`} aria-hidden="true">
              {good ? '✓' : '✗'}
            </span>
            <strong className="lesson-sheet-title">{good ? pickPhrase(t.feedback.correct, seed) : t.feedback.wrong}</strong>
            {good && result.xp > 0 && mode === 'lesson' && (
              <span className="lesson-xp-pill anim-pop">
                +<CountUp value={result.xp} duration={600} /> {t.common.xp}
              </span>
            )}
          </div>
          {!good && (
            <>
              <p className="lesson-sheet-text">{pickPhrase(t.feedback.wrongEncourage, seed >>> 3)}</p>
              <div className="lesson-sheet-answer">
                <span className="lesson-sheet-label">{t.feedback.correctAnswer}</span> <Rich text={formatAnswer(question.answer)} className="lesson-inline-rich" />
              </div>
              {willRequeue && <p className="lesson-sheet-note">↻ {t.feedback.tryAgainLater}</p>}
              <Solution steps={question.solution} />
            </>
          )}
          {good && (
            <>
              {showSolution && <Solution steps={question.solution} />}
              <button type="button" className="lesson-link-btn" onClick={() => setShowSolution((s) => !s)}>
                {showSolution ? t.feedback.hideSolution : t.feedback.showSolution}
              </button>
            </>
          )}
        </div>
        <button ref={btn} type="button" className={`btn btn-block ${good ? 'btn-good' : ''}`} onClick={onContinue}>
          {t.common.continue}
        </button>
      </div>
    </div>
  );
}
