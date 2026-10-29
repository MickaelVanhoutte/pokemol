import type { P, Redraw } from './crayon.ts';

/**
 * A little puppy made of soft pink eraser, turned to the left, like the cute shaped erasers children keep in
 * their pencil case: a rounded block for a body with its blue paper sleeve, floppy ears, big round eyes, the
 * top of its head rubbed flat from use, and a little fist up, wrapped like a boxer's (it corrects things, it
 * doesn't rub them out). Eraser crumbs at its feet.
 */
export default {
  id: '110', slug: 'gommichon', seed: 11003, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f7b2c4', DEEP = '#e8879f', SLEEVE = '#5b8fe8', CHEEK = '#f27f9c';
    // the far ear and a little tail, behind
    shape([[200, 290], [120, 360], [110, 480], [170, 500], [230, 400]], DEEP, { angle: 70 });
    c.part('queue', { pivot: [830, 560], motion: 'swing', amp: 16, period: 1.1, behind: true }, () => {
      shape(potato(870, 540, 44, 36, 8, 0.08), PINK, { angle: 40 });
    });
    // stubby legs, the far ones behind
    shape(potato(500, 850, 52, 46, 8, 0.06), DEEP, { angle: 90 });
    shape(potato(800, 830, 50, 44, 8, 0.06), DEEP, { angle: 90 });
    // the body: a soft eraser block with rounded corners
    const body: P[] = [[430, 470], [600, 450], [780, 455], [850, 520], [858, 700], [820, 800], [640, 830], [470, 830], [410, 740]];
    shape(body, PINK, { angle: 80, over: 0.45 });
    // its blue paper sleeve, a white star drawn on it
    shape([[560, 452], [700, 450], [712, 820], [575, 830]], SLEEVE, { angle: 0, over: 0.3 }, {}, false);
    const star: P[] = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 18 : 42;
      return [636 + Math.cos(a) * r, 620 + Math.sin(a) * r];
    });
    shape(star, '#ffffff', { over: 0, wash: 1 }, { w: 3.5 }, false);
    // the near legs
    shape(potato(580, 860, 56, 48, 8, 0.06), PINK, { angle: 90 });
    shape(potato(760, 860, 56, 48, 8, 0.06), PINK, { angle: 90 });
    // the head, a rounded block too, its top rubbed flat and smudgy
    const head: P[] = [[170, 340], [250, 250], [440, 240], [530, 300], [545, 500], [490, 590], [250, 605], [165, 530]];
    shape(head, PINK, { angle: 78, over: 0.45 });
    stroke([[200, 300], [235, 268]], { w: 3.5 });
    stroke([[215, 318], [258, 280]], { w: 3.5 });
    // the near floppy ear
    shape([[440, 250], [540, 260], [600, 360], [580, 470], [520, 450], [500, 340]], DEEP, { angle: 70 });
    // big round shiny eyes (the far one smaller), cheeks, a little nose and a happy mouth
    for (const [x, y, rx, ry] of [[255, 410, 34, 42], [405, 400, 46, 54]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
    }
    shape(potato(205, 495, 30, 18, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(480, 490, 38, 22, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(325, 478, 20, 14, 7, 0.06), '#c45a78', { over: 0 }, { w: 3.5 });
    stroke([[285, 515], [308, 535], [328, 505], [350, 535], [376, 515]], { w: 4.5 });
    // the little fist up, wrapped in white tape like a boxer's: in battle it jabs
    c.part('poing', { pivot: [470, 690], motion: 'reach', amp: -18, period: 1.2 }, () => {
      shape(band([[480, 690], [400, 700], [340, 690]], 60, 54), PINK, { angle: 20 });
      shape(potato(310, 682, 50, 46, 9, 0.06), PINK, { angle: 60, over: 0.3 });
      shape([[300, 645], [340, 650], [345, 720], [305, 722]], '#ffffff', { over: 0, wash: 1 }, { w: 3.5 }, false);
      stroke([[302, 668], [342, 672]], { w: 3 });
      stroke([[303, 694], [343, 696]], { w: 3 });
    });
    // eraser crumbs at its feet
    for (const [x, y] of [[230, 880], [280, 905], [880, 880], [920, 860], [840, 912]] as const) {
      shape([[x - 16, y], [x - 6, y - 10], [x + 14, y - 6], [x + 16, y + 6], [x - 4, y + 10]], PINK, { over: 0 }, { w: 3 });
    }
  },
} satisfies Redraw;
