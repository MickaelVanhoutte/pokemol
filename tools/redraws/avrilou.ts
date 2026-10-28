import type { P, Redraw } from './crayon.ts';

/**
 * An April fish (« poisson d'avril »), the paper fish children cut out and stick on someone's back on the
 * first of April: turned to the left, coloured in bright crayon scales, a strip of sticky tape still on its
 * back, its mouth open in a surprised « O ». It flops its tail and fins about.
 */
export default {
  id: '099', slug: 'avrilou', seed: 9903, size: [1000, 1000], tilt: -4,
  draw(c) {
    const { shape, paper, stroke, dot, tint, potato } = c;
    const ORANGE = '#f39a3c', BELLY = '#ffd76a', FIN = '#4fa3e0', TAPE = '#dde4e6';
    const SCALES = ['#e8513f', '#4fa3e0', '#5cb85c', '#9b59b6', '#e8513f', '#4fa3e0'];
    // the tail, behind the body: in battle it flops
    c.part('queue', { pivot: [760, 520], motion: 'swing', amp: 13, period: 0.9, behind: true }, () => {
      shape([[730, 520], [870, 370], [935, 385], [880, 520], [940, 655], [875, 672]], FIN, { angle: 20, over: 0.4 }, {}, false);
      for (const y of [430, 520, 610]) stroke([[790, 520], [890, y]], { w: 3 });
    });
    // the fin along its back
    shape([[400, 375], [455, 262], [560, 245], [640, 310], [665, 400]], FIN, { angle: 60, over: 0.3 });
    for (const x of [470, 530, 590]) stroke([[x, 380], [x + 25, 285]], { w: 3 });
    // the body, cut out of paper and coloured in
    const body: P[] = [[225, 525], [255, 420], [350, 360], [500, 342], [640, 378], [745, 450], [785, 522], [745, 592], [640, 652], [500, 684], [355, 668], [258, 612]];
    shape(body, ORANGE, { angle: 15, over: 0.5 });
    tint([[290, 600], [420, 645], [560, 655], [690, 610], [740, 575], [620, 600], [480, 610], [340, 585]], BELLY, { gap: 3.4 });
    // rows of scales in every crayon of the box
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 4 - (r === 2 ? 1 : 0); k++) {
        const x = 470 + k * 68 + (r % 2) * 34, y = 420 + r * 68;
        stroke([[x - 26, y - 14], [x - 18, y + 14], [x, y + 24], [x + 18, y + 14], [x + 26, y - 14]], { w: 6, col: SCALES[(k + r * 2) % SCALES.length] });
      }
    }
    // the gill
    stroke([[410, 395], [440, 470], [445, 555], [415, 625]], { w: 4.5 });
    // its big surprised eye and open « O » mouth
    paper(potato(330, 462, 54, 56, 10, 0.04));
    dot(318, 470, 24, 27);
    dot(308, 458, 8, 9, '#ffffff');
    stroke([[275, 392], [330, 380], [372, 398]], { w: 5 });
    shape(potato(238, 548, 30, 38, 8, 0.06), '#c0392b', { over: 0, press: 0.8 });
    tint(potato(330, 560, 26, 16, 7, 0.1), '#f29ac8', { gap: 3 });
    // the strip of sticky tape, still on its back, its ends torn
    paper([[455, 300], [640, 262], [652, 300], [642, 330], [658, 352], [480, 392], [470, 366], [478, 345], [462, 322]], { w: 3.5 }, false);
    tint([[470, 310], [630, 278], [640, 340], [485, 378]], TAPE, { gap: 3, wash: 0.6 });
    stroke([[495, 318], [610, 296]], { w: 2.5, col: '#ffffff' });
    // the near fin, under its chest: in battle it waves
    c.part('nageoire', { pivot: [440, 610], motion: 'flap', amp: 22, period: 0.6 }, () => {
      shape([[425, 590], [505, 640], [530, 725], [470, 712], [418, 650]], FIN, { angle: 60, over: 0.3 });
      stroke([[440, 615], [500, 700]], { w: 3 });
    });
    // only in battle: drops fly off as it flops about
    c.part('gouttes', { pivot: [500, 500], motion: 'flicker', period: 1.6, extra: true }, () => {
      for (const [x, y, s] of [[150, 360, 1], [880, 250, 0.8], [190, 720, 0.9], [905, 760, 1]] as const) {
        shape([[x, y - 40 * s], [x + 22 * s, y + 4 * s], [x, y + 26 * s], [x - 22 * s, y + 4 * s]], FIN, { over: 0 }, { w: 3.5 });
      }
    });
  },
} satisfies Redraw;
