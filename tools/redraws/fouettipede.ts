import type { Redraw } from './crayon.ts';
import { LEG, LILAC, VIOLET, YELLOW, segmented } from './milleKit.ts';

/**
 * The grown millipede, the whip: a long violet body unrolled in one S, its front half reared up high, its tail end
 * lifted and cracked like a whip, ending in a yellow barb. A narrow angular head, two poison fangs, long antennae swept
 * back, narrowed eyes. It still rolls up when it's scared, but now it uncoils all at once.
 */
export default {
  id: '134', slug: 'fouettipede', seed: 13401, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the whip of a tail, behind: lifted high at the back and curling over
    c.part('fouet', { pivot: [760, 700], motion: 'swing', amp: 4, period: 1.8, behind: true }, () => {
      const t = segmented(c, [[760, 760], [880, 700], [920, 560], [860, 420], [780, 400]], (k) => 160 - 110 * k, { N: 30, seg: 5, legs: false });
      const [x, y] = t.sp[t.N - 1];
      shape([[x + 10, y - 26], [x - 70, y - 10], [x + 6, y + 26]], YELLOW, { angle: 0, over: 0 }, { w: 4.5 }, false);
    });
    // the S of a body: low along the ground at the back, rearing up at the front
    segmented(c, [[780, 790], [640, 850], [470, 820], [380, 700], [380, 520], [330, 380]], (k) => 190 - 50 * k, { N: 64, seg: 6, legSide: -1, legLen: 50 });
    // the head, angular, three-quarter left
    const [hx, hy] = [300, 290];
    c.part('antennes', { pivot: [hx + 20, hy - 40], motion: 'swing', amp: 3, period: 2.2, behind: true }, () => {
      stroke([[hx + 10, hy - 50], [hx + 90, hy - 170], [hx + 230, hy - 220]], { w: 7, col: LEG });
      stroke([[hx + 50, hy - 40], [hx + 170, hy - 120], [hx + 300, hy - 130]], { w: 7, col: LEG });
    });
    shape([[hx - 130, hy + 10], [hx - 80, hy - 80], [hx + 40, hy - 100], [hx + 130, hy - 40], [hx + 140, hy + 60], [hx + 40, hy + 110], [hx - 90, hy + 90]], VIOLET, { angle: 30, over: 0.3 }, {}, false);
    c.tint(potato(hx - 40, hy + 40, 60, 30, 8, 0.05), LILAC, { angle: 30, wash: 0.6 });
    // two curved poison fangs under the head
    shape([[hx - 90, hy + 40], [hx - 170, hy + 100], [hx - 120, hy + 150], [hx - 70, hy + 80]], YELLOW, { angle: 0, over: 0 }, { w: 4 }, false);
    shape([[hx - 30, hy + 70], [hx - 70, hy + 160], [hx - 20, hy + 170], [hx, hy + 84]], '#d8a83a', { angle: 0, over: 0 }, { w: 4 }, false);
    // narrowed eyes with a glint, brows slanted down to the nose
    c.eye(hx - 48, hy - 6, 26, 32, '#3a3050', { lid: 0.22, skin: VIOLET });
    c.eye(hx + 38, hy - 14, 32, 40, '#3a3050', { lid: 0.22, skin: VIOLET });
    stroke([[hx - 82, hy - 40], [hx - 26, hy - 30]], { w: 6 });
    stroke([[hx + 10, hy - 42], [hx + 76, hy - 58]], { w: 6 });
    c.part('paupieres', { pivot: [hx, hy - 10], motion: 'blink', extra: true }, () => {
      c.lid(hx - 48, hy - 6, 26, 32, VIOLET);
      c.lid(hx + 38, hy - 14, 32, 40, VIOLET);
    });
  },
} satisfies Redraw;
