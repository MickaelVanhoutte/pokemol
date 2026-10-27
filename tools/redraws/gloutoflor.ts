import type { P, Redraw } from './crayon.ts';

/**
 * Clochegueule grown: a huge pitcher turned to the left under a jagged leaf hood, long vines coiled all
 * round it like whips, big serrated leaves, a flytrap jaw of fangs clenched shut, a fierce glare.
 */
export default {
  id: '064', slug: 'gloutoflor', seed: 6403, size: [1100, 1100], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const YELLOW = '#efc22c', GREEN = '#3f9a2a', BROWN = '#8a5a2c', RED = '#d8456a';
    // a point along a path, t from 0 to 1
    const along = (path: P[], t: number): P => {
      const f = t * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), k = f - i;
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
    };
    // vines coiled behind: one above the hood, one out to the right, one low on the left; the far leaf
    c.part('lianes', { pivot: [560, 620], motion: 'swing', amp: 4, period: 2.6, behind: true }, () => {
      shape(band([[700, 340], [770, 210], [870, 130], [975, 140], [1015, 230], [970, 295], [905, 270], [915, 215]], 46, 20), GREEN, { angle: 60 });
      shape(band([[790, 660], [940, 680], [1040, 780], [1030, 900], [950, 930], [910, 875], [950, 840]], 42, 18), GREEN, { angle: 120 });
      shape(band([[380, 860], [250, 900], [150, 860], [130, 770], [190, 730], [235, 775], [205, 810]], 40, 16), GREEN, { angle: 30 });
    });
    shape([[340, 660], [220, 590], [80, 565], [140, 635], [70, 675], [200, 715], [120, 755], [330, 735]], GREEN, { angle: 20, press: 1.1 }, {}, false);
    stroke([[330, 690], [110, 620]], { w: 3 });
    // the huge pitcher, round, its point at the bottom, brown spots
    shape([[290, 450], [380, 340], [550, 300], [730, 330], [830, 450], [850, 620], [800, 790], [700, 920], [600, 990], [545, 1050], [505, 985], [400, 900], [310, 760], [270, 600]], YELLOW, { angle: 80, over: 0.6, press: 1.05 });
    for (const [x, y, r] of [[730, 520, 30], [760, 690, 26], [660, 850, 28], [520, 900, 22], [640, 720, 18]] as const) shape(potato(x, y, r, r * 0.8, 8, 0.1), BROWN, { over: 0 }, { w: 3.5 });
    // the flytrap jaw clenched shut, its corners down, long fangs crossing
    const jaw: P[] = [[280, 640], [350, 600], [460, 588], [580, 595], [680, 612], [740, 655]];
    stroke(jaw.map(([x, y]) => [x, y + 8] as P), { w: 8, col: RED });
    stroke(jaw.map(([x, y]) => [x, y - 7] as P), { w: 6, col: RED });
    for (let k = 0; k < 9; k++) {
      const [x, y] = along(jaw, 0.07 + k * 0.107), down = k % 2 ? 1 : -1;
      c.paper([[x - 16, y - down * 6], [x + 3, y + down * 54], [x + 16, y - down * 6]], { w: 3.5 }, false);
    }
    stroke(jaw, { w: 6.5 });
    // the jagged leaf hood, its tip hanging over the face
    shape(spikes([[200, 430], [330, 330], [520, 260], [720, 270], [880, 360]], 2, -30).concat([[820, 400], [640, 385], [460, 410], [320, 460], [215, 455]] as P[]), GREEN, { angle: 30, press: 1.15, over: 0.4 }, {}, false);
    stroke([[230, 440], [440, 360], [680, 320], [850, 370]], { w: 3 });
    // a fierce glare under the hood
    c.paper(potato(355, 515, 22, 24, 8, 0.05));
    c.paper(potato(475, 505, 30, 30, 8, 0.05));
    dot(352, 521, 10, 12);
    dot(470, 511, 13, 14);
    stroke([[318, 484], [380, 503]], { w: 6.5 });
    stroke([[432, 492], [515, 473]], { w: 7 });
    // the near leaf, big and serrated
    c.part('feuille', { pivot: [765, 750], motion: 'swing', amp: 6, period: 2 }, () => {
      shape([[760, 700], [900, 630], [1070, 625], [1010, 690], [1085, 735], [990, 760], [1040, 805], [890, 810], [770, 790]], GREEN, { angle: 160, press: 1.1 }, {}, false);
      stroke([[780, 750], [1040, 700]], { w: 3 });
    });
  },
} satisfies Redraw;
