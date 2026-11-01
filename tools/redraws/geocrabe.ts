import type { P, Redraw } from './crayon.ts';

/**
 * Coquilou grown into a walking fortress (« forteresse ambulante »), turned to the left: a strong armoured hermit crab
 * whose shell has turned into a geode: a rough, frosted rind of grey stone and steel rising on its back, and the crab
 * comes out of its opening, a hollow lined with gleaming ice crystals that catch the light all round its body. Broad and
 * heavy, its two great frosted pincers raised in guard, calm and stern.
 */
export default {
  id: '059', slug: 'geocrabe', seed: 5901, size: [1150, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const STEEL = '#6f84aa', DEEP = '#4f5f84', DARK = '#323c58', BELLY = '#c9d3e8', METAL = '#a3afc4';
    const ICE = '#d8f2fc', ICE2 = '#a9dcf3', ICELINE = '#477cae', FROST = '#f0f9fd', GLINT = '#ffc76a';
    const ROCK = '#8f95a4', ROCK2 = '#6d7385', BAND = '#eef5fa', HOLLOW = '#2c4372', GLOW = '#8fdcff';

    /** A great pincer: the arm from `a` by the elbow `b` to the wrist `w`, the palm along `deg` (0 = left, 90 = up), `r`
     * its size; a heavy palm with three knobs and frost on top, the fingers curving to meet, dark tips. */
    const claw = (a: P, b: P, w: P, deg: number, r: number, col: string) => {
      const an = (deg * Math.PI) / 180, u: P = [-Math.cos(an), -Math.sin(an)], n: P = [-u[1], u[0]];
      const Q = (f: number, k: number): P => [w[0] + (u[0] * f + n[0] * k) * r, w[1] + (u[1] * f + n[1] * k) * r];
      shape(c.band([a, b], r * 0.6, r * 0.54), col, { angle: 60, over: 0.2 });
      shape(c.band([b, w], r * 0.54, r * 0.5), col, { angle: 30, over: 0.2 });
      shape([Q(1.3, -0.44), Q(1.8, -0.6), Q(2.3, -0.48), Q(2.66, -0.12), Q(2.3, -0.18), Q(1.8, -0.16), Q(1.48, -0.06)], col, { angle: deg, over: 0 });
      shape([Q(1.45, 0.08), Q(1.9, 0.06), Q(2.3, 0.0), Q(2.6, -0.06), Q(2.3, 0.24), Q(1.9, 0.4), Q(1.45, 0.46)], col, { angle: deg, over: 0 });
      for (const [f, k] of [[2.5, -0.14], [2.46, -0.02]] as const) c.tint(potato(...Q(f, k), r * 0.16, r * 0.1, 7, 0.05), DARK, { wash: 0.9 });
      shape([Q(-0.1, -0.42), Q(0.4, -0.62), Q(1.0, -0.66), Q(1.46, -0.46), Q(1.66, -0.06), Q(1.58, 0.32), Q(1.2, 0.56), Q(0.6, 0.58), Q(0.0, 0.42)], col, { angle: deg + 60, over: 0.3 });
      // frost settled along its top edge
      shape([Q(0.0, -0.44), Q(0.4, -0.64), Q(1.0, -0.68), Q(1.44, -0.48), Q(1.3, -0.34), Q(1.1, -0.46), Q(0.9, -0.36), Q(0.6, -0.48), Q(0.4, -0.38), Q(0.15, -0.36)], FROST, { over: 0, wash: 0.9 }, { col: ICELINE, w: 3 });
      stroke([Q(0.2, 0.2), Q(0.8, 0.3), Q(1.3, 0.24)], { w: 4, col: DARK });
      c.shine([Q(0.35, -0.2), Q(1.0, -0.24)], 6);
    };
    /** A walking leg, three segments: the thigh out and up, a bent knee, the shin down to a sharp dark point. */
    const leg = (hip: P, knee: P, ankle: P, tip: P, col: string, w: number) => {
      shape(c.band([hip, knee], w, w * 0.84), col, { angle: 60, over: 0 });
      shape(c.band([knee, ankle], w * 0.8, w * 0.6), col, { angle: 80, over: 0 });
      const dx = tip[0] - ankle[0], dy = tip[1] - ankle[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      shape([[ankle[0] + nx * w * 0.32, ankle[1] + ny * w * 0.32], [tip[0], tip[1]], [ankle[0] - nx * w * 0.32, ankle[1] - ny * w * 0.32]], DARK, { angle: 80, over: 0 }, { w: 3.5 }, false);
    };
    /** An ice crystal: a six-sided point from `base` toward `tip`, `w` wide, one face pale ice, the other white. */
    const crystal = (base: P, tip: P, w: number, glint = false) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
      const at = (f: number, k: number): P => [base[0] + dx * f + n[0] * k * w, base[1] + dy * f + n[1] * k * w];
      shape([at(0, -0.5), at(0.72, -0.5), at(1, 0), at(0.72, 0.5), at(0, 0.5)], ICE2, { angle: 80, over: 0 }, { col: ICELINE, w: 4 }, false);
      shape([at(0, -0.5), at(0.72, -0.5), at(1, 0), at(0.72, 0.02), at(0, 0.02)], ICE, { angle: 80, over: 0, wash: 1 }, { w: 0.1 }, false);
      stroke([at(0, 0.02), at(0.72, 0.02), at(1, 0)], { w: 3, col: ICELINE }, false);
      stroke([at(0.72, -0.5), at(0.72, 0.5)], { w: 2.5, col: ICELINE }, false);
      c.shine([at(0.1, -0.28), at(0.62, -0.28)], 5);
      if (glint) shape([at(0.74, 0.04), at(0.98, 0.0), at(0.74, 0.44)], GLINT, { over: 0, wash: 1 }, { w: 0.1 }, false);
    };
    /** A four-pointed sparkle of light at (x, y), `r` its size. */
    const sparkle = (x: number, y: number, r: number, col = '#ffffff') => {
      shape([[x, y - r], [x + r * 0.2, y - r * 0.2], [x + r, y], [x + r * 0.2, y + r * 0.2], [x, y + r], [x - r * 0.2, y + r * 0.2], [x - r, y], [x - r * 0.2, y - r * 0.2]], col, { over: 0, wash: 1 }, { col: ICELINE, w: 2.5 }, false);
    };

    // the geode on its back: a big rough rind of grey stone streaked with steel, frost settled on top
    const R = 400, [cx, cy] = [660, 520];
    shape(potato(cx, cy, R, R * 0.9, 26, 0.03), ROCK, { angle: 60, over: 0.4 }, { w: 5.5 });
    const rim = (k: number, a0: number, a1: number): P[] => Array.from({ length: 11 }, (_, i): P => {
      const a = ((a0 + ((a1 - a0) * i) / 10) * Math.PI) / 180;
      return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * 0.9 * k];
    });
    c.tint([...rim(0.98, -50, 110), ...rim(0.78, 110, -50)], ROCK2, { angle: 30, wash: 0.4 });
    for (const pts of [[[880, 300], [930, 380], [940, 470]]] as P[][]) shape(c.band(pts, 26, 16), METAL, { angle: 80, over: 0 }, { w: 3.5 });
    for (const [x, y] of [[560, 220], [760, 200], [1000, 400], [1030, 560], [960, 780], [840, 840], [880, 560]] as const) c.dot(x, y, 7, 5, ROCK2);
    const top = rim(0.99, 200, 340), drip = rim(0.9, 340, 200).map(([x, y], i): P => [x, y + (i % 2 ? 26 : 0)]);
    shape([...top, ...drip], FROST, { angle: 0, over: 0, wash: 0.9 }, { col: ICELINE, w: 4 });
    c.shine([[440, 300], [520, 250]], 9);
    // its opening, where the crab comes out: a jagged crack in the rind, a pale band, a glowing hollow lined with crystals
    const [gx, gy] = [500, 610], grx = 270, gry = 280;
    const JAG = [0, 0.9, 0.3, 1.2, 0.5, 0.1, 1, 0.4, 0.8, 0.2, 1.3, 0.6, 0, 0.9, 0.5, 1.1, 0.2, 0.7, 1, 0.3, 0.8, 0.4];
    const crack = (k: number, jag: number): P[] => Array.from({ length: 22 }, (_, i): P => {
      const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.04, kk = k * (1 - jag * JAG[i]);
      return [gx + Math.cos(a) * grx * kk, gy + Math.sin(a) * gry * kk];
    });
    shape(crack(1, 0.06), BAND, { angle: 20, over: 0, wash: 1 }, { w: 5 }, false);
    shape(crack(0.88, 0.05), HOLLOW, { angle: 70, over: 0.2, press: 1.1 }, { w: 3.5 }, false);
    c.tint(potato(gx + 10, gy - 20, grx * 0.7, gry * 0.66, 12, 0.04), GLOW, { wash: 0.7 });
    // [angle, wall depth, length, width]: uneven crystals all round the rim, pointing in toward the crab
    const xtals: [number, number, number, number][] = [[250, 0.84, 0.3, 58], [276, 0.82, 0.24, 44], [226, 0.84, 0.22, 40], [302, 0.84, 0.34, 66], [200, 0.84, 0.26, 50],
      [330, 0.84, 0.3, 54], [168, 0.84, 0.34, 62], [354, 0.84, 0.36, 64], [144, 0.84, 0.22, 42], [18, 0.84, 0.32, 60], [122, 0.84, 0.28, 54], [42, 0.84, 0.26, 50],
      [96, 0.84, 0.3, 60], [68, 0.84, 0.28, 52]];
    xtals.forEach(([d, rr, len, w], i) => {
      const a = (d * Math.PI) / 180;
      crystal([gx + Math.cos(a) * grx * rr, gy + Math.sin(a) * gry * rr], [gx + Math.cos(a) * grx * (rr - len), gy + Math.sin(a) * gry * (rr - len)], w, i === 7);
    });

    // the crab, broad and armoured: legs bent and planted, a wide carapace, eyes on short stalks, pincers raised in guard
    // the far legs and far pincer first, in front of the shell but behind the body
    leg([540, 720], [690, 660], [780, 790], [810, 930], DEEP, 48);
    leg([350, 700], [230, 640], [170, 780], [150, 920], DEEP, 50);
    claw([540, 620], [680, 600], [680, 460], 98, 74, DEEP);
    const hx = 410, hy = 600;
    shape([[hx - 180, hy + 10], [hx - 160, hy - 70], [hx - 60, hy - 120], [hx + 80, hy - 120], [hx + 180, hy - 70], [hx + 200, hy + 20], [hx + 150, hy + 120], [hx, hy + 150], [hx - 140, hy + 110]], STEEL, { angle: 75, over: 0.4 });
    c.tint([[hx - 150, hy + 60], [hx - 60, hy + 120], [hx + 60, hy + 130], [hx + 150, hy + 100], [hx + 60, hy + 80], [hx - 60, hy + 80]], BELLY, { wash: 0.6 });
    stroke([[hx - 150, hy - 40], [hx - 40, hy - 70], [hx + 80, hy - 70], [hx + 170, hy - 30]], { w: 4.5, col: DARK });
    shape([[hx - 30, hy - 116], [hx + 10, hy - 150], [hx + 40, hy - 116]], STEEL, { over: 0 }, { w: 4 }, false);
    c.shine([[hx - 110, hy - 70], [hx - 30, hy - 96]], 8);
    // the near legs, on top: splayed out, bent at the knee
    leg([380, 730], [280, 710], [230, 840], [215, 960], STEEL, 54);
    leg([480, 740], [590, 716], [650, 840], [668, 960], STEEL, 54);
    // eyes on short sturdy stalks: calm and stern, looking straight at the foe
    const e1: P = [hx - 70, hy - 170], e2: P = [hx + 60, hy - 180];
    shape(c.band([[hx - 60, hy - 110], [e1[0], e1[1] + 4]], 40, 54), DEEP, { angle: 90 });
    shape(c.band([[hx + 50, hy - 110], [e2[0], e2[1] + 4]], 46, 62), STEEL, { angle: 90 });
    c.eye(e1[0], e1[1], 24, 28, '#241c38', { lid: 0.4, skin: DEEP, tilt: 14 });
    c.eye(e2[0], e2[1], 28, 32, '#241c38', { lid: 0.4, skin: STEEL, tilt: -14 });
    stroke([[hx - 60, hy + 30], [hx - 20, hy + 26], [hx + 20, hy + 32]], { w: 6 });
    c.part('paupieres', { pivot: [hx, hy - 176], motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 24, 28, DEEP);
      c.lid(e2[0], e2[1], 28, 32, STEEL);
    });
    c.part('pince', { pivot: [330, 660], motion: 'swing', amp: 2, period: 3 }, () => claw([330, 660], [190, 680], [170, 540], 86, 88, STEEL));
    // light catching the crystals beside its shoulders
    sparkle(700, 420, 26);
    sparkle(740, 640, 20);
    sparkle(560, 360, 16);
  },
} satisfies Redraw;
