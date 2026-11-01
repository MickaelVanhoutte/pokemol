import type { P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';
import { AXO, drop, frame, frond, pearl } from './gouttelotl.ts';

/**
 * Flaquelotl grown into a serene storm dragon (Dragon/Flying), turned to the left, flying through the rain in one long S
 * from its smiling head down its neck and back to the finned tail curling over at the end. Its gills have grown into
 * great wings rooted all along the back of its skull and its shoulders: three giant gill plumes, their jagged fringe
 * darkening into a stormy plum like rain clouds. A dragon's head with a defined muzzle and the family's long smile, a
 * pair of small gill nubs swept back like horns, the rain pearl on its brow, small claws tucked under its chest.
 */
export default {
  id: '045', slug: 'orajolotl', seed: 4597, size: [1350, 1200], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band } = c;
    const PINK = '#f283ae', DEEP = '#d0608e', BELLY = '#fde0e6', FIN = '#f9b8d0', CLAW = '#fbf3ea';
    const FRINGE = '#ea5c98', STALK = '#a8245e', PLUM = '#5e2a62', PLUM2 = '#7a3a78';
    const lerp = (a: P, b: P, f: number): P => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

    /**
     * A wing plume: a gill grown huge, a thick stalk from `root` to `tip` bowed by `bend`, its jagged fringe on the trailing
     * side `w` wide, the fringe's outer half darkening into storm-cloud plum.
     */
    const plume = (root: P, tip: P, w: number, bend: number, k = 1, dark = false) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy), sg = bend < 0 ? -1 : 1, nx = (-dy / l) * sg, ny = (dx / l) * sg, n = 10;
      const spine: P[] = Array.from({ length: n + 1 }, (_, i) => {
        const f = i / n, b = Math.sin(Math.PI * f) * Math.abs(bend);
        return [root[0] + dx * f + nx * b, root[1] + dy * f + ny * b];
      });
      const wid = (f: number) => w * Math.sin(Math.PI * Math.min(1, 0.1 + f * 0.95)) * (0.5 + 0.5 * f);
      const at = (i: number, kk: number): P => [spine[i][0] + nx * wid(i / n) * kk, spine[i][1] + ny * wid(i / n) * kk];
      const edge = spine.map((_, i) => at(i, 1)), mid = spine.map((_, i) => at(i, 0.55));
      shape([...c.spikes(edge, 2, 16 * k * sg), ...spine.slice().reverse()], dark ? '#c84a84' : FRINGE, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 60, over: 0.3 }, { w: 4 }, false);
      // the storm in its fringe: a plum band, scalloped like clouds
      const cloud = mid.map((p, i): P => lerp(p, spine[i], 0.18 * Math.abs(Math.sin((i * Math.PI) / 2.5))));
      c.tint([...edge.map((p, i) => lerp(p, spine[i], 0.08)), ...cloud.reverse()], dark ? PLUM : PLUM2, { angle: 20, wash: 0.85 });
      for (let i = 2; i < n; i += 2) stroke([spine[i], at(i, 0.9)], { w: 2.5, col: STALK });
      shape(band(spine, 40 * k, 8), dark ? '#7e1c4a' : STALK, { angle: (Math.atan2(dy, dx) * 180) / Math.PI, over: 0 }, { w: 4 });
    };
    /** A small arm tucked under the chest from `at`, a little hand with three small claws. */
    const arm = (at: P, col: string, k: number) => {
      const [x, y] = at, elbow: P = [x + 10 * k, y + 70 * k], wrist: P = [elbow[0] - 56 * k, elbow[1] - 6 * k];
      shape(band([[x, y], elbow, wrist], 54 * k, 32 * k), col, { angle: 70, over: 0.2 });
      const [hx, hy] = [wrist[0] - 12 * k, wrist[1] + 12 * k];
      shape(c.potato(hx, hy, 22 * k, 18 * k, 8, 0.05), col, { angle: 30, over: 0 });
      for (const d of [-1, 0, 1]) {
        const bx = hx - 12 * k + d * 11 * k, by = hy + 12 * k - d * 4 * k;
        shape([[bx - 5 * k, by - 3 * k], [bx - 9 * k, by + 14 * k], [bx - 2 * k, by + 20 * k], [bx + 4 * k, by + 2 * k]], CLAW, { over: 0, wash: 1 }, { w: 3 });
      }
    };
    /** A hind leg tucked back along the flank in flight, toes trailing, three small claws. */
    const hind = (top: P, foot: P, col: string, w: number) => {
      shape(band([top, lerp(top, foot, 0.5), foot], w, w * 0.45), col, { angle: 40, over: 0.2 });
      for (const d of [-1, 0, 1]) {
        const bx = foot[0] + 8, by = foot[1] + d * 10;
        shape([[bx, by - 5], [bx + 22, by - 2], [bx + 2, by + 5]], CLAW, { over: 0, wash: 1 }, { w: 3 });
      }
    };

    // the line of action: the head high at the left, the neck curving down, the back, the tail sweeping up and curling over
    const spine: P[] = [[370, 420], [420, 500], [470, 590], [560, 670], [680, 720], [810, 740], [940, 720], [1050, 660], [1140, 570], [1190, 460], [1180, 360], [1120, 300]];
    const ws = [96, 116, 170, 200, 190, 160, 124, 92, 64, 40, 22, 8];
    const [hx, hy, hs, hr] = [270, 350, 0.82, -6];
    const { T, t } = frame(hx, hy, hs, hr);

    c.part('pluie', { pivot: [200, 900], motion: 'nod', amp: 3, period: 2.6, decor: true }, () => {
      drop(c, 120, 820, 20);
      drop(c, 300, 1040, 16);
      drop(c, 760, 1080, 16);
    });
    // the far wing, darker, rising behind the head
    c.part('aile-loin', { pivot: [430, 400], motion: 'swing', amp: 2, period: 3.2, behind: true }, () => {
      plume([450, 420], [380, 50], 120, 30, 0.85, true);
      plume([420, 370], [170, 100], 110, 30, 0.85, true);
    });
    // the tail: a tall fin along its upper side running back from the middle of the back, curling over at the tip
    c.part('queue', { pivot: [940, 720], motion: 'swing', amp: 2, period: 3, behind: true }, () => {
      const fin: P[] = [], top: P[] = [];
      for (let i = 5; i < spine.length; i++) {
        const [ax, ay] = spine[Math.max(0, i - 1)], [bx, by] = spine[Math.min(spine.length - 1, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1;
        const n: P = [(by - ay) / l, -(bx - ax) / l], h = 14 + 52 * Math.sin((Math.PI * (i - 5)) / (spine.length - 5));
        fin.push([spine[i][0] + n[0] * (ws[i] / 2 - 8), spine[i][1] + n[1] * (ws[i] / 2 - 8)]);
        top.push([spine[i][0] + n[0] * (ws[i] / 2 + h), spine[i][1] + n[1] * (ws[i] / 2 + h)]);
      }
      shape([...fin, ...top.reverse()], FIN, { angle: 60, over: 0 });
      for (let i = 1; i < 5; i++) stroke([fin[i], lerp(fin[i], top[top.length - 1 - i], 0.8)], { w: 2.5, col: '#e8a0bc' });
    });
    // the far limbs, darker, tucked
    arm([540, 680], DEEP, 0.85);
    hind([840, 770], [960, 800], DEEP, 56);
    // the far gill nub, swept back like a horn
    frond(c, T([40, -130]), T([150, -250]), 34 * hs, '#c84a84', STALK, -14, 1);
    // the long body in one line, a pale belly underneath, a darker back
    shape(lineOfAction(spine, ws, [0, 0, 20, 24, 10, 0, 0, 0, 0, 0, 0, 0]), PINK, { angle: 30, over: 0.5, press: 1.15 });
    c.tint(lineOfAction(spine.slice(0, 7).map((p, i): P => [p[0] - [34, 44, 44, 20, 0, 0, 0][i], p[1] + [14, 30, 56, 76, 74, 62, 46][i]]), [30, 36, 50, 54, 46, 34, 18]), BELLY, { angle: 20, wash: 0.75 });
    // the near limbs: a small arm tucked under the chest, the hind leg drawn back
    arm([500, 660], PINK, 1);
    hind([780, 750], [920, 790], PINK, 70);

    // the head: a cranium, a defined muzzle, the long smile
    shape(t([[-250, -10], [-236, -56], [-180, -80], [-100, -92], [-40, -128], [60, -140], [150, -104], [192, -30], [182, 50], [130, 100], [30, 120], [-80, 98], [-180, 72], [-240, 40]]), PINK, { angle: 96, over: 0.45, press: 1.1 });
    c.tint(t([[-240, 34], [-180, 64], [-80, 92], [30, 112], [60, 90], [-40, 66], [-150, 46]]), BELLY, { angle: 60, wash: 0.75 });
    stroke(t([[-180, -78], [-140, -84], [-102, -90]]), { w: 4, col: DEEP });
    pearl(c, ...T([-96, -114]), 22 * hs);
    // serene, one emotion: kind smiling eyes (the lower lids pushed up by the smile), the long closed smile curling up
    for (const [x, y, rx, ry] of [[-140, -58, 20, 24], [-36, -56, 30, 36]] as const) {
      const [ex, ey] = T([x, y]);
      shape(c.potato(ex, ey, rx * hs, ry * hs, 10, 0.03), AXO.EYE, { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(ex - rx * hs * 0.3, ey - ry * hs * 0.4, rx * hs * 0.26, ry * hs * 0.2, '#ffffff');
      shape(t([[x - rx * 1.25, y + ry * 0.62], [x - rx * 0.6, y + ry * 0.36], [x, y + ry * 0.26], [x + rx * 0.6, y + ry * 0.36], [x + rx * 1.25, y + ry * 0.62], [x + rx * 1.2, y + ry * 1.3], [x - rx * 1.2, y + ry * 1.3]]), PINK, { over: 0, spill: 0, wash: 1 }, { w: 0.1 });
      stroke(t([[x - rx * 1.05, y + ry * 0.56], [x - rx * 0.5, y + ry * 0.32], [x + rx * 0.5, y + ry * 0.32], [x + rx * 1.05, y + ry * 0.56]]), { w: 5 });
    }
    stroke(t([[-242, 22], [-180, 46], [-100, 58], [-20, 46], [10, 20]]), { w: 5.5 });
    c.cheek(...T([40, 30]), 30 * hs, 17 * hs, '#e8508a');
    dot(...T([-228, -26]), 6, 4);
    // the near gill nub, a small horn swept back
    frond(c, T([90, -112]), T([230, -200]), 38 * hs, FRINGE, STALK, -16, 1);

    // the near wing, rooted all along the back of the skull and the shoulder
    c.part('aile', { pivot: [470, 430], motion: 'swing', amp: 2, period: 3.2 }, () => {
      // the fleshy root running from the skull into the shoulder
      shape(band([[410, 350], [460, 420], [530, 510]], 80, 76), PINK, { angle: 40, over: 0.3 }, { w: 0.1 });
      plume([530, 510], [1060, 250], 150, 40);
      plume([462, 424], [880, 50], 160, 40);
      plume([416, 360], [600, 40], 130, 34);
    });
    c.part('paupieres', { pivot: T([-80, -56]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-140, -58]), 20 * hs, 24 * hs, PINK);
      c.lid(...T([-36, -56]), 30 * hs, 36 * hs, PINK);
    });
  },
} satisfies Redraw;
