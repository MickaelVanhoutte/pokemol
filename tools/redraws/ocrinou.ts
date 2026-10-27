import type { P, Redraw } from './crayon.ts';

/**
 * A baby mammoth stepped out of a cave painting, turned to the left: drawn in charcoal (black felt-tip lines),
 * ochre-red wool with dabs of yellow ochre, a domed head, a little curled trunk, two tiny tusks, stubby legs,
 * and a tail tuft glowing like an ember.
 */
export default {
  id: '076', slug: 'ocrinou', seed: 7601, size: [1000, 900], tilt: -2, felt: true,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const OCHRE = '#c8642e', DEEP = '#8f3d1f', YOCHRE = '#e8b04a', TUSK = '#f3e6c4', FLAME = '#f7a12b', YEL = '#f7dc35';
    // the tail with its ember tuft, behind
    shape(band([[760, 470], [840, 450], [880, 400]], 26, 18), OCHRE, { angle: 40 });
    shape([[860, 420], [870, 340], [900, 370], [915, 300], [945, 380], [935, 430], [890, 445]], FLAME, { angle: 80, press: 1.1 }, {}, false);
    shape([[885, 425], [895, 380], [910, 400], [920, 365], [928, 415]], YEL, { over: 0 }, { w: 3 }, false);
    // the far legs, behind, darker
    shape(band([[400, 640], [395, 780]], 78, 72), DEEP, { angle: 90 });
    shape(band([[680, 630], [700, 770]], 74, 70), DEEP, { angle: 90 });
    // the woolly body, a hump on its back, zig-zag wool hanging under its tummy
    const wool = spikes([[740, 640], [600, 690], [450, 690], [330, 640]], 4, 26);
    const body: P[] = [[330, 380], [450, 300], [600, 300], [720, 350], [790, 440], [790, 560], ...wool, [300, 560]];
    shape(body, OCHRE, { angle: 80, over: 0.5 }, {}, false);
    // dabs of yellow ochre, the way the cave painters did with their fingers
    for (const [x, y] of [[520, 400], [610, 430], [700, 470], [560, 520], [660, 560], [480, 590]] as const) shape(potato(x, y, 20, 16, 7, 0.1), YOCHRE, { over: 0 }, { w: 3 });
    // the near legs, stubby, toenails
    shape(band([[460, 650], [455, 800]], 88, 84), OCHRE, { angle: 90 });
    shape(band([[730, 630], [750, 790]], 84, 80), OCHRE, { angle: 90 });
    for (const [x, y] of [[440, 800], [470, 802], [735, 790], [765, 792]] as const) c.paper(potato(x, y, 11, 9, 7, 0.08), { w: 3 });
    // the head turned left: domed, a little ear, a trunk curling under
    shape(potato(330, 400, 175, 160, 12, 0.04), OCHRE, { angle: 70, over: 0.45 });
    shape(spikes([[250, 270], [320, 225], [400, 240]], 3, 26), DEEP, { over: 0 }, {}, false);
    shape(potato(430, 430, 60, 80, 9, 0.06), DEEP, { angle: 90, over: 0 });
    // the trunk: in battle it goes up and down, from under the head (the tusks stay in front)
    c.part('trompe', { pivot: [215, 475], motion: 'swing', amp: 12, period: 2.2, behind: true }, () => {
      shape(band([[210, 470], [170, 560], [160, 640], [200, 680], [235, 655]], 64, 34), OCHRE, { angle: 20 });
      stroke([[175, 560], [205, 568]], { w: 3 });
      stroke([[168, 600], [198, 606]], { w: 3 });
    });
    // two tiny tusks curling out
    shape(band([[250, 520], [215, 570], [228, 610]], 24, 12), TUSK, { over: 0 });
    shape(band([[300, 530], [290, 585], [310, 615]], 24, 12), TUSK, { over: 0 });
    // big friendly eyes, a smile
    c.paper(potato(255, 395, 22, 27, 8, 0.05));
    c.paper(potato(345, 385, 27, 32, 8, 0.05));
    dot(250, 402, 12, 16);
    dot(338, 393, 14, 18);
    dot(245, 392, 4, 5, '#ffffff');
    dot(332, 381, 5, 6, '#ffffff');
    stroke([[275, 480], [300, 492], [330, 486]], { w: 4.5 });
  },
} satisfies Redraw;
