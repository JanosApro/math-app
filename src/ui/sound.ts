/**
 * Synthesized sound effects (Web Audio, no files): a bell "ding-ding" for a correct answer, a
 * soft "bwomp" for a wrong one, a short jingle for a finished lesson part and a fanfare for a
 * finished lesson, chapter or daily challenge. On by default; the mute buttons are in the lesson
 * top bar and in settings. Every call is safe: it does nothing if audio is unavailable.
 */
import { getState } from '../state/store';

export type SoundName =
  | 'tap'
  | 'correct'
  | 'wrong'
  /** "almost" / could not read the answer: a neutral nudge, not a mistake */
  | 'notice'
  /** mini test not passed yet: gentle, encouraging */
  | 'tryAgain'
  | 'partComplete'
  | 'lessonComplete'
  | 'chapterComplete';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Phones only allow audio after a user gesture: wake the context on the first tap.
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (getState().settings.sound) audio();
  };
  window.addEventListener('pointerdown', unlock, { once: true, capture: true });
  window.addEventListener('keydown', unlock, { once: true, capture: true });
}

interface NoteOpts {
  type?: OscillatorType;
  vol?: number;
  attack?: number;
  /** glide to this frequency over the note */
  glideTo?: number;
  /** low-pass cutoff (Hz) — softens square/saw waves into "brass" */
  lowpass?: number;
  /** vibrato depth in Hz */
  vibrato?: number;
}

function note(ac: AudioContext, freq: number, start: number, dur: number, o: NoteOpts = {}) {
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t0 + dur * 0.9);
  if (o.vibrato) {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = 6;
    depth.gain.value = o.vibrato;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.1);
  }
  const vol = o.vol ?? 0.18;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack ?? 0.012));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = osc;
  if (o.lowpass) {
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lowpass;
    node = node.connect(f);
  }
  node.connect(gain).connect(master!);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** A bell: fundamental + a quiet inharmonic partial (sounds like a glockenspiel). */
function bell(ac: AudioContext, freq: number, start: number, dur = 0.5, vol = 0.16) {
  note(ac, freq, start, dur, { type: 'sine', vol, attack: 0.004 });
  note(ac, freq * 2.76, start, dur * 0.5, { type: 'sine', vol: vol * 0.25, attack: 0.004 });
  note(ac, freq * 2, start, dur * 0.7, { type: 'triangle', vol: vol * 0.2, attack: 0.004 });
}

/** Filtered noise: sparkle (high band) or a soft cymbal swell. */
function noise(ac: AudioContext, start: number, dur: number, freq: number, vol: number, swell = false) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = ac.currentTime + start;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + (swell ? dur * 0.4 : 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.5;
const G6 = 1568;

export function playSound(name: SoundName): void {
  if (!getState().settings.sound) return;
  const ac = audio();
  if (!ac || !master) return;
  try {
    switch (name) {
      case 'tap':
        note(ac, 700, 0, 0.06, { type: 'triangle', vol: 0.07 });
        break;
      case 'correct':
        bell(ac, E6, 0, 0.35, 0.14);
        bell(ac, G6, 0.09, 0.6, 0.16);
        noise(ac, 0.08, 0.25, 7000, 0.035);
        break;
      case 'wrong':
        note(ac, 330, 0, 0.32, { type: 'triangle', vol: 0.2, glideTo: 196, lowpass: 900 });
        note(ac, 165, 0.02, 0.3, { type: 'sine', vol: 0.12, glideTo: 110 });
        break;
      case 'notice':
        note(ac, 520, 0, 0.12, { type: 'sine', vol: 0.12 });
        note(ac, 620, 0.11, 0.16, { type: 'sine', vol: 0.12 });
        break;
      case 'tryAgain':
        note(ac, 392, 0, 0.2, { type: 'triangle', vol: 0.14, lowpass: 1600 });
        note(ac, 330, 0.18, 0.2, { type: 'triangle', vol: 0.14, lowpass: 1600 });
        note(ac, 440, 0.38, 0.35, { type: 'triangle', vol: 0.15, lowpass: 1600 });
        break;
      case 'partComplete':
        [C5, E5, G5, C6].forEach((f, i) => bell(ac, f, i * 0.09, 0.45, 0.13));
        [C6, E6, G6].forEach((f) => note(ac, f, 0.4, 0.7, { type: 'triangle', vol: 0.06, vibrato: 4 }));
        noise(ac, 0.36, 0.5, 8000, 0.03);
        break;
      case 'lessonComplete':
      case 'chapterComplete': {
        // "ta-ta-ta-taaa" fanfare on soft brass, then a big chord with a cymbal swell and sparkles
        const brass = { type: 'sawtooth' as OscillatorType, vol: 0.09, lowpass: 2200, attack: 0.02 };
        const notes: [number, number, number][] =
          name === 'lessonComplete'
            ? [
                [G5 / 2, 0, 0.13],
                [G5 / 2, 0.14, 0.13],
                [G5 / 2, 0.28, 0.13],
                [C5, 0.42, 0.5],
              ]
            : [
                [C5, 0, 0.13],
                [C5, 0.14, 0.13],
                [C5, 0.28, 0.13],
                [E5, 0.42, 0.3],
                [G5, 0.74, 0.13],
                [E5, 0.88, 0.13],
                [G5, 1.02, 0.6],
              ];
        for (const [f, at, d] of notes) {
          note(ac, f, at, d, brass);
          note(ac, f * 2, at, d, { ...brass, vol: 0.04 });
        }
        const chordAt = notes[notes.length - 1][1] + 0.1;
        [C5, E5, G5, C6].forEach((f) => note(ac, f, chordAt, 1.3, { type: 'triangle', vol: 0.07, vibrato: 5, attack: 0.05 }));
        noise(ac, chordAt - 0.15, 1.4, 5000, 0.05, true);
        [C6, E6, G6, C6 * 2, G6, C6 * 2].forEach((f, i) => bell(ac, f, chordAt + 0.15 + i * 0.07, 0.4, 0.07));
        break;
      }
    }
  } catch {
    /* ignore */
  }
}
