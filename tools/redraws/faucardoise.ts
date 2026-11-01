import type { P, Redraw } from './crayon.ts';

/**
 * A falcon of slate (« fier chasseur »), turned to the left, diving: wings folded tight, it drops head first on its prey
 * like a falling stone, the fastest thing in the sky. Its wings and breast are armoured with faceted, cracked stone plates
 * (feathers only at the wing tips), its yellow toes clenched in a fist swept back along its belly, its proud eyes fixed
 * on what it hunts.
 */
export default {
  id: '050', slug: 'faucardoise', seed: 5023, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot } = c;
    const SLATE = '#76849e', DEEP = '#55627c', PALE = '#dfe3ea', CAP = '#3e4860', YELLOW = '#f4c23a', STONE = '#b6c0d2';

    const deg = -38;
    const r = (deg * Math.PI) / 180, [ox, oy] = [500, 500];
    /** The bird is drawn level, facing left, then tipped head down into the dive. */
    const T = ([x, y]: P): P => [ox + (x - ox) * Math.cos(r) - (y - oy) * Math.sin(r), oy + (x - ox) * Math.sin(r) + (y - oy) * Math.cos(r)];
    const t = (pts: P[]) => pts.map(T);
    /** A faceted stone plate (local points), a crack running across it and a light top edge. */
    const plate = (pts: P[], col: string, crack: P[]) => {
      shape(t(pts), col, { angle: deg + 30, over: 0, press: 1.2, wash: 0.8 }, { w: 5 }, false);
      stroke(t(crack), { w: 4, col: CAP }, false);
      c.shine(t([pts[0], pts[1]]).map(([x, y]): P => [x + 3, y + 5]), 5);
    };
    /** The head (local frame) drawn half again as big round (240, 500). */
    const big = ([x, y]: P): P => T([240 + (x - 240) * 1.5, 500 + (y - 500) * 1.5]);
    const b = (pts: P[]) => pts.map(big);

    // speed lines streaming behind it (screen space, up and to the right)
    for (const [x, y, l] of [[760, 120, 150], [860, 260, 120], [640, 60, 100]] as const) stroke([[x, y], [x + l * Math.cos(-r), y - l * Math.sin(-r)]], { w: 5 });
    // the far wing, a sliver above the back
    shape(t([[380, 420], [520, 360], [720, 380], [960, 420], [720, 420], [520, 430]]), DEEP, { angle: deg, over: 0.3 });
    // the tail, narrow and closed
    shape(t([[740, 470], [920, 466], [950, 500], [920, 534], [740, 530]]), DEEP, { angle: deg, over: 0.3 });
    // the body: a teardrop from the head to the tail
    shape(t([[290, 430], [420, 396], [600, 420], [770, 466], [770, 530], [600, 580], [440, 604], [300, 590]]), SLATE, { angle: deg, over: 0.4 });
    // its breast armoured with pale stone plates, cracked
    plate([[330, 540], [420, 548], [430, 600], [340, 596]], PALE, [[360, 556], [380, 574], [372, 592]]);
    plate([[430, 546], [530, 548], [520, 590], [440, 600]], PALE, [[480, 552], [470, 572], [490, 588]]);
    plate([[536, 540], [640, 528], [610, 566], [530, 586]], PALE, [[580, 540], [590, 560]]);
    // its feet: three yellow toes clenched in a fist, swept back along the belly, black talons curled
    shape(t([[500, 586], [560, 610], [610, 618], [620, 640], [590, 652], [540, 640], [496, 614]]), YELLOW, { angle: deg, over: 0 });
    for (const [x, y] of [[566, 640], [592, 648], [616, 640]] as P[]) shape(t([[x - 10, y - 4], [x + 8, y + 18], [x - 8, y + 26], [x - 4, y + 12]]), CAP, { over: 0 }, { w: 3 }, false);
    stroke(t([[560, 618], [556, 640]]), { w: 3.5 });
    stroke(t([[588, 624], [584, 648]]), { w: 3.5 });
    // the near wing folded tight along the body: stone plates along its leading edge, feathers only at its tips
    c.part('aile', { pivot: T([400, 470]), motion: 'swing', amp: 2, period: 1.6 }, () => {
      for (const [y0, len] of [[452, 980], [470, 940], [488, 890]] as const) shape(t([[700, y0 - 16], [len, y0 + 2], [700, y0 + 22]]), DEEP, { angle: deg, over: 0 }, { w: 4 }, false);
      shape(t([[340, 456], [420, 412], [580, 404], [740, 430], [760, 460], [740, 496], [580, 510], [420, 516]]), SLATE, { angle: deg, over: 0.3 });
      plate([[360, 448], [440, 414], [470, 470], [390, 494]], STONE, [[410, 430], [420, 456], [404, 476]]);
      plate([[446, 412], [560, 404], [570, 462], [476, 470]], STONE, [[500, 410], [516, 440], [506, 462]]);
      plate([[566, 404], [690, 424], [670, 476], [576, 464]], STONE, [[620, 414], [610, 444], [630, 466]]);
      plate([[476, 474], [600, 468], [590, 508], [470, 512]], DEEP, [[530, 474], [540, 496]]);
    });
    // the head, half again as big: a dark cap, a pale cheek, the dark stripe down the cheek, a hooked beak
    shape(b([[120, 506], [170, 440], [250, 410], [330, 424], [350, 480], [340, 560], [280, 596], [200, 590], [150, 556]]), SLATE, { angle: deg + 60, over: 0.3 });
    c.tint(b([[146, 500], [200, 470], [300, 466], [340, 520], [320, 570], [270, 592], [190, 584], [146, 550]]), PALE, { wash: 0.85 });
    shape(b([[124, 490], [170, 434], [250, 410], [336, 426], [352, 490], [330, 520], [300, 470], [250, 462], [180, 470], [140, 500]]), CAP, { angle: deg, over: 0 });
    // the dark stripe down its cheek, under the eye
    shape(b([[222, 516], [244, 516], [246, 562], [234, 586], [224, 554]]), CAP, { over: 0 }, { w: 3 });
    // the beak: yellow at the base, a big dark hook curling down at the tip
    shape(b([[150, 470], [120, 472], [96, 484], [80, 506], [82, 534], [94, 522], [110, 514], [150, 528]]), YELLOW, { over: 0 });
    shape(b([[96, 484], [80, 506], [82, 534], [92, 516], [100, 500]]), CAP, { over: 0 }, { w: 3 });
    stroke(b([[110, 514], [146, 512]]), { w: 4 });
    dot(...big([132, 488]), 5, 5);
    // proud: the eye open, looking ahead down the dive, a firm brow along the cap
    // its head is in profile: only the near eye shows (the far one is hidden behind the beak's bridge)
    const e2 = big([240, 490]);
    c.eye(...e2, 36, 42, '#241c38', { lid: 0.3, skin: PALE, tilt: deg });
    stroke(b([[200, 462], [282, 464]]), { w: 10 });
    c.part('paupieres', { pivot: e2, motion: 'blink', extra: true }, () => {
      c.lid(...e2, 36, 42, PALE);
    });
  },
} satisfies Redraw;
