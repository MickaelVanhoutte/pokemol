import type { P, Redraw } from './crayon.ts';

/**
 * Chenillou shut in its pupa (« patient »), turned to the left: a tall hard emerald shell standing on its curled tail, one
 * eye peeking out of a slit, waiting. Under the shell you can already see what it is becoming: the bud of a horn moulded
 * into the shell above its brow and a wing bud pressed along its side, a glint of rainbow at its edge.
 */
export default {
  id: '015', slug: 'coquattend', seed: 1516, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato, tint } = c;
    const BELLY = '#f6f0d2', EM = '#1f9e62', EMD = '#14724a', EML = '#3dbb7c', SHEEN = '#5cc6e6';
    const PRISM = ['#f58ab8', '#f7d84a', '#6fd6e8'], PINK = '#f28aa6';

    /** A wing bud along `spine` (root to tip), `w` wide: a raised pad, a rainbow glint along its outer edge. */
    const bud = (pts: P[], edge: P[]) => {
      shape(pts, EML, { angle: 60, over: 0.2 });
      edge.slice(0, -1).forEach((p, i) => stroke([p, edge[i + 1]], { w: 16, col: PRISM[i % 3] }));
      c.shine(edge.map(([x, y]): P => [x - 14, y]), 5);
    };

    /** The hard tail curled under and forward in rolls, from the body down to its tip, each `[x, y, r]`. */
    const tail = (segs: [number, number, number][]) => {
      for (const [x, y, r] of segs) {
        shape(potato(x, y, r, r * 0.9, 11, 0.03), EM, { angle: 70, over: 0.3 });
        const cap: P[] = [];
        for (let k = -4; k <= 4; k++) cap.push([x + Math.cos(-2.4 + k * 0.28) * r * 0.95, y + Math.sin(-2.4 + k * 0.28) * r * 0.86]);
        tint([...cap, [x - r * 0.15, y - r * 0.15]], BELLY, { wash: 0.8 });
      }
    };
    /** A little leg folded flat across its chest, from `root` to `foot`. */
    const folded = (root: P, knee: P, foot: P) => {
      shape(c.band([root, knee, foot], 40, 28), EMD, { angle: 30, over: 0 }, { w: 4 });
    };

    // the far wing bud, behind
    shape([[600, 330], [700, 400], [740, 560], [700, 720], [640, 650], [600, 480]], EMD, { angle: 60, over: 0.2 });
    tail([[600, 740, 120], [570, 860, 100], [460, 900, 80], [370, 870, 60], [330, 800, 44]]);
    // the hard body, a big rounded head and chest in one, the horn's bud moulded into the shell above its brow
    shape([[260, 420], [266, 330], [294, 262], [318, 206], [342, 164], [372, 186], [410, 206], [470, 178], [580, 200], [660, 300], [680, 460], [650, 620], [580, 760], [470, 780], [380, 720], [300, 600]], EM, { angle: 76, over: 0.45 });
    tint([[300, 300], [322, 222], [342, 178], [362, 200], [350, 264], [330, 320]], EMD, { wash: 0.6 });
    stroke([[290, 336], [318, 250], [342, 176]], { w: 5, col: EMD });
    c.shine([[356, 206], [380, 214]], 6);
    tint([[580, 220], [650, 320], [670, 450], [630, 400], [590, 300]], SHEEN, { angle: 50, wash: 0.5 });
    c.shine([[420, 214], [480, 196], [540, 204]], 9);
    // the near wing bud pressed along its side, a rainbow glint at its edge
    bud([[540, 330], [620, 380], [670, 500], [650, 680], [590, 760], [540, 660], [520, 480]], [[624, 392], [664, 510], [648, 660]]);
    // patient: the far eye shut, the near one open and calm, peeking at you; a small closed mouth
    stroke([[290, 380], [318, 394], [344, 384]], { w: 8 });
    c.eye(420, 372, 34, 40, '#241c38');
    c.cheek(470, 440, 30, 16, PINK);
    stroke([[320, 470], [356, 476]], { w: 6 });
    // its little legs folded across its chest like crossed arms
    folded([470, 560], [400, 600], [320, 570]);
    folded([450, 620], [380, 560], [300, 600]);
    c.part('paupiere', { pivot: [420, 370], motion: 'blink', extra: true }, () => c.lid(420, 370, 34, 40, EM));
  },
} satisfies Redraw;
