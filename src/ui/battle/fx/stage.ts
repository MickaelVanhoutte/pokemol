/**
 * Plays move animations over the battle scene: two canvases (`.pk-fx` over the drawings,
 * `.pk-fx-back` under them), the drawings' motions and the hit reactions.
 */
import type { Side } from '../../../engine/pk/battle';
import { fxSound, sfx } from '../../../audio/sfx';
import { calmMotion } from '../../../anim/calm';
import { Brush } from './brush';
import type { Anchor, Env, Layer, Recipe } from './core';
import { BLINK, motionFrames, reactionFrames, run, shakeFrames } from './motions';
import { cameraFrames, focusFrames, hitStopMs, stopClock } from './camera';

export interface PlayOpts {
  /** The side using the move. */
  side: Side;
  /** Battle-speed multiplier (1 normal, 0.55 fast…). */
  speed: number;
  crit?: boolean;
  eff?: number;
  /** The first turn of a two-turn move. */
  charge?: boolean;
  /** Second and later hits of a multi-hit move: a bit quicker. */
  quick?: boolean;
  /** Leaves the last frame on screen (a caught Croque-Carnet) until the next animation. */
  keep?: boolean;
  seed?: number;
  /** The camera follows the move: leans on the attacker then zooms on the target ('hit'), or only leans ('self'). */
  camera?: 'hit' | 'self';
  /** The hit knocks the target out: a longer freeze-frame. */
  finalBlow?: boolean;
}

/** Flipbook frames a second for the pencil wobble. */
const BOIL_FPS = 12;

/** A canvas to draw on, over or under the drawings. */
interface Pane { ctx: CanvasRenderingContext2D; back: boolean }

const spriteOf = (scene: HTMLElement, side: Side) =>
  scene.querySelector<HTMLElement>(side === 0 ? '.pk-side--me .pk-sprite' : '.pk-side--foe .pk-sprite');

function anchorOf(el: HTMLElement | null, scene: DOMRect, side: Side): Anchor {
  const r = el?.getBoundingClientRect();
  if (!r || r.width < 4 || r.height < 4) {
    const x = scene.width * (side === 0 ? 0.3 : 0.74), y = scene.height * (side === 0 ? 0.74 : 0.3), size = scene.height * (side === 0 ? 0.36 : 0.26);
    return { x, y, top: y - size / 2, bottom: y + size / 2, left: x - size / 2, right: x + size / 2, size };
  }
  const top = Math.max(r.top, scene.top) - scene.top, bottom = Math.min(r.bottom, scene.bottom) - scene.top;
  const left = Math.max(r.left, scene.left) - scene.left, right = Math.min(r.right, scene.right) - scene.left;
  // effects keep a readable size around small (far away) drawings
  const size = Math.max(Math.min(right - left, bottom - top), Math.min(scene.width, scene.height) * 0.36);
  return { x: (left + right) / 2, y: (top + bottom) / 2, top, bottom, left, right, size };
}

export class FxStage {
  private stopCurrent: (() => void) | null = null;
  /** Motions that keep a drawing away (up in the air, under the ground) until its next move. */
  private held: Partial<Record<Side, Animation>> = {};
  private blinks: Partial<Record<Side, Animation>> = {};
  private frozen: Animation[] = [];
  /** The camera's current move (cancelled before measuring the scene again). */
  private camAnim: Animation | null = null;

  constructor(private root: () => HTMLElement | null) {}

  private cam(scene: HTMLElement) {
    return scene.querySelector<HTMLElement>('.pk-cam');
  }

  /** Back to the plain view, so the drawings are measured where they stand. */
  private settleCamera() {
    this.camAnim?.cancel();
    this.camAnim = null;
  }

  private runCamera(scene: HTMLElement, frames: Keyframe[] | null, dur: number, delay = 0): Animation | null {
    const el = this.cam(scene);
    if (!frames || !el || typeof el.animate !== 'function' || calmMotion()) return null;
    this.settleCamera();
    this.camAnim = el.animate(frames, { duration: dur, delay, easing: 'linear', fill: 'none' });
    return this.camAnim;
  }

