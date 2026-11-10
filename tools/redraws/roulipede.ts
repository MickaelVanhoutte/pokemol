import type { Redraw } from './crayon.ts';
import { LEG, LILAC, VIOLET, YELLOW, segmented, spiral } from './milleKit.ts';

/**
 * A baby millipede, the scaredy-cat: rolled up tight, its plated violet body wound once round on itself (Fouettipède's
 * whip, coiled shut), a yellow warning spot on every plate (it oozes a bitter poison when touched). Its head, with the
 * family's angular helmet and two little yellow fangs, peeks out at the front: big frightened eyes, antennae trembling,
 * a few tiny legs splayed in the gap. Its flaw: it rolls up at everything, even its own shadow.
 */
export default {
  id: '133', slug: 'roulipede', seed: 13303, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the coil: the tail tucked in the middle, the body wound once round, thick, its plates stepping out at the rim
    // the tube wound one and a half turns, the same thickness all along, the tail tip and its yellow spike curled in
    // the middle
    c.shape(potato(600, 500, 70, 70, 8, 0.05), '#4a2e78', { angle: 30 }, { w: 0.1 });
    const t = segmented(c, spiral(600, 500, -400, 150, 30, 250, 26), (k) => (k < 0.12 ? 60 + (k / 0.12) * 110 : 170), { N: 80, seg: 5, legs: false });
    const [sx, sy] = t.sp[0];
    shape([[sx + 16, sy - 20], [sx - 40, sy - 6], [sx + 16, sy + 14]], YELLOW, { angle: 0, over: 0 }, { w: 3.5 }, false);
    // little legs only where the coil meets the ground
    for (const x of [470, 540, 610, 680, 750]) stroke([[x, 760], [x - 14, 810], [x - 40, 820]], { w: 7, col: LEG });
    // the head, at the outer end of the coil, peeking out at the lower left
    const [hx, hy] = [380, 700];
    c.part('antennes', { pivot: [hx + 10, hy - 70], motion: 'swing', amp: 4, period: 1.4, behind: true }, () => {
      stroke([[hx - 20, hy - 80], [hx - 70, hy - 190], [hx - 150, hy - 230]], { w: 6, col: LEG });
      stroke([[hx + 30, hy - 84], [hx + 30, hy - 210], [hx - 10, hy - 280]], { w: 6, col: LEG });
    });
    // the angular helmet of the family
    shape([[hx - 140, hy + 10], [hx - 100, hy - 80], [hx + 20, hy - 106], [hx + 120, hy - 60], [hx + 140, hy + 40], [hx + 60, hy + 100], [hx - 90, hy + 96]], VIOLET, { angle: 30, over: 0.3 }, {}, false);
    c.tint(potato(hx - 40, hy + 50, 76, 36, 8, 0.05), LILAC, { angle: 30, wash: 0.7 });
    // two little yellow fangs
    shape([[hx - 100, hy + 80], [hx - 120, hy + 124], [hx - 84, hy + 112]], YELLOW, { angle: 0, over: 0 }, { w: 3.5 }, false);
    shape([[hx - 30, hy + 96], [hx - 40, hy + 140], [hx - 6, hy + 124]], YELLOW, { angle: 0, over: 0 }, { w: 3.5 }, false);
    // frightened: white rings round small pupils, brows tilted up in the middle
    shape(potato(hx - 60, hy - 22, 36, 44, 10, 0.03), '#ffffff', { angle: 90, over: 0 }, { w: 3.5 });
    shape(potato(hx + 44, hy - 30, 44, 54, 10, 0.03), '#ffffff', { angle: 90, over: 0 }, { w: 3.5 });
    c.dot(hx - 64, hy - 14, 15, 19, '#2e2440');
    c.dot(hx + 38, hy - 20, 19, 24, '#2e2440');
    c.dot(hx - 69, hy - 22, 5, 5, '#ffffff');
    c.dot(hx + 32, hy - 32, 6, 6, '#ffffff');
    stroke([[hx - 96, hy - 70], [hx - 46, hy - 88]], { w: 5 });
    stroke([[hx + 8, hy - 98], [hx + 76, hy - 88]], { w: 5 });
    stroke([[hx - 50, hy + 50], [hx - 34, hy + 42], [hx - 18, hy + 50], [hx - 2, hy + 42]], { w: 4.5 });
    // a few tiny legs splayed in fright in the gap under its head
    for (const [x, y, dx] of [[hx + 80, hy + 90, 30], [hx + 130, hy + 80, 46], [hx + 180, hy + 70, 60]] as [number, number, number][]) {
      stroke([[x, y], [x + dx * 0.3, y + 44], [x + dx, y + 60]], { w: 7, col: LEG });
    }
    c.part('paupieres', { pivot: [hx, hy - 24], motion: 'blink', extra: true }, () => {
      c.lid(hx - 60, hy - 22, 36, 44, VIOLET);
      c.lid(hx + 44, hy - 30, 44, 54, VIOLET);
    });
  },
} satisfies Redraw;
