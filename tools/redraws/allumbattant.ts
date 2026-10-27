import type { P, Redraw } from './crayon.ts';
import { flame } from './allumou.ts';

/**
 * Allumou grown into a match boxer turned to the left: a blazing flame mohawk streaming back, a charred red
 * head with a fierce look, a thick wooden body, boxing gloves made of the rough brown strip you strike a match
 * on (sparks flying off them), a matchbox for shorts, legs planted in a fighting stance.
 */
export default {
  id: '081', slug: 'allumbattant', seed: 8101, size: [1050, 1150], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const WOOD = '#e2c288', GRAIN = '#a9814a', RED = '#c22d27', DARK = '#7f1d1a', ORANGE = '#f7a12b', YEL = '#f7dc35', STRIKE = '#6b4a3a';
    const BOX = '#3f6fc6', LABEL = '#f2c43a';
    const glove = (x: number, y: number, r: number, cuff: P) => {
      shape(band([cuff, [x + (cuff[0] - x) * 0.55, y + (cuff[1] - y) * 0.55]], r * 0.9, r * 0.9), '#f3e6c4', { over: 0 }, { w: 3.5 });
      shape(potato(x, y, r, r * 0.9, 10, 0.04), STRIKE, { angle: 40, over: 0.4, press: 1.1 });
      for (let k = 0; k < 14; k++) dot(x + c.j(r * 1.3), y + c.j(r * 1.2), 2.5, 2.5, '#a88a72');
      stroke([[x - r * 0.6, y + r * 0.35], [x + r * 0.2, y + r * 0.6]], { w: 3.5, col: '#3e2a20' });
    };
    // the flame mohawk, tongues of fire streaming back behind the head
    for (const [x, y, w, h, l] of [[630, 290, 120, 140, 180], [550, 210, 140, 180, 180], [445, 170, 140, 160, 140], [340, 175, 110, 150, 80]] as const)
      shape(flame(x, y, w, h, l), ORANGE, { angle: 60, over: 0.3, press: 1.1 }, {}, false);
    for (const [x, y, w, h, l] of [[550, 200, 70, 110, 110], [445, 165, 70, 110, 80], [345, 168, 56, 90, 45]] as const)
      shape(flame(x, y, w, h, l), YEL, { over: 0 }, { w: 3 }, false);
    // the far leg and far glove up by its face, behind
    shape(band([[470, 830], [400, 950], [360, 1060]], 52, 46), WOOD, { angle: 70, over: 0 });
    shape(potato(330, 1075, 62, 28, 7, 0.06), '#5a4030', { over: 0 });
    shape(band([[440, 560], [330, 590], [270, 520]], 50, 46), WOOD, { angle: 60, over: 0 });
    glove(250, 480, 72, [300, 545]);
    // the thick wooden body, grain lines
    shape(band([[480, 440], [490, 640], [495, 840]], 150, 140), WOOD, { angle: 90, over: 0.4 });
    stroke([[450, 520], [455, 640]], { w: 3.5, col: GRAIN });
    stroke([[520, 600], [524, 760]], { w: 3.5, col: GRAIN });
    // the matchbox shorts: blue, a yellow label, striker strips on the sides
    shape([[395, 780], [600, 770], [610, 900], [390, 905]], BOX, { angle: 0, over: 0.3 }, { w: 4.5 }, false);
    shape([[440, 800], [560, 796], [562, 870], [442, 874]], LABEL, { over: 0 }, { w: 3.5 }, false);
    shape(flame(500, 860, 50, 56, 6), '#e2423a', { over: 0 }, { w: 3 }, false);
    shape([[390, 790], [410, 790], [410, 900], [390, 902]], STRIKE, { over: 0 }, { w: 3 }, false);
    shape([[590, 780], [608, 780], [610, 898], [592, 898]], STRIKE, { over: 0 }, { w: 3 }, false);
    // the near leg, planted
    shape(band([[540, 900], [600, 1000], [630, 1070]], 58, 52), WOOD, { angle: 110, over: 0 });
    shape(potato(660, 1085, 70, 30, 7, 0.06), '#5a4030', { over: 0 });
    // the charred red head, the far side darker, a black burnt rim
    shape(potato(430, 300, 180, 175, 12, 0.04), RED, { angle: 75, over: 0.55, press: 1.05 });
    c.tint([[520, 170], [600, 280], [590, 400], [520, 460], [560, 320]], DARK, { gap: 3.6 });
    // a fierce face, shifted left
    c.paper(potato(340, 300, 26, 22, 8, 0.05));
    c.paper(potato(445, 292, 30, 26, 8, 0.05));
    dot(332, 305, 13, 14);
    dot(437, 298, 15, 16);
    dot(327, 298, 4, 5, '#ffffff');
    dot(431, 290, 5, 6, '#ffffff');
    stroke([[300, 262], [370, 282]], { w: 8 });
    stroke([[410, 272], [490, 248]], { w: 8.5 });
    stroke([[320, 380], [370, 392], [420, 386]], { w: 5.5 });
    // the near arm punching forward to the left, sparks off the glove
    shape(band([[540, 540], [420, 610], [250, 640]], 56, 50), WOOD, { angle: 160, over: 0 });
    glove(190, 650, 88, [290, 640]);
    for (const [x, y, w, h, l] of [[90, 590, 40, 70, -20], [110, 720, 34, 56, -26], [70, 660, 30, 50, -30]] as const) shape(flame(x, y, w, h, l), ORANGE, { over: 0 }, { w: 3 }, false);
  },
} satisfies Redraw;
