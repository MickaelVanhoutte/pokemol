import type { P, Redraw } from './crayon.ts';

/** A flame, pointing up from (x, y). */
export function flame(x: number, y: number, w: number, h: number, lean = 0): P[] {
  return [[x - w / 2, y], [x - w * 0.55, y - h * 0.4], [x - w * 0.2 + lean * 0.4, y - h * 0.65], [x - w * 0.1 + lean * 0.6, y - h * 0.45],
    [x + lean, y - h], [x + w * 0.3 + lean * 0.5, y - h * 0.55], [x + w * 0.45, y - h * 0.7], [x + w * 0.58, y - h * 0.3], [x + w / 2, y]];
}

/**
 * A stick figure that is a real match, turned to the left: a big round red match head with a little flame on
 * top and a cheerful face, a pale wooden stick for a body, stick arms up in a boxer's guard, stick legs.
 */
export default {
  id: '080', slug: 'allumou', seed: 8001, size: [820, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const WOOD = '#ead09a', GRAIN = '#b8925a', RED = '#d23a32', DARK = '#9c2420', ORANGE = '#f7a12b', YEL = '#f7dc35';
    // the far arm and far leg, behind
    shape(band([[360, 520], [280, 560], [250, 470]], 26, 24), WOOD, { angle: 60, over: 0 });
    shape(potato(248, 452, 30, 28, 8, 0.08), WOOD, { over: 0 });
    shape(band([[390, 760], [330, 860], [300, 930]], 28, 26), WOOD, { angle: 70, over: 0 });
    shape(potato(285, 940, 40, 20, 7, 0.06), GRAIN, { over: 0 });
    // the wooden stick body, a line of grain
    shape(band([[400, 420], [405, 600], [410, 780]], 74, 70), WOOD, { angle: 90, over: 0.3 });
    stroke([[392, 500], [396, 610]], { w: 3, col: GRAIN });
    stroke([[418, 650], [420, 740]], { w: 3, col: GRAIN });
    // the near leg and near arm up in a boxer's guard, a little round fist
    shape(band([[420, 770], [480, 860], [500, 935]], 30, 28), WOOD, { angle: 110, over: 0 });
    shape(potato(520, 945, 44, 22, 7, 0.06), GRAIN, { over: 0 });
    shape(band([[430, 530], [540, 560], [560, 450]], 30, 28), WOOD, { angle: 120, over: 0 });
    shape(potato(565, 430, 36, 34, 8, 0.08), WOOD, { over: 0.2 });
    // the little flame on top, leaning back
    shape(flame(400, 140, 120, 150, 40), ORANGE, { angle: 85, press: 1.1, over: 0.2 }, {}, false);
    shape(flame(405, 128, 60, 80, 20), YEL, { over: 0 }, { w: 3 }, false);
    // the round red match head, darker on the far side
    shape(potato(380, 280, 160, 165, 12, 0.04), RED, { angle: 75, over: 0.5 });
    c.tint([[450, 160], [520, 260], [510, 370], [450, 420], [490, 300]], DARK, { gap: 3.6 });
    // a cheerful face, shifted left
    c.paper(potato(300, 270, 26, 32, 8, 0.05));
    c.paper(potato(395, 262, 30, 36, 8, 0.05));
    dot(294, 278, 14, 19);
    dot(387, 271, 16, 21);
    dot(288, 266, 5, 6, '#ffffff');
    dot(380, 258, 5.5, 6.5, '#ffffff');
    stroke([[280, 345], [320, 372], [362, 368], [392, 342]], { w: 5 });
    c.tint(potato(260, 330, 26, 18, 8, 0.1), '#f6a7c8', { gap: 3 });
  },
} satisfies Redraw;
