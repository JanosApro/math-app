/**
 * The /dev/gallery page (dev builds only): every figure type with examples.
 * Sections come from src/dev/gallery/*.ts — each exports `section: GallerySection`.
 * Controls: light/dark, topic color (--topic) and card width, because figures depend on them.
 */
import { useEffect, useMemo, useState } from 'react';
import { checkFigure } from '../figures/index';
import { FigureView } from '../figures/FigureView';
import { navigate } from '../ui/router';
import type { GallerySection } from './gallery/types';
import './dev.css';

const rawSections = import.meta.glob<{ section?: GallerySection }>('./gallery/*.ts', { eager: true });

interface SectionInfo {
  name: string;
  section: GallerySection;
}

const SECTIONS: SectionInfo[] = Object.entries(rawSections)
  .filter(([path, mod]) => !path.endsWith('types.ts') && mod.section)
  .map(([path, mod]) => ({ name: path.split('/').pop()!.replace(/\.ts$/, ''), section: mod.section! }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Theme = 'auto' | 'light' | 'dark';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export default function GalleryScreen() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [color, setColor] = useState<string>('#5a4ff3');
  const [width, setWidth] = useState<'360' | '600'>('360');
  const [copied, setCopied] = useState<string | null>(null);

  // Read the current --topic for the color picker; restore the theme on leaving the page.
  useEffect(() => {
    const root = document.documentElement;
    const original = root.getAttribute('data-theme');
    const computed = getComputedStyle(root).getPropertyValue('--topic').trim();
    if (/^#[0-9a-f]{6}$/i.test(computed)) setColor(computed);
    return () => {
      if (original === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', original);
    };
  }, []);

  // The theme buttons set data-theme directly (dev-only tool).
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  const scrollTo = (name: string) => document.getElementById(`dev-gallery-${name}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  async function onCopy(key: string, text: string) {
    if (await copyText(text)) {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    }
  }

  return (
    <div className="dev-page" style={{ ['--dev-card-w' as string]: width === '360' ? '360px' : '600px' }}>
      <div className="dev-top">
        <h1>Ábragaléria</h1>
        <div className="dev-links">
          <button type="button" className="btn btn-small btn-ghost" onClick={() => navigate({ name: 'dev' })}>
            ← /dev
          </button>
        </div>
      </div>

      <section className="dev-card">
        <h2>Vezérlők</h2>
        <div className="dev-controls">
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Téma:
          </span>
          {(['auto', 'light', 'dark'] as Theme[]).map((th) => (
            <button key={th} type="button" className={`btn btn-small ${theme === th ? '' : 'btn-ghost'}`} onClick={() => setTheme(th)}>
              {th === 'auto' ? 'Automatikus' : th === 'light' ? 'Világos' : 'Sötét'}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Szakasz színe:
          </span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Szakasz színe (--topic)" />
          <span style={{ flex: 1 }} />
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Szélesség:
          </span>
          {(['360', '600'] as const).map((w) => (
            <button key={w} type="button" className={`btn btn-small ${width === w ? '' : 'btn-ghost'}`} onClick={() => setWidth(w)}>
              {w} px
            </button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: '0.82rem', margin: '0.6rem 0 0' }}>
          Az ábrák a téma (világos/sötét) és a szakasz színe (--topic) szerint színeződnek.
        </p>
      </section>

      <section className="dev-card" style={{ ['--topic' as string]: color }}>
        <h2>Típusjegyzék</h2>
        <div className="dev-gallery-index">
          {SECTIONS.map(({ name, section }) => (
            <button key={name} type="button" onClick={() => scrollTo(name)}>
              ▸ {section.title} <span className="dev-types">({section.types.join(', ')}) · {section.entries.length} példa</span>
            </button>
          ))}
        </div>
      </section>

      {SECTIONS.map(({ name, section }) => (
        <section key={name} id={`dev-gallery-${name}`} className="dev-card" style={{ ['--topic' as string]: color }}>
          <h2>{section.title}</h2>
          <p className="muted" style={{ margin: '0 0 0.8rem', fontSize: '0.85rem' }}>
            Típusok: <span className="dev-kbd">{section.types.join(', ')}</span> · src/dev/gallery/{name}.ts
          </p>
          <div className="dev-figs">
            {section.entries.map((entry, i) => (
              <GalleryEntry
                key={i}
                whereKey={`${name}/${i}`}
                title={`[${i}] ${entry.title}`}
                note={entry.note}
                figure={entry.figure}
                copied={copied === `${name}/${i}`}
                onCopy={onCopy}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function GalleryEntry({
  whereKey,
  title,
  note,
  figure,
  copied,
  onCopy,
}: {
  whereKey: string;
  title: string;
  note?: string;
  figure: Parameters<typeof FigureView>[0]['figure'];
  copied: boolean;
  onCopy: (key: string, text: string) => void;
}) {
  const validation = useMemo(() => checkFigure(figure), [figure]);
  const json = useMemo(() => JSON.stringify(figure, null, 2), [figure]);
  return (
    <div className="dev-fig">
      <div className="dev-fig-title">{title}</div>
      {note && <div className="dev-fig-note">{note}</div>}
      <FigureView figure={figure} />
      {validation.errors.length > 0 && (
        <p className="dev-issue dev-issue-error">
          <span>✖</span>
          <span className="dev-msg">{validation.errors.join(' · ')}</span>
        </p>
      )}
      {validation.warnings.length > 0 && (
        <p className="dev-issue dev-issue-warn">
          <span>⚠</span>
          <span className="dev-msg">{validation.warnings.join(' · ')}</span>
        </p>
      )}
      <details className="dev-fig-details">
        <summary>Ábra objektum (JSON)</summary>
        <pre className="dev-json">{json}</pre>
        <button type="button" className="btn btn-small btn-ghost" style={{ marginTop: '0.4rem' }} onClick={() => onCopy(whereKey, json)}>
          {copied ? <span className="dev-copy-ok">Kimásolva ✓</span> : 'Másolás'}
        </button>
      </details>
    </div>
  );
}
