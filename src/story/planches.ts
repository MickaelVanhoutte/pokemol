/**
 * The story's planches (src/ui/planche): its few big moments drawn full screen, stroke by stroke.
 * - `effaceurVisage`: at the Edge of the Page, eraser crumbs fall from the Great Eraser's rubbed-out face, a face
 *   is pencilled in under the cap, then the cap itself is rubbed away: it is the player's own face.
 * - `photo`: the Prof's « Clic-clac ! » in the lab, a Polaroid of the player and the first Bestiole developing on
 *   the cork board, a little blurry (« Le mieux est parfois l'ennemi du bien »).
 * - `reveil`: waking up in the real bedroom, eyes opening on the morning (the prologue the other way round).
 */
import { L } from '../i18n';
import { clamp01, easeBack, easeInOut, easeOut, lerp, seg } from '../anim/ease';
import { doubtLook, hoodedLook, type Appearance } from '../data/appearance';
import { personUrl } from '../ui/personArt';
import { monArtUrl } from '../ui/monArt';
import { seeded } from '../ui/paper/pencilCanvas';
import { camAt, crumbs, eraser, fit, grain, hatched, lids, LINES, look, pencil, toDest, type Box, type CamKey } from '../ui/planche/draw';
import type { Planche } from '../ui/planche/planche';

const GRAPHITE = '#3a3346';

// ------------------------------------------------------------------ the Great Eraser's face

/** Its timeline (ms): crumbs falling, the face pencilled in, the cap rubbed out, the face shown. */
export const VISAGE = { face: 2600, faceEnd: 5000, cap: 5200, capEnd: 7200, shown: 7400, end: 8800 };

/** In the portraits' own pixels (src/ui/personArt.ts draws them 400×520): the face, and the eraser cap. */
const FACE: Box = { x: 110, y: 140, w: 180, h: 116 };
const CAP: Box = { x: 80, y: 28, w: 240, h: 112 };

const VISAGE_CAM: CamKey[] = [
  { at: 0, x: 200, y: 270, z: 1 },
  { at: 2400, x: 200, y: 205, z: 1.45 },
  { at: 4800, x: 200, y: 195, z: 1.6 },
  { at: 6000, x: 200, y: 150, z: 1.3 },
  { at: 7400, x: 200, y: 185, z: 1.2 },
  { at: 8800, x: 200, y: 190, z: 1.32 },
];

