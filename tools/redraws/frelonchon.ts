import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * A hot-tempered hornet (« soupe au lait »), turned to the left: it flares up at the smallest thing and dives straight at
 * you, its wings buzzing, its cheeks red with rage. Its weapon is its jaw: two big curved mandibles that snip like
 * scissors. A round yellow head with big furious eyes, a striped tail with its sting, only two little legs tucked up.
 */
export default {
  id: '048', slug: 'frelonchon', seed: 4817, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const YEL = '#f6c531', CREAM = '#fff0bc', BLACK = '#3a2f3c', JAW = '#2e2428', JAW2 = '#6a5258', WING = '#e4f2fb', RED = '#f2645a';

    // the pose: drawn level, then tipped around (520, 500)
    const deg = -32;
    const r = (deg * Math.PI) / 180, [ox, oy] = [520, 500];
    const T = ([x, y]: P): P => [ox + ((x - ox) * Math.cos(r) - (y - oy) * Math.sin(r)) * 0.92, oy + ((x - ox) * Math.sin(r) + (y - oy) * Math.cos(r)) * 0.92];
    const t = (pts: P[]) => pts.map(T);

    /** A mandible: a short solid blade from its hinge `h` to its tip `tp`, bowed by `bow`, `w` thick at the base, its
     * inner edge cut in teeth like a pair of pinking scissors. */
    const mandible = (h: P, tp: P, bow: number, w: number, col: string, side: 1 | -1) => {
      const dx = tp[0] - h[0], dy = tp[1] - h[1], l = Math.hypot(dx, dy), n: P = [(-dy / l) * side, (dx / l) * side];
      const at = (f: number, k: number): P => [h[0] + dx * f + n[0] * (k + bow * Math.sin(Math.PI * f)), h[1] + dy * f + n[1] * (k + bow * Math.sin(Math.PI * f))];
      const outer: P[] = [at(0, w / 2), at(0.35, w * 0.5), at(0.7, w * 0.34), at(1, 0)];
      const inner: P[] = [];
      for (let i = 0; i <= 6; i++) inner.push(at(0.9 - i * 0.14, (i % 2 ? -w * 0.08 : -w * 0.2) - (i / 6) * w * 0.25));
      shape([...outer, ...inner], col, { angle: 30, over: 0, press: 1.3, wash: 1 }, {}, false);
    };
    /** A grasping leg, tucked forward under the head for the strike, a hooked foot. */
    const leg = (pts: P[], col: string) => {
      const p = c.band(t(pts), 26, 16);
      openLimb(c, p, col, 1, p.length - 1);
      const [a, b] = [T(pts[pts.length - 2]), T(pts[pts.length - 1])], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      stroke([b, [b[0] + (dx / l) * 26 - (dy / l) * 14, b[1] + (dy / l) * 26 + (dx / l) * 14]], { w: 7, col });
    };

    // the far wings, buzzing behind (they beat in battle)
    c.part('ailesLoin', { pivot: T([540, 420]), motion: 'flap', amp: 14, period: 0.25, behind: true }, () => {
      shape(t([[540, 420], [620, 230], [720, 160], [790, 190], [700, 360], [580, 450]]), '#d4e6f2', { angle: 70, over: 0 });
    });
    // the striped tail with its sting
    // the sting, a little dark spike at the tip
    shape(t([[984, 548], [1060, 590], [990, 570]]), BLACK, { over: 0 }, { w: 3 }, false);
    shape(t([[640, 500], [700, 420], [820, 410], [920, 460], [990, 540], [1000, 560], [960, 572], [880, 610], [760, 620], [680, 580]]), YEL, { angle: 60, over: 0.3 });
    for (const [x0, x1] of [[740, 780], [850, 886]]) shape(t([[x0, 414], [x1, 418], [x1 + 24, 612], [x0 + 16, 618]]), BLACK, { angle: 70, over: 0 }, { w: 2 });
    shape(t([[960, 520], [1000, 556], [966, 572], [952, 548]]), BLACK, { angle: 70, over: 0 }, { w: 2 });
    c.tint(t([[700, 580], [800, 604], [900, 590], [800, 584]]), CREAM, { wash: 0.6 });
    // the thorax, one smooth dark mass, a narrow waist; its grasping legs tucked forward under the head for the strike
    leg([[470, 560], [430, 620], [370, 600]], '#2a222c');
    shape(t(c.band([[600, 500], [660, 510]], 66, 46)), BLACK, { angle: 0, over: 0, press: 1.3, wash: 1 });
    shape(t(c.potato(510, 500, 118, 104, 12, 0.02)), BLACK, { angle: 80, over: 0, press: 1.3, wash: 1 });
    c.shine(t([[450, 430], [500, 410], [550, 414]]), 6);
    leg([[500, 580], [450, 660], [380, 650]], BLACK);
    leg([[550, 590], [520, 680], [450, 690]], BLACK);
    // the near wings, see-through, two veins
    c.part('ailes', { pivot: T([520, 410]), motion: 'flap', amp: 14, period: 0.25 }, () => {
      shape(t([[520, 410], [560, 220], [660, 110], [740, 120], [690, 300], [580, 430]]), WING, { angle: 70, over: 0 });
      stroke(t([[540, 380], [600, 230], [680, 150]]), { w: 3, col: '#8fb6d0' });
      shape(t([[540, 420], [650, 330], [760, 300], [790, 340], [690, 420], [580, 450]]), WING, { angle: 20, over: 0 });
    });
    // the big round head, the far antenna and mandible first
    const [hx, hy] = T([320, 470]);
    c.part('antennes', { pivot: [hx - 40, hy - 120], motion: 'swing', amp: 6, period: 0.6 }, () => {
      stroke(t([[300, 340], [250, 230], [180, 210]]), { w: 7, col: BLACK });
      stroke(t([[380, 330], [370, 200], [300, 150]]), { w: 7, col: BLACK });
      dot(...T([180, 210]), 12, 10, BLACK);
      dot(...T([300, 150]), 12, 10, BLACK);
    });
    shape(potato(hx, hy, 170, 150, 14, 0.03), YEL, { angle: 78, over: 0.4 });
    c.tint(potato(hx - 90, hy + 70, 80, 56, 10, 0.05), CREAM, { angle: 60, wash: 0.7 });
    // a black crown mark between the eyes
    shape([[hx - 40, hy - 150], [hx + 50, hy - 146], [hx + 20, hy - 100], [hx - 20, hy - 100]], BLACK, { over: 0 }, { w: 2 });
    // furious: big eyes under brows slammed down to the middle, red cheeks of rage
    const e1: P = [hx - 80, hy - 20], e2: P = [hx + 30, hy - 30];
    c.eye(e1[0], e1[1], 40, 48, '#241c38', { lid: 0.32, skin: YEL, tilt: 22 });
    c.eye(e2[0], e2[1], 48, 56, '#241c38', { lid: 0.32, skin: YEL, tilt: -20 });
    stroke([[e1[0] - 46, e1[1] - 56], [e1[0] + 36, e1[1] - 24]], { w: 9 });
    stroke([[e2[0] - 30, e2[1] - 26], [e2[0] + 56, e2[1] - 66]], { w: 9 });
    c.cheek(hx + 110, hy + 50, 40, 24, RED);
    c.cheek(hx - 150, hy + 40, 22, 18, RED);
    // the near mandible, crossing the far one like open scissors
    c.part('mandibules', { pivot: [hx - 110, hy + 100], motion: 'swing', amp: 4, period: 0.9 }, () => {
      // two blades from the mouth, one above the other, mirror images, open like a pair of scissors
      mandible([hx - 96, hy + 64], [hx - 250, hy + 70], 28, 30, JAW2, 1);
      mandible([hx - 92, hy + 116], [hx - 250, hy + 116], 28, 30, JAW, -1);
    });
    c.part('paupieres', { pivot: [hx - 20, hy - 26], motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 40, 48, YEL);
      c.lid(e2[0], e2[1], 48, 56, YEL);
    });
    for (const [x, y, l] of [[700, 120, 120], [760, 220, 100]] as const) stroke([[x, y], [x + l * 0.85, y - l * 0.5]], { w: 5 });
  },
} satisfies Redraw;
