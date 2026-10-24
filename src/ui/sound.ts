/**
 * Tiny synthesized sound effects (Web Audio, no files). Off by default; the toggle lives in
 * settings. Every call is safe: it silently does nothing if audio is unavailable.
 */
import { getState } from '../state/store';

type SoundName = 'correct' | 'wrong' | 'complete' | 'tap';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + start);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.05);
}

export function playSound(name: SoundName): void {
  if (!getState().settings.sound) return;
  const ac = audio();
  if (!ac) return;
  try {
    switch (name) {
      case 'correct':
        tone(ac, 660, 0, 0.12, 'triangle');
        tone(ac, 880, 0.1, 0.18, 'triangle');
        break;
      case 'wrong':
        tone(ac, 300, 0, 0.18, 'sine', 0.12);
        tone(ac, 240, 0.12, 0.22, 'sine', 0.1);
        break;
      case 'complete':
        [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.11, 0.25, 'triangle'));
        break;
      case 'tap':
        tone(ac, 520, 0, 0.05, 'sine', 0.06);
        break;
    }
  } catch {
    /* ignore */
  }
}
