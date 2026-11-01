import type { P, Redraw } from './crayon.ts';

/**
 * A little blue turtle lying on its back and spinning on its shell like a top, its head on the left, laughing: the
 * brown checked shell underneath, the yellow checked belly on top (the drum it beats), four short legs kicking in the
 * air, a curly tail. Two speed lines show it spinning. Drawn after her drawing's colours and checks.
 */
export default {
  id: '003', slug: 'clapotin', seed: 3163, size: [1000, 1000], tilt: -4,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#4a86e0', DEEP = '#3a6ec8', SHELL = '#a8672e', BELLY = '#f6d86a', PINK = '#f28aa8', SOLE = '#9cc4f4';
    /** A short chubby leg sticking up from the body: wide at the body, a round foot at the tip, a round sole. */
    const leg = (base: P, tip: P, col: string) => {
      const [bx, by] = base, [tx, ty] = tip, mx = (bx + tx) / 2, my = (by + ty) / 2;
      const dx = tx - bx, dy = ty - by, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const pts: P[] = [[bx + nx * 40, by + ny * 40], [mx + nx * 38, my + ny * 38], [tx + nx * 36, ty + ny * 36], [tx + nx * 24 + dx / l * 30, ty + ny * 24 + dy / l * 30], [tx + dx / l * 40, ty + dy / l * 40], [tx - nx * 24 + dx / l * 30, ty - ny * 24 + dy / l * 30], [tx - nx * 36, ty - ny * 36], [mx - nx * 38, my - ny * 38], [bx - nx * 40, by - ny * 40]];
      shape(pts, col, { angle: 80, over: 0.3 }, { w: 0.1 });
      stroke(pts, { w: 5 });
      shape(potato(tx + dx / l * 6, ty + dy / l * 6, 26, 22, 8, 0.05), SOLE, { over: 0 }, { w: 3 });
    };
    // the speed lines: it's spinning
    for (const [pts, w] of [[[[150, 820], [110, 760], [120, 690]], 6], [[[860, 860], [910, 800], [900, 730]], 6]] as [P[], number][]) stroke(pts, { w, col: '#8aa8d8' });
    // the far legs, kicking in the air behind
    leg([440, 590], [420, 470], DEEP);
    leg([690, 600], [770, 500], DEEP);
    // the curly tail at the back end
    c.part('queue', { pivot: [770, 690], motion: 'swing', amp: 12, period: 0.8, behind: true }, () => {
      shape(band([[760, 690], [840, 660], [870, 600], [830, 580]], 46, 28), BLUE, { angle: 40 });
    });
    // the shell underneath, a dome, checked like her drawing
    const shell: P[] = [[250, 680], [330, 800], [460, 870], [600, 870], [730, 800], [800, 690], [700, 720], [520, 730], [340, 720]];
    shape(shell, SHELL, { angle: 0, over: 0.5 });
    for (const x of [380, 480, 580, 680]) stroke([[x, 720], [x - 6, 860]], { w: 4 });
    stroke([[300, 770], [520, 800], [760, 770]], { w: 4 });
    // the body lying on its back, the yellow checked belly facing up
    shape(potato(530, 640, 270, 100, 12, 0.03), BLUE, { angle: 0, over: 0.3 });
    const belly: P[] = [[340, 620], [440, 570], [600, 566], [720, 600], [710, 670], [600, 700], [440, 700], [350, 670]];
    shape(belly, BELLY, { angle: 0, over: 0 });
    for (const x of [430, 520, 610]) stroke([[x, 572], [x - 4, 700]], { w: 3.5 });
    stroke([[350, 640], [530, 632], [714, 640]], { w: 3.5 });
    // the near legs, in front, low on its side at the edge of the shell (they wiggle in battle)
    c.part('pattes', { pivot: [540, 720], motion: 'swing', amp: 8, period: 0.5 }, () => {
      leg([480, 730], [470, 600], BLUE);
      leg([650, 730], [720, 610], BLUE);
    });
    // the big round head on the left, tipped back, laughing
    shape(potato(240, 560, 170, 150, 14, 0.03), BLUE, { angle: 80, over: 0.4 });
    c.eye(180, 520, 32, 40);
    c.eye(286, 506, 42, 52);
    c.cheek(330, 600, 30, 17, PINK);
    shape([[130, 600], [200, 630], [270, 620], [250, 660], [190, 670], [140, 640]], '#9a2f4a', { over: 0 }, { w: 4 });
    c.tint([[170, 650], [200, 640], [230, 650], [205, 664]], PINK, { wash: 0.8 });
    dot(110, 560, 6, 5);
    c.part('paupieres', { pivot: [232, 512], motion: 'blink', extra: true }, () => {
      c.lid(180, 520, 32, 40, BLUE);
      c.lid(286, 506, 42, 52, BLUE);
    });
  },
} satisfies Redraw;
