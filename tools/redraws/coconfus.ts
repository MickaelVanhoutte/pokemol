import type { P, Redraw } from './crayon.ts';

/**
 * The unfinished drawing: a plump violet cocoon three-quarters to the left, muddled with scribbles and silk,
 * an eraser smear across it and a little hole rubbed right through. Two big curious eyes peek out under a hood
 * of silk; Nightmoth's feathery antennae on top; two crumpled wing stubs come out of its back, one with the
 * start of a pink spiral, the other with a few panes of stained glass.
 */
export default {
  id: '073', slug: 'coconfus', seed: 7301, size: [960, 1000], tilt: -6,
  draw(c) {
    const { shape, stroke, dot, potato, spikes } = c;
    const BODY = '#6c5f92', DEEP = '#3a3160', SILK = '#c9c0dc', PINK = '#ee5fb0', PAPER = '#f7f3ea';
    const PANES = ['#bfe2fa', '#f6a7c8', '#f7e37a'];
    // the far wing stub, crumpled, peeking over its back: a few stained-glass panes
    const far: P[] = spikes([[600, 330], [690, 210], [790, 150]], 2, 18).concat([[840, 210], [800, 300], [700, 370], [610, 390]]);
    shape(far, PANES[0], { angle: 40, over: 0.2, press: 0.95 }, { w: 4 }, false);
    c.tint(potato(730, 240, 34, 28, 8, 0.1), PANES[1], { gap: 3.4 });
    c.tint(potato(780, 270, 22, 20, 8, 0.1), PANES[2], { gap: 3.4 });
    stroke([[630, 370], [720, 260], [800, 180]], { w: 3.5 });
    stroke([[690, 330], [740, 300], [770, 330]], { w: 3 });
    // feathery antennae, short and a bit bent
    for (const [x0, y0, x1, y1, bend] of [[430, 190, 330, 70, -40], [490, 175, 540, 60, 40]] as const) {
      const pts: P[] = [], back: P[] = [];
      for (let k = 0; k <= 7; k++) {
        const t = k / 7, w = 20 * Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.05));
        const x = x0 + (x1 - x0) * t + bend * Math.sin(Math.PI * t) * 0.6, y = y0 + (y1 - y0) * t;
        pts.push([x - w, y]);
        back.unshift([x + w, y]);
      }
      shape([...pts, ...back], SILK, { angle: 80, over: 0 }, { w: 3.5 });
      stroke([[x0, y0], [x0 + (x1 - x0) * 0.5 + bend * 0.6, y0 + (y1 - y0) * 0.5], [x1, y1]], { w: 3, col: DEEP });
    }
    // the cocoon, lopsided, its tip curling at the bottom
    const body: P[] = [[460, 150], [560, 190], [640, 320], [690, 500], [700, 600], [680, 700], [650, 820], [610, 895], [650, 935], [625, 975], [555, 960], [470, 935], [390, 900], [310, 800], [262, 660], [285, 560], [268, 460], [315, 300], [380, 195]];
    shape(body, BODY, { angle: 75, over: 0.6, press: 1.05 }, { w: 5 });
    c.tint([[560, 230], [650, 420], [680, 640], [630, 820], [580, 800], [610, 600], [590, 380]], DEEP, { gap: 3.6, angle: 60 });
    // silk wound round it, every which way, over the line in places
    stroke([[280, 520], [380, 545], [480, 520], [600, 545], [700, 520]], { w: 4.5, col: SILK });
    stroke([[270, 620], [360, 600], [470, 640], [590, 610], [695, 640]], { w: 4, col: SILK });
    stroke([[300, 760], [420, 790], [520, 760], [660, 790]], { w: 4.5, col: SILK });
    stroke([[350, 860], [450, 845], [560, 880], [610, 860]], { w: 4, col: SILK });
    // scribbles on top: a muddled drawing that went over and over the same place
    const loop: P[] = [];
    for (let k = 0; k < 26; k++) { const a = k * 0.9; loop.push([520 + Math.cos(a) * (40 + (k % 5) * 6) + k * 3, 680 + Math.sin(a) * (28 + (k % 4) * 5)]); }
    stroke(loop, { w: 3, col: DEEP });
    // an eraser smear across it, rubbed pale, with crumbs falling off
    c.tint([[300, 700], [360, 668], [450, 630], [470, 648], [400, 690], [318, 728]], PAPER, { angle: 28, gap: 3.2, press: 0.95, over: 0.3, miss: 0.2 });
    c.tint([[440, 690], [520, 640], [590, 610], [604, 628], [540, 665], [455, 712]], PAPER, { angle: 32, gap: 3.6, press: 0.8, over: 0, miss: 0.3 });
    // graphite dragged along by the eraser
    stroke([[330, 712], [430, 668], [520, 628]], { w: 2.5, col: '#8e86a0' });
    stroke([[360, 700], [460, 652]], { w: 2, col: '#8e86a0' });
    for (const [x, y, r] of [[300, 770, 9], [330, 800, 7], [290, 830, 8], [600, 610, 7], [575, 640, 6]] as const) dot(x, y, r, r * 0.8, '#c4939d');
    // the hole rubbed right through: paper behind it
    c.paper(potato(470, 790, 36, 30, 9, 0.06), { w: 4.5 });
    stroke([[440, 778], [462, 768], [492, 772]], { w: 3, col: DEEP });
    // the near wing stub, crumpled, with the start of a pink spiral
    const near: P[] = [[615, 520], [700, 468], [790, 462], [855, 505], [872, 575], [835, 625], [858, 680], [780, 705], [700, 676], [632, 622]];
    shape(near, '#3a3160', { angle: 60, over: 0.5, press: 1.1 }, { w: 5 });
    // crumpled: folds that don't line up
    stroke([[790, 470], [812, 520], [800, 560]], { w: 3, col: '#241e40' });
    stroke([[838, 625], [800, 650], [760, 640]], { w: 3, col: '#241e40' });
    shape(potato(775, 580, 42, 38, 10, 0.05), PINK, { angle: 90, over: 0, press: 1.1 }, { w: 3.5 });
    const sp: P[] = [];
    for (let k = 0; k < 16; k++) { const a = k * 0.6, rad = (k / 16) * 32; sp.push([775 + Math.cos(a) * rad, 580 + Math.sin(a) * rad]); }
    stroke(sp, { w: 3.5, col: '#241e40' });
    stroke([[700, 500], [740, 560], [720, 640]], { w: 3, col: '#241e40' });
    // the face peeking out under its hood of silk, looking left
    shape(potato(395, 360, 115, 88, 12, 0.05), SILK, { angle: 80, over: 0.2, press: 0.9 }, { w: 4 });
    stroke([[285, 300], [360, 270], [450, 268], [520, 300]], { w: 5, col: DEEP });
    c.paper(potato(335, 365, 36, 44, 9, 0.04));
    c.paper(potato(435, 355, 50, 58, 9, 0.04));
    shape(potato(330, 375, 22, 30, 9, 0.04), '#5a3f8a', { angle: 90, over: 0, press: 1.15 }, { w: 3 });
    shape(potato(428, 367, 31, 40, 9, 0.04), '#5a3f8a', { angle: 90, over: 0, press: 1.15 }, { w: 3 });
    dot(322, 362, 7, 10, '#ffffff');
    dot(418, 352, 10, 13, '#ffffff');
    dot(340, 392, 4, 5, PINK);
    dot(441, 388, 5, 6, PINK);
    // a wobbly, not-quite-sure little mouth
    stroke([[330, 425], [352, 418], [372, 428], [394, 418], [414, 426]], { w: 4 });
  },
} satisfies Redraw;
