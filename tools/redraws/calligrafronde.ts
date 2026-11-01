import type { P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';
import { SEA, frond } from './fronduline.ts';

/** Points along a smooth curve through `pts`, `n` of them. */
function sample(pts: P[], n: number): P[] {
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out: P[] = [];
  for (let k = 0; k < n; k++) {
    const u = (k / (n - 1)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), t = u - i;
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)], t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

/**
 * Hippomine grown into the calligrapher of the seas (« calligraphe des mers »), turned to the left: a long elegant sea
 * dragon whose leaf fronds have grown into flowing golden banners. Its long snout ends in a brush of ink-blue bristles,
 * and as it glides it writes glowing ink runes in the water.
 */
export default {
  id: '070', slug: 'calligrafronde', seed: 7001, size: [1300, 1100], tilt: 0,
  draw(c) {
    const { shape, stroke } = c;
    const { TEAL, DEEP, BELLY, GOLD, GOLD2, INK, GLOW, EYE, PINK } = SEA;

    /** A flowing banner along `ctrl` (root to tip), `w` wide at its widest, its edges rippling, curling at the tip. */
    const banner = (ctrl: P[], w: number, col = GOLD) => {
      const N = 40, sp = sample(ctrl, N);
      const ws = sp.map((_, i) => {
        const f = i / (N - 1);
        return Math.max(6, w * Math.sin(Math.PI * Math.min(1, 0.08 + f * 1.0)) * (0.7 + 0.3 * Math.cos(f * Math.PI * 5)) * (f < 0.06 ? 0.4 : 1));
      });
      shape(lineOfAction(sp, ws), col, { angle: 40, over: 0.2 }, { w: 4 });
      stroke(sp.slice(2, N - 3), { w: 3, col: GOLD2 });
    };
    /** The ink it writes: a glowing calligraphy stroke along `ctrl`, thick in the middle, thin at both ends. */
    const ink = (ctrl: P[], w: number) => {
      const N = 50, sp = sample(ctrl, N), ws = sp.map((_, i) => { const f = i / (N - 1); return w * (0.15 + 0.85 * Math.sin(Math.PI * Math.pow(f, 0.7))); });
      c.tint(lineOfAction(sp, ws.map((x) => x + 18)), GLOW, { wash: 0.3, angle: 30 });
      shape(lineOfAction(sp, ws), INK, { angle: 30, over: 0, press: 1.2 }, { w: 0.1 });
    };

    /** The head centred on (hx, hy), `s` its size, turned `rot` degrees (its snout along local -x): a dragon's skull, a
     * long tube snout ending in the ink brush, two leafy horns grown long. Returns the brush's tip. */
    const head = (hx: number, hy: number, s: number, rot: number): P => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the far horn
      frond(c, H([60, -70]), H([330, 60]), 50 * s, -24, 3, '#e2ac2a');
      // the snout: a long tube
      shape(h([[-60, -30], [-200, -10], [-300, 6], [-306, 52], [-200, 50], [-60, 50]]), TEAL, { angle: 20 + rot, over: 0.3 });
      // the brush: a bundle of ink-blue bristles narrowing to a fine point
      shape(h([[-296, 0], [-340, -8], [-390, 10], [-440, 34], [-392, 56], [-340, 66], [-298, 58]]), INK, { angle: rot, over: 0, press: 1.25 }, { w: 4 });
      for (const k of [16, 44]) stroke(h([[-310, k], [-380, 30 + (k - 30) * 0.4]]), { w: 2.5, col: '#6a7cd0' });
      shape(c.band(h([[-292, 2], [-300, 56]]), 18, 18), DEEP, { over: 0 }, { w: 3.5 });
      // the skull: a long dragon head, a heavy brow, a strong jaw line
      shape(h([[-90, -40], [-40, -88], [40, -100], [110, -70], [140, -10], [120, 50], [60, 80], [-20, 76], [-90, 54], [-110, 10]]), TEAL, { angle: 80 + rot, over: 0.45 });
      c.tint(h([[-100, 40], [-40, 70], [40, 74], [0, 46], [-60, 30]]), BELLY, { wash: 0.75 });
      // the near horn
      frond(c, H([40, -90]), H([360, -40]), 56 * s, -30, 3);
      // proud and focused: one open eye looking down along its brush, a firm level brow
      const e = H([-30, -24]);
      c.eye(e[0], e[1], 26 * s, 30 * s, EYE);
      stroke(h([[-74, -66], [-30, -72], [16, -60]]), { w: 6.5 });
      c.cheek(...H([50, 26]), 24 * s, 14 * s, PINK);
      c.part('paupieres', { pivot: e, motion: 'blink', extra: true }, () => c.lid(e[0], e[1], 26 * s, 30 * s, TEAL));
      return H([-446, 34]);
    };

    // A: gliding level in one long S, the head bowed to write, the banners streaming back
    const spine: P[] = sample([[330, 380], [400, 470], [520, 540], [680, 520], [820, 440], [960, 440], [1070, 540], [1100, 690], [1050, 800], [960, 820], [920, 760], [970, 720], [1000, 760]], 60);
    // narrow behind the head, swelling into the chest, a waist, swelling again at the hips, then tapering to the curl
    const bulge = (f: number, at: number, w: number, h: number) => h * Math.exp(-(((f - at) / w) ** 2));
    const ws = spine.map((_, i) => { const f = i / 59; return 14 + 46 * (1 - f) + bulge(f, 0.25, 0.09, 160) + bulge(f, 0.52, 0.08, 96) - bulge(f, 0.04, 0.05, 10); });
    const [hx, hy, hs, hr] = [300, 330, 0.95, -48];
    const r = (hr * Math.PI) / 180, tip: P = [hx + (-446 * Math.cos(r) - 34 * Math.sin(r)) * hs, hy + (-446 * Math.sin(r) + 34 * Math.cos(r)) * hs];
    c.part('encre', { pivot: [200, 800], motion: 'swing', amp: 1, period: 3, decor: true }, () => {
      ink([tip, [96, 700], [140, 800], [240, 840], [380, 820], [520, 860], [640, 920]], 20);
    });
    // far banners behind
    c.part('bannieres-loin', { pivot: [700, 520], motion: 'swing', amp: 2, period: 3.4, behind: true }, () => {
      banner([[640, 480], [700, 330], [820, 240], [940, 200], [1060, 120]], 74, '#e2ac2a');
    });
    shape(lineOfAction(spine, ws), TEAL, { angle: 30, over: 0.45 });
    c.tint(lineOfAction(spine.slice(4, 44).map(([x, y], i): P => [x - 4, y + ws[i + 4] * 0.22]), ws.slice(4, 44).map((x) => x * 0.42)), BELLY, { wash: 0.8, angle: 20 });
    // bony rings along its body, the mark of its kind
    for (let i = 10; i < 46; i += 5) {
      const [ax, ay] = spine[i - 1], [bx, by] = spine[i + 1], l = Math.hypot(bx - ax, by - ay), n: P = [(by - ay) / l, -(bx - ax) / l], w = ws[i] / 2;
      stroke([[spine[i][0] + n[0] * (w - 6), spine[i][1] + n[1] * (w - 6)], [spine[i][0] + n[0] * w * 0.1, spine[i][1] + n[1] * w * 0.1]], { w: 3.5, col: DEEP });
    }
    // near banners: grown from its back and belly, streaming back
    c.part('bannieres', { pivot: [700, 560], motion: 'swing', amp: 2, period: 3.4 }, () => {
      banner([[880, 420], [980, 330], [1110, 320], [1240, 250]], 80);
      banner([[700, 590], [780, 720], [900, 790], [1020, 900], [1180, 960]], 90);
      banner([[560, 470], [600, 330], [700, 250], [780, 130]], 64);
    });
    head(hx, hy, hs, hr);
  },
} satisfies Redraw;
