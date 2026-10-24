/**
 * Renders RichText (see engine/types.ts): $math$ via KaTeX, **bold**, line breaks, bullet lists.
 */
import katex from 'katex';
import { Fragment, memo } from 'react';
import { parseRich, type Inline } from '../engine/richtext';

const cache = new Map<string, string>();

export function renderMath(latex: string, display = false): string {
  const key = (display ? 'D:' : 'I:') + latex;
  let html = cache.get(key);
  if (html === undefined) {
    try {
      html = katex.renderToString(latex, { throwOnError: true, displayMode: display, strict: 'ignore' });
    } catch {
      html = `<span class="math-error">${latex.replace(/</g, '&lt;')}</span>`;
    }
    if (cache.size > 2000) cache.clear();
    cache.set(key, html);
  }
  return html;
}

function InlineRun({ seg }: { seg: Inline }) {
  const node =
    seg.kind === 'math' ? <span className="math" dangerouslySetInnerHTML={{ __html: renderMath(seg.latex) }} /> : <>{seg.text}</>;
  return seg.bold ? <strong>{node}</strong> : node;
}

function Line({ segs }: { segs: Inline[] }) {
  return (
    <>
      {segs.map((s, i) => (
        <InlineRun key={i} seg={s} />
      ))}
    </>
  );
}

/** Block rendering: paragraphs and lists. */
export const Rich = memo(function Rich({ text, className }: { text: string; className?: string }) {
  const blocks = parseRich(text);
  return (
    <div className={className ? `rich ${className}` : 'rich'}>
      {blocks.map((b, i) =>
        b.kind === 'para' ? (
          <p key={i}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Line segs={l} />
              </Fragment>
            ))}
          </p>
        ) : (
          <ul key={i}>
            {b.items.map((l, j) => (
              <li key={j}>
                <Line segs={l} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
});

/** Inline rendering (no paragraphs), e.g. inside buttons. Line breaks become spaces. */
export const RichInline = memo(function RichInline({ text }: { text: string }) {
  const blocks = parseRich(text);
  const lines = blocks.flatMap((b) => (b.kind === 'para' ? b.lines : b.items));
  return (
    <span className="rich-inline">
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <Line segs={l} />
        </Fragment>
      ))}
    </span>
  );
});
