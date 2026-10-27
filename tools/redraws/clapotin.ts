import type { Redraw } from './crayon.ts';

/** A blue turtle standing up, three-quarters to the left: big round head, a brown checked shell on its back. */
export default {
  id: '003', slug: 'clapotin', seed: 304, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#4a86e0', BROWN = '#a8672e', CREAM = '#f6deaa';
    // in battle, the whole turtle now and then hides in its shell: everything but the shell shrinks into it
    // and slips behind it (drawn in two goes: the tail and far leg before the shell, the rest after)
    const hide = { pivot: [670, 610] as [number, number], motion: 'peek' as const, to: [0, 0] as [number, number], shrink: 0.12, fade: true, inside: true };
    c.part('corps', hide, () => {
      // a curly tail behind
      shape(band([[650, 760], [750, 800], [790, 740], [750, 700]], 48, 30), BLUE, { angle: 40 });
      // the far leg
      shape(band([[580, 760], [600, 860], [610, 910]], 76, 72), BLUE, { angle: 90 });
    });
    // the shell on its back, checked
    shape([[560, 420], [710, 440], [780, 570], [760, 730], [650, 800], [560, 770]], BROWN, { angle: 80, press: 1.05, over: 0.6 });
    for (const y of [520, 610, 700]) stroke([[580, y], [768, y - 10]], { w: 4 });
    for (const x of [640, 710]) stroke([[x, 450], [x - 5, 790]], { w: 4 });
    c.part('corps', hide, () => {
      // the body turned left, its pale belly
      shape([[370, 480], [510, 450], [610, 520], [620, 700], [560, 800], [420, 800], [350, 700], [340, 570]], BLUE, { angle: 85, over: 0.5 });
      shape([[380, 520], [480, 505], [530, 600], [515, 740], [420, 760], [375, 660]], CREAM, { angle: 0, over: 0 });
      for (const y of [580, 650, 720]) stroke([[385, y], [520, y - 5]], { w: 3 });
      // the near leg and arm
      shape(band([[430, 760], [415, 860], [400, 912]], 80, 76), BLUE, { angle: 90 });
      shape(band([[380, 530], [300, 480], [255, 395]], 54, 48), BLUE, { angle: 70 });
      // the big head, turned left: the far eye small at the edge
      shape([[260, 330], [300, 220], [420, 180], [560, 210], [620, 320], [590, 430], [480, 480], [340, 470], [255, 410]], BLUE, { angle: 80, over: 0.5 });
      c.paper(potato(320, 300, 30, 46, 9, 0.04));
      c.paper(potato(450, 295, 44, 56, 9, 0.04));
      dot(316, 312, 14, 22);
      dot(440, 308, 20, 27);
      dot(310, 300, 5, 7, '#ffffff');
      dot(432, 296, 7, 9, '#ffffff');
      stroke([[275, 395], [350, 425], [450, 400]]);
    });
  },
} satisfies Redraw;
