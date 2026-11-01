import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * Clapotin grown into a daredevil (its shell already hardening into stone, a little stone ridge on its snout: the prow
 * of Tortorock to come), surfing a curling wave far too fast, turned to the left: eyes wide open, eyebrows
 * up, a wide yell of joy, a flipper flung up for balance and the other kicked up behind, sweat flying: its domed shell has become a drum, a small taut drumhead on
 * top inside a darker rim, the red cord laced in zig-zags round its side with little knots, a trace of Clapotin's checks below.
 * Long pointed sea-turtle flippers, a dark tail stub ends in a little fan. The family's blue skin, brown shell, yellow belly.
 */
export default {
  id: '022', slug: 'clapoflot', seed: 2287, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#4a86e0', DEEP = '#3a6ec8', SHELL = '#a8672e', RIM = '#7a4520';
    const PLASTRON = '#f6d86a', WAVE = '#7ab8f0', FOAM = '#eaf6ff', PINK = '#f28aa8', RED = '#9a2f4a';
    // the surfer, tipped onto its nose down the wave's face, its rear lifting off: drawn round (540, 600), turned 36 degrees
    const r = (-36 * Math.PI) / 180, [ox, oy] = [540, 600];
    const T = ([x, y]: P): P => [ox + (x - ox) * Math.cos(r) - (y - oy) * Math.sin(r), oy - 14 + (x - ox) * Math.sin(r) + (y - oy) * Math.cos(r)];
    const t = (pts: P[]) => pts.map(T);
    /**
     * A sea turtle's flipper (on the page): a long blade from `root` to a pointed `tip`, `w` wide at its widest, its
     * front edge (side `lead`, 1 or -1) bulging, its back edge almost straight, a crease along it.
     */
    const blade = (root: P, tip: P, col: string, w: number, lead: 1 | -1, near = true) => {
      const [rx, ry] = root, dx = tip[0] - rx, dy = tip[1] - ry, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const at = (f: number, k: number): P => [rx + dx * f + nx * k * lead, ry + dy * f + ny * k * lead];
      const pts: P[] = [at(0, w * 0.3), at(0.25, w * 0.6), at(0.55, w * 0.5), at(0.85, w * 0.22), at(1, 0), at(0.8, -w * 0.1), at(0.5, -w * 0.28), at(0.2, -w * 0.36), at(0, -w * 0.3)];
      if (near) {
        openLimb(c, pts, col, 1, 8);
        stroke([at(0.12, w * 0.12), at(0.5, w * 0.14), at(0.82, w * 0.06)], { w: 3.5, col: '#2f5aa8' });
      } else shape(pts, col, { angle: 60, over: 0.3 });
    };
    // the curling wave: its face under the surfer, its lip hooking over behind the tail, foam on the lip (it rolls)
    c.part('vague', { pivot: [700, 800], motion: 'swing', amp: 2, period: 2.2, behind: true, decor: true }, () => {
      const wave: P[] = [[20, 960], [60, 900], [300, 830], [600, 676], [800, 584], [892, 440], [860, 330], [790, 320], [740, 360], [780, 280], [890, 260], [980, 340], [1000, 520], [990, 960]];
      shape(wave, WAVE, { angle: 20, over: 0.3 });
      stroke([[750, 350], [790, 300], [890, 270], [970, 340], [995, 460]], { w: 12, col: FOAM });
      for (const [x, y, rr] of [[750, 390, 14], [715, 430, 10], [770, 440, 8]] as const) shape(potato(x, y, rr, rr, 7, 0.05), FOAM, { over: 0 }, { w: 2.5 });
      for (const [x, y] of [[260, 920], [500, 880], [720, 760]] as const) stroke([[x - 40, y], [x, y - 14], [x + 40, y]], { w: 5, col: FOAM });
    });
    // the far rear flipper, just peeking out
    blade(T([740, 660]), [880, 620], DEEP, 40, 1, false);
    // a short dark tail stub low at the back, by the belly plate, a little fin on it
    shape(t(band([[790, 664], [836, 670], [862, 668]], 36, 24)), DEEP, { angle: 30 });
    shape(t([[856, 664], [884, 630], [906, 646], [902, 676], [880, 690]]), '#2a4f96', { angle: 40, over: 0 }, { w: 4.5 });
    // the shell: its side, a darker rim, the pale drumhead on top
    shape(t([[326, 655], [340, 540], [420, 450], [560, 410], [700, 440], [785, 540], [796, 655]]), SHELL, { angle: 80, over: 0.4 });
    for (const x of [420, 520, 620, 720]) stroke(t([[x, 620], [x - 4, 655]]), { w: 3.5, col: '#c48a50' });
    stroke(t([[330, 625], [560, 630], [796, 625]]), { w: 5, col: RIM });
    // the drum's hoop round the upper shell, the pale drumhead's edge showing above it, a shine
    const hoop = (x: number) => 478 + ((x - 560) / 216) ** 2 * 80;
    const arc: P[] = [];
    for (let x = 344; x <= 776; x += 36) arc.push([x, hoop(x)]);
    stroke(t(arc.map(([x, y]): P => [x, y - 15])), { w: 9, col: '#f8eed6' }, false);
    stroke(t(arc), { w: 20, col: RIM }, false);
    c.shine(t([[450, 450], [530, 434]]), 7);
    // its shell starting to harden into stone: a few rock slabs pushing through, a crack (Tortorock's shell to come)
    for (const slab of [[[430, 520], [500, 488], [548, 520], [530, 566], [452, 572]], [[580, 500], [650, 486], [700, 520], [672, 566], [596, 556]], [[700, 560], [756, 548], [772, 600], [716, 610]]] as P[][]) {
      shape(t(slab), '#a8907a', { angle: 50, over: 0.3 }, { w: 4.5, col: '#2e2420' }, false);
      stroke(t([slab[0], slab[1], slab[2]]).map(([x, y]): P => [x, y + 7]), { w: 5, col: '#e8e2d4' }, false);
    }
    stroke(t([[612, 600], [600, 624], [616, 646]]), { w: 3, col: '#2e2420' }, false);
    // its belly plate is its surfboard: longer than the shell, a pointed nose, a sharp edge
    shape(t([[236, 680], [326, 655], [796, 655], [850, 676], [800, 704], [340, 704]]), PLASTRON, { angle: 0, over: 0 }, {}, false);
    stroke(t([[262, 684], [560, 690], [830, 682]]), { w: 4, col: '#d8a83a' }, false);
    // the rear flipper kicked up behind as it wobbles
    blade(T([752, 676]), [960, 420], BLUE, 54, 1);
    // speed lines streaming off its back: it's going far too fast
    for (const [x, y, l] of [[690, 300, 120], [740, 340, 90]] as const) stroke([[x, y], [x + l * 0.81, y - l * 0.59]], { w: 5 });
    // the neck arched up out of the front of the shell, the chin raised
    shape(band([T([380, 610]), [300, 640], [214, 600]], 120, 112), BLUE, { angle: 60, over: 0.3 });

    const [hx, hy]: P = [196, 590];
    shape(potato(hx, hy, 145, 129, 14, 0.03), BLUE, { angle: 80, over: 0.4 });
    // the start of a prow: a little ridge of stone along its snout, from brow to nose
    shape([[hx - 98, hy - 98], [hx - 140, hy - 62], [hx - 166, hy - 14], [hx - 156, hy + 12], [hx - 132, hy - 18], [hx - 108, hy - 62], [hx - 82, hy - 88]], '#7e6a58', { angle: 70, over: 0.2 }, { w: 4.5 }, false);
    stroke([[hx - 102, hy - 90], [hx - 142, hy - 54], [hx - 162, hy - 10]], { w: 5, col: '#e8e2d4' }, false);
    // daredevil, one emotion: glee. Big shining eyes, brows set down toward the snout (determined), a wide grin under the nostril,
    // the tongue flapping in the wind
    for (const [x, y, rx, ry] of [[hx - 62, hy - 30, 36, 46], [hx + 36, hy - 38, 42, 52]] as const) {
      c.eye(x, y, rx, ry, '#241c38');
      stroke([[x - rx, y - ry - 2], [x, y - ry - 14], [x + rx, y - ry - 26]], { w: 7 });
    }
    c.cheek(hx + 96, hy + 26, 28, 16, PINK);
    shape([[hx - 112, hy + 32], [hx - 40, hy + 46], [hx + 34, hy + 36], [hx + 22, hy + 82], [hx - 30, hy + 104], [hx - 92, hy + 80]], RED, { over: 0 }, { w: 4 });
    shape([[hx + 14, hy + 56], [hx + 66, hy + 62], [hx + 118, hy + 46], [hx + 96, hy + 76], [hx + 40, hy + 84]], PINK, { over: 0 }, { w: 3.5 });
    dot(hx - 128, hy - 8, 6, 5);
    // the near front flipper thrown back up over the shell, like a surfer's back arm
    blade([420, 646], [600, 440], BLUE, 64, 1);
    c.part('paupieres', { pivot: [hx - 4, hy - 34], motion: 'blink', extra: true }, () => {
      c.lid(hx - 62, hy - 30, 36, 46, BLUE);
      c.lid(hx + 36, hy - 38, 42, 52, BLUE);
    });
  },
} satisfies Redraw;
