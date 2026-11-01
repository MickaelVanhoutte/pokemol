import type { P, Redraw } from './crayon.ts';

/**
 * A proud, theatrical peacock (« fier et théâtral »), turned to the left: it fans its train out behind it like a rainbow
 * and every feather opens a big shiny eye that stares at its foe (that is how it hypnotises). A violet body, the chest
 * puffed out, the head held high on a curved neck, three crest feathers, looking down its beak.
 */
export default {
  id: '014', slug: 'hypnopaon', seed: 1414, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const VIO = '#6b4fc8', VIOD = '#4e3698', CHEST = '#d9ccf6', BEAK = '#f6c93a', LEGC = '#8a7aa8', PINK = '#f29ab0';
    const RAINBOW = ['#ef5350', '#f7a030', '#f6d23a', '#5cc04c', '#4a9ae6', '#9a6ad8'];
    const GOLD = '#f6c93a', IRIS = '#2bb3b0', PUPIL = '#241c38';

    /** A train feather from `base` to its tip at angle `a` (radians), `len` long, `w` wide: an eye-spot near its tip. */
    const feather = (base: P, a: number, len: number, w: number, col: string) => {
      const u: P = [Math.cos(a), Math.sin(a)], n: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [base[0] + u[0] * f * len + n[0] * k * w, base[1] + u[1] * f * len + n[1] * k * w];
      shape([at(0, -0.08), at(0.35, -0.3), at(0.7, -0.5), at(0.9, -0.42), at(1, -0.16), at(1.02, 0), at(1, 0.16), at(0.9, 0.42), at(0.7, 0.5), at(0.35, 0.3), at(0, 0.08)], col, { angle: (a * 180) / Math.PI, over: 0.3 });
      stroke([at(0.05, 0), at(0.5, 0)], { w: 3 });
      return at(0.78, 0);
    };
    /** A hypnotic eye-spot at (x, y): a gold ring, a teal iris, a big shiny pupil. */
    const spot = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r * 1.1, 10, 0.03), GOLD, { angle: 60, over: 0 }, { w: 4 });
      shape(potato(x, y + r * 0.04, r * 0.72, r * 0.8, 10, 0.03), IRIS, { angle: 60, over: 0 }, { w: 3 });
      c.eye(x, y + r * 0.06, r * 0.42, r * 0.48, PUPIL);
    };

    // the train fanned out behind like a rainbow, six feathers, six eyes
    const piv: P = [570, 750], spots: P[] = [];
    RAINBOW.forEach((col, i) => {
      const a = ((-170 + i * 32) * Math.PI) / 180, len = Math.hypot(Math.cos(a) * 380, Math.sin(a) * 560);
      spots.push(feather(piv, a, len, 250, col));
    });
    c.part('roue', { pivot: piv, motion: 'swing', amp: 1.5, period: 3, behind: true }, () => {
      spots.forEach(([x, y]) => spot(x, y, 54));
    });
    // legs, planted, bent back at the heel
    for (const [x0, k, x1] of [[560, 600, 580], [480, 500, 450]] as const) {
      shape(band([[x0, 780], [k, 860], [x1, 930]], 24, 16), LEGC, { angle: 90, over: 0 }, { w: 4 });
      for (const d of [-40, -4, 28]) stroke([[x1, 930], [x1 + d, 952]], { w: 9, col: LEGC });
    }
    // the body, the chest puffed out, a folded wing on its side
    shape([[350, 640], [380, 570], [440, 536], [530, 540], [610, 590], [640, 680], [610, 760], [520, 800], [420, 784], [362, 720]], VIO, { angle: 70, over: 0.4 });
    c.tint([[358, 640], [384, 580], [420, 566], [436, 650], [424, 770], [384, 730]], CHEST, { wash: 0.75 });
    shape([[500, 620], [570, 620], [624, 680], [616, 740], [560, 756], [510, 700]], VIOD, { angle: 40, over: 0.2 });
    // the curved neck and the small head held high, stretched out in front of its train
    const hx = 250, hy = 280;
    // a graceful S of a neck, wide where it grows from the chest, slim under the head (no line where it joins the body)
    const neck = band([[440, 640], [386, 580], [372, 510], [392, 450], [372, 390], [hx + 34, hy + 44]], 170, 50), m = neck.length / 2;
    shape(neck, VIO, { angle: 80, over: 0.3 }, { w: 0.1 });
    stroke(neck.slice(1, m), { w: 5 });
    stroke(neck.slice(m, -1), { w: 5 });
    c.tint(band([[400, 640], [356, 580], [346, 510], [362, 452], [340, 396]], 50, 20), CHEST, { wash: 0.7 });
    // its crest: three feathers, each ending in a small hypnotic eye
    c.part('huppe', { pivot: [hx, hy - 56], motion: 'swing', amp: 3, period: 2.4 }, () => {
      for (const [x, y] of [[hx - 44, hy - 160], [hx + 6, hy - 182], [hx + 58, hy - 156]] as const) {
        stroke([[hx + 2, hy - 54], [x, y + 14]], { w: 6, col: VIOD });
        spot(x, y, 22);
      }
    });
    shape(potato(hx, hy, 76, 66, 11, 0.03), VIO, { angle: 80, over: 0.3 });
    // the beak, short, gold, closed
    shape([[hx - 68, hy - 10], [hx - 130, hy + 16], [hx - 66, hy + 28]], BEAK, { over: 0 }, { w: 4 }, false);
    // proud and theatrical: its own eye the same hypnotic eye as its train's, a firm brow, a pink cheek
    spot(hx - 18, hy - 6, 28);
    stroke([[hx - 54, hy - 50], [hx + 14, hy - 46]], { w: 7 });
    c.cheek(hx + 36, hy + 28, 20, 12, PINK);
    c.part('paupieres', { pivot: [hx - 18, hy - 6], motion: 'blink', extra: true }, () => c.lid(hx - 18, hy - 6, 30, 33, VIO));
  },
} satisfies Redraw;
