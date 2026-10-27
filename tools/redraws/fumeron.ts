import type { Redraw } from './crayon.ts';

/** A little puff of gas: a bumpy cloud. */
const cloud = (x: number, y: number, r: number): [number, number][] =>
  Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, q = r * (0.8 + 0.25 * Math.abs(Math.sin(a * 2.5)));
    return [x + Math.cos(a) * q, y + Math.sin(a) * q * 0.8] as [number, number];
  });

/** A floating ball of dark smog turned to the left: lumpy crater spots, a sly closed grin, puffs of gas leaking out. */
export default {
  id: '056', slug: 'fumeron', seed: 5601, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const PURPLE = '#7b5aa8', SPOT = '#b9a2d6', GAS = '#9fae86';
    // puffs of gas around it
    c.part('gaz', { pivot: [520, 520], motion: 'flicker', period: 2.6, behind: true }, () => {
      for (const [x, y, r] of [[830, 300, 62], [880, 620, 46], [200, 790, 54], [760, 830, 58]] as const) shape(cloud(x, y, r), GAS, { angle: 30, over: 0, press: 0.8 });
    });
    // the round body, its crater spots
    shape(potato(520, 520, 300, 290, 16, 0.04), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
    for (const [x, y, r] of [[700, 360, 40], [760, 560, 34], [620, 720, 46], [480, 300, 26], [330, 700, 30]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), SPOT, { over: 0 }, { w: 4 });
    // little vents puffing gas
    shape(potato(820, 470, 40, 34, 8, 0.1), PURPLE, { over: 0 }, { w: 4 });
    shape(potato(400, 230, 34, 30, 8, 0.1), PURPLE, { over: 0 }, { w: 4 });
    // the face, shifted left: a narrow far eye, a sly near eye, a closed grin
    c.paper(potato(290, 470, 26, 34, 8, 0.05));
    c.paper(potato(420, 465, 40, 44, 8, 0.05));
    dot(286, 478, 11, 16);
    dot(412, 474, 16, 20);
    stroke([[255, 430], [320, 445]], { w: 6 });
    stroke([[375, 440], [465, 420]], { w: 6.5 });
    stroke([[260, 580], [320, 605], [400, 600], [460, 570]], { w: 6 });
    c.paper([[300, 600], [312, 625], [325, 603]], {}, false);
    c.paper([[400, 598], [412, 623], [424, 595]], {}, false);
  },
} satisfies Redraw;
