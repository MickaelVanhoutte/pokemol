import type { P, Redraw } from './crayon.ts';

/**
 * Rocailloux grown into a big armadillo, turned to the left and standing proud: its shell of grey stone plates has
 * grown into a little mountain, three peaks and snow on the highest. Once a year it sheds its old plates, which become
 * pebbles for the little Cailloutou. It keeps the family's grey stone and sandy head.
 */
export default {
  id: '040', slug: 'montagnoc', seed: 4091, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const STONE = '#a3a6ae', DEEP = '#7f838c', SAND = '#ecc9a4', SNOW = '#f4f6fb';
    // the tail and the far legs, behind
    c.part('queue', { pivot: [830, 720], motion: 'swing', amp: 7, period: 1.8, behind: true }, () => {
      shape(band([[820, 720], [920, 760], [960, 720]], 70, 30), SAND, { angle: 20 });
    });
    shape(band([[700, 740], [720, 860]], 74, 66), SAND, { angle: 90 });
    shape(band([[340, 740], [360, 860]], 74, 66), SAND, { angle: 90 });
    // the shell grown into a little mountain: three peaks, snow on the highest
    const shell: P[] = [[180, 780], [210, 620], [300, 530], [380, 390], [450, 470], [540, 230], [640, 440], [730, 350], [810, 520], [870, 700], [820, 800], [230, 810]];
    shape(shell, STONE, { angle: 60, over: 0.4 }, {}, false);
    shape([[474, 380], [540, 230], [606, 380], [570, 360], [540, 400], [508, 362]], SNOW, { angle: 30, over: 0 }, { w: 4 }, false);
    for (const x of [400, 560, 720]) stroke([[x - 10, 520], [x - 40, 660], [x - 30, 800]], { w: 6, col: DEEP });
    // the near legs
    shape(band([[460, 780], [450, 880]], 86, 78), SAND, { angle: 90 });
    shape(potato(446, 892, 60, 30, 8, 0.06), SAND, { angle: 10 });
    shape(band([[760, 780], [780, 880]], 86, 78), SAND, { angle: 90 });
    shape(potato(782, 892, 60, 30, 8, 0.06), SAND, { angle: 10 });
    // its sandy head held high: big ears, a long nose, a proud little grin
    shape([[320, 560], [300, 450], [360, 510]], SAND, { angle: 70 }, {}, false);
    shape([[250, 570], [210, 470], [276, 520]], SAND, { angle: 70 }, {}, false);
    const head: P[] = [[340, 600], [260, 570], [170, 610], [90, 690], [70, 740], [120, 764], [250, 766], [340, 720]];
    shape(head, SAND, { angle: 60, over: 0.3 });
    c.eye(180, 654, 22, 28);
    c.eye(262, 646, 30, 38);
    c.cheek(300, 712, 26, 16);
    dot(80, 730, 15, 12, '#9a5a4a');
    stroke([[128, 744], [166, 758], [206, 742]], { w: 5 });
    c.part('paupieres', { pivot: [220, 650], motion: 'blink', extra: true }, () => {
      c.lid(180, 654, 22, 28, SAND);
      c.lid(262, 646, 30, 38, SAND);
    });
  },
} satisfies Redraw;
