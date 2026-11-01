import type { P, Redraw } from './crayon.ts';

/**
 * Pschitou grown into a big, sly skunk, turned to the left. It keeps Pschitou's purple, its cream stripe from the
 * forehead along the back to the tip of the tail, its pointed snout and pink nose; its eyes are narrowed now, a fang
 * shows in its sly grin, and its giant tail is raised high behind it, curling over at the tip like a question mark.
 * It stands up on its back legs, arms crossed: proud and sly.
 */

export default {
  id: '043', slug: 'mouffetor', seed: 4357, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#7c4cbc', DEEP = '#62389e', CREAM = '#f6ecd2', TAIL = '#b896e4', PINK = '#f28aa8';
    const tail = (path: P[], w0: number, w1: number) => {
      c.part('queue', { pivot: path[0], motion: 'swing', amp: 5, period: 2.2, behind: true }, () => {
        shape(band(path, w0, w1), FUR, { angle: 60, over: 0.3 });
        // its stripe a pale lavender on the tail, so it doesn't read as a second tail
        shape(band(path.slice(1), w0 * 0.32, w1 * 0.34), TAIL, { angle: 60, over: 0 }, { w: 0.1 });
      });
    };
    /** The head: the snout to the left of (x, y), sly narrowed eyes, a grin with one fang. */
    const head = (x: number, y: number, s: number) => {
      const T = ([px, py]: P): P => [x + (px - 370) * s, y + (py - 560) * s];
      shape(potato(...T([330, 410]), 50 * s, 50 * s, 9, 0.05), DEEP, { angle: 60 });
      shape(potato(...T([480, 380]), 58 * s, 58 * s, 9, 0.05), FUR, { angle: 60 });
      shape(([[290, 470], [370, 400], [480, 400], [560, 470], [570, 590], [500, 680], [380, 700], [300, 660], [200, 630], [130, 610], [140, 580], [240, 550]] as P[]).map(T), FUR, { angle: 78, over: 0.3 });
      shape(([[330, 470], [380, 420], [460, 400], [540, 420], [470, 440], [400, 470]] as P[]).map(T), CREAM, { over: 0 }, { w: 3 });
      c.eye(...T([322, 530]), 30 * s, 38 * s, '#3a3050', { lid: 0.34, skin: FUR, tilt: 14 });
      c.eye(...T([432, 524]), 40 * s, 50 * s, '#3a3050', { lid: 0.34, skin: FUR, tilt: -10 });
      stroke([T([290, 480]), T([350, 496])], { w: 8 });
      stroke([T([400, 480]), T([470, 466])], { w: 8 });
      dot(...T([140, 594]), 18 * s, 14 * s, PINK);
      stroke(([[190, 640], [240, 656], [300, 640]] as P[]).map(T), { w: 5 });
      shape(([[256, 650], [272, 650], [264, 676]] as P[]).map(T), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
      c.cheek(...T([490, 610]), 30 * s, 17 * s, PINK);
      return T;
    };
    tail([[600, 720], [800, 600], [860, 360], [780, 160], [620, 120], [580, 220]], 200, 250);
    // the far leg, the body standing up, a cream stripe down its back, the near leg
    shape(band([[580, 760], [600, 900]], 90, 80), DEEP, { angle: 90 });
    shape(potato(610, 914, 70, 32, 8, 0.06), DEEP, { angle: 10 });
    shape([[400, 880], [380, 700], [400, 520], [470, 440], [600, 440], [660, 540], [680, 720], [640, 880]], FUR, { angle: 80, over: 0.3 });
    shape(band([[600, 450], [650, 560], [660, 700]], 50, 40), CREAM, { angle: 80, over: 0 }, { w: 0.1 });
    shape(band([[460, 780], [450, 900]], 96, 86), FUR, { angle: 90 });
    shape(potato(440, 916, 76, 34, 8, 0.06), FUR, { angle: 10 });
    // arms crossed over its chest
    shape(band([[420, 580], [520, 640], [600, 610]], 70, 60), DEEP, { angle: 20 });
    shape(band([[600, 580], [500, 650], [410, 630]], 76, 66), FUR, { angle: 20 });
    const s = 0.9;
    const T = head(470, 330, s);
    c.part('paupieres', { pivot: T([376, 528]), motion: 'blink', extra: true }, () => {
      c.lid(...T([322, 530]), 30 * s, 38 * s, FUR);
      c.lid(...T([432, 524]), 40 * s, 50 * s, FUR);
    });
  },
} satisfies Redraw;
