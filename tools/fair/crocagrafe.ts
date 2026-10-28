import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/** The same pen moved by (dx, dy) on the sheet, so the drawing keeps its own coordinates with room round it. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]) => [x + dx, y + dy] as P);
  return {
    ...c,
    shape: (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(m(pts), col, o, l, round),
    paper: (pts: P[], l?: Line, round?: boolean) => c.paper(m(pts), l, round),
    tint: (pts: P[], col: string, o?: Colour) => c.tint(m(pts), col, o),
    stroke: (pts: P[], l?: Line, round?: boolean) => c.stroke(m(pts), l, round),
    dot: (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + dx, y + dy, rx, ry, col),
    shine: (pts: P[], w?: number) => c.shine(m(pts), w),
    star: (x: number, y: number, r: number, rot?: number) => c.star(x + dx, y + dy, r, rot),
    part: (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + dx, def.pivot[1] + dy] }, draw),
  };
}

/**
 * Crocagrafe's fair copy, Steel/Dark, the same drawing grown up: its binder clips grown into a spiked crest,
 * a double row of tall clips along its back and three more down a longer, heavier tail (the tallest one flicks its
 * wire handles); its stapler jaws much bigger and thrown wide open, a big row of staple teeth on each; a big
 * paper-clip hook at the tip of its tail; thicker legs with steel claws, more staples stuck in its hide, a narrower
 * eye under a heavier brow, and the gold star on its flank. It faces left, like its drawing.
 */
