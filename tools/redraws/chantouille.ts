import type { Redraw } from './crayon.ts';

/** A round pink singer, three-quarters to the left: two pointy ears, a curl on top, big shiny eyes, a green microphone. */
export default {
  id: '005', slug: 'chantouille', seed: 506, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f6a7c8', DEEP = '#e26fa2', GREEN = '#6cc23e', GREY = '#8a8494';
    // far foot, far ear behind
    shape(potato(610, 900, 66, 32, 8, 0.06), PINK, { angle: 10 });
    shape([[330, 300], [300, 120], [420, 240]], PINK, { angle: 70 }, {}, false);
    shape([[340, 260], [318, 165], [380, 235]], DEEP, { over: 0 }, { w: 3.5 }, false);
    // the round body, turned left
    shape(potato(520, 560, 290, 330, 14, 0.04), PINK, { angle: 80, over: 0.5 });
    shape(potato(390, 905, 74, 34, 8, 0.06), PINK, { angle: 10 });
    // the near ear
    shape([[600, 240], [730, 100], [720, 310]], PINK, { angle: 110 }, {}, false);
    shape([[640, 235], [710, 160], [705, 270]], DEEP, { over: 0 }, { w: 3.5 }, false);
    // the curl on top
    stroke([[480, 240], [450, 290], [420, 330], [450, 360], [490, 340], [480, 300]], { w: 5 });
    c.tint([[435, 250], [510, 240], [500, 330], [450, 340], [425, 300]], DEEP, { gap: 3.2 });
    // the near arm holding the microphone up to sing
    shape(band([[330, 600], [250, 560], [215, 490]], 52, 46), PINK, { angle: 60 });
    shape(band([[215, 480], [195, 560]], 26, 20), GREY, { angle: 90, over: 0 });
    shape(potato(220, 450, 40, 40, 9, 0.05), GREEN, { angle: 60, press: 1.1 });
    shape(band([[790, 600], [850, 650], [860, 710]], 50, 44), PINK, { angle: 130 });
    // big eyes, shifted left (the far one smaller), a little singing mouth
    shape(potato(330, 470, 58, 86, 11, 0.04), '#ffffff', { over: 0, press: 0.3 }, { w: 5 });
    shape(potato(515, 460, 80, 96, 11, 0.04), '#ffffff', { over: 0, press: 0.3 }, { w: 5 });
    shape(potato(322, 492, 32, 52, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 4 });
    shape(potato(495, 482, 42, 56, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 4 });
    dot(316, 470, 9, 13, '#ffffff');
    dot(484, 460, 12, 15, '#ffffff');
    // singing: a small round open mouth, low on the face
    shape(potato(395, 690, 42, 36, 9, 0.05), '#b52a3c', { angle: 0, over: 0 }, { w: 4.5 });
    shape(potato(400, 704, 22, 14, 7, 0.05), '#f39ab0', { over: 0 }, { w: 0.1 });
  },
} satisfies Redraw;
