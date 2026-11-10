import type { P, Redraw } from './crayon.ts';
import { BODY, SAIL, SPOT, fin, fishBody } from './sautevase.ts';

/**
 * The grown mudskipper, the high jumper of the marsh: caught at the top of a huge leap, its long body bent in a bow, a
 * tall sail of a back fin raised along its whole back, spotted turquoise, its two front fins grown into broad shovels
 * (it digs its burrow in no time) spread wide like wings. Eyes still bulging on top, narrowed with daring, a toothy
 * grin. Mud drops fly off its tail.
 */
export default {
  id: '136', slug: 'bondivase', seed: 13603, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the trail of its leap below it
    c.part('trace', { pivot: [600, 900], motion: 'nod', amp: 1, period: 2.4, decor: true, behind: true }, () => {
      stroke([[880, 920], [700, 900], [520, 870]], { w: 5 });
      stroke([[860, 960], [660, 944]], { w: 4.5 });
    });
    // the tall jagged sail along its whole back, each ray ending in a point (it ripples in battle)
    c.part('voile', { pivot: [620, 460], motion: 'swing', amp: 2, period: 2.4, behind: true }, () => {
      const tips: P[] = [[470, 300], [540, 150], [620, 120], [700, 150], [780, 220], [840, 330], [860, 430]];
      const edge: P[] = [];
      tips.forEach((t, i) => { edge.push(t); const n = tips[i + 1]; if (n) edge.push([(t[0] + n[0]) / 2 + 6, (t[1] + n[1]) / 2 + 40]); });
      shape([[470, 440], ...edge, [840, 500]], SAIL, { angle: 30, over: 0.1 });
      for (const t of tips.slice(1, -1)) stroke([[t[0] + (650 - t[0]) * 0.1, 470], t], { w: 3, col: '#4a8aa8' });
      for (const [x, y, r] of [[560, 260, 17], [650, 230, 16], [740, 280, 15], [610, 340, 13], [790, 370, 12]] as [number, number, number][]) c.dot(x, y, r, r, SPOT);
    });
    // the tail fin
    c.part('queue', { pivot: [900, 600], motion: 'swing', amp: 4, period: 1.6, behind: true }, () => {
      fin(c, [920, 600], [[970, 500], [995, 560], [985, 640], [995, 720], [930, 690]], SAIL, 3);
    });
    // the body bent in a tight bow: a blunt flat-topped head low at the front, the tail up behind
    fishBody(c, [[240, 600], [360, 500], [520, 450], [700, 470], [850, 550], [920, 600]], (k) => (k < 0.15 ? 290 : 290 - ((k - 0.15) / 0.85) * 230), BODY, '#f6e6c4', 44);
    for (const [x, y, r] of [[480, 470, 17], [580, 450, 16], [680, 470, 14], [400, 520, 14], [780, 520, 12], [860, 570, 10]] as [number, number, number][]) c.dot(x, y, r, r, SPOT);
    // its two front fins grown into broad shovels, rooted at the shoulder and spread up and back like wings: the far
    // one above its back in front of the sail, the near one swept along its flank, tips up (they beat in battle)
    c.part('pelles', { pivot: [380, 540], motion: 'flap', amp: 5, period: 1.6 }, () => {
      fin(c, [380, 520], [[420, 400], [480, 300], [560, 260], [580, 330], [520, 440]], '#7ac0d8', 4);
      fin(c, [390, 560], [[480, 600], [600, 600], [700, 540], [660, 640], [520, 660]], '#8fd0e6', 4);
    });
    // turret eyes, wide open and daring, one brow pulled down
    shape(potato(330, 410, 60, 64, 10, 0.04), BODY, { angle: 60, over: 0.2 });
    c.eye(334, 404, 38, 44, '#241c38');
    shape(potato(230, 440, 64, 68, 10, 0.04), BODY, { angle: 60, over: 0.2 });
    c.eye(230, 434, 42, 50, '#241c38');
    stroke([[180, 380], [236, 392], [278, 384]], { w: 7.5 });
    stroke([[296, 340], [330, 318], [370, 330]], { w: 6.5 });
    // a toothy grin under the blunt snout
    shape([[130, 620], [200, 650], [290, 660], [340, 636], [310, 690], [220, 704], [160, 676]], '#7a3040', { angle: 90, over: 0 }, { w: 4.5 });
    for (const x of [190, 234, 278]) shape([[x, 652], [x + 20, 654], [x + 10, 674]], '#ffffff', { angle: 90, over: 0 }, { w: 2.5 }, false);
    c.part('paupieres', { pivot: [280, 420], motion: 'blink', extra: true }, () => {
      c.lid(334, 404, 38, 44, BODY);
      c.lid(230, 434, 42, 50, BODY);
    });
  },
} satisfies Redraw;