export default {
  id: '075', slug: 'crocagrafe', seed: 7575, size: [1600, 1000], tilt: -2,
  draw(pen) {
    const c = moved(pen, 105, 75);
    const { shape, stroke, dot, band, potato } = c;
    const BODY = '#2f4f52', DEEP = '#1f3537', BELLY = '#d9d39c', METAL = '#b9bdc8', RED = '#c8343c', BLACK = '#2b2830', WIRE = '#8d93a0', YEL = '#f7dc35';
    /** Drawing coordinates of a point (px, py) of something standing at (x, y), stretched (sx, sy) and turned `deg`. */
    const at = (x: number, y: number, sx: number, sy: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      return (px: number, py: number): P => [x + px * sx * Math.cos(a) - py * sy * Math.sin(a), y + px * sx * Math.sin(a) + py * sy * Math.cos(a)];
    };
    /** The two steel wire handles of a binder clip standing at (x, y). */
    const handles = (x: number, y: number, sx: number, sy: number, deg: number) => {
      const r = at(x, y, sx, sy, deg);
      for (const loop of [[r(-22, -48), r(-34, -104), r(-4, -110), r(-4, -50)], [r(4, -50), r(12, -108), r(38, -100), r(22, -48)]]) {
        stroke(loop, { w: 13 });
        stroke(loop, { w: 7, col: WIRE });
      }
    };
    /** A tall black binder clip standing on the hide at (x, y), its wire handles up (unless they move on their own). */
    const clip = (x: number, y: number, sx: number, sy: number, deg: number, withHandles = true) => {
      const r = at(x, y, sx, sy, deg);
      if (withHandles) handles(x, y, sx, sy, deg);
      shape([r(-42, 14), r(-24, -52), r(24, -52), r(42, 14)], BLACK, { angle: 90 + deg, over: 0, press: 1.1 }, {}, false);
      stroke([r(-30, 0), r(-18, -40)], { w: 5, col: '#6c6874' });
    };
    // the jaws hinge at the back of the head: the top one thrown up, the bottom one dropped
    const HINGE: P = [572, 565];
    const turn = (deg: number) => (x: number, y: number): P => {
      const a = (deg * Math.PI) / 180, dx = x - HINGE[0], dy = y - HINGE[1];
      return [HINGE[0] + dx * Math.cos(a) - dy * Math.sin(a), HINGE[1] + dx * Math.sin(a) + dy * Math.cos(a)];
    };
    const U = turn(15), D = turn(-7);
    /** A big row of staple teeth along a jaw (`T` turns them with it), pointing down or up. */
    const teeth = (T: (x: number, y: number) => P, x0: number, x1: number, y: number, h: number, n: number, down: boolean) => {
      for (let k = 0; k < n; k++) {
        const x = x0 + ((x1 - x0) * (k + 0.5)) / n, w = ((x1 - x0) / n) * 0.66, s = down ? 1 : -1, t = 10;
        c.paper([T(x - w / 2, y), T(x + w / 2, y), T(x + w / 2, y + h * s), T(x + w / 2 - t, y + h * s), T(x + w / 2 - t, y + t * s), T(x - w / 2 + t, y + t * s), T(x - w / 2 + t, y + h * s), T(x - w / 2, y + h * s)], { w: 4 }, false);
      }
    };
    // the longer, heavier tail behind, three clips along it, a big paper-clip hook at its tip
    c.part('queue', { pivot: [830, 540], motion: 'swing', amp: 3, period: 2.2, behind: true }, () => {
      for (const [x, y, sx, sy, d] of [[1040, 512, 1.3, 1.9, 18], [1170, 492, 1.15, 1.6, 32], [1268, 430, 1.0, 1.35, 50]] as const) clip(x, y, sx, sy, d);
      shape(band([[820, 530], [1000, 590], [1160, 568], [1290, 478], [1355, 355]], 196, 62), BODY, { angle: 20, over: 0.4 });
      const hook: P[] = [[1350, 365], [1432, 200], [1375, 62], [1295, 122], [1330, 290], [1402, 228], [1390, 130]];
      stroke(hook, { w: 22 });
      stroke(hook, { w: 12, col: METAL });
    });
    // the far legs, behind
    shape(band([[420, 640], [392, 780]], 98, 88), DEEP, { angle: 90 });
    shape(band([[800, 630], [832, 770]], 98, 88), DEEP, { angle: 90 });
    // a spiked crest of tall binder clips along its back: a far row, then the near row in front
    for (const [x, y, sx, sy, d] of [[592, 392, 1.3, 2.5, -9], [735, 380, 1.4, 2.85, 2], [870, 412, 1.3, 2.3, 14]] as const) clip(x, y, sx, sy, d);
    for (const [x, y, sx, sy, d] of [[518, 405, 1.45, 2.2, -14], [662, 382, 1.7, 2.95, -4], [806, 388, 1.65, 2.7, 8], [932, 445, 1.45, 2.2, 20]] as const) clip(x, y, sx, sy, d, x !== 662);
    // the tallest one flicks its wire handles
    c.part('poignees', { pivot: at(662, 382, 1.7, 2.95, -4)(0, -50), motion: 'nod', amp: 9, period: 1.8 }, () => handles(662, 382, 1.7, 2.95, -4));
    // the long armoured body, a pale tummy, scutes
    shape([[370, 425], [560, 372], [800, 374], [950, 445], [975, 565], [890, 662], [600, 702], [425, 682], [330, 565]], BODY, { angle: 15, over: 0.6, press: 1.05 });
    c.tint([[435, 650], [870, 640], [830, 688], [480, 698]], BELLY, { gap: 3.4, angle: 15 });
    for (const x of [520, 620, 720, 820, 905]) stroke([[x, 430], [x + 10, 520], [x - 4, 610]], { w: 3.5, col: DEEP });
    // staples stuck in its hide like scars
    for (const [x, y] of [[585, 470], [760, 540], [860, 470], [470, 520]] as const) {
      const st: P[] = [[x, y + 18], [x, y], [x + 42, y - 8], [x + 42, y + 10]];
      stroke(st, { w: 11 }, false);
      stroke(st, { w: 5, col: METAL }, false);
    }
    c.star(700, 590, 50, -8);
    // the near legs, thicker, long steel claws
    shape(band([[500, 662], [480, 792]], 118, 108), BODY, { angle: 90 });
    shape(band([[765, 652], [795, 787]], 118, 108), BODY, { angle: 90 });
    for (const [x, y] of [[430, 800], [478, 808], [526, 802], [748, 796], [796, 804], [844, 798]] as const) shape([[x - 12, y - 6], [x - 28, y + 48], [x + 10, y - 2]], METAL, { over: 0 }, { w: 4 }, false);
    // the stapler jaws, much bigger and thrown wide open: the dark mouth, the bottom jaw and its row of staple teeth
    const [ft, fb] = [U(-30, 550), D(-20, 616)];
    shape([ft, U(450, 548), [585, 590], D(500, 612), fb, [(ft[0] + fb[0]) / 2 + 80, (ft[1] + fb[1]) / 2]], '#5a2a30', { angle: 0, over: 0 }, { w: 4 });
    c.tint([D(130, 602), D(430, 598), D(410, 572), U(150, 572)], '#b84a5a', { gap: 3.6 });
    shape([D(-55, 705), D(-5, 615), D(500, 608), D(588, 624), D(596, 708), D(480, 750), D(60, 748)], METAL, { angle: -7, over: 0.25 });
    stroke([D(50, 708), D(480, 704)], { w: 5, col: '#7f8494' });
    teeth(D, -10, 540, 616, 78, 9, false);
    // the top jaw: the red stapler top, its black strip, its row of staple teeth, the eye on its bump
    c.part('machoire', { pivot: HINGE, motion: 'nod', amp: 8, period: 2.4 }, () => {
      shape([U(-70, 505), U(-40, 425), U(220, 372), U(460, 342), U(582, 400), U(592, 520), U(450, 552), U(-20, 560)], RED, { angle: 25, over: 0.5, press: 1.05 });
      shape([U(80, 425), U(440, 366), U(545, 395), U(525, 434), U(100, 470)], BLACK, { angle: 25, over: 0 }, { w: 4 });
      stroke([U(120, 448), U(480, 400)], { w: 4, col: '#6c6874' });
      teeth(U, -30, 535, 552, 78, 9, true);
      dot(...U(-15, 462), 11, 8);
      dot(...U(30, 448), 11, 8);
      c.shine([U(-20, 432), U(150, 396)], 8);
      // the eye on a bigger bump, narrow and fierce under a heavy brow
      const [ex, ey] = U(445, 362);
      shape(potato(ex, ey, 92, 70, 9, 0.05), BODY, { angle: 80, over: 0.3 });
      shape([[ex - 58, ey + 8], [ex - 12, ey - 16], [ex + 58, ey - 10], [ex + 2, ey + 24]], YEL, { over: 0 }, { w: 4.5 }, false);
      stroke([[ex + 2, ey - 14], [ex + 4, ey + 22]], { w: 8 });
      stroke([[ex - 82, ey - 22], [ex, ey - 32], [ex + 74, ey - 62]], { w: 14 });
      // the hinge
      shape(potato(HINGE[0], HINGE[1], 58, 58, 9, 0.04), BLACK, { over: 0 });
      dot(HINGE[0], HINGE[1], 18, 18, METAL);
    });
  },
} satisfies Fair;