  private env(scene: HTMLElement, o: PlayOpts): Env {
    const rect = scene.getBoundingClientRect();
    const foe = (1 - o.side) as Side;
    const w = rect.width, h = rect.height;
    return {
      w, h,
      user: anchorOf(spriteOf(scene, o.side), rect, o.side),
      target: anchorOf(spriteOf(scene, foe), rect, foe),
      userSide: o.side,
      dir: o.side === 0 ? 1 : -1,
      k: Math.min(2, Math.max(0.8, Math.min(w, h) / 300)),
      seed: o.seed ?? Math.floor(Math.random() * 1e6),
      crit: !!o.crit,
      eff: o.eff ?? 1,
    };
  }

  private canvases(scene: HTMLElement, env: Env): Pane[] {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    return [...scene.querySelectorAll<HTMLCanvasElement>('canvas.pk-fx, canvas.pk-fx-back')].map((c) => {
      const cw = Math.round(env.w * dpr), ch = Math.round(env.h * dpr);
      if (c.width !== cw || c.height !== ch) {
        c.width = cw;
        c.height = ch;
      }
      const ctx = c.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, back: c.classList.contains('pk-fx-back') };
    });
  }

  private render(panes: Pane[], env: Env, layers: Layer[], ms: number, boil: number, flash = 0) {
    for (const { ctx, back } of panes) {
      ctx.clearRect(0, 0, env.w, env.h);
      const b = new Brush(ctx, env, boil);
      for (const l of layers) {
        if (!!l.back !== back) continue;
        const t = (ms - l.start) / l.dur;
        if (t >= 0 && t <= 1) l.draw(b, t);
      }
      // a critical hit: the page flashes white for the length of the freeze-frame
      if (!back && flash > 0) b.flash(flash);
    }
  }

  private setup(recipe: Recipe, o: PlayOpts) {
    const scene = this.root();
    if (!scene) return null;
    this.settleCamera();
    const part = o.charge && recipe.charge ? recipe.charge : recipe;
    const env = this.env(scene, o);
    const layers = part.layers.map((f) => f(env));
    const total = Math.max(240, ...layers.map((l) => l.start + l.dur));
    const hit = layers.find((l) => l.impact !== undefined);
    const impact = hit ? hit.start + hit.impact! : total * 0.5;
    const speed = o.speed * (o.quick ? 0.7 : 1);
    // the freeze-frame at the hit (none on a charge turn, or with MOUVEMENTS : DOUX)
    const stop = o.charge || calmMotion() ? 0 : hitStopMs({ crit: o.crit, eff: o.eff, finalBlow: o.finalBlow });
    return { scene, part, env, layers, total, impact, speed, stop };
  }

  /** Starts the motions; returns them so a frozen frame can pause them. */
  private moveAll(s: NonNullable<ReturnType<FxStage['setup']>>, recipe: Recipe, o: PlayOpts): Animation[] {
    const { scene, part, env, impact, speed } = s;
    const out: Animation[] = [];
    const foe = (1 - o.side) as Side;
    if (part.user) {
      this.held[o.side]?.cancel();
      const m = motionFrames(part.user, env.dir);
      const a = run(spriteOf(scene, o.side), m, speed, recipe.userAt ?? 0);
      if (a) out.push(a);
      if (a && m.hold) this.held[o.side] = a;
      else delete this.held[o.side];
    }
    if (!o.charge) {
      const power = (env.crit ? 1.4 : 1) * (env.eff > 1 ? 1.4 : env.eff < 1 ? 0.6 : 1);
      const r = run(spriteOf(scene, foe), reactionFrames(recipe.hit ?? 'jiggle', env.dir, power), speed, impact);
      if (r) out.push(r);
      if (recipe.shake) {
        const sh = run(scene, shakeFrames(recipe.shake * (env.crit ? 1.3 : 1)), speed, impact);
        if (sh) out.push(sh);
      }
    }
    if (o.camera) {
      const frames = cameraFrames({
        user: env.user, target: env.target, userAt: recipe.userAt ?? 0, impact, total: s.total,
        crit: env.crit, eff: env.eff, kind: o.charge ? 'self' : o.camera,
      });
      const c = this.runCamera(scene, frames, s.total * speed);
      if (c) out.push(c);
    }
    return out;
  }

  /** Plays a move's animation; resolves when it is over. */
  play(recipe: Recipe, o: PlayOpts): Promise<void> {
    this.stop();
    const s = this.setup(recipe, o);
    if (!s) return Promise.resolve();
    const motions = this.moveAll(s, recipe, o);
    // sounds after the hit wait for the freeze-frame
    const later = (ms: number) => (s.stop && ms > s.impact ? ms + s.stop : ms);
    const sounds = s.layers.flatMap((l) => (l.sounds ?? []).map(([kind, at]) => setTimeout(() => fxSound(kind), later(l.start + at) * s.speed)));
    if (s.stop) {
      // everything holds still for a moment when the hit lands
      sounds.push(setTimeout(() => {
        if (o.crit) sfx.crit();
        s.scene.classList.add('is-stop');
        for (const a of motions) a.pause();
      }, s.impact * s.speed));
      sounds.push(setTimeout(() => {
        s.scene.classList.remove('is-stop');
        for (const a of motions) if (a.playState === 'paused') a.play();
      }, (s.impact + s.stop) * s.speed));
    }
    const length = s.total + s.stop;
    const panes = this.canvases(s.scene, s.env);
    return new Promise((resolve) => {
      const t0 = performance.now();
      let raf = 0;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        clearTimeout(guard);
        sounds.forEach(clearTimeout);
        s.scene.classList.remove('is-stop');
        for (const a of motions) if (a.playState === 'paused') a.play();
        if (o.keep) this.render(panes, s.env, s.layers, s.total, 0);
        else for (const { ctx } of panes) ctx.clearRect(0, 0, s.env.w, s.env.h);
        this.stopCurrent = null;
        resolve();
      };
      const frame = (now: number) => {
        const real = now - t0, clock = real / s.speed;
        if (clock >= length) return finish();
        const ms = stopClock(clock, s.impact, s.stop);
        const stopped = s.stop > 0 && clock > s.impact && clock < s.impact + s.stop;
        // the pencil keeps wobbling during the freeze-frame: only the drawing's time stands still
        this.render(panes, s.env, s.layers, ms, Math.floor((real / 1000) * BOIL_FPS), stopped && o.crit ? 0.5 : 0);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      // no frames while the page is hidden: end on time anyway
      const guard = setTimeout(finish, length * s.speed + 400);
      this.stopCurrent = finish;
    });
  }

  /** Draws one moment (0 to 1) of an animation and leaves it on screen (playtests, gallery). */
  freeze(recipe: Recipe, o: PlayOpts, frac: number) {
    this.clear();
    const s = this.setup(recipe, o);
    if (!s) return;
    const ms = frac * s.total;
    for (const a of this.moveAll(s, recipe, o)) {
      a.pause();
      a.currentTime = ms * s.speed;
      this.frozen.push(a);
    }
    this.render(this.canvases(s.scene, s.env), s.env, s.layers, ms, Math.floor(frac * 9));
  }

  /** The camera pushes onto a drawing for a moment (a Bestiole fainting); `ms` at normal speed. */
  focus(side: Side, speed: number, ms = 1000) {
    const scene = this.root();
    if (!scene) return;
    this.settleCamera();
    const rect = scene.getBoundingClientRect();
    this.runCamera(scene, focusFrames(anchorOf(spriteOf(scene, side), rect, side)), ms * speed);
  }

  /** The blink of a drawing taking damage (restarts when hits follow each other). */
  blink(side: Side) {
    const scene = this.root();
    if (!scene) return;
    this.blinks[side]?.cancel();
    const a = run(spriteOf(scene, side), BLINK, 1);
    if (a) this.blinks[side] = a;
  }

  /** A drawing flickering like a ghost (Passe-Muraille letting a hit through). */
  ghost(side: Side, speed: number) {
    const scene = this.root();
    if (!scene) return;
    run(spriteOf(scene, side), { dur: 700, easing: 'linear', frames: [1, 0.3, 0.8, 0.25, 0.9, 1].map((opacity) => ({ opacity })) }, speed);
  }

  /** A drawing coming back (switched in, fainted…): forgets it was up in the air. */
  reset(side: Side) {
    this.held[side]?.cancel();
    delete this.held[side];
  }

  stop() {
    this.stopCurrent?.();
    this.settleCamera();
  }

  clear() {
    this.stop();
    for (const a of this.frozen) a.cancel();
    this.frozen = [];
    const scene = this.root();
    if (!scene) return;
    for (const c of scene.querySelectorAll<HTMLCanvasElement>('canvas.pk-fx, canvas.pk-fx-back')) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  }
}
