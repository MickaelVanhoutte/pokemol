import type { P, Redraw } from './crayon.ts';

/** A glow-worm arching its back like an inchworm, turned to the left: plum rings, a little lamp for a tail. */
export default {
  id: '091', slug: 'lumiver', seed: 9101, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const PLUM = '#8a56b8', LILAC = '#b391dc', LAMP = '#ffd93a', GLOW = '#f2a91a';
    // its little feet: three in front, two big ones at the back
    for (const x of [300, 360, 410]) shape(band([[x, 720], [x - 6, 790]], 30, 26), PLUM, { angle: 90, over: 0 });
    shape(band([[740, 680], [745, 790]], 40, 34), PLUM, { angle: 90, over: 0 });
    // the lamp at the end of its tail
    shape(potato(805, 700, 88, 82, 10, 0.04), LAMP, { angle: 60, over: 0.3, press: 0.95 });
    paper(potato(830, 670, 22, 14, 7, 0.06));
    // the rings, from the tail to the head, arching up in the middle
    const rings: [number, number, number][] = [[760, 600, 70], [715, 505, 74], [640, 440, 80], [550, 418, 82], [460, 445, 84], [380, 520, 86]];
    rings.forEach(([x, y, r], i) => {
      shape(potato(x, y, r, r * 0.95, 9, 0.05), i % 2 ? LILAC : PLUM, { angle: 70 + i * 8, over: 0.4 });
      stroke([[x - r * 0.5, y - r * 0.55], [x - r * 0.15, y - r * 0.75]] as P[], { w: 3.5 });
    });
    // the round head, low in front
    shape(potato(285, 630, 118, 106, 11, 0.04), PLUM, { angle: 60, over: 0.5 });
    // short antennae: in battle they wiggle
    c.part('antennes', { pivot: [285, 530], motion: 'swing', amp: 12, period: 1.5, behind: true }, () => {
      stroke([[270, 535], [235, 470], [205, 440]], { w: 5 });
      dot(202, 436, 13, 13, LAMP);
      stroke([[305, 530], [320, 460], [305, 420]], { w: 5 });
      dot(303, 416, 13, 13, LAMP);
    });
    // big sleepy-sweet eyes, the far one smaller, pink cheeks, a smile
    paper(potato(232, 610, 26, 36, 8, 0.04));
    paper(potato(318, 604, 34, 44, 8, 0.04));
    dot(229, 618, 13, 20);
    dot(313, 612, 17, 24);
    dot(224, 606, 5, 6, '#ffffff');
    dot(306, 598, 6, 7, '#ffffff');
    tint(potato(360, 668, 22, 13, 7, 0.1), '#f29ac8', { gap: 3 });
    stroke([[238, 676], [270, 694], [305, 684]], { w: 4.5 });
    // in battle its lamp shines now and then
    c.part('lueur', { pivot: [805, 700], motion: 'flicker', period: 2.2, behind: true, extra: true }, () => {
      tint(potato(805, 700, 150, 140, 12, 0.05), '#fff2a0', { gap: 4, wash: 0.5, over: 0 });
      for (let k = 0; k < 9; k++) {
        const a = -Math.PI * 0.95 + (k / 8) * Math.PI * 1.3;
        stroke([[805 + Math.cos(a) * 115, 700 + Math.sin(a) * 108], [805 + Math.cos(a) * 165, 700 + Math.sin(a) * 155]], { w: 6, col: GLOW });
      }
    });
  },
} satisfies Redraw;
