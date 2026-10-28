import type { Crayon, Fair, P } from '../redraws/crayon.ts';

/**
 * Chantouffe's fair copy, Fairy/Normal, the same drawing grown up: its fluff grown into a big spiky halo
 * of fur standing on end all round it, a storm cloud of fluff with fairy twinkles on its tips, its ears half as
 * long again, the curl of fur on its head grown much bigger, its microphone bigger with a twinkle on its head, its
 * mouth wide open in a loud song, brows set, and the gold star on its side.
 */
export default {
  id: '047', slug: 'chantouffe', seed: 47047, size: [1150, 1260], tilt: 3,
  draw(c) {
    // the pencil drawing's own coordinates, lowered to make room for the longer ears
    const DY = 170;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + DY]);
    const shape: Crayon['shape'] = (pts, ...r) => c.shape(m(pts), ...r);
    const tint: Crayon['tint'] = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: Crayon['stroke'] = (pts, ...r) => c.stroke(m(pts), ...r);
    const shine: Crayon['shine'] = (pts, ...r) => c.shine(m(pts), ...r);
    const dot = (x: number, y: number, rx: number, ry = rx, col?: string) => c.dot(x, y + DY, rx, ry, col);
    const part = (name: string, def: Parameters<Crayon['part']>[1], draw: () => void) => c.part(name, { ...def, pivot: [def.pivot[0], def.pivot[1] + DY] }, draw);
    const { potato, shake } = c;
    const PINK = '#f6a8c8', HALO = '#f293bf', ROSE = '#e8789f', WHITE = '#fdf3f7', MIC = '#7fcf55', MIC_D = '#3f8f30', DARK = '#4a4458', TWINKLE = '#efe2ff';
    /** A point on its body's oval, `e` further out. */
    const at = (a: number, e: number): P => [560 + Math.cos(a) * (272 + e), 640 + Math.sin(a) * (330 + e)];
    /** Round lobes pushed out along a path (fluff). */
    const bumps = (path: P[], h: number): P[] => {
      const out: P[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const [a, b] = [path[i], path[i + 1]];
        const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
        for (const [f, up] of [[0, 0], [0.18, 0.7], [0.5, 1], [0.82, 0.7]] as P[]) {
          out.push([a[0] + (b[0] - a[0]) * f + (nx / l) * h * up, a[1] + (b[1] - a[1]) * f + (ny / l) * h * up]);
        }
      }
      return out;
    };
    /** A four-pointed fairy twinkle. */
    const twinkle = (x: number, y: number, r: number) => {
      const pts: P[] = Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 - Math.PI / 2, k = i % 2 ? 0.28 : 1;
        return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
      });
      shape(pts, TWINKLE, { over: 0, spill: 1 }, { w: 4.5 }, false);
    };
    // the far ear, half as long again, and the far foot, behind
    shape(shake([[360, 330], [112, -97], [243, -89], [420, 300]], 4), PINK, { angle: 70 });
    tint([[350, 285], [150, -50], [215, -48], [378, 270]], ROSE, { angle: 70 });
    shape(potato(420, 1010, 72, 40, 8, 0.06), PINK, { angle: 0 });
    // the halo of fur standing on end all round it, spiky tufts swept a little round, smaller under it
    const N = 15, halo: P[] = [], tips: P[] = [];
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + (i / N) * Math.PI * 2, h = Math.PI / N, low = Math.sin(a) > 0.55;
      const tip = low ? 75 : 175 + (i % 2 ? -25 : 15);
      halo.push(at(a - h, 22), at(a - h * 0.55, tip * 0.72), at(a + 0.1, tip), at(a + h * 0.3, tip * 0.8), at(a + h * 0.72, tip * 0.42));
      tips.push(at(a + 0.1, tip));
    }
    shape(halo, HALO, { angle: 60 });
    // the far arm holding up its microphone, bigger, a twinkle on its head
    part('micro', { pivot: [300, 655], motion: 'nod', amp: 7, period: 1.4 }, () => {
      shape(shake([[300, 628], [225, 600], [200, 640], [300, 685]], 3), PINK, { angle: 30 });
      shape(shake([[178, 500], [216, 500], [226, 690], [184, 692]], 2), DARK, { angle: 90, over: 0 }, { w: 5 });
      shape(potato(197, 455, 64, 66, 10, 0.03), MIC, { angle: 45, over: 0 });
      for (const k of [-32, 0, 32]) {
        stroke([[197 + k - 18, 396 + Math.abs(k) * 0.3], [197 + k + 18, 514 - Math.abs(k) * 0.3]], { w: 3.5, col: MIC_D });
        stroke([[141 + Math.abs(k) * 0.3, 455 + k], [253 - Math.abs(k) * 0.3, 455 + k]], { w: 3.5, col: MIC_D });
      }
      shine([[163, 428], [178, 406]], 6);
      twinkle(150, 404, 40);
      shape(potato(212, 628, 34, 30, 8, 0.05), PINK, { angle: 30, over: 0 });
    });
    // the tall fluffy body, turned left
    const ring: P[] = [];
    for (let a = 0; a <= Math.PI * 2 + 0.001; a += Math.PI / 11) ring.push(at(a, 0));
    shape(bumps(ring, -46), PINK, { angle: 70 });
    shape(potato(480, 775, 142, 168, 10, 0.04), WHITE, { angle: 70, over: 0 });
    c.star(735, 770 + DY, 48, 8);
    shape(potato(650, 1012, 84, 42, 8, 0.06), PINK, { angle: 0 });
    // the near ear, half as long again
    part('oreille', { pivot: [630, 320], motion: 'swing', amp: 5, period: 2.4 }, () => {
      shape(shake([[600, 300], [813, -120], [897, -59], [660, 330]], 4), PINK, { angle: 70 });
      tint([[640, 280], [818, -75], [858, -50], [655, 305]], ROSE, { angle: 70 });
    });
    // the curl of fur on top, grown much bigger
    shape(shake([[394, 330], [343, 160], [462, 58], [632, 92], [666, 211], [564, 262], [496, 194], [564, 160]], 3), WHITE, { angle: 40, over: 0 });
    // big eyes shifted left under set brows, singing loud
    shape(potato(375, 470, 46, 64, 9, 0.03), '#ffffff', { over: 0, wash: 0 }, { w: 6 });
    dot(378, 485, 18, 27);
    dot(384, 468, 6, 6, '#ffffff');
    shape(potato(540, 470, 62, 70, 9, 0.03), '#ffffff', { over: 0, wash: 0 }, { w: 6 });
    dot(545, 485, 26, 30);
    dot(554, 466, 8, 8, '#ffffff');
    stroke([[325, 398], [410, 418]], { w: 11 });
    stroke([[485, 410], [600, 385]], { w: 12 });
    shape([[318, 570], [420, 566], [410, 662], [372, 676], [332, 660]], '#5a2430', { over: 0 });
    tint([[338, 640], [400, 632], [392, 662], [350, 662]], '#e2667a');
    // fairy twinkles on the tips of its halo
    part('eclats', { pivot: [560, 640], motion: 'flicker', period: 1.8 }, () => {
      for (const i of [2, 4, 5, 11]) {
        const t = tips[i], dx = t[0] - 560, dy = t[1] - 640, l = Math.hypot(dx, dy);
        twinkle(t[0] + (dx / l) * 12, t[1] + (dy / l) * 12, 46);
      }
    });
  },
} satisfies Fair;
