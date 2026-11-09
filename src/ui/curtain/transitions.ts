/**
 * The curtain: a canvas over every screen that runs the transitions (`wipes.ts`). It lives outside
 * the router, so a transition started over the world carries on over the battle that replaces it:
 *
 *   await cover('grass');      // the screen gets covered
 *   await showVs(card);        // a boss's VS splash, over the covered page
 *   go({ id: 'battle', … });   // the screen changes underneath
 *   void uncover('lift');      // and is revealed
 *
 * Durations follow the battle speed option; MOUVEMENTS : DOUX turns every transition into a fade.
 */
import { signal } from '@preact/signals';
import { prefs } from '../../state/prefs';
import { calmMotion } from '../../anim/calm';
import { playSound, type SoundId } from '../../audio/sfx';
import { CALM_MS, COVER_MS, COVER_SOUNDS, REVEAL_MS, REVEAL_SOUNDS, drawCurtain, forgetSheet, type CoverKind, type RevealKind } from './wipes';
import type { VsCard } from './VsSplash';
import type { Intro } from '../battle/intro';

interface CurtainState {
  mode: 'cover' | 'still' | 'reveal';
  cover: CoverKind;
  reveal?: RevealKind;
  t: number;
  seed: number;
  calm: boolean;
}

let state: CurtainState | null = null;
/** The curtain is up: `Curtain` mounts its canvas. */
export const curtainUp = signal(false);
/** The VS splash on screen, its way out and how to skip it. */
export const vsShown = signal<{ card: VsCard; leaving: boolean; skip: () => void } | null>(null);

/** How long a VS splash stays, in ms at normal speed. */
export const VS_MS = 2400;
/** The splash's way out. */
export const VS_OUT_MS = 260;
/** Taps before this are ignored (a tap still held from the dialog before the battle). */
const VS_SKIP_AFTER = 600;

/** Transitions follow the battle speed, but stay visible at its fastest. */
export const transitionPace = () => 0.5 + 0.5 * prefs.value.battleAnim;

let canvas: HTMLCanvasElement | null = null;
let lastPaint = 0;
/** The pencil's flipbook frame: 12 a second, like the move animations. */
const BOIL_MS = 1000 / 12;

/** `Curtain` hands its canvas over (null when it unmounts). */
export function bindCurtain(c: HTMLCanvasElement | null) {
  canvas = c;
  if (c) paint(true);
}

/** Draws the current frame (30 a second at most, unless `force`). */
export function paint(force = false) {
  if (!state || !canvas) return;
  const now = performance.now();
  if (!force && now - lastPaint < 30) return;
  lastPaint = now;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  // a capped pixel ratio keeps the canvas small (phones drop big canvases when memory runs low)
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCurtain(ctx, w, h, state, Math.floor(now / BOIL_MS));
}

/** Next animation frame, or a timer when frames stop (hidden window): a transition never hangs. */
const frame = () =>
  new Promise<void>((resolve) => {
    let done = false;
    const fin = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    requestAnimationFrame(fin);
    setTimeout(fin, 50);
  });

async function run(ms: number, step: (t: number) => void) {
  const t0 = performance.now();
  for (;;) {
    const t = Math.min(1, (performance.now() - t0) / Math.max(1, ms));
    step(t);
    if (t >= 1) return;
    await frame();
  }
}

function sounds(list: [SoundId, number][], ms: number) {
  for (const [id, at] of list) setTimeout(() => playSound(id), at * ms);
}

/** Covers the screen; resolves once it is fully covered (the curtain then stays down). */
export async function cover(kind: CoverKind, o: { ms?: number } = {}) {
  const calm = calmMotion();
  const ms = calm ? CALM_MS : o.ms ?? COVER_MS[kind] * transitionPace();
  state = { mode: 'cover', cover: kind, t: 0, seed: (Math.random() * 1e9) | 0, calm };
  curtainUp.value = true;
  if (!calm) sounds(COVER_SOUNDS[kind], ms);
  const mine = state;
  await run(ms, (t) => {
    if (state !== mine) return;
    mine.t = t;
    paint(t >= 1);
  });
  if (state === mine) {
    mine.mode = 'still';
    paint(true);
  }
}

/** Opens the covered screen onto whatever is under it now; resolves when it is gone. */
export async function uncover(kind: RevealKind, o: { ms?: number } = {}) {
  const mine = state;
  if (!mine) return;
  const calm = mine.calm || calmMotion();
  const ms = calm ? CALM_MS : o.ms ?? REVEAL_MS[kind] * transitionPace();
  Object.assign(mine, { mode: 'reveal', reveal: kind, t: 0, calm });
  if (!calm) sounds(REVEAL_SOUNDS[kind], ms);
  if (kind === 'lift' && !calm && canvas) {
    await liftOff(canvas, mine, ms);
    if (state === mine) dropCurtain();
    return;
  }
  await run(ms, (t) => {
    if (state !== mine) return;
    mine.t = t;
    paint(t >= 1);
  });
  if (state === mine) dropCurtain();
}

/**
 * The covered page lifted off upwards by the compositor: drawn once, then only moved, so the screen being
 * mounted under it (the world after a battle) can't make it stutter.
 */
async function liftOff(c: HTMLCanvasElement, mine: CurtainState, ms: number) {
  mine.mode = 'still';
  paint(true);
  c.classList.add('is-lifting');
  const anim = c.animate(
    [{ transform: 'none' }, { transform: 'translateY(-112%) rotate(-2.9deg)' }],
    { duration: ms, easing: 'cubic-bezier(0.55, 0, 0.8, 0.4)', fill: 'forwards' },
  );
  // a hidden page may not finish its animations: never hang on it
  await Promise.race([anim.finished.catch(() => undefined), new Promise((r) => setTimeout(r, ms + 250))]);
}

/** Takes the curtain (and any VS splash) away at once. */
export function dropCurtain() {
  state = null;
  vsShown.value = null;
  curtainUp.value = false;
  forgetSheet();
  if (canvas) {
    canvas.getAnimations().forEach((a) => a.cancel());
    canvas.classList.remove('is-lifting');
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** The screen is covered right now. */
export const isCovered = () => state?.mode === 'still';

/** Shows a VS splash over the covered screen; resolves when it is gone (a tap skips it). */
export function showVs(card: VsCard): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const ms = VS_MS * Math.max(0.45, prefs.value.battleAnim);
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (vsShown.value) vsShown.value = { ...vsShown.value, leaving: true };
      setTimeout(() => {
        vsShown.value = null;
        resolve();
      }, VS_OUT_MS);
    };
    const timer = setTimeout(end, ms);
    vsShown.value = { card, leaving: false, skip: () => { if (performance.now() - start > VS_SKIP_AFTER) end(); } };
  });
}

/** Two frames: the screen under the curtain has been painted once. */
export async function painted() {
  await frame();
  await frame();
}

/**
 * The way into a battle (shared by `fight()` and the demo page): the world gets covered, a boss's VS
 * splash, `mount` puts the battle under the curtain, then it is revealed while its platforms slide in.
 */
export async function playIntro(intro: Intro, card: VsCard | undefined, mount: () => void) {
  await cover(intro.cover);
  if (card) await showVs(card);
  mount();
  await painted();
  void uncover(intro.reveal);
}

/** The way back: a page turns over the battle, `mount` puts the world back, and the page lifts off it. */
export async function playOutro(mount: () => void) {
  await cover('page');
  mount();
  await painted();
  void uncover('lift');
}
