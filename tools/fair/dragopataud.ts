import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Dragopataud's fair copy, Dragon/Water, the same drawing grown up: its small wings grown into big fins
 * with blue rays and a scalloped edge, little fins growing on its forearms and a fan of fin at the tip of its tail,
 * longer antennae, heavier brows, longer fangs and claws, and the gold star on its side.
 */
export default {
  id: '045', slug: 'dragopataud', seed: 45045, size: [1250, 1150], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, potato, shake } = c;
    const ORANGE = '#f3943a', CREAM = '#f6dfa0', WING = '#6fc6b4', RAY = '#2f7fc8';
    /** A fin from its root: rays fanning out to each tip, the edge scalloped between them, back to `back`. */
    const fin = (root: P, tips: P[], back: P, w = 5) => {
      const edge: P[] = [root, tips[0]];
      for (let i = 1; i < tips.length; i++) {
        const a = tips[i - 1], b = tips[i];
        edge.push([(a[0] + b[0]) / 2 + (root[0] - (a[0] + b[0]) / 2) * 0.16, (a[1] + b[1]) / 2 + (root[1] - (a[1] + b[1]) / 2) * 0.16], b);
      }
      edge.push(back);
      shape(edge, WING, { angle: 50 });
      for (const t of tips) stroke([root, [root[0] + (t[0] - root[0]) * 0.9, root[1] + (t[1] - root[1]) * 0.9]], { w, col: RAY });
    };
    // the far wing, a big fin now, behind on the left
    c.part('aile-loin', { pivot: [425, 505], motion: 'flap', amp: 14, period: 0.6, behind: true, phase: 0 }, () => {
      fin([430, 480], [[320, 290], [215, 350], [180, 450], [235, 540]], [410, 560]);
    });
    // the thick tail on the ground, a fan of fin at its tip
    c.part('queue', { pivot: [730, 930], motion: 'swing', amp: 5, period: 2.2, behind: true }, () => {
      fin([1040, 935], [[1110, 815], [1185, 870], [1205, 960], [1160, 1040]], [1050, 975], 4);
      shape(shake([[720, 880], [900, 950], [1030, 900], [1060, 960], [900, 1020], [700, 960]], 5), ORANGE, { angle: 20 });
    });
    // the far leg and far arm, behind, a fin growing on its forearm
    shape(potato(430, 920, 85, 105, 9, 0.05), ORANGE, { angle: 70 });
    for (let i = -1; i <= 1; i++) shape([[338, 1036 + i * 20 - 9], [286, 1046 + i * 28], [336, 1036 + i * 20 + 9]], '#ffffff', { over: 0 }, { w: 3.5 }, false);
    shape(potato(420, 1040, 98, 42, 8, 0.06), ORANGE, { angle: 0 });
    fin([350, 675], [[250, 565], [210, 625], [222, 695]], [320, 708], 4);
    shape(shake([[400, 600], [310, 650], [290, 710], [340, 715], [410, 670]], 4), ORANGE, { angle: 30 });
    for (const [a, b] of [[[296, 700], [258, 728]], [[318, 712], [292, 752]]] as [P, P][]) shape([[a[0] - 7, a[1] - 7], b, [a[0] + 8, a[1] + 6]], '#ffffff', { over: 0 }, { w: 3.5 }, false);
    // a big round body, its striped belly shifted left, the star on its side
    shape(potato(590, 690, 240, 280, 12, 0.03), ORANGE, { angle: 65 });
    shape(potato(520, 740, 130, 195, 10, 0.04), CREAM, { angle: -80, over: 0 });
    for (let i = -3; i <= 3; i++) stroke([[420, 740 + i * 52], [615, 735 + i * 52]], { w: 4.5, col: '#c98a2e' });
    c.star(772, 790, 42, 6);
    // the near wing, a big fin, on the right
    c.part('aile', { pivot: [770, 515], motion: 'flap', amp: -14, period: 0.6, phase: 0 }, () => {
      fin([765, 480], [[960, 250], [1085, 320], [1130, 440], [1075, 545]], [790, 565]);
    });
    // the near leg and near arm, longer claws, a fin on the forearm
    shape(potato(690, 925, 95, 112, 9, 0.05), ORANGE, { angle: 70 });
    for (let i = -1; i <= 1; i++) shape([[608, 1040 + i * 22 - 9], [552, 1052 + i * 30], [606, 1040 + i * 22 + 9]], '#ffffff', { over: 0 }, { w: 3.5 }, false);
    shape(potato(700, 1045, 110, 46, 8, 0.06), ORANGE, { angle: 0 });
    fin([705, 645], [[805, 570], [845, 630], [825, 700]], [715, 692], 4);
    shape(shake([[700, 600], [640, 660], [620, 720], [670, 725], [730, 670]], 4), ORANGE, { angle: 30 });
    for (const [a, b] of [[[628, 712], [598, 750]], [[652, 722], [638, 764]]] as [P, P][]) shape([[a[0] - 7, a[1] - 6], b, [a[0] + 8, a[1] + 6]], '#ffffff', { over: 0 }, { w: 3.5 }, false);
    // longer antennae, then the head turned left
    stroke([[470, 250], [430, 140], [370, 70], [300, 55]], { w: 7 });
    stroke([[590, 250], [645, 135], [715, 70], [790, 62]], { w: 7 });
    shape(shake([[400, 330], [450, 240], [560, 210], [680, 250], [710, 350], [650, 440], [520, 460], [420, 430], [370, 380]], 4), ORANGE, { angle: 60 });
    // fiercer: heavy brows over its eyes, longer fangs
    dot(455, 320, 10, 13);
    dot(570, 317, 12, 14);
    dot(452, 314, 3, 4, '#ffffff');
    dot(566, 311, 4, 4, '#ffffff');
    stroke([[418, 284], [482, 306]], { w: 11 });
    stroke([[532, 302], [610, 280]], { w: 12 });
    dot(398, 362, 5); dot(420, 364, 5);
    stroke([[410, 395], [480, 425], [560, 395]], { w: 6 });
    c.paper([[436, 406], [449, 452], [462, 413]], { w: 4 }, false);
    c.paper([[512, 413], [526, 456], [538, 407]], { w: 4 }, false);
    c.shine([[600, 240], [650, 258]], 6);
  },
} satisfies Fair;