/** Black scribbles round the page: the Great Eraser's mark (redrawn 12 times a second, like a flipbook). */
function scribbles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const r = seeded(70 + (Math.floor(t / 83) % 3));
  ctx.strokeStyle = 'rgba(8, 6, 12, 0.55)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const side = i % 4;
    let x = side === 0 ? r() * w * 0.2 : side === 1 ? w - r() * w * 0.2 : r() * w;
    let y = side === 2 ? r() * h * 0.15 : side === 3 ? h - r() * h * 0.15 : r() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 9; j++) {
      x += (r() - 0.5) * 60;
      y += (r() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/** The Great Eraser's face coming back: it is `me`'s own, greyed by doubt. */
export function effaceurVisage(me: Appearance): Planche {
  const V = VISAGE;
  return {
    id: 'effaceurVisage',
    ms: V.end,
    end: 'tap',
    beats: [
      { at: 0 },
      { at: V.face, caption: L('Sous la gomme, un visage se dessine…', 'Under the eraser, a face is being drawn…') },
      { at: V.cap, caption: L('… un visage que tu connais bien.', '… a face you know well.') },
      { at: V.shown, caption: L('Le Grand Effaceur… a ton visage !', 'The Great Eraser… has your face!') },
    ],
    images: () => ({ blank: personUrl(hoodedLook(me, 'blank')), hooded: personUrl(hoodedLook(me)), face: personUrl(doubtLook(me)) }),
    cues: [
      { from: 300, to: 2400, sound: 'rub' },
      { from: V.face, to: V.faceEnd, sound: 'pencil' },
      { from: V.cap, to: V.capEnd, sound: 'rub' },
      { at: V.shown, sound: 'thud' },
    ],
    draw(ctx, t, w, h, kit) {
      const blank = kit.img('blank'), hooded = kit.img('hooded'), face = kit.img('face');
      ctx.fillStyle = '#1f1b29';
      ctx.fillRect(0, 0, w, h);
      scribbles(ctx, w, h, t);
      const cam = camAt(VISAGE_CAM, t, kit.calm);
      // a low landscape screen crops the page's foot: the face is what counts
      const base = Math.min(w / 470, h / (w > h ? 440 : 600));
      ctx.save();
      // a knock when the face is shown
      if (!kit.calm && t > V.shown && t < V.shown + 360) {
        const k = 1 - (t - V.shown) / 360;
        ctx.translate(Math.sin(t * 0.11) * 7 * k, Math.cos(t * 0.13) * 5 * k);
      }
      look(ctx, w, h, { ...cam, z: cam.z * base });
      // the page
      ctx.save();
      ctx.rotate(-0.02);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-26, -22, 470, 580);
      ctx.fillStyle = '#ebe6ee';
      ctx.fillRect(-35, -30, 470, 580);
      grain(ctx, { x: -35, y: -30, w: 470, h: 580 }, 5, 500);
      ctx.restore();
      const dest: Box = { x: 0, y: 0, w: 400, h: 520 };
      let tip: [number, number] | null = null, tool: 'pencil' | 'eraser' = 'pencil';
      if (blank && hooded && face) {
        if (t < V.cap) {
          ctx.drawImage(blank, dest.x, dest.y, dest.w, dest.h);
          // the face, in graphite first, then its colours
          const k1 = seg(t, V.face, V.face + 1500), k2 = seg(t, V.face + 900, V.faceEnd);
          const a = hatched(ctx, kit, 0, hooded, dest, { box: FACE, k: k1, seed: 3, mode: 'in', rows: 7, filter: LINES, blend: 'multiply' });
          const b = hatched(ctx, kit, 2, hooded, dest, { box: FACE, k: k2, seed: 5, mode: 'in', rows: 7 });
          tip = b ?? a;
        } else {
          // the cap rubbed away, the face underneath
          ctx.drawImage(face, dest.x, dest.y, dest.w, dest.h);
          tip = hatched(ctx, kit, 0, hooded, dest, { box: CAP, k: seg(t, V.cap, V.capEnd), seed: 9, mode: 'out', rows: 6 });
          tool = 'eraser';
        }
      }
      // crumbs off the rubbed-out face, then off the cap
      crumbs(ctx, t, { x0: 140, x1: 260, y: 225, from: 300, to: 2300, n: 24, seed: 11, size: 9, fall: 420 });
      crumbs(ctx, t, { x0: CAP.x + 20, x1: CAP.x + CAP.w - 20, y: CAP.y + CAP.h * 0.7, from: V.cap + 200, to: V.capEnd, n: 30, seed: 12, size: 10, fall: 460, colour: '#ee8aab' });
      if (tip && blank) {
        const [x, y] = toDest(blank, dest, tip);
        if (tool === 'pencil') pencil(ctx, x, y, 120, -0.8);
        else eraser(ctx, x, y, 90, -0.4 + Math.sin(t / 60) * 0.08);
      }
      ctx.restore();
      // the dark round the edges
      const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.hypot(w, h) * 0.6);
      v.addColorStop(0, 'rgba(10, 8, 16, 0)');
      v.addColorStop(1, 'rgba(10, 8, 16, 0.75)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
      // a flash as it is shown
      const flash = t > V.shown ? 1 - clamp01((t - V.shown) / 380) : 0;
      if (flash > 0 && !kit.calm) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.55 * flash).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }
      // the page fades in from the dark
      const dark = 1 - seg(t, 0, 500);
      if (dark > 0) {
        ctx.fillStyle = `rgba(31, 27, 41, ${dark.toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }
    },
  };
}

// ------------------------------------------------------------------ the Prof's photo

/** Its timeline (ms): the flash, the Polaroid sliding up and pinned, developing, the names written on it. */
export const PHOTO = { slide: 250, settle: 1200, pin: 1400, develop: 1200, developed: 4400, write: 3800, written: 4900, end: 5200 };

/** The little photos already pinned on the Prof's cork board (where, size, tilt, colour). */
function corkBoard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#c8a06a';
  ctx.fillRect(0, 0, w, h);
  grain(ctx, { x: 0, y: 0, w, h }, 21, Math.round((w * h) / 300), 'rgba(110, 70, 30, 0.25)', 'rgba(255, 230, 180, 0.25)');
  const r = seeded(33);
  const colours = ['#f6a7c8', '#bfe2fa', '#f7e37a', '#c9ec9a', '#d9ccf5', '#f9c49a'];
  const s = Math.min(w, h) * 0.2;
  for (let i = 0; i < 12; i++) {
    const x = (i % 4) * (w / 4) + r() * w * 0.12, y = Math.floor(i / 4) * (h / 3) + r() * h * 0.12;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((r() - 0.5) * 0.4);
    ctx.fillStyle = 'rgba(60, 40, 20, 0.25)';
    ctx.fillRect(3, 4, s * 0.82, s);
    ctx.fillStyle = '#f7f3ea';
    ctx.fillRect(0, 0, s * 0.82, s);
    ctx.fillStyle = colours[i % colours.length];
    ctx.globalAlpha = 0.7;
    ctx.fillRect(s * 0.06, s * 0.06, s * 0.7, s * 0.66);
    // a drawing on it: a blob with two eyes
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = GRAPHITE;
    ctx.beginPath();
    ctx.arc(s * 0.32, s * 0.36, s * 0.025, 0, Math.PI * 2);
    ctx.arc(s * 0.48, s * 0.36, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d64a4a';
    ctx.beginPath();
    ctx.arc(s * 0.41, s * 0.03, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // the board a little out of focus round the new photo
  ctx.fillStyle = 'rgba(40, 25, 10, 0.28)';
  ctx.fillRect(0, 0, w, h);
}

/** What the photo shows: the lab, `me` and the first Bestiole, drawn on a `pw`×`ph` canvas. */
function shot(c: CanvasRenderingContext2D, pw: number, ph: number, me?: HTMLImageElement, mon?: HTMLImageElement) {
  const wall = c.createLinearGradient(0, 0, 0, ph);
  wall.addColorStop(0, '#efe7d4');
  wall.addColorStop(1, '#d9cdb2');
  c.fillStyle = wall;
  c.fillRect(0, 0, pw, ph);
  c.fillStyle = '#b8a07a';
  c.fillRect(0, ph * 0.8, pw, ph * 0.2);
  c.fillStyle = 'rgba(120, 100, 70, 0.35)';
  c.fillRect(0, ph * 0.3, pw, ph * 0.02);
  if (me?.naturalWidth) {
    const d = fit(me.naturalWidth, me.naturalHeight, { x: pw * 0.02, y: ph * 0.08, w: pw * 0.56, h: ph * 0.94 });
    c.drawImage(me, d.x, d.y, d.w, d.h);
  }
  if (mon?.naturalWidth) {
    const d = fit(mon.naturalWidth, mon.naturalHeight, { x: pw * 0.5, y: ph * 0.42, w: pw * 0.48, h: ph * 0.52 });
    c.drawImage(mon, d.x, d.y, d.w, d.h);
  }
}

/** The Prof's photo of `name` and the first Bestiole `mon` (`label`: its name, written on the white margin). */
export function photo(o: { look: Appearance; mon: { species: string; shiny?: boolean }; name: string; label: string }): Planche {
  const P = PHOTO;
  return {
    id: 'photo',
    ms: P.end,
    end: 'auto',
    beats: [{ at: 0 }],
    images: () => ({ me: personUrl(o.look), mon: monArtUrl(o.mon) }),
    cues: [
      { at: 1, sound: 'shutter' },
      { at: P.slide + 50, sound: 'swoosh' },
      { at: P.pin, sound: 'pop' },
      { from: P.write, to: P.written, sound: 'pencil' },
    ],
    draw(ctx, t, w, h, kit) {
      corkBoard(ctx, w, h);
      // the Polaroid: 0.82 as wide as high, its photo with a wide white margin at the bottom
      const fh = Math.min(h * 0.8, (w * 0.8) / 0.82), fw = fh * 0.82;
      const slide = easeBack(seg(t, P.slide, P.settle));
      const cx = w / 2, cy = h / 2 + (1 - slide) * (h * 0.5 + fh);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(lerp(0.16, -0.045, kit.calm ? 1 : easeOut(seg(t, P.slide, P.settle))));
      ctx.fillStyle = 'rgba(30, 20, 10, 0.35)';
      ctx.fillRect(-fw / 2 + 6, -fh / 2 + 8, fw, fh);
      ctx.fillStyle = '#fbf8f1';
      ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
      grain(ctx, { x: -fw / 2, y: -fh / 2, w: fw, h: fh }, 8, 220);
      const m = fw * 0.065, pw = fw - 2 * m, ph = pw;
      const px = -fw / 2 + m, py = -fh / 2 + m;
      // what it shows, a little blurry (the Prof's hand shook): developing from dark and sepia into colour
      const dev = easeInOut(seg(t, P.develop, P.developed));
      const art = kit.scratch(0, Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
      const a = art.getContext('2d')!;
      shot(a, art.width, art.height, kit.img('me'), kit.img('mon'));
      ctx.filter = `sepia(${(0.85 * (1 - dev) + 0.12).toFixed(2)}) blur(${lerp(5, 1.3, dev).toFixed(2)}px) brightness(${lerp(0.55, 1.03, dev).toFixed(2)})`;
      ctx.drawImage(art, px, py, pw, ph);
      ctx.globalAlpha = 0.32;
      ctx.drawImage(art, px + pw * 0.025, py - ph * 0.012, pw, ph);
      ctx.globalAlpha = 1;
      ctx.filter = 'none';
      ctx.fillStyle = `rgba(42, 32, 26, ${(1 - dev).toFixed(3)})`;
      ctx.fillRect(px, py, pw, ph);
      // a glossy glint
      const glint = ctx.createLinearGradient(px, py, px + pw, py + ph);
      glint.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
      glint.addColorStop(0.45, 'rgba(255, 255, 255, 0.16)');
      glint.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glint;
      ctx.fillRect(px, py, pw, ph);
      // the names, written in pencil on the margin
      const k = seg(t, P.write, P.written);
      if (k > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-fw / 2, py + ph, fw * k, fh);
        ctx.clip();
        ctx.fillStyle = GRAPHITE;
        ctx.font = `${Math.round(fh * 0.075)}px 'Bestioles Main', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${o.name} & ${o.label}`, 0, py + ph + (fh / 2 - (py + ph)) / 2, fw * 0.9);
        ctx.restore();
      }
      // pinned to the board
      if (t >= P.pin) {
        const r = fw * 0.035;
        ctx.fillStyle = 'rgba(30, 20, 10, 0.35)';
        ctx.beginPath();
        ctx.arc(3, -fh / 2 + m * 0.5 + 4, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d64a4a';
        ctx.beginPath();
        ctx.arc(0, -fh / 2 + m * 0.5, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -fh / 2 + m * 0.5 - r * 0.3, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // the flash
      const flash = t < 120 ? 1 : 1 - seg(t, 120, 800);
      if (flash > 0) {
        ctx.fillStyle = `rgba(255, 253, 246, ${flash.toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }
    },
  };
}

// ------------------------------------------------------------------ waking up

/** How shut the eyes are while waking up (1 shut, 0 open): they open, close again, blink, and open. */
const WAKE_LIDS: [number, number][] = [
  [0, 1], [1100, 1], [1500, 0.55], [1900, 0.92], [2200, 0.92], [2900, 0.35], [3150, 0.35], [3300, 1], [3450, 0.3], [3700, 0.3], [4600, 0],
];

export const REVEIL_MS = 4800;

export function wakeLids(t: number): number {
  if (t <= WAKE_LIDS[0][0]) return WAKE_LIDS[0][1];
  for (let i = 1; i < WAKE_LIDS.length; i++) {
    const [ta, a] = WAKE_LIDS[i - 1], [tb, b] = WAKE_LIDS[i];
    if (t < tb) return lerp(a, b, easeInOut((t - ta) / (tb - ta)));
  }
  return WAKE_LIDS[WAKE_LIDS.length - 1][1];
}

/** Waking up in the real bedroom: the white of the dream, warm eyelids in the morning light, the room blurred then sharp. */
export function reveil(): Planche {
  return {
    id: 'reveil',
    ms: REVEIL_MS,
    end: 'auto',
    beats: [{ at: 0 }],
    veil: (t) => {
      const sharp = easeInOut(seg(t, 1800, REVEIL_MS));
      return `blur(${(9 * (1 - sharp)).toFixed(2)}px) brightness(${(1 + 0.3 * (1 - seg(t, 1000, 4200))).toFixed(3)})`;
    },
    draw(ctx, t, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#5e2f2c');
      g.addColorStop(0.5, '#f0a487');
      g.addColorStop(1, '#5e2f2c');
      lids(ctx, w, h, wakeLids(t), g, 'rgba(59, 34, 36, 0.8)');
      // the dream's white, fading into the eyelids' glow
      const white = 1 - seg(t, 200, 1000);
      if (white > 0) {
        ctx.fillStyle = `rgba(251, 246, 234, ${white.toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }
    },
  };
}

/** Every planche, built for tests and the docs. */
export const PLANCHES = (me: Appearance) => [
  effaceurVisage(me),
  photo({ look: me, mon: { species: '001' }, name: 'Léa', label: 'Bestiole' }),
  reveil(),
];
