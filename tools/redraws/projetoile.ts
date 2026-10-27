import type { P, Redraw } from './crayon.ts';
import { star } from './lumignon.ts';

/**
 * Lumignon grown into a star projector turned to the left: its lampshade became a little night-blue dome crown
 * pierced with stars, and a great cape of night sky spreads behind it, full of stars and a moon, held open by
 * both arms like a conjurer. Violet eyes that see dreams, a cord tail ending in a star plug.
 */
export default {
  id: '083', slug: 'projetoile', seed: 8301, size: [1100, 1150], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const NIGHT = '#2f3a7a', DEEP = '#1f2656', GLOW = '#fbe58a', WARM = '#f7c650', YEL = '#f7dc35', MOON = '#f2c43a', PSY = '#b56fd8';
    // the great cape of night sky spread behind it, scalloped at the hem
    const cape: P[] = [[430, 470], [290, 380], [170, 330], [150, 540], [125, 790], [165, 1005], [270, 960], [380, 1030], [520, 985], [660, 1035], [800, 975], [950, 1015], [1030, 790], [1005, 520], [985, 300], [840, 360], [670, 470]];
    shape(cape, NIGHT, { angle: 70, over: 0.55, press: 1.05 });
    c.tint([[700, 480], [960, 360], [990, 700], [960, 960], [820, 940], [880, 650]], DEEP, { gap: 3.6 });
    for (const [x, y, r, t] of [[245, 450, 30, 0.1], [215, 650, 26, -0.3], [265, 850, 30, 0.4], [880, 450, 30, 0.2], [940, 640, 26, -0.1], [860, 860, 34, 0.3], [330, 980, 20, 0], [760, 1000, 20, 0.5]] as const)
      shape(star(x, y, r, t), YEL, { over: 0 }, { w: 3 }, false);
    shape([[880, 760], [920, 715], [975, 712], [938, 735], [925, 775], [945, 815], [980, 830], [925, 828], [890, 800]], MOON, { over: 0 }, { w: 3 });
    // the cord tail, a star plug at its end
    stroke([[640, 980], [760, 1070], [900, 1095], [990, 1060]], { w: 5 });
    shape(star(1020, 1050, 42, 0.3), YEL, { over: 0, press: 1.1 }, { w: 4 }, false);
    // the far arm raised, holding up the cape
    shape(band([[420, 610], [310, 510], [235, 385]], 46, 40), GLOW, { angle: 60, over: 0 });
    shape(potato(230, 368, 31, 29, 8, 0.06), GLOW, { over: 0 });
    // the slim glowing body, warmer at the bottom, two feet
    shape(potato(430, 1060, 62, 28, 8, 0.06), WARM, { over: 0 });
    shape([[400, 520], [650, 515], [710, 700], [700, 900], [630, 1025], [460, 1040], [380, 940], [360, 720]], GLOW, { angle: 80, over: 0.35 });
    c.tint([[370, 880], [705, 870], [630, 1020], [460, 1035]], WARM, { gap: 3.6, angle: 80 });
    shape(potato(600, 1065, 68, 30, 8, 0.06), WARM, { over: 0 });
    // the near arm raised the other way
    shape(band([[660, 610], [800, 500], [910, 360]], 52, 44), GLOW, { angle: 120, over: 0 });
    shape(potato(918, 340, 34, 32, 8, 0.06), GLOW, { over: 0 });
    // the round glowing head
    shape(potato(470, 430, 160, 135, 12, 0.04), GLOW, { angle: 75, over: 0.3 });
    // the dome crown: night blue, pierced with stars, a ring of little moons, a knob on top
    shape([[325, 340], [350, 220], [460, 160], [590, 190], [650, 300], [630, 350], [480, 360]], NIGHT, { angle: 70, over: 0.5 });
    for (const [x, y, r, t] of [[410, 250, 26, 0.1], [520, 215, 22, -0.2], [580, 290, 24, 0.3], [460, 320, 18, 0.4]] as const) shape(star(x, y, r, t), YEL, { over: 0 }, { w: 3 }, false);
    shape(band([[315, 345], [480, 368], [650, 345]], 30, 30), DEEP, { angle: 10, over: 0 });
    for (const x of [355, 430, 505, 580]) shape(potato(x, 358, 11, 11, 8, 0.05), GLOW, { over: 0 }, { w: 2.5 });
    shape(potato(465, 150, 34, 22, 8, 0.05), MOON, { over: 0 }, { w: 3.5 });
    // violet eyes that see dreams, a calm smile
    c.paper(potato(360, 450, 30, 32, 8, 0.05));
    c.paper(potato(470, 443, 34, 36, 8, 0.05));
    dot(353, 457, 17, 21, PSY);
    dot(462, 450, 19, 23, PSY);
    dot(353, 457, 7, 9);
    dot(462, 450, 8, 10);
    dot(346, 446, 5, 6, '#ffffff');
    dot(455, 438, 6, 7, '#ffffff');
    stroke([[370, 525], [410, 540], [452, 527]], { w: 5 });
  },
} satisfies Redraw;
