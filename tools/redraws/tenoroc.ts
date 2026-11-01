import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { PIKA, pikaHead, rock, scallop, song } from './sifflou.ts';

/**
 * Chantouille grown into a great tenor (« ténor »), turned to the left: a tall pika standing on top of its rock pile,
 * its chest thrown out, one arm flung wide, head back and eyes shut, singing so loud the pebbles roll down. Its cheek
 * fluff has grown into a great cloud-soft ruff round its neck that puffs out with its voice; a round belly, short stocky
 * legs.
 */
export default {
  id: '047', slug: 'tenoroc', seed: 4711, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const { FUR, DEEP, CREAM } = PIKA, CLOUD = '#e9e0fb', SHADE = '#bfb0ea';

    /** The great ruff round its neck at (cx, cy): its cream chest fur grown into a soft cloud of big puffs that swells
     * with its song, a rose shade under each puff. */
    const ruff = (cx: number, cy: number, rx: number, ry: number) => {
      shape(scallop(cx, cy, rx, ry, -20, 340, 9, 0.24), CLOUD, { angle: 60, over: 0.3, wash: 1 });
      c.tint(scallop(cx + 10, cy + ry * 0.25, rx * 0.84, ry * 0.66, 0, 180, 5, 0.22), SHADE, { wash: 0.75 });
    };
    /** Pebbles bouncing down the rock, a little arc behind each. */
    const pebbles = (list: [number, number, number][]) => {
      c.part('cailloux', { pivot: list[0].slice(0, 2) as P, motion: 'nod', amp: 4, period: 1.4, decor: true }, () => {
        for (const [x, y, r] of list) {
          shape(potato(x, y, r, r * 0.8, 8, 0.08), PIKA.ROCK2, { angle: 30, over: 0 });
          stroke([[x - r * 1.6, y - r * 1.9], [x - r * 2.4, y - r * 1.2], [x - r * 2.9, y - r * 0.2]], { w: 4 });
        }
      });
    };

    // standing tall on its rock pile, chest out, one arm flung wide, head back in full song
    rock(c, [[110, 960], [150, 890], [260, 850], [420, 832], [600, 838], [760, 870], [870, 924], [890, 960]], [[140, 950], [400, 910], [700, 918], [880, 955]]);
    pebbles([[830, 810, 24], [910, 884, 18]]);
    // short stocky legs under a round belly
    shape(c.band([[610, 760], [620, 820], [624, 856]], 100, 92), DEEP, { angle: 90 });
    shape(potato(640, 862, 66, 26, 8, 0.05), DEEP, { angle: 10 });
    shape([[350, 620], [380, 520], [470, 460], [600, 460], [700, 530], [740, 650], [720, 760], [640, 830], [520, 846], [420, 810], [360, 730]], FUR, { angle: 80, over: 0.45 });
    c.tint(potato(480, 690, 120, 140, 10, 0.05), CREAM, { angle: 80, wash: 0.85 });
    openLimb(c, [[560, 740], [470, 750], [420, 810], [412, 856], [500, 864], [540, 816], [580, 780]], FUR, 1, 5);
    shape(potato(440, 866, 70, 26, 8, 0.05), FUR, { angle: 10 });
    ruff(510, 380, 300, 230);
    const { mouth } = pikaHead(c, 450, 300, 0.86, 38, 'belt', 1.25);
    // the arm flung out wide and high, the paw open
    c.part('bras', { pivot: [470, 530], motion: 'swing', amp: 3, period: 2.4 }, () => {
      openLimb(c, [[500, 500], [400, 480], [290, 420], [170, 330], [150, 366], [270, 466], [380, 540], [480, 560]], FUR, 1, 6);
      shape(potato(156, 344, 40, 32, 8, 0.06), FUR, { angle: 40 });
    });
    c.part('chant', { pivot: mouth, motion: 'nod', amp: 3, period: 2.2, decor: true }, () => song(c, mouth, -66, 3, 1));
  },
} satisfies Redraw;
