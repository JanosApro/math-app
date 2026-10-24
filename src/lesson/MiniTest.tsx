/**
 * The mini test at the end of a lesson: `module.miniTest.items`, fresh seeds per attempt,
 * no hints and no feedback during the test. Fail → review of the wrong items and an immediate
 * retry (new seeds, no lockout). Pass → `onPass` (the player records it and celebrates).
 */
import { useMemo, useState } from 'react';
import type { Question, StudentAnswer, SubtopicModule } from '../engine/types';
import { formatAnswer } from '../engine/answers';
import { generateQuestion, seedOf } from '../engine/session';
import { FigureView } from '../figures/FigureView';
import { Rich } from '../ui/Rich';
import { playSound } from '../ui/sound';
import { t } from '../i18n/hu';
import { describeAnswer } from './inputs/draft';
import { InfoButton } from '../ui/InfoButton';
import { LessonFooter, useEnterKey } from './parts';
import { QuestionRunner } from './QuestionRunner';

export interface TestAnswer {
  question: Question;
  answer: StudentAnswer | null;
  correct: boolean;
}

export interface TestResult {
  correct: number;
  total: number;
  percent: number;
  passPercent: number;
  passed: boolean;
  answers: TestAnswer[];
}

function makeQuestions(module: SubtopicModule, attempt: number): { question: Question | null; seed: number }[] {
  return module.miniTest.items.map((ref, i) => {
    const seed = seedOf('test', module.id, attempt, i);
    try {
      return { question: generateQuestion(module, ref, seed), seed };
    } catch (e) {
      console.error(e);
      return { question: null, seed };
    }
  });
}

export function MiniTest({
  module,
  onPass,
  onFail,
  onExit,
  onProgress,
}: {
  module: SubtopicModule;
  /** Passed: the player records the result and shows the celebration. */
  onPass: (r: TestResult) => void;
  /** Failed: record the attempt (no penalty). */
  onFail?: (r: TestResult) => void;
  onExit: () => void;
  onProgress?: (p: number) => void;
}) {
  const [attempt, setAttempt] = useState(() => Date.now());
  const questions = useMemo(() => makeQuestions(module, attempt), [module, attempt]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [failed, setFailed] = useState<TestResult | null>(null);
  const passPercent = module.miniTest.passPercent ?? 80;
  const n = questions.length;

  const record = (a: TestAnswer) => {
    const all = [...answers, a];
    setAnswers(all);
    if (all.length < n) {
      setIndex(all.length);
      onProgress?.(all.length / n);
      window.scrollTo({ top: 0 });
      return;
    }
    const correct = all.filter((x) => x.correct).length;
    const percent = Math.round((correct / n) * 100);
    const result: TestResult = { correct, total: n, percent, passPercent, passed: percent >= passPercent, answers: all };
    onProgress?.(1);
    if (result.passed) onPass(result);
    else {
      playSound('tryAgain');
      onFail?.(result);
      setFailed(result);
      window.scrollTo({ top: 0 });
    }
  };

  const retry = () => {
    setAttempt(Date.now());
    setIndex(0);
    setAnswers([]);
    setFailed(null);
    onProgress?.(0);
    window.scrollTo({ top: 0 });
  };

  if (failed) return <TestFailed result={failed} onRetry={retry} onExit={onExit} />;

  const cur = questions[index];
  if (!cur.question) {
    // A broken generator must not block the test: count it as correct and move on.
    return (
      <>
        <div className="lesson-card">
          <p className="lesson-notice">{t.lesson.generatorError}</p>
        </div>
        <LessonFooter>
          <button type="button" className="btn lesson-main-btn" onClick={() => record({ question: { prompt: '—', answer: { type: 'truefalse', value: true }, hint: '', solution: [] }, answer: null, correct: true })}>
            {t.common.continue}
          </button>
        </LessonFooter>
      </>
    );
  }
  return (
    <QuestionRunner
      key={`${attempt}:${index}`}
      question={cur.question}
      seed={cur.seed}
      mode="test"
      onDone={(r) => record({ question: cur.question!, answer: r.answer, correct: r.correct })}
    />
  );
}

/**
 * The wrong answers, one short row each (number + the correct answer); 🔍 opens the task, the
 * student's answer and the worked solution.
 */
export function ReviewList({ answers }: { answers: TestAnswer[] }) {
  const wrong = answers.map((a, i) => ({ ...a, no: i + 1 })).filter((a) => !a.correct);
  if (wrong.length === 0) return null;
  return (
    <div className="lesson-review">
      <h3 className="lesson-review-title">{t.test.review}</h3>
      <ul className="lesson-review-list">
        {wrong.map((a) => (
          <li key={a.no} className="lesson-review-item">
            <span className="lesson-review-no">{a.no}.</span>
            <span className="lesson-review-answer">
              <span className="lesson-review-mark" aria-hidden="true">
                ✓
              </span>
              <span className="sr-only">{t.feedback.correctAnswer} </span>
              <Rich text={formatAnswer(a.question.answer)} className="lesson-inline-rich" />
            </span>
            <InfoButton title={t.test.question(a.no, answers.length)} icon="search" label={t.test.reviewItem(a.no)}>
              <Rich text={a.question.prompt} />
              {a.question.figure && <FigureView figure={a.question.figure} />}
              <div className="lesson-review-row lesson-review-yours">
                <span className="lesson-review-mark" aria-hidden="true">
                  ✗
                </span>
                <span className="lesson-sheet-label">{t.feedback.yourAnswer}</span> <Rich text={describeAnswer(a.question.answer, a.answer)} className="lesson-inline-rich" />
              </div>
              <div className="lesson-review-row lesson-review-correct">
                <span className="lesson-review-mark" aria-hidden="true">
                  ✓
                </span>
                <span className="lesson-sheet-label">{t.feedback.correctAnswer}</span> <Rich text={formatAnswer(a.question.answer)} className="lesson-inline-rich" />
              </div>
              <div className="lesson-solution">
                <div className="lesson-solution-title">{t.feedback.solutionTitle}</div>
                <ol>
                  {a.question.solution.map((s, j) => (
                    <li key={j}>
                      <Rich text={s} />
                    </li>
                  ))}
                </ol>
              </div>
            </InfoButton>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestFailed({ result, onRetry, onExit }: { result: TestResult; onRetry: () => void; onExit: () => void }) {
  useEnterKey(onRetry);
  return (
    <>
      <div className="lesson-card lesson-result anim-slide-up">
        <div className="lesson-result-emoji" aria-hidden="true">
          💪
        </div>
        <h2 className="lesson-title">{t.test.failed}</h2>
        <div className="lesson-score">
          <span className="lesson-score-big">{result.percent}%</span>
          <span className="lesson-score-small">
            {t.test.score(result.correct, result.total)} · {t.test.needed(result.passPercent)}
          </span>
        </div>
        <ReviewList answers={result.answers} />
      </div>
      <LessonFooter>
        <button type="button" className="btn btn-ghost lesson-side-btn" onClick={onExit}>
          {t.test.backToMap}
        </button>
        <button type="button" className="btn lesson-main-btn" onClick={onRetry}>
          ↻ {t.test.retry}
        </button>
      </LessonFooter>
    </>
  );
}
