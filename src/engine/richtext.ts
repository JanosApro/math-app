/**
 * RichText parser (pure, no React). See `RichText` in types.ts for the syntax.
 * The React renderer is src/ui/Rich.tsx; the validator (scripts/check.ts) uses this too.
 */

export type Inline =
  | { kind: 'text'; text: string; bold?: boolean }
  | { kind: 'math'; latex: string; bold?: boolean };

export type Block =
  | { kind: 'para'; lines: Inline[][] }
  | { kind: 'list'; items: Inline[][] };

/** Makes author-friendly math KaTeX-ready: decimal commas, thin spaces, unicode minus. */
export function prepareLatex(latex: string): string {
  let s = latex.replace(/−/g, '-').replace(/[  ]/g, '\\,').replace(/ /g, '~');
  // decimal comma: 0,5 → 0{,}5 (run twice for chains like 1,2,3 which should not occur anyway)
  s = s.replace(/(\d),(?=\d)/g, '$1{,}');
  return s;
}

/** Splits one line into text and math segments; `**bold**` may wrap both. */
export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  let bold = false;
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) out.push({ kind: 'text', text: buf, bold: bold || undefined });
    buf = '';
  };
  while (i < line.length) {
    const ch = line[i];
    if (ch === '\\' && line[i + 1] === '$') {
      buf += '$';
      i += 2;
      continue;
    }
    if (ch === '*' && line[i + 1] === '*') {
      flush();
      bold = !bold;
      i += 2;
      continue;
    }
    if (ch === '$') {
      const end = line.indexOf('$', i + 1);
      if (end < 0) {
        // unmatched $: keep as text (the validator reports it)
        buf += line.slice(i);
        break;
      }
      flush();
      out.push({ kind: 'math', latex: prepareLatex(line.slice(i + 1, end)), bold: bold || undefined });
      i = end + 1;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

export function parseRich(text: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = text.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  for (const p of paragraphs) {
    const lines = p.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) continue;
    let para: Inline[][] = [];
    let list: Inline[][] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ kind: 'para', lines: para });
      para = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ kind: 'list', items: list });
      list = [];
    };
    for (const line of lines) {
      const bullet = /^\s*[-•]\s+(.*)$/.exec(line);
      if (bullet) {
        flushPara();
        list.push(parseInline(bullet[1]));
      } else {
        flushList();
        para.push(parseInline(line));
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}

/** All math segments of a RichText, for validation. */
export function mathSegments(text: string): string[] {
  const res: string[] = [];
  for (const b of parseRich(text)) {
    const lines = b.kind === 'para' ? b.lines : b.items;
    for (const l of lines) for (const seg of l) if (seg.kind === 'math') res.push(seg.latex);
  }
  return res;
}

/** Problems that are easy to detect without KaTeX (used by the validator). */
export function richTextProblems(text: string): string[] {
  const problems: string[] = [];
  // Control characters usually mean a LaTeX command lost its backslash: '\frac' in a normal
  // string becomes form-feed + 'rac', '\t' tab, '\b' backspace, '\v' vertical tab, '\r' CR.
  if (/[\f\b\v\t\r]/.test(text.replace(/\r\n/g, '\n'))) {
    problems.push('Control character in text (\\f, \\t, \\b, \\v, \\r): a LaTeX command probably lost its backslash. Write \\\\frac (two backslashes) or use the tex`...` template.');
  }
  const dollars = (text.replace(/\\\$/g, '').match(/\$/g) || []).length;
  if (dollars % 2 !== 0) problems.push('Odd number of $ signs: a formula is not closed.');
  const stars = (text.match(/\*\*/g) || []).length;
  if (stars % 2 !== 0) problems.push('Odd number of **: a bold part is not closed.');
  if (/\bundefined\b|\bNaN\b|\bInfinity\b|\[object Object\]/.test(text)) {
    problems.push('Text contains "undefined", "NaN", "Infinity" or "[object Object]".');
  }
  // Decimal point in numbers inside text (Hungarian uses decimal comma).
  const textOnly = text.replace(/\$[^$]*\$/g, '');
  if (/\d\.\d/.test(textOnly)) problems.push('Decimal point in text: Hungarian uses a decimal comma (use num()).');
  for (const latex of mathSegments(text)) {
    if (/\d\.\d/.test(latex)) problems.push(`Decimal point in formula "${latex}": use a decimal comma (num()).`);
  }
  return problems;
}
