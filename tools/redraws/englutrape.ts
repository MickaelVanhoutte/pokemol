import type { P, Redraw } from './crayon.ts';
import { DEEP, GREEN, PALE, leaf, skirtLeaf } from './sundewKit.ts';
import { tailBand } from './pandaKit.ts';

/**
 * The grown sundew, the proud glutton: a tall bud whose pointed sepals have split open at the top like a crown, a
 * flower stalk rising out of the opening with three drooping bell flowers. It stands low and wide on a skirt of long
 * splayed leaves, and whips one long forked arm toward you in an S, red and fringed with sticky drops along both prongs;
 * its far arm waits behind. Eyes wide with a gleam, brows hard down, a grin with a fang at one side and a drop of dew
 * drooling from the corner: it is already thinking of its next meal.
 */
export default {
  id: '132', slug: 'englutrape', seed: 13203, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the flower stalk rising out of the open top, three drooping bells
    c.part('fleurs', { pivot: [560, 240], motion: 'swing', amp: 3, period: 3.2, behind: true }, () => {
      stroke([[560, 250], [580, 140], [640, 70], [720, 60], [770, 90]], { w: 8, col: '#4a8a34' });
      for (const [x, y] of [[640, 74], [710, 62], [772, 96]] as [number, number][]) {
        stroke([[x, y], [x + 4, y + 26]], { w: 4, col: '#4a8a34' });
        shape([[x - 22, y + 30], [x - 18, y + 60], [x - 28, y + 76], [x + 34, y + 76], [x + 26, y + 60], [x + 28, y + 30], [x + 4, y + 22]], '#f6e8f2', { angle: 90, over: 0 }, { w: 3.5 });
        c.tint([[x - 26, y + 70], [x + 30, y + 70], [x + 28, y + 76], [x - 26, y + 76]], '#e890b8', { wash: 0.6 });
      }
    });
    // the far arm, short, waiting behind the body
    c.part('brasLoin', { pivot: [690, 460], motion: 'swing', amp: 2, period: 3.2, behind: true }, () => {
      const t = tailBand([[680, 470], [760, 420], [800, 360]], () => 40, 16);
      shape(t.out, '#57a83e', { angle: 60, over: 0.2 });
      leaf(c, [[790, 370], [830, 320], [850, 270]], 110, 4, { stalk: 0.3, col: '#57a83e' });
    });
    // the wide skirt behind
    skirtLeaf(c, [660, 800], [920, 830], 116, DEEP);
    skirtLeaf(c, [420, 800], [120, 840], 108, DEEP);
    // the tall bud, its pointed sepals split open at the top like a crown
    shape([[420, 800], [360, 700], [350, 560], [380, 420], [420, 330], [440, 230], [500, 320], [540, 240], [580, 330], [630, 220], [660, 340], [720, 440], [740, 580], [720, 720], [660, 810], [540, 840]], GREEN, { angle: 72, over: 0.45 }, {}, false);
    c.tint([[660, 340], [720, 440], [740, 580], [720, 720], [660, 800], [680, 600], [660, 440]], DEEP, { angle: 80, wash: 0.5 });
    for (const [a, b] of [[[440, 230], [470, 480]], [[630, 220], [640, 470]]] as [P, P][]) stroke([a, [(a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2], b], { w: 4.5 });
    c.tint(potato(470, 650, 90, 120, 10, 0.05), PALE, { angle: 70, wash: 0.65 });
    // the skirt in front: long leaves splayed wide like arms on the ground
    skirtLeaf(c, [460, 820], [240, 950], 128);
    skirtLeaf(c, [640, 820], [850, 940], 124);
    // the face: eyes wide with a gleam, brows hard down, a grin with a fang at one side, a drop drooling
    c.eye(452, 500, 34, 44, '#241c38');
    c.eye(574, 488, 42, 54, '#241c38');
    stroke([[404, 446], [480, 470]], { w: 8 });
    stroke([[540, 460], [626, 432]], { w: 8 });
    shape([[420, 570], [480, 596], [560, 598], [618, 572], [600, 622], [520, 642], [452, 628]], '#7a3040', { angle: 90, over: 0 }, { w: 4.5 });
    shape([[586, 590], [604, 584], [600, 612]], '#ffffff', { angle: 90, over: 0 }, { w: 3 }, false);
    // a drop of dew drooling from the corner of its mouth
    shape([[440, 616], [452, 640], [454, 664], [440, 676], [426, 664], [428, 640]], '#c79cf2', { angle: 90, over: 0, wash: 0.9 }, { w: 3 });
    c.dot(436, 652, 4, 5, '#ffffff');
    // the near arm, rooted on its side, whipping forward and down in an S, its fork open: two red paddles
    c.part('bras', { pivot: [370, 660], motion: 'reach', amp: 4, period: 2.6 }, () => {
      const t = tailBand([[380, 650], [290, 590], [230, 620], [210, 700], [220, 760]], (k) => 64 - 30 * k, 30);
      shape(t.out, GREEN, { angle: 50, over: 0.25 });
      leaf(c, [[220, 750], [180, 680], [150, 600]], 124, 6, { stalk: 0.28 });
      leaf(c, [[222, 760], [170, 810], [150, 870]], 112, 5, { stalk: 0.28 });
    });
    c.part('paupieres', { pivot: [514, 494], motion: 'blink', extra: true }, () => {
      c.lid(452, 500, 34, 44, GREEN);
      c.lid(574, 488, 42, 54, GREEN);
    });
  },
} satisfies Redraw;
