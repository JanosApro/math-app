/**
 * One chapter's winding trail on the map: subtopic nodes in a gentle S-curve with their titles
 * beside them, connected by a curved path measured from the real node positions (so long,
 * wrapping Hungarian titles never break the layout). The trail ends at a trophy goal.
 *
 * Node states are distinct without color: ✓ (done), bigger + play + bubble (recommended),
 * lesson number (available), padlock (soft-locked), hourglass (soon); in-progress lessons get a
 * half-filled badge and a "Folyamatban" label. Every node is a real <button> with a full label.
 */
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { NodeState } from '../content/catalog';
import { t } from '../i18n/hu';
import { CheckIcon, LockIcon, PlayIcon, SoonIcon, TrophyIcon } from '../ui/AppShellIcons';

export interface TrailNode {
  id: string;
  title: string;
  /** 1-based number inside the chapter. */
  number: number;
  /** Position in the whole grade, drives the zig-zag so it continues across chapters. */
  globalIndex: number;
  state: NodeState;
  /** A lesson step is saved (started but not finished). */
  inProgress: boolean;
  /** Bubble text above the recommended node ("Kezdd itt!" / "Folytasd!"). */
  bubble?: string;
}

/** Horizontal positions (fraction of the free width) of consecutive nodes: a soft S-curve. */
const XS = [0.1, 0.34, 0.66, 0.9, 0.66, 0.34];

interface Paths {
  w: number;
  h: number;
  done: string;
  rest: string;
}

function stateLabel(n: TrailNode): string {
  switch (n.state) {
    case 'done':
      return t.map.completed;
    case 'recommended':
      return n.inProgress ? t.map.inProgress : t.map.notStarted;
    case 'available':
      return n.inProgress ? t.map.inProgress : t.map.notStarted;
    case 'softLocked':
      return t.map.locked;
    case 'soon':
      return t.map.soon;
  }
}

function visibleStatus(n: TrailNode): string | null {
  if (n.state === 'done') return t.map.completed;
  if (n.state === 'soon') return t.map.soon;
  if (n.inProgress) return t.map.inProgress;
  return null;
}

function Glyph({ n }: { n: TrailNode }) {
  switch (n.state) {
    case 'done':
      return <CheckIcon size={30} strokeWidth={3.4} />;
    case 'recommended':
      return <PlayIcon size={34} />;
    case 'softLocked':
      return <LockIcon size={26} />;
    case 'soon':
      return <SoonIcon size={24} />;
    default:
      return <span className="node-num">{n.number}</span>;
  }
}

export function MapTrail({ nodes, chapterDone, onOpen }: { nodes: TrailNode[]; chapterDone: boolean; onOpen: (id: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Paths | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const pts = [...el.querySelectorAll<HTMLElement>('[data-dot]')].map((d) => {
        const r = d.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, done: d.dataset.done === '1' };
      });
      let done = '';
      let rest = '';
      const f = (v: number) => v.toFixed(1);
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dy = (b.y - a.y) * 0.6;
        const seg = `M${f(a.x)} ${f(a.y)}C${f(a.x)} ${f(a.y + dy)} ${f(b.x)} ${f(b.y - dy)} ${f(b.x)} ${f(b.y)}`;
        if (a.done) done += seg;
        else rest += seg;
      }
      setPaths({ w: box.width, h: box.height, done, rest });
    };
    measure();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [nodes]);

  const last = nodes[nodes.length - 1];
  const goalIndex = last ? last.globalIndex + 1 : 0;
  const goalX = XS[goalIndex % XS.length];

  return (
    <div className="trail" ref={wrap}>
      {paths && (
        <svg className="trail-svg" width={paths.w} height={paths.h} viewBox={`0 0 ${paths.w} ${paths.h}`} aria-hidden="true" focusable="false">
          <path className="trail-path trail-path-rest" d={paths.rest} />
          <path className="trail-path trail-path-done" d={paths.done} />
        </svg>
      )}
      <ol className="trail-list">
        {nodes.map((n) => {
          const x = XS[n.globalIndex % XS.length];
          const status = visibleStatus(n);
          return (
            <li key={n.id} className={`trail-row side-${x < 0.5 ? 'left' : 'right'} st-${n.state}${n.inProgress ? ' is-progress' : ''}`} style={{ '--x': x } as CSSProperties}>
              <button type="button" className="node" data-node-id={n.id} onClick={() => onOpen(n.id)}>
                <span className="node-dot" data-dot="" data-done={n.state === 'done' ? '1' : '0'}>
                  {n.bubble && (
                    <span className="node-bubble" aria-hidden="true">
                      {n.bubble}
                    </span>
                  )}
                  <Glyph n={n} />
                  {n.inProgress && n.state !== 'done' && <span className="node-badge" aria-hidden="true" />}
                </span>
                <span className="node-label">
                  <span className="node-title">{n.title}</span>
                  {status && <span className="node-status">{status}</span>}
                  <span className="sr-only">
                    {' – '}
                    {n.bubble ? `${n.bubble} ` : ''}
                    {stateLabel(n)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        <li className={`trail-row trail-goal side-${goalX < 0.5 ? 'left' : 'right'}${chapterDone ? ' is-won' : ''}`} style={{ '--x': goalX } as CSSProperties} aria-hidden="true">
          <span className="node-dot goal-dot" data-dot="" data-done={chapterDone ? '1' : '0'} title={t.map.chapterGoal}>
            <TrophyIcon size={24} />
          </span>
        </li>
      </ol>
    </div>
  );
}
