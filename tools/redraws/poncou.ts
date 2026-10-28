import type { P, Redraw } from './crayon.ts';

/**
 * A little hedgehog whose back is a sheet of sandpaper, turned to the left: short rough spines all along it,
 * specks of grit, the edge torn where it was cut; a cream face with a pointed snout, beady eyes, tiny feet.
 * It sniffs about.
 */
export default {
  id: '105', slug: 'poncou', seed: 10509, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, tint, potato, spikes, rnd } = c;
    const SAND = '#d9b77a', GRIT = '#7a5a30', CREAM = '#f4e2b4', PINK = '#f29ac8', FUR = '#b98a55';
    // the far feet, behind
    for (const x of [420, 640]) shape(potato(x, 720, 34, 22, 8, 0.06), FUR, { over: 0 });
    // the body under the sandpaper
    shape(potato(530, 600, 250, 140, 11, 0.04), FUR, { angle: 70, over: 0.3 });
    // its back, a sheet of sandpaper bristling with short spines
    const ridge: P[] = [[800, 650], [770, 500], [670, 395], [530, 360], [400, 395], [320, 480]];
    const back = spikes(ridge, 4, 46).concat([[360, 560], [470, 520], [620, 530], [740, 600]]);
    shape(back, SAND, { angle: 40, over: 0.5 });
    // specks of grit all over it
    for (let k = 0; k < 70; k++) {
      const x = 380 + rnd() * 400, y = 400 + rnd() * 220;
      const inside = ((x - 560) / 240) ** 2 + ((y - 520) / 150) ** 2 < 0.8 && y < 590 - (x - 560) * 0.05;
      if (inside) dot(x, y, 2.5 + rnd() * 2.5, 2 + rnd() * 2, GRIT);
    }
    // the torn edge where the sheet was cut
    stroke([[360, 560], [385, 540], [400, 556], [425, 532], [445, 548], [470, 520]], { w: 3.5 }, false);
    // the near feet
    for (const x of [470, 700]) shape(potato(x, 735, 40, 26, 8, 0.06), FUR, { over: 0 });
    // its head and pointed snout: in battle it sniffs
    c.part('tete', { pivot: [400, 580], motion: 'nod', amp: 7, period: 2.4 }, () => {
      shape([[410, 520], [420, 640], [330, 690], [240, 680], [160, 640], [185, 610], [260, 560], [340, 520]], CREAM, { angle: 30, over: 0.3 });
      dot(160, 630, 16, 13);
      dot(155, 625, 4, 3, '#ffffff');
      tint(potato(305, 645, 24, 14, 7, 0.1), PINK, { gap: 3 });
      // beady eyes, the far one smaller
      dot(255, 585, 9, 12);
      dot(318, 578, 13, 16);
      dot(314, 572, 4, 5, '#ffffff');
      stroke([[200, 660], [235, 668]], { w: 4 });
      // a little ear
      shape(potato(385, 520, 26, 30, 7, 0.06), FUR, { over: 0 });
    });
    // only in battle: puffs of sand round its feet
    c.part('sable', { pivot: [500, 760], motion: 'flicker', period: 2.2, extra: true }, () => {
      for (const [x, y, s] of [[300, 770, 1], [820, 760, 0.9], [580, 800, 0.7]] as const) {
        shape(potato(x, y, 50 * s, 26 * s, 9, 0.12), SAND, { over: 0, press: 0.7 });
        for (let k = 0; k < 5; k++) dot(x + (rnd() - 0.5) * 70 * s, y + (rnd() - 0.5) * 30 * s, 3, 3, GRIT);
      }
    });
  },
} satisfies Redraw;
