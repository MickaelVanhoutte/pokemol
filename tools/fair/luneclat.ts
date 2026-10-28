import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Lunéclat's fair copy, Fairy/Psychic, the same drawing grown up: much longer ears, the crescent moon on
 * its forehead grown twice as big, its wings grown big and spreading high, its stars come to rest on its wings,
 * violet eyes under little brows, a sure smile, and the gold star on its belly. It faces left, like its drawing.
 */
export default {
  id: '028', slug: 'luneclat', seed: 28028, size: [1180, 1240], tilt: 2,
  draw(c0) {
    const c = moved(c0, 40, 130);
    const { shape, stroke, dot, potato } = c;
    const PINK = '#f39ac0', DEEP = '#de6f9e', WHITE = '#f6eef6', YEL = '#f6d22c', RED = '#e8606a', VIOLET = '#8a5ad6', FEATHER = '#b9a3c9';
    /** One of its yellow stars, lying on a wing. */
    const twinkle = (x: number, y: number, r: number, rot: number) => {
      const pts: P[] = Array.from({ length: 10 }, (_, i) => {
        const a = ((rot - 90 + i * 36) * Math.PI) / 180, k = i % 2 ? 0.45 : 1;
        return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
      });
      shape(pts, YEL, { over: 0 }, { w: 4.5 }, false);
    };

    // the wings grown big, spreading high over its shoulders (the far one behind on the left), its stars on them
    c.part('aile-loin', { pivot: [355, 585], motion: 'flap', amp: 12, period: 0.6, behind: true, phase: 0 }, () => {
      shape([[365, 530], [325, 440], [255, 350], [160, 280], [80, 262], [62, 312], [130, 370], [52, 410], [70, 466], [150, 478], [92, 538], [120, 594], [205, 590], [190, 648], [255, 668], [345, 648]], WHITE, { angle: 40 });
      for (const t of [[150, 372], [170, 482], [222, 584]] as P[]) stroke([[330, 565], t], { w: 4, col: FEATHER });
      twinkle(170, 410, 30, -10);
    });
    c.part('aile', { pivot: [665, 585], motion: 'flap', amp: -12, period: 0.6, behind: true, phase: 0 }, () => {
      shape([[655, 520], [715, 420], [815, 300], [950, 205], [1055, 180], [1080, 240], [990, 330], [1095, 368], [1085, 440], [985, 462], [1052, 540], [1012, 602], [905, 592], [932, 660], [862, 692], [760, 668], [690, 662]], WHITE, { angle: 140 });
      for (const t of [[960, 335], [955, 468], [885, 592]] as P[]) stroke([[700, 560], t], { w: 4, col: FEATHER });
      twinkle(925, 300, 38, 8);
      twinkle(910, 520, 30, -12);
    });
    // the far ear, much longer, the far foot
    shape([[380, 320], [288, -45], [358, -52], [440, 300]], PINK, { angle: 75 });
    shape([[395, 280], [320, 0], [348, -5], [418, 275]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    shape(potato(420, 975, 78, 42, 8, 0.06), PINK, { angle: 0 });
    // round body, white belly shifted left with the gold star, stubby arms
    shape(potato(530, 720, 215, 240, 11, 0.04), PINK, { angle: 80, over: 0.5 });
    shape(potato(460, 780, 108, 132, 9, 0.05), WHITE, { angle: 70, over: 0 });
    c.star(462, 792, 46, -6);
    shape(potato(320, 640, 52, 35, 7, 0.06), PINK, { angle: 20 });
    shape(potato(610, 978, 88, 45, 8, 0.06), PINK, { angle: 0 });
    shape(potato(730, 650, 64, 41, 7, 0.06), PINK, { angle: 20 });
    // the near ear, much longer
    shape([[520, 300], [640, -55], [708, -34], [590, 320]], PINK, { angle: 70 });
    shape([[548, 270], [645, -8], [672, 2], [578, 282]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the head turned left
    shape(potato(480, 370, 160, 135, 11, 0.04), PINK, { angle: 75, over: 0.4 });
    // the crescent moon on its forehead, grown twice as big, its horns rising over its head
    const moon: P[] = [], [mx, my, mr, from, to] = [468, 212, 96, -0.72, 4.92];
    for (let i = 0; i <= 24; i++) {
      const a = from + ((to - from) * i) / 24;
      moon.push([mx + Math.cos(a) * mr, my + Math.sin(a) * mr]);
    }
    for (let i = 23; i >= 1; i--) {
      const a = from + ((to - from) * i) / 24, r = mr - 52 * Math.sin((Math.PI * i) / 24);
      moon.push([mx + Math.cos(a) * r, my + Math.sin(a) * r]);
    }
    shape(moon, YEL, { angle: 30, over: 0 }, {}, false);
    // lilac eyes under little brows, shifted left (the far one smaller), its nose, a sure smile
    c.paper(potato(382, 370, 30, 38, 9, 0.03), { w: 5 });
    c.paper(potato(503, 368, 38, 42, 9, 0.03), { w: 5.5 });
    dot(386, 376, 17, 22, VIOLET);
    dot(507, 374, 21, 25, VIOLET);
    dot(388, 378, 8, 11);
    dot(509, 376, 10, 13);
    dot(380, 366, 5, 5, '#ffffff');
    dot(499, 364, 6, 6, '#ffffff');
    stroke([[350, 322], [408, 336]], { w: 9 });
    stroke([[464, 334], [538, 314]], { w: 9 });
    shape(potato(412, 432, 24, 18, 7, 0.08), RED, { over: 0 }, { w: 4.5 });
    stroke([[352, 462], [370, 476], [405, 486], [445, 474], [462, 458]], { w: 6 });
    c.shine([[580, 300], [605, 330]], 6);
  },
} satisfies Fair;

/** The crayon drawing everything (dx, dy) further, to make room for what grew; the shapes keep the pencil drawing's coordinates. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]): P => [x + dx, y + dy]);
  return {
    ...c,
    shape: (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(m(pts), col, o, l, round),
    paper: (pts: P[], l?: Line, round?: boolean) => c.paper(m(pts), l, round),
    tint: (pts: P[], col: string, o?: Colour) => c.tint(m(pts), col, o),
    stroke: (pts: P[], l?: Line, round?: boolean) => c.stroke(m(pts), l, round),
    dot: (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + dx, y + dy, rx, ry, col),
    shine: (pts: P[], w?: number) => c.shine(m(pts), w),
    star: (x: number, y: number, r: number, rot?: number) => c.star(x + dx, y + dy, r, rot),
    part: (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + dx, def.pivot[1] + dy] }, draw),
  };
}
