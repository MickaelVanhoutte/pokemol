import type { Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { TOAD, puff, toadFoot, wart } from './crapougne.ts';

/**
 * Fumeron grown into the lord of the fog (« seigneur du brouillard »), turned to the left: a big heavy toad sitting up
 * tall and still, chin raised, eyeing you from under heavy lids, its huge wide mouth shut in a knowing line. The warts on
 * its head have swollen into a crown of poison glands; dark mist puffs out of them and rolls round its feet.
 */
export default {
  id: '057', slug: 'brumapaud', seed: 5701, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato, band } = c;
    const { SKIN, DEEP, BELLY, SMOG } = TOAD;

    // the dark mist pouring from its glands down its back and swirling round its feet
    c.part('brume-fond', { pivot: [560, 860], motion: 'swing', amp: 1, period: 4.4, behind: true }, () => {
      for (const [x, y, r] of [[760, 880, 86], [900, 800, 66], [190, 900, 70]] as const) shape(puff(x, y, r, 6), SMOG, { angle: 20, over: 0.25 }, { w: 4.5, col: TOAD.WART2 });
    });
    // the far front leg planted
    shape(band([[300, 640], [272, 780], [262, 850]], 76, 64), DEEP, { angle: 85 });
    toadFoot(c, 256, 864, 6, 1.15, DEEP);
    // the tall heavy body, chest out, a pale throat and chest
    shape([[270, 560], [310, 440], [420, 380], [580, 370], [720, 430], [810, 560], [830, 720], [790, 840], [660, 890], [470, 900], [330, 860], [262, 720]], SKIN, { angle: 80, over: 0.5 });
    c.tint(potato(400, 640, 110, 200, 12, 0.04), BELLY, { angle: 80, wash: 0.9 });
    for (const [x, y, r] of [[650, 540, 28], [740, 660, 32], [630, 680, 22], [740, 790, 22]] as const) wart(c, x, y, r);
    // the near hind leg folded on the flank, its foot forward
    openLimb(c, [[800, 730], [680, 710], [600, 790], [620, 870], [720, 896], [820, 850]], SKIN, 1, 5);
    toadFoot(c, 610, 900, 0, 1.2, SKIN);
    // the near front leg planted straight down from the shoulder
    openLimb(c, [[500, 560], [430, 600], [400, 720], [392, 850], [446, 866], [476, 740], [540, 640]], SKIN, 1, 5);
    toadFoot(c, 404, 880, 0, 1.2, SKIN);
    // the wide flat head, chin up
    shape([[110, 372], [134, 290], [226, 220], [380, 180], [530, 190], [620, 246], [652, 336], [624, 420], [530, 470], [380, 490], [226, 472], [130, 432]], SKIN, { angle: 30, over: 0.5 });
    c.tint([[120, 400], [226, 462], [380, 484], [520, 462], [400, 440], [230, 420]], BELLY, { wash: 0.85 });
    // its crown: the warts on top of its head swollen into a ridge of big poison glands, smoking
    shape(band([[330, 196], [440, 150], [570, 158], [660, 222], [690, 300]], 64, 52), SKIN, { angle: 30, over: 0.3 });
    for (const [x, y, r] of [[350, 176, 22], [430, 140, 28], [516, 132, 34], [600, 160, 34], [664, 222, 30], [690, 296, 24]] as const) wart(c, x, y, r);
    // the eyes bulging on top, heavy-lidded, looking down at you
    shape(potato(262, 236, 54, 46, 9, 0.05), SKIN, { angle: 60, over: 0 });
    shape(potato(420, 206, 72, 60, 9, 0.05), SKIN, { angle: 60, over: 0 });
    c.eye(262, 246, 28, 28, TOAD.EYE, { lid: 0.56, skin: SKIN, tilt: 14 });
    c.eye(422, 218, 40, 38, TOAD.EYE, { lid: 0.56, skin: SKIN, tilt: -10 });
    stroke([[220, 196], [300, 218]], { w: 9 });
    stroke([[366, 186], [470, 166]], { w: 9 });
    c.dot(132, 326, 8, 6);
    // the huge wide mouth from the snout right back under the gland, shut in a knowing line, one corner up
    stroke([[112, 386], [200, 404], [340, 424], [480, 428], [586, 414], [632, 384]], { w: 8 });
    c.cheek(590, 360, 30, 16, TOAD.PINK);
    c.part('brume', { pivot: [600, 160], motion: 'swing', amp: 2, period: 4 }, () => {
      // dark puffs rising from the glands and rolling back over its shoulder
      for (const [x, y, r] of [[560, 70, 40], [700, 90, 50], [830, 170, 60], [880, 330, 54]] as const) shape(puff(x, y, r, 6), SMOG, { angle: 20, over: 0.25 }, { w: 4.5, col: TOAD.WART2 });
    });
    // and rolling round in front of its feet
    c.part('brume-devant', { pivot: [400, 930], motion: 'swing', amp: 1.5, period: 4.4 }, () => {
      for (const [x, y, r, k] of [[300, 930, 64, 1], [500, 944, 72, 2]] as const) shape(puff(x, y, r, k), SMOG, { angle: 30, over: 0.25 }, { w: 4.5, col: TOAD.WART2 });
    });
  },
} satisfies Redraw;
