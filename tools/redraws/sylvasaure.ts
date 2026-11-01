import type { P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';

/**
 * Brontopousse grown into the calm giant guardian of the forest (Grass/Dragon), turned to the left: a long-necked dinosaur
 * on four sturdy legs, its neck reaching forward and up in a long curve from high shoulders, the small head tipped down to
 * look calmly at its foe. Its back has grown into a little wood: a cap of moss along the spine from shoulders to hips,
 * three trees of different heights rooted in it (the tallest over the shoulders), their crowns one leafy mass. Brontopousse's
 * sprout still grows on its head, between a pair of swept-back violet horns, and a row of violet points runs down its tail.
 */
// the line of action: from the lowered head up the neck, over the high shoulders, down the back to the tail tip
const SPINE: P[] = [[500, 600], [630, 540], [780, 546], [910, 600], [1010, 668], [1096, 724], [1170, 762], [1226, 780], [1262, 780]];
const WIDTHS = [270, 300, 296, 250, 170, 112, 70, 38, 16];

export default {
  id: '124', slug: 'sylvasaure', seed: 12401, size: [1300, 1100], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const GREEN = '#4f9e3c', DEEP = '#2c6428', SHADE = '#357a2c', BELLY = '#e8f2c6', MOSS = '#22501e', LEAF = '#8ccf3a', VEIN = '#4a7a1e';
    const CANOPY = '#8ccf3a', LIGHT = '#d2ee78', BARK = '#5a3622', VIOLET = '#6a34e0', DUSK = '#4a24a8', NAVY = '#241c38';
    /** Points `k` (0 = spine, 1 = edge) of the way from a path to one of its sides (`side` 1 the band's first side). */
    const side = (path: P[], w0: number, w1: number, k: number, sgn: 1 | -1, down: number[] = []): P[] => path.map((p, i) => {
      const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1;
      const w = ((w0 + ((w1 - w0) * i) / Math.max(1, path.length - 1)) / 2) * k + (sgn < 0 ? (down[i] ?? 0) * k : 0);
      return [p[0] - sgn * (dy / l) * w, p[1] + sgn * (dx / l) * w];
    });

    const body = lineOfAction(SPINE, WIDTHS, [20, 50, 50, 20, 0, 0, 0, 0, 0]);
    const n = SPINE.length;
    /** A point on the back line at `f` (a fractional spine index), and the outward normal there. */
    const back = (f: number): { p: P; nrm: P } => {
      const i = Math.min(n - 2, Math.floor(f)), t = f - i, [a, b] = [body[i], body[i + 1]];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return { p: [a[0] + dx * t, a[1] + dy * t], nrm: [dy / l, -dx / l] };
    };
    const at = (f: number, k: number): P => {
      const { p, nrm } = back(f);
      return [p[0] + nrm[0] * k, p[1] + nrm[1] * k];
    };
    /** A rounded elephant pad of a foot, no toes. */
    const pad = (x: number, y: number, w: number, col: string) => {
      shape([[x - w, y + 18], [x - w * 1.02, y - 8], [x - w * 0.7, y - 28], [x, y - 32], [x + w * 0.7, y - 28], [x + w * 1.02, y - 8], [x + w, y + 18], [x, y + 26]], col, { angle: 10 });
    };
    /** Ellipses (x, y, rx, ry) filled as one mass, its outline only where no other ellipse covers it. */
    const mass = (lobes: [number, number, number, number][], col: string) => {
      const ring = ([x, y, rx, ry]: [number, number, number, number], k = 1) =>
        Array.from({ length: 24 }, (_, i): P => [x + Math.cos((i / 24) * Math.PI * 2) * rx * k, y + Math.sin((i / 24) * Math.PI * 2) * ry * k]);
      const inside = ([px, py]: P, [x, y, rx, ry]: [number, number, number, number]) => ((px - x) / rx) ** 2 + ((py - y) / ry) ** 2 < 0.96;
      for (const e of lobes) shape(ring(e), col, { angle: 60, over: 0.4 }, { w: 0.1 });
      for (const e of lobes) {
        const pts = ring(e), out = pts.map((p) => !lobes.some((o) => o !== e && inside(p, o)));
        let k0 = out.findIndex((o) => !o);
        if (k0 < 0) { stroke([...pts, pts[0]], { w: 5 }); continue; }
        let run: P[] = [];
        for (let s = 1; s <= pts.length; s++) {
          const k = (k0 + s) % pts.length;
          if (out[k]) run.push(pts[k]);
          else { if (run.length > 1) stroke(run, { w: 5 }); run = []; }
        }
        if (run.length > 1) stroke(run, { w: 5 });
        k0 = 0;
      }
      for (const [x, y, rx, ry] of lobes.filter((e) => e[2] > 90)) c.tint(potato(x - rx * 0.3, y - ry * 0.34, rx * 0.36, ry * 0.2, 8, 0.1), LIGHT, { wash: 0.8 });
    };

    // the far legs, darker, further back and half hidden
    shape(band([[660, 700], [676, 850], [672, 960]], 104, 92), DEEP, { angle: 80 });
    pad(668, 984, 64, DEEP);
    shape(band([[1010, 700], [1030, 850], [1034, 960]], 108, 94), DEEP, { angle: 80 });
    pad(1032, 984, 64, DEEP);
    // the body and the tail in one outline, a pale belly
    shape(body, GREEN, { angle: 20, over: 0.4 });
    // darker along the back, a pale belly underneath
    const upper = SPINE.slice(3, 8);
    c.tint([...side(upper, WIDTHS[3], WIDTHS[7], 0.98, 1), ...side(upper, WIDTHS[3], WIDTHS[7], 0.5, 1).reverse()], SHADE, { angle: 20, wash: 0.55 });
    const lower = SPINE.slice(0, 6), dn = [20, 50, 50, 20, 0, 0];
    c.tint([...side(lower, WIDTHS[0], WIDTHS[5], 0.55, -1, dn), ...side(lower, WIDTHS[0], WIDTHS[5], 0.92, -1, dn).reverse()], BELLY, { angle: 10, wash: 0.8 });
    // a row of violet points down the tail
    for (const [f, hgt] of [[4.6, 46], [5.3, 38], [6.0, 30], [6.6, 22]]) {
      const { p, nrm } = back(f), tng: P = [-nrm[1], nrm[0]];
      shape([[p[0] - tng[0] * hgt * 0.6 - nrm[0] * 8, p[1] - tng[1] * hgt * 0.6 - nrm[1] * 8], [p[0] + nrm[0] * hgt + tng[0] * hgt * 0.3, p[1] + nrm[1] * hgt + tng[1] * hgt * 0.3],
        [p[0] + tng[0] * hgt * 0.6 - nrm[0] * 8, p[1] + tng[1] * hgt * 0.6 - nrm[1] * 8]], VIOLET, { angle: 30, over: 0 }, { w: 4 }, false);
    }
    // the moss cap along the spine from the shoulders to the hips: the back itself growing into the wood
    const top: P[] = [], low: P[] = [];
    for (let f = 0.5; f <= 3.6; f += 0.1) {
      top.push(at(f, 6));
      low.push(at(f, -58 - 18 * Math.sin(f * 7.5)));
    }
    shape([...top, ...low.reverse()], MOSS, { angle: 30, over: 0.5, press: 1.3, wash: 0.7 }, { w: 3.5 });
    // roots running from each trunk down over the moss onto the flanks
    const trees: [number, number, number][] = [[1.0, 210, 1.1], [2.15, 160, 0.9], [3.05, 110, 0.72]];
    for (const [f, , k] of trees) {
      const [x, y] = at(f, -6);
      for (const d of [-1, -0.3, 0.5, 1]) stroke([[x + d * 12, y - 4], [x + d * 34 * k, y + 44 * k], [x + d * 60 * k, y + 96 * k]], { w: 9 * k, col: BARK });
    }
    // the trees and their crowns, one leafy mass, the tallest over the shoulders (it sways a little in battle)
    c.part('bosquet', { pivot: at(2.0, 0), motion: 'swing', amp: 1.2, period: 3.4 }, () => {
      for (const [f, hgt, k] of trees) {
        const [x, y] = at(f, -10);
        shape(band([[x, y + 10], [x - 4, y - hgt * 0.4], [x - 8, y - hgt * 0.6]], 40 * k, 28 * k), BARK, { angle: 90, over: 0 });
      }
      const lobes: [number, number, number, number][] = [];
      for (const [f, hgt, k] of trees) {
        const [x, y] = at(f, -10), cy = y - hgt * 0.8;
        lobes.push([x - 8, cy, 112 * k, 86 * k], [x - 96 * k, cy + 44 * k, 64 * k, 50 * k], [x + 84 * k, cy + 36 * k, 70 * k, 52 * k], [x + 6, cy - 64 * k, 66 * k, 52 * k]);
      }
      mass(lobes, CANOPY);
    });
    // the near hind leg: a big round thigh on the flank, the knee a little bent, a sturdy column down to the pad
    openLimb(c, [[1016, 590], [846, 590], [790, 690], [800, 790], [846, 846], [836, 906], [838, 962], [952, 962], [954, 890], [940, 846], [986, 770], [1020, 690]], GREEN, 1, 11);
    stroke([[860, 850], [900, 862], [930, 850]], { w: 4 });
    pad(894, 984, 84, GREEN);
    // the neck from the high shoulders, thick at the base, reaching forward and up in a long curve to the head
    const neck = band([[540, 620], [452, 470], [350, 360], [258, 306]], 250, 100);
    shape(neck, GREEN, { angle: 70, over: 0.3 }, { w: 0.1 });
    stroke(neck.slice(1, 4), { w: 5 });
    stroke(neck.slice(4, 8), { w: 5 });
    const npath: P[] = [[540, 620], [452, 470], [350, 360], [258, 306]];
    c.tint([...side(npath, 250, 100, 0.4, -1), ...side(npath, 250, 100, 0.92, -1).reverse()], BELLY, { angle: 60, wash: 0.8 });
    // its one gesture: the near front leg raised in a slow, heavy warning step toward the foe (« n'approche pas »), out of a
    // big rounded shoulder, the elbow forward, the forearm hanging, the broad sole hovering over the ground
    c.part('patte', { pivot: [570, 620], motion: 'nod', amp: 3, period: 3.2 }, () => {
      openLimb(c, [[660, 556], [520, 548], [450, 610], [404, 700], [368, 780], [356, 852], [454, 864], [466, 800], [520, 740], [610, 722], [664, 650]], GREEN, 1, 10);
      stroke([[380, 770], [420, 780], [452, 770]], { w: 4 });
      shape(potato(404, 878, 78, 30, 10, 0.04), GREEN, { angle: 10 });
      c.tint(potato(404, 888, 60, 16, 8, 0.05), BELLY, { wash: 0.8 });
    });

    // the small dinosaur head, tipped down at its foe
    const [hx, hy, s, rot] = [222, 314, 0.82, -20], r = (rot * Math.PI) / 180;
    const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
    const h = (pts: P[]) => pts.map(H);
    // the far horn, darker, behind the skull
    shape(h([[40, -70], [160, -110], [270, -112], [170, -72], [90, -40]]), DUSK, { angle: 30, over: 0 }, { w: 4 });
    // Brontopousse's sprout, grown a little, still on its head (it sways in battle)
    c.part('pousse', { pivot: H([-10, -84]), motion: 'swing', amp: 3, period: 3, behind: true }, () => {
      const tip = H([-30, -190]);
      shape(band([H([-6, -70]), H([-18, -140]), tip], 16, 9), LEAF, { angle: 80 });
      for (const [deg, len] of [[-80, 90], [40, 80]] as [number, number][]) {
        const a = ((deg + rot) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
        const L = (px: number, py: number): P => [tip[0] + (v[0] * px + u[0] * py) * len / 100, tip[1] + (v[1] * px + u[1] * py) * len / 100];
        shape([L(0, -6), L(-30, 30), L(-24, 70), L(0, 100), L(24, 66), L(28, 28)], LEAF, { angle: deg + 90, over: 0 });
        stroke([L(0, 4), L(0, 80)], { w: 3, col: VEIN });
      }
    });
    // a rounded skull, a long blunt muzzle
    shape(h([[-212, 14], [-206, -24], [-168, -50], [-90, -64], [-20, -90], [60, -86], [118, -46], [132, 10], [104, 58], [30, 80], [-70, 72], [-160, 54], [-206, 38]]), GREEN, { angle: 70 + rot, over: 0.4 });
    c.tint(h([[-204, 30], [-160, 50], [-70, 64], [20, 72], [-40, 50], [-150, 36]]), BELLY, { angle: 60, wash: 0.75 });
    // the near horn, swept back from the skull
    shape(h([[10, -78], [140, -100], [260, -92], [150, -58], [70, -40]]), VIOLET, { angle: 30, over: 0 }, { w: 4 });
    // calm: a relaxed, slightly lowered lid, the pupil low on its foe, a level brow, a long soft closed smile
    const [ex, ey] = H([-40, -22]), rx = 30 * s, ry = 34 * s;
    shape(potato(ex, ey, rx, ry, 10, 0.03), '#fffaf0', { over: 0, wash: 1 }, { w: 3.5 });
    dot(ex - rx * 0.24, ey + ry * 0.3, rx * 0.64, ry * 0.58, NAVY);
    dot(ex - rx * 0.46, ey + ry * 0.12, rx * 0.2, ry * 0.16, '#ffffff');
    const lidY = ey - ry * 0.32;
    c.tint([[ex - rx * 1.15, ey - ry * 1.2], [ex + rx * 1.15, ey - ry * 1.2], [ex + rx * 1.15, lidY - 4], [ex, lidY + 2], [ex - rx * 1.15, lidY + 4]], GREEN, { wash: 1 });
    stroke([[ex - rx * 1.05, lidY + 4], [ex, lidY + 2], [ex + rx * 1.05, lidY - 4]], { w: 5 });
    stroke(h([[-86, -54], [-40, -70], [6, -72]]), { w: 8 });
    dot(...H([-198, -8]), 6 * s, 5 * s);
    stroke(h([[-206, 34], [-150, 44], [-90, 44], [-56, 34], [-44, 22]]), { w: 5 });
    c.part('paupieres', { pivot: [ex, ey], motion: 'blink', extra: true }, () => c.lid(ex, ey, rx, ry, GREEN));
  },
} satisfies Redraw;
