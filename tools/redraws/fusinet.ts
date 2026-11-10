import type { P, Redraw } from './crayon.ts';

/**
 * A baby charcoal crow, the little thief: a round fluffy chick the colour of a charcoal stick, its wing tips and tail
 * tips glowing like embers. It has just pinched a glowing coal from the hearth and holds it in its beak, looking at you
 * sideways, very pleased with itself. Its flaw: the coal is hot, its cheeks are puffed and its eyes water.
 */
export const CHAR = '#3e3a48', CHAR2 = '#5a5466', GREY = '#8a8494', EMBER = '#f2803a', GLOW = '#f6c63c', RED = '#d84a2e';

/** A feather tip glowing like an ember: the feather in charcoal, its end orange with a yellow heart. */
export function emberFeather(c: { shape: (p: P[], col: string, o?: object, l?: object) => void; tint: (p: P[], col: string, o?: object) => void }, pts: P[], k = 0.45) {
  c.shape(pts, CHAR, { angle: 60, over: 0.3 });
  const n = pts.length, tip = pts.slice(Math.floor(n * (0.5 - k / 2)), Math.ceil(n * (0.5 + k / 2)));
  c.tint(tip, EMBER, { angle: 40, wash: 0.85, press: 1.2 });
}

export default {
  id: '139', slug: 'fusinet', seed: 13901, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the tail feathers behind, their tips glowing
    c.part('queue', { pivot: [700, 760], motion: 'swing', amp: 3, period: 2.4, behind: true }, () => {
      emberFeather(c, [[680, 740], [790, 680], [880, 700], [860, 760], [760, 800]]);
      emberFeather(c, [[680, 780], [800, 790], [870, 840], [820, 880], [720, 840]]);
    });
    // little feet
    stroke([[480, 880], [470, 930], [430, 940]], { w: 8, col: '#5a4a3a' });
    stroke([[470, 930], [490, 948]], { w: 7, col: '#5a4a3a' });
    stroke([[580, 880], [590, 934], [560, 946]], { w: 8, col: '#3e342c' });
    // the round fluffy body, a soft grey belly, a tuft on its head
    shape(potato(560, 620, 250, 270, 16, 0.05), CHAR, { angle: 70, over: 0.45 });
    c.tint(potato(470, 720, 120, 140, 10, 0.06), GREY, { angle: 60, wash: 0.75 });
    shape([[540, 360], [520, 290], [570, 330], [590, 270], [610, 350]], CHAR, { angle: 80, over: 0 }, { w: 4 });
    // the near wing, folded on the flank, its tip an ember
    c.part('aile', { pivot: [640, 560], motion: 'fold', amp: 4, period: 2.6 }, () => {
      emberFeather(c, [[620, 540], [720, 580], [770, 680], [740, 760], [660, 720], [610, 640]], 0.35);
    });
    // a sly face: big eyes glancing sideways at you, one lid a little lower
    c.eye(420, 500, 40, 50, '#3a3050', { lid: 0.18, skin: CHAR });
    c.eye(540, 488, 50, 62, '#3a3050', { lid: 0.08, skin: CHAR });
    stroke([[500, 412], [570, 404]], { w: 6, col: '#2a2630' });
    c.cheek(560, 600, 34, 22, '#f2803a');
    // the glowing coal, a big round ember held between the two halves of its open beak
    c.part('braise', { pivot: [300, 620], motion: 'nod', amp: 2, period: 1.4 }, () => {
      shape([[400, 560], [330, 560], [276, 580], [330, 596], [400, 600]], '#4a4250', { angle: 10, over: 0 }, { w: 4.5 }, false);
      shape(potato(290, 630, 62, 56, 10, 0.1), RED, { angle: 30, over: 0.3 });
      c.tint(potato(284, 622, 32, 28, 8, 0.1), GLOW, { angle: 30, wash: 0.9 });
      shape([[400, 640], [336, 660], [290, 680], [340, 692], [400, 680]], '#4a4250', { angle: 10, over: 0 }, { w: 4.5 }, false);
      c.dot(300, 540, 8, 8, GLOW);
      c.dot(240, 556, 6, 6, EMBER);
    });
    c.part('paupieres', { pivot: [480, 494], motion: 'blink', extra: true }, () => {
      c.lid(420, 500, 40, 50, CHAR);
      c.lid(540, 488, 50, 62, CHAR);
    });
    void CHAR2;
  },
} satisfies Redraw;
