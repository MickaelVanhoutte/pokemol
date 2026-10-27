import type { Crayon, Redraw } from './crayon.ts';
import { staples } from './agrafou.ts';

/** A black binder clip standing on its back, its two silver wire handles up. */
function clip(c: Crayon, x: number, y: number, s: number) {
  c.shape([[x - 40 * s, y + 10 * s], [x - 24 * s, y - 50 * s], [x + 24 * s, y - 50 * s], [x + 40 * s, y + 10 * s]], '#2b2830', { angle: 90, over: 0, press: 1.1 }, { w: 3.5 }, false);
  c.stroke([[x - 22 * s, y - 48 * s], [x - 34 * s, y - 100 * s], [x - 6 * s, y - 104 * s], [x - 4 * s, y - 50 * s]], { w: 6, col: '#6f7480' });
  c.stroke([[x + 4 * s, y - 50 * s], [x + 12 * s, y - 102 * s], [x + 36 * s, y - 96 * s], [x + 22 * s, y - 48 * s]], { w: 6, col: '#6f7480' });
}

/**
 * Agrafou grown into a big armoured crocodile turned to the left: a long desk-stapler head with a red top and a
 * row of staple teeth clenched in a menacing grin, black binder clips standing all along its back, a dark body,
 * a heavy tail ending in a paper-clip hook, a fierce narrow eye.
 */
export default {
  id: '075', slug: 'crocagrafe', seed: 7511, size: [1250, 900], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BODY = '#2f4f52', DEEP = '#1f3537', BELLY = '#d9d39c', METAL = '#b9bdc8', RED = '#c8343c', BLACK = '#2b2830';
    // the heavy tail behind, a paper-clip hook at its tip
    shape(band([[820, 520], [980, 560], [1100, 520], [1170, 430]], 140, 40), BODY, { angle: 20, over: 0.4 });
    stroke([[1165, 440], [1200, 360], [1170, 300], [1130, 330], [1150, 410], [1185, 380], [1180, 330]], { w: 7, col: '#8d93a0' });
    // the far legs, behind
    shape(band([[420, 640], [390, 760]], 80, 72), DEEP, { angle: 90 });
    shape(band([[800, 630], [830, 750]], 80, 72), DEEP, { angle: 90 });
    // binder clips standing along its back
    for (const [x, y, s] of [[500, 400, 1.35], [650, 380, 1.5], [800, 395, 1.35], [920, 445, 1.1]] as const) clip(c, x, y, s);
    // the long armoured body, a pale tummy, scutes
    shape([[380, 420], [560, 380], [800, 385], [940, 450], [960, 560], [880, 650], [600, 690], [430, 670], [340, 560]], BODY, { angle: 15, over: 0.6, press: 1.05 });
    c.tint([[440, 640], [860, 630], [820, 675], [480, 685]], BELLY, { gap: 3.4, angle: 15 });
    for (const x of [520, 620, 720, 820]) stroke([[x, 440], [x + 10, 520], [x - 4, 600]], { w: 3, col: DEEP });
    // a few staples stuck in its hide like scars
    for (const [x, y] of [[640, 480], [760, 560]] as const) stroke([[x, y + 14], [x, y], [x + 34, y - 6], [x + 34, y + 8]], { w: 4, col: METAL }, false);
    // the near legs, thick, claws
    shape(band([[500, 660], [480, 780]], 96, 88), BODY, { angle: 90 });
    shape(band([[760, 650], [790, 775]], 96, 88), BODY, { angle: 90 });
    for (const [x, y] of [[445, 790], [480, 796], [515, 790], [760, 786], [795, 792], [830, 786]] as const) stroke([[x, y - 6], [x - 8, y + 18]], { w: 4.5 });
    // the long stapler head, jaws a little apart: a dark mouth, two rows of staple teeth, the red top above
    shape([[70, 560], [520, 535], [560, 600], [90, 610]], '#5a2a30', { angle: 0, over: 0 }, { w: 3 });
    shape([[60, 610], [100, 585], [500, 575], [560, 595], [560, 650], [470, 670], [110, 660], [55, 640]], METAL, { angle: 0, over: 0.25 });
    staples(c, 110, 500, 586, 26, 9, false);
    c.part('machoire', { pivot: [560, 560], motion: 'nod', amp: 10, period: 2.4 }, () => {
      shape([[40, 520], [70, 460], [260, 415], [460, 390], [560, 430], [560, 520], [450, 540], [90, 552]], RED, { angle: 10, over: 0.5, press: 1.05 });
      shape([[160, 455], [440, 405], [520, 430], [500, 460], [180, 488]], BLACK, { angle: 10, over: 0 }, { w: 3.5 });
      stroke([[200, 465], [440, 422]], { w: 3, col: '#6c6874' });
      staples(c, 100, 510, 545, 28, 10, true);
      // the hinge
      shape(potato(560, 560, 40, 40, 9, 0.04), BLACK, { over: 0 });
      dot(560, 560, 11, 11, METAL);
      dot(75, 480, 9, 6);
      dot(110, 468, 9, 6);
      // the eye on a bump, narrow and fierce, a heavy brow
      shape(potato(440, 385, 72, 58, 9, 0.05), BODY, { angle: 80, over: 0.3 });
      shape([[395, 388], [430, 366], [480, 374], [440, 404]], '#f2c43a', { over: 0 }, { w: 3.5 }, false);
      stroke([[438, 368], [440, 402]], { w: 6 });
      stroke([[380, 356], [440, 351], [500, 338]], { w: 8 });
    });
  },
} satisfies Redraw;
