import type { Redraw } from './crayon.ts';

/**
 * Punaisette grown into a knight beetle: an armoured red shell studded with gold pin heads, a steel collar,
 * a long pin for a horn, wings open behind, a front leg raised to fight.
 */
export default {
  id: '090', slug: 'punaisaure', seed: 9001, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const RED = '#d8322f', METAL = '#aeb3c6', NAVY = '#33375f', GOLD = '#f2c230', SKY = '#cfe3f7';
    // the wings, open behind the shell: in battle they beat
    c.part('ailes', { pivot: [570, 370], motion: 'flap', amp: 12, period: 0.45, behind: true }, () => {
      paper([[570, 370], [640, 210], [760, 100], [880, 62], [935, 120], [890, 225], [770, 330], [630, 410]]);
      tint([[600, 360], [660, 220], [770, 120], [880, 85], [905, 130], [860, 220], [760, 320], [640, 390]], SKY, { gap: 3.6 });
      paper([[610, 410], [760, 340], [900, 312], [965, 370], [905, 445], [770, 470], [640, 460]]);
      tint([[640, 420], [770, 360], [895, 335], [940, 375], [895, 425], [770, 450], [650, 445]], SKY, { gap: 3.6 });
      for (const [x, y] of [[760, 110], [840, 160], [900, 360], [880, 430]] as const) stroke([[600, 390], [x, y]], { w: 3 });
    });
    // the far legs, behind
    shape(band([[560, 700], [610, 820], [600, 905]], 34, 26), NAVY, { angle: 90, over: 0 });
    shape(band([[720, 690], [790, 800], [820, 895]], 34, 26), NAVY, { angle: 90, over: 0 });
    shape(band([[400, 640], [380, 770], [340, 900]], 34, 26), NAVY, { angle: 90, over: 0 });
    // the shell: two armoured halves, gold pin heads
    shape([[430, 340], [560, 280], [720, 290], [850, 370], [910, 500], [890, 640], [800, 740], [640, 790], [500, 760], [430, 640], [410, 480]], RED, { angle: 70, over: 0.7, press: 1.15 });
    stroke([[500, 305], [640, 450], [760, 620], [830, 728]], { w: 6 });
    paper(potato(640, 350, 46, 18, 8, 0.06));
    for (const [x, y, r] of [[560, 600, 30], [660, 690, 26], [720, 430, 24], [820, 560, 24]] as const) {
      shape(potato(x, y, r, r * 0.92, 8, 0.05), GOLD, { over: 0, press: 1.1 });
      dot(x - r * 0.3, y - r * 0.3, r * 0.22, r * 0.18, '#ffffff');
    }
    // the steel collar, riveted
    shape([[330, 380], [400, 330], [485, 330], [525, 425], [508, 545], [440, 595], [362, 575], [318, 485]], METAL, { angle: 100, over: 0.5 });
    for (const [x, y] of [[372, 392], [462, 360], [490, 500], [400, 548]] as const) dot(x, y, 7, 7);
    // the head in front, a long pin for a horn
    shape(potato(238, 475, 114, 100, 10, 0.05), NAVY, { angle: 60, over: 0.5 });
    shape(band([[262, 395], [232, 280], [190, 160], [152, 62]], 60, 4), METAL, { angle: 75, over: 0.3 }, {}, false);
    stroke([[246, 360], [218, 270], [184, 170]], { w: 4, col: '#ffffff' });
    shape(potato(262, 392, 48, 22, 8, 0.05), GOLD, { over: 0 });
    // two hooked jaws
    shape(band([[150, 535], [100, 555], [92, 600]], 26, 8), METAL, { over: 0 });
    shape(band([[192, 568], [165, 605], [178, 642]], 26, 8), METAL, { over: 0 });
    // the near legs, jointed
    shape(band([[650, 760], [700, 850], [690, 935]], 42, 30), NAVY, { angle: 90, over: 0 });
    shape(band([[510, 730], [485, 835], [455, 935]], 42, 30), NAVY, { angle: 90, over: 0 });
    // the front leg raised to fight, a steel claw: in battle it jabs
    c.part('patte', { pivot: [390, 610], motion: 'swing', amp: 9, period: 1.5 }, () => {
      shape(band([[392, 610], [305, 692], [205, 652]], 44, 30), NAVY, { angle: 30, over: 0 });
      shape([[212, 640], [148, 612], [178, 652], [138, 676], [212, 668]], METAL, { over: 0 }, { w: 4 }, false);
    });
    // fierce yellow eyes, the far one smaller, frowning
    shape(potato(186, 462, 20, 26, 8, 0.04), GOLD, { over: 0, press: 1.2 }, { w: 4 });
    shape(potato(266, 455, 28, 34, 8, 0.04), GOLD, { over: 0, press: 1.2 }, { w: 4 });
    dot(181, 468, 9, 13);
    dot(259, 462, 12, 16);
    stroke([[156, 426], [210, 440]], { w: 7, col: '#f1e6ee' });
    stroke([[234, 432], [306, 408]], { w: 7, col: '#f1e6ee' });
  },
} satisfies Redraw;
