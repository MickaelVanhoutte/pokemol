import type { Fair, P } from '../redraws/crayon.ts';

/** A little puff of gas: a bumpy cloud. */
const cloud = (x: number, y: number, r: number): P[] =>
  Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, q = r * (0.8 + 0.25 * Math.abs(Math.sin(a * 2.5)));
    return [x + Math.cos(a) * q, y + Math.sin(a) * q * 0.8] as P;
  });

/**
 * Fumerax's fair copy, Poison/Dark, the same drawing grown up: three smog balls stuck together instead of
 * two (a new one budding low on the right, glaring left like the others), its chimney taller and puffing, bigger
 * craters, heavier brows and longer fangs, its puffs of gas grown bigger and thicker (green smog swirled with
 * purple), and the gold star on the big ball. It faces left, like its drawing.
 */
export default {
  id: '057', slug: 'fumerax', seed: 57057, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const PURPLE = '#6a4a96', SPOT = '#b39cd2', GAS = '#93a57a', HAZE = '#a184cc';
    /** A thick puff of its smog: a big green cloud with a purple one swelling out behind it. */
    const smog = (x: number, y: number, r: number, dir: number) => {
      shape(cloud(x + dir * r * 0.6, y - r * 0.42, r * 0.66), HAZE, { angle: 30, over: 0 });
      shape(cloud(x, y, r), GAS, { angle: 30, over: 0.3 });
    };
    /** Its glaring face: eyes, heavy brows, a frown and a fang or two. */
    const face = (x: number, y: number, s: number, fangs: number) => {
      c.paper(potato(x, y, 18 * s, 22 * s, 8, 0.05));
      c.paper(potato(x + 88 * s, y - 4 * s, 26 * s, 28 * s, 8, 0.05));
      dot(x - 2 * s, y + 6 * s, 8 * s, 11 * s);
      dot(x + 84 * s, y + 4 * s, 11 * s, 14 * s);
      stroke([[x - 26 * s, y - 36 * s], [x + 24 * s, y - 18 * s]], { w: 9 });
      stroke([[x + 58 * s, y - 22 * s], [x + 124 * s, y - 44 * s]], { w: 10 });
      stroke([[x - 14 * s, y + 70 * s], [x + 40 * s, y + 84 * s], [x + 104 * s, y + 70 * s]], { w: 6 });
      for (let i = 0; i < fangs; i++) {
        const fx = x + (fangs === 1 ? 64 : 4 + i * 74) * s;
        c.paper([[fx, y + 80 * s], [fx + 12 * s, y + 116 * s], [fx + 26 * s, y + 78 * s]], { w: 4.5 }, false);
      }
    };
    // its puffs of gas, bigger and thicker, one puffing from its chimney
    c.part('gaz', { pivot: [560, 520], motion: 'flicker', period: 2.6, behind: true }, () => {
      for (const [x, y, r, dir] of [[985, 185, 92, -1], [1022, 530, 66, -1], [125, 855, 100, 1], [760, 912, 76, -1], [98, 465, 80, 1], [500, 160, 78, 1]] as const) smog(x, y, r, dir);
    });
    // the smaller ball behind, up on the right
    c.part('boule-d', { pivot: [610, 450], motion: 'nod', amp: 3, period: 2.8, behind: true }, () => {
      shape(potato(760, 330, 200, 190, 14, 0.05), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
      for (const [x, y, r] of [[860, 260, 34], [880, 425, 30], [740, 175, 26]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), SPOT, { over: 0 }, { w: 4 });
      face(650, 318, 1, 1);
    });
    // the new ball budding low on the right, behind, glaring left like the others
    c.part('boule-bas', { pivot: [745, 720], motion: 'nod', amp: 3, period: 2.8, behind: true, phase: 0.5 }, () => {
      shape(potato(885, 730, 150, 142, 14, 0.04), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
      for (const [x, y, r] of [[960, 650, 24], [990, 790, 26], [880, 830, 20]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), SPOT, { over: 0 }, { w: 4 });
      face(812, 706, 0.8, 1);
    });
    // the joining tube and the taller chimney
    shape([[560, 420], [650, 400], [670, 470], [590, 500]], PURPLE, { over: 0.3 });
    shape([[466, 335], [534, 335], [530, 222], [470, 224]], PURPLE, { over: 0 }, { w: 5 });
    shape([[455, 230], [545, 228], [542, 200], [458, 202]], PURPLE, { over: 0 }, { w: 5 });
    // the big ball in front, its bigger craters, the star
    shape(potato(450, 620, 300, 290, 16, 0.04), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
    for (const [x, y, r] of [[630, 490, 48], [680, 665, 42], [470, 860, 50], [360, 400, 30]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), SPOT, { over: 0 }, { w: 4 });
    c.star(600, 775, 48, -8);
    c.shine([[250, 450], [300, 410]], 8);
    // its face, shifted left, scowling harder, a grin with two long fangs
    c.paper(potato(240, 580, 24, 32, 8, 0.05));
    c.paper(potato(365, 575, 38, 42, 8, 0.05));
    dot(240, 590, 11, 15);
    dot(360, 586, 16, 19);
    stroke([[198, 528], [276, 556]], { w: 12 });
    stroke([[318, 552], [422, 518]], { w: 13 });
    stroke([[195, 690], [260, 718], [340, 712], [410, 678]], { w: 6.5 });
    c.paper([[236, 710], [252, 758], [270, 714]], { w: 5 }, false);
    c.paper([[338, 710], [354, 756], [372, 704]], { w: 5 }, false);
  },
} satisfies Fair;
