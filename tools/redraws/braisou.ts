import type { P, Redraw } from './crayon.ts';

/**
 * A little orange salamander lying low on its belly, turned to the left, head up, drawn after her drawing: a big round head with a wide
 * happy smile, and the two tall « ears » she drew are two flames, its collar of fire, a third little one in between.
 * It roasts its marshmallows on them. Smooth skin, big shiny eyes,  a cream belly, short splayed legs, a long tail.
 */
export default {
  id: '002', slug: 'braisou', seed: 2113, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const ORANGE = '#f2a04a', DEEP = '#de8636', CREAM = '#f8e8c4', FLAME = '#f6c63c', RED = '#e8502e', PINK = '#f28aa8';
    /** One flame from its root (x, y), pointing at `deg` (0 = up), `h` tall, `w` wide. */
    const flame = (x: number, y: number, deg: number, h: number, w: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
      const at = (px: number, py: number): P => [x + u[0] * py * h + v[0] * px * w, y + u[1] * py * h + v[1] * px * w];
      shape([at(-0.5, 0), at(-0.6, 0.4), at(-0.25, 0.62), at(-0.3, 0.8), at(0, 1), at(0.2, 0.7), at(0.5, 0.5), at(0.5, 0)], FLAME, { angle: deg + 90, over: 0 });
      c.tint([at(-0.28, 0.05), at(-0.3, 0.4), at(0, 0.7), at(0.26, 0.4), at(0.28, 0.05)], RED, { wash: 0.7 });
    };
    // the long tail lying out behind, its tip curling up (it swishes in battle)
    c.part('queue', { pivot: [800, 760], motion: 'swing', amp: 8, period: 1.8, behind: true }, () => {
      shape(band([[780, 760], [880, 770], [950, 720], [960, 640], [920, 610]], 86, 34), ORANGE, { angle: 20, over: 0.3 });
    });
    // the far legs, short, elbows out
    shape(band([[720, 780], [790, 800], [800, 860]], 54, 48), DEEP, { angle: 60 });
    shape(band([[470, 780], [420, 800], [400, 860]], 54, 48), DEEP, { angle: 60 });
    // the long body lying low on its belly, a cream underside
    shape(potato(610, 750, 230, 110, 12, 0.03), ORANGE, { angle: 10, over: 0.4 });
    c.tint(potato(600, 820, 170, 34, 10, 0.05), CREAM, { angle: 10, wash: 0.8 });
    // the near legs, short and splayed, round toes
    shape(band([[740, 800], [810, 840], [820, 890]], 60, 52), ORANGE, { angle: 60 });
    shape(potato(830, 896, 44, 24, 8, 0.06), ORANGE, { angle: 10 });
    shape(band([[500, 800], [440, 840], [430, 890]], 60, 52), ORANGE, { angle: 60 });
    shape(potato(420, 896, 44, 24, 8, 0.06), ORANGE, { angle: 10 });
    for (const x of [404, 428]) stroke([[x, 900], [x - 2, 918]], { w: 3.5 });
    // its collar of fire: two tall flames where she drew ears, a small one between (they flicker in battle)
    c.part('flammes', { pivot: [348, 431], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      flame(238, 440, -14, 212, 110);
      flame(422, 431, 12, 230, 120);
      flame(334, 413, 0, 138, 80);
    });
    // the big round head, smooth like a salamander's
    shape(potato(330, 560, 202, 166, 14, 0.03), ORANGE, { angle: 78, over: 0.45 });
    c.tint(potato(238, 634, 101, 52, 9, 0.08), CREAM, { angle: 60, wash: 0.6 });
    // big shiny eyes, two little nostrils, a wide happy smile, pink cheeks
    c.eye(247, 542, 33, 42);
    c.eye(370, 536, 42, 53);
    c.cheek(450, 615, 31, 18, PINK);
    dot(152, 578, 6, 5);
    dot(170, 573, 6, 5);
    stroke([[155, 624], [210, 658], [284, 661], [339, 643]], { w: 5 });
    c.part('paupieres', { pivot: [308, 538], motion: 'blink', extra: true }, () => {
      c.lid(247, 542, 33, 42, ORANGE);
      c.lid(370, 536, 42, 53, ORANGE);
    });
    // the tip of its tail is a little ember: a glowing tip with a small flame on it, the line's signature (it grows into
    // Braisaure's torch, then Dragobraise's ring of fire). Drawn last so her face keeps its strokes; it flickers in battle.
    c.part('braise', { pivot: [930, 630], motion: 'swing', amp: 4, period: 2.2, behind: true }, () => {
      c.tint(band([[958, 660], [946, 628], [922, 612]], 34, 28), RED, { angle: 30, wash: 0.75 });
      flame(922, 618, -14, 150, 84);
    });
  },
} satisfies Redraw;
