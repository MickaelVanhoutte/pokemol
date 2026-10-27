import type { Crayon, P, Redraw } from './crayon.ts';

/** A row of staples for teeth, between two jaws: little paper brackets. */
export function staples(c: Crayon, x0: number, x1: number, y: number, h: number, n: number, down = true) {
  for (let k = 0; k < n; k++) {
    const x = x0 + ((x1 - x0) * (k + 0.5)) / n, w = ((x1 - x0) / n) * 0.62;
    const s = down ? 1 : -1;
    c.paper([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h * s], [x + w / 2 - 6, y + h * s], [x + w / 2 - 6, y + 6 * s], [x - w / 2 + 6, y + 6 * s], [x - w / 2 + 6, y + h * s], [x - w / 2, y + h * s]], { w: 2.5 }, false);
  }
}

/**
 * A little crocodile with a stapler for a head, turned to the left: a red stapler top, a silver jaw underneath,
 * staples for teeth in a cheeky grin, big eyes popping up on top, a slate-green body with a ridged back.
 */
export default {
  id: '074', slug: 'agrafou', seed: 7411, size: [1000, 820], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const BODY = '#3f7468', DEEP = '#29504a', BELLY = '#e7dfa6', METAL = '#b9bdc8', RED = '#d8434a', BLACK = '#35303a';
    // the tail behind, ridged on top
    const tail: P[] = [[640, 470], [760, 500], [860, 480], [940, 420]];
    shape(band(tail, 90, 22), BODY, { angle: 20 });
    shape(spikes([[930, 400], [860, 440], [760, 455], [660, 430]], 2, 22), DEEP, { over: 0 }, {}, false);
    // the far legs, behind
    shape(band([[420, 560], [400, 650]], 54, 48), DEEP, { angle: 90 });
    shape(band([[640, 560], [660, 650]], 54, 48), DEEP, { angle: 90 });
    // the body, a pale tummy, little ridges along its back
    shape(potato(530, 500, 190, 105, 11, 0.04), BODY, { angle: 15, over: 0.5 });
    c.tint([[400, 560], [660, 565], [640, 600], [420, 598]], BELLY, { gap: 3.4, angle: 15 });
    shape(spikes([[700, 410], [600, 395], [480, 400], [400, 420]], 3, 26), DEEP, { over: 0 }, {}, false);
    // the near legs, short, little claws
    shape(band([[460, 580], [445, 680]], 62, 58), BODY, { angle: 90 });
    shape(band([[620, 580], [640, 680]], 62, 58), BODY, { angle: 90 });
    for (const [x, y] of [[425, 690], [450, 694], [620, 690], [645, 694]] as const) stroke([[x, y - 6], [x - 6, y + 14]], { w: 3.5 });
    // the stapler head: a silver lower jaw, staples for teeth, a red top pressed down in a grin
    shape([[110, 560], [140, 535], [420, 528], [470, 545], [470, 590], [400, 605], [150, 600], [105, 585]], METAL, { angle: 0, over: 0.2 });
    c.part('machoire', { pivot: [470, 520], motion: 'nod', amp: 12, period: 2.2 }, () => {
      shape([[95, 520], [120, 470], [300, 430], [430, 420], [490, 460], [480, 520], [380, 530], [140, 538]], RED, { angle: 10, over: 0.4 });
      stroke([[150, 480], [300, 446], [420, 440]], { w: 3.5, col: '#f2a0a4' });
      staples(c, 150, 410, 530, 26, 7, true);
      // the hinge at the back of its jaws
      shape(potato(470, 520, 30, 30, 9, 0.04), BLACK, { over: 0 });
      dot(470, 520, 8, 8, METAL);
      // nostrils at the tip
      dot(130, 470, 7, 5);
      dot(160, 462, 7, 5);
      // big eyes popping up on top, looking left
      shape(potato(320, 400, 56, 52, 9, 0.05), BODY, { angle: 80, over: 0 });
      shape(potato(410, 395, 60, 56, 9, 0.05), BODY, { angle: 80, over: 0 });
      c.paper(potato(312, 395, 32, 34, 8, 0.05));
      c.paper(potato(405, 388, 36, 38, 8, 0.05));
      dot(302, 400, 15, 20);
      dot(394, 393, 17, 22);
      dot(296, 390, 5, 6, '#ffffff');
      dot(387, 382, 5.5, 6.5, '#ffffff');
      stroke([[270, 355], [330, 366]], { w: 5 });
      stroke([[370, 352], [440, 345]], { w: 5.5 });
    });
  },
} satisfies Redraw;
