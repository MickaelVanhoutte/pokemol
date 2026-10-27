import type { Redraw } from './crayon.ts';

/** A red llama-unicorn trotting: blue curly mane and tail, a flower on its side, a horn shooting a rainbow. */
export default {
  id: '014', slug: 'lamacorne', seed: 1414, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const RED = '#ec4a3a', BLUE = '#3d6fd8', GREEN = '#86cf4a', YELLOW = '#f7d33a', BLACK = '#3a3440';
    // the rainbow from the horn
    const RB = ['#ef5350', '#f7a530', '#f7d21e', '#5cb33c', '#4a92e0', '#8a6cd0'];
    c.part('arc', { pivot: [770, 110], motion: 'flicker', period: 2.6, behind: true }, () => {
      RB.forEach((col, i) => stroke([[760 + i * 4, 120 - i * 10], [800 + i * 2, 60 - i * 12], [860, 40 - i * 10], [930, 60 - i * 8]], { col, w: 9 }));
    });
    // legs at a trot, black hooves
    shape(band([[300, 690], [270, 820], [230, 900]], 64, 56), RED, { angle: 75 });
    shape(band([[400, 700], [410, 830], [420, 910]], 64, 56), RED, { angle: 90 });
    shape(band([[600, 700], [640, 820], [690, 890]], 64, 56), RED, { angle: 100 });
    shape(band([[690, 690], [700, 820], [710, 910]], 64, 56), RED, { angle: 90 });
    for (const [x, y] of [[225, 915], [420, 925], [695, 905], [712, 925]]) shape(potato(x, y, 40, 22, 7, 0.06), BLACK, { over: 0 }, { w: 3.5 });
    // a curly blue tail
    c.part('queue', { pivot: [235, 505], motion: 'swing', amp: 10, period: 1.5, behind: true }, () => {
      shape([[230, 470], [160, 430], [110, 470], [130, 520], [100, 560], [150, 590], [230, 540]], BLUE, { angle: 60, press: 1.1 });
    });
    // the boxy body, a flower on its side
    shape([[240, 450], [600, 440], [740, 470], [760, 620], [720, 720], [270, 720], [230, 600]], RED, { angle: 85, over: 0.7, press: 1.05 });
    for (const [x, y] of [[360, 545], [420, 520], [450, 585], [395, 625], [330, 600]]) shape(potato(x, y, 38, 34, 8, 0.08), GREEN, { over: 0 }, { w: 4 });
    shape(potato(390, 570, 36, 34, 9, 0.05), YELLOW, { over: 0, press: 1.1 }, { w: 4 });
    // the long neck and head
    shape([[620, 470], [640, 300], [680, 200], [760, 170], [870, 200], [880, 260], [790, 290], [740, 330], [745, 480]], RED, { angle: 80, over: 0.5 });
    // blue curly mane down the neck
    for (let i = 0; i < 5; i++) shape(potato(625 - i * 4, 230 + i * 55, 32, 30, 8, 0.1), BLUE, { over: 0, angle: 80 }, { w: 4 });
    // the horn, ears, eye, smile
    shape([[750, 175], [770, 70], [800, 175]], BLUE, { angle: 80, press: 1.1, over: 0 }, {}, false);
    shape([[700, 190], [690, 130], [735, 175]], RED, { over: 0 }, {}, false);
    c.paper(potato(780, 220, 24, 20, 8, 0.05));
    dot(785, 222, 11, 12);
    stroke([[820, 262], [860, 255]], { w: 4 });
  },
} satisfies Redraw;
