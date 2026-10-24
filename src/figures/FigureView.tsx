/**
 * React renderer for figures. Content never uses this directly — the lesson player
 * renders `figure` fields with it.
 */
import { memo, useMemo, useState } from 'react';
import type { Figure } from './types';
import { layoutFigure } from './index';
import type { Scene, SvgItem } from './scene';
import { Rich } from '../ui/Rich';
import { t } from '../i18n/hu';
import './figures.css';

function Item({ it, isNew }: { it: SvgItem; isNew: boolean }) {
  if (it.k === 'path') {
    const drawn = isNew && !!it.stroke && !it.dash && (!it.fill || it.fill === 'none');
    const cls = isNew ? (drawn ? 'fig-drawn' : 'fig-faded') : undefined;
    return (
      <path
        d={it.d}
        fill={it.fill ?? 'none'}
        fillOpacity={it.fillOpacity}
        stroke={it.stroke}
        strokeWidth={it.stroke ? it.sw ?? 2 : undefined}
        strokeDasharray={it.dash}
        strokeLinecap={it.linecap ?? 'round'}
        strokeLinejoin="round"
        className={cls}
        pathLength={drawn ? 1 : undefined}
      />
    );
  }
  if (it.k === 'circle') {
    const cls = isNew ? 'fig-faded' : undefined;
    return (
      <circle
        cx={it.cx}
        cy={it.cy}
        r={it.r}
        fill={it.fill ?? 'none'}
        fillOpacity={it.fillOpacity}
        stroke={it.stroke}
        strokeWidth={it.stroke ? it.sw ?? 2 : undefined}
        strokeDasharray={it.dash}
        className={cls}
      />
    );
  }
  return (
    <text
      x={it.x}
      y={it.y}
      fontSize={it.size}
      textAnchor={it.anchor}
      dominantBaseline="central"
      fill={it.fill}
      fontWeight={it.bold ? 700 : undefined}
      className={`${it.font === 'math' ? 'fig-math' : 'fig-ui'}${it.halo ? ' fig-halo' : ''}${isNew ? ' fig-faded' : ''}`}
      transform={it.rotate ? `rotate(${-it.rotate} ${it.x} ${it.y})` : undefined}
    >
      {it.runs.map((r, i) =>
        r.italic ? (
          <tspan key={i} className="fig-italic">
            {r.text}
          </tspan>
        ) : (
          <tspan key={i}>{r.text}</tspan>
        ),
      )}
    </text>
  );
}

export function SceneSvg({ scene, step, alt }: { scene: Scene; step?: number; alt?: string }) {
  const vb = scene.viewBox;
  const visible = step === undefined ? scene.items : scene.items.filter((it) => (it.step ?? 0) <= step);
  return (
    <svg
      className="fig-svg"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      style={{ maxWidth: `${Math.round(vb.w * 1.35)}px` }}
      role="img"
      aria-label={alt ?? t.figure.alt}
    >
      {visible.map((it, i) => (
        <Item key={i} it={it} isNew={step !== undefined && step > 0 && it.step === step} />
      ))}
    </svg>
  );
}

function FigureViewInner({ figure }: { figure: Figure }) {
  const result = useMemo(() => {
    try {
      return { layout: layoutFigure(figure), error: null };
    } catch (e) {
      return { layout: null, error: (e as Error).message };
    }
  }, [figure]);
  const [step, setStep] = useState(0);

  if (!result.layout) {
    return (
      <div className="fig fig-error" role="alert">
        {t.figure.error}
        {import.meta.env.DEV && <pre>{result.error}</pre>}
      </div>
    );
  }
  const { scene, steps } = result.layout;
  const isConstruction = !!steps && steps.length > 0;
  return (
    <figure className="fig">
      <SceneSvg scene={scene} step={isConstruction ? step : undefined} alt={figure.alt} />
      {isConstruction && (
        <div className="fig-steps">
          <div className="fig-step-caption">
            {step === 0 ? <Rich text={t.figure.constructionStart} /> : <Rich text={`**${step}.** ${steps[step - 1]}`} />}
          </div>
          <div className="fig-step-buttons">
            <button type="button" className="btn btn-small btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)} aria-label={t.figure.prevStep}>
              ‹
            </button>
            <span className="fig-step-count">
              {step} / {steps.length}
            </span>
            <button type="button" className="btn btn-small" disabled={step === steps.length} onClick={() => setStep(step + 1)}>
              {step === 0 ? t.figure.startConstruction : t.figure.nextStep}
            </button>
          </div>
        </div>
      )}
      {(scene.notToScale || scene.caption) && (
        <figcaption>
          {scene.caption && <span className="fig-caption">{scene.caption}</span>}
          {scene.notToScale && <span className="fig-nts">{t.figure.notToScale}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** Renders any Figure. Re-layouts only when the figure object changes. */
export const FigureView = memo(FigureViewInner);
