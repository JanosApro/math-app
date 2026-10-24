/**
 * Shows one question: prompt, figure, input label, the answer input for any AnswerSpec, unit.
 * Controlled: the parent owns the draft (see inputs/draft.ts) and decides when to check.
 *
 *   <QuestionView question={q} seed={seed} draft={draft} onDraft={setDraft} locked={checked} verdict="wrong" />
 */
import type { Question } from '../engine/types';
import { FigureView } from '../figures/FigureView';
import { Rich } from '../ui/Rich';
import type { AnswerDraft } from './inputs/draft';
import { NumbersAnswerInput, TextAnswer, type Verdict } from './inputs/TextAnswer';
import { ChoiceInput, MatchInput, OrderInput, TrueFalseInput } from './inputs/PickAnswers';

export interface QuestionViewProps {
  question: Question;
  /** Seed of the question — also shuffles choice / order / match items deterministically. */
  seed: number;
  draft: AnswerDraft;
  onDraft: (d: AnswerDraft) => void;
  /** No more input (after checking). The keypad is hidden. */
  locked?: boolean;
  /** After checking: mark the input correct/wrong (choice: shows the correct option). */
  verdict?: Verdict;
  /** Extra class for the answer area (e.g. a shake animation). */
  answerClassName?: string;
}

export function QuestionView({ question, seed, draft, onDraft, locked, verdict, answerClassName }: QuestionViewProps) {
  const spec = question.answer;
  let input: JSX.Element | null = null;
  switch (spec.type) {
    case 'number':
    case 'fraction':
    case 'root':
    case 'expression':
      if (draft.type === 'text')
        input = (
          <TextAnswer spec={spec} inputLabel={question.inputLabel} text={draft.text} onChange={(text) => onDraft({ type: 'text', text })} locked={locked} verdict={verdict} />
        );
      break;
    case 'numbers':
      if (draft.type === 'fields')
        input = (
          <NumbersAnswerInput
            spec={spec}
            texts={draft.texts}
            focus={draft.focus}
            onChange={(texts, focus) => onDraft({ type: 'fields', texts, focus })}
            locked={locked}
            verdict={verdict}
          />
        );
      break;
    case 'choice':
      if (draft.type === 'choice')
        input = <ChoiceInput spec={spec} seed={seed} index={draft.index} onSelect={(index) => onDraft({ type: 'choice', index })} locked={locked} verdict={verdict} />;
      break;
    case 'truefalse':
      if (draft.type === 'truefalse')
        input = <TrueFalseInput correctValue={spec.value} value={draft.value} onSelect={(value) => onDraft({ type: 'truefalse', value })} locked={locked} verdict={verdict} />;
      break;
    case 'order':
      if (draft.type === 'order')
        input = <OrderInput spec={spec} seed={seed} order={draft.order} onChange={(order) => onDraft({ type: 'order', order })} locked={locked} verdict={verdict} />;
      break;
    case 'match':
      if (draft.type === 'match') input = <MatchInput spec={spec} seed={seed} draft={draft} onChange={(d) => onDraft({ type: 'match', ...d })} locked={locked} verdict={verdict} />;
      break;
  }
  const typed = spec.type === 'number' || spec.type === 'fraction' || spec.type === 'root' || spec.type === 'expression' || spec.type === 'numbers';
  // A choice question's input label (rare) is shown above the options.
  return (
    <div className="lesson-question">
      <div className="lesson-prompt">
        <Rich text={question.prompt} />
      </div>
      {question.figure && <FigureView figure={question.figure} />}
      {!typed && question.inputLabel && (
        <div className="lesson-input-label">
          <Rich text={question.inputLabel} />
        </div>
      )}
      <div className={`lesson-answer${answerClassName ? ` ${answerClassName}` : ''}`}>{input}</div>
    </div>
  );
}
