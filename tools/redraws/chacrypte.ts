import type { P, Redraw } from './crayon.ts';
import { lineOfAction, paw } from './anatomy.ts';
import { mist } from './chacalune.ts';

/** Points every `step` px along the polyline through `pts`. */
function along(pts: P[], step = 10): P[] {
  const out: P[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

/**
 * The lonely pup grown into the guardian of the old tombs (« gardien des tombeaux »), turned to the left: a tall jackal
 * standing proud, head high, very tall ears, a long neck, half in this world and half in the other. Its front half is
 * solid, the family's sandy fur with dark points (ear tips, muzzle, socks), a few small gold markings and sharp golden
 * eyes; from the middle of its body back it fades into a see-through spirit of itself, pale sand and lavender, and as it
 * moves it leaves ghostly trails behind its legs and its long tail. Ghost lights drift off it.
 */
export default {
  id: '066', slug: 'chacrypte', seed: 6602, size: [1350, 1180], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const SAND = '#dca858', FARS = '#b07a3a', CREAM = '#f6e4bc', DARK = '#3a2e40', EAR = '#f0b49a', NOSE = '#1e1824';
    const GOLD = '#f0b020', PALE = '#f2dfb8', LAV = '#c4b2e6', SPIRIT = '#7fe6dc', GLOW = '#c8fff6', GLINE = '#8ad8d4';

    /** A soft dashed line of light along `pts` (a ghostly outline). */
    const dashed = (pts: P[], col = GLINE, w = 4) => {
      const p = along(pts, 9);
      for (let i = 0; i + 3 < p.length; i += 6) stroke(p.slice(i, i + 4), { w, col });
    };
    /** A see-through ghostly part: pale sand fading to lavender, a faint turquoise glow, a dashed glowing outline. */
    const ghost = (pts: P[], wash = 0.5) => {
      c.tint(c.grow(pts, 14), SPIRIT, { wash: 0.12 });
      c.tint(pts, PALE, { wash, angle: 40, press: 0.9 });
      c.tint(pts, LAV, { wash: wash * 0.7, angle: 110, press: 0.9 });
      dashed([...pts, pts[0]]);
    };
    /** A sharp golden eye: a gold oval, a dark pupil, the house shine, a lid of sandy fur, a gold line round it. */
    const golden = (x: number, y: number, rx: number, ry: number, tilt: number) => {
      c.eye(x, y, rx, ry, '#f6d040');
      dot(x - rx * 0.1, y + ry * 0.1, rx * 0.36, ry * 0.58, '#241c38');
      dot(x - rx * 0.34, y - ry * 0.32, rx * 0.24, ry * 0.18, '#ffffff');
      const t = (tilt * Math.PI) / 180, top = y - ry * 1.5, cut = y - ry * 0.66;
      const at = (dx: number, yy: number): P => [x + dx, yy + dx * Math.tan(t)];
      shape([at(-rx * 1.5, top), at(rx * 1.5, top), at(rx * 1.5, cut), at(0, cut + ry * 0.08), at(-rx * 1.5, cut)], SAND, { over: 0, spill: 0, wash: 1 }, { w: 0.1 });
      stroke([at(-rx * 1.1, cut), at(0, cut + ry * 0.08), at(rx * 1.1, cut)], { w: 5 });
      stroke([at(-rx * 1.1, y + ry * 0.2), at(-rx * 0.5, y + ry * 1.12), at(rx * 0.5, y + ry * 1.16), at(rx * 1.3, y + ry * 0.5), at(rx * 2.1, y + ry * 0.1)], { w: 5.5, col: '#c88410' });
    };
    /** A little ghost light floating at (x, y), `s` its size: a glowing ball trailing a wisp that curls up. */
    const light = (x: number, y: number, s: number) => {
      mist(c, [[x, y], [x + 10 * s, y - 50 * s], [x - 6 * s, y - 96 * s], [x + 18 * s, y - 130 * s]], 50 * s, SPIRIT, 3, 0.9);
      shape(potato(x, y, 26 * s, 26 * s, 10, 0.03), SPIRIT, { angle: 80, over: 0, wash: 0.8 }, { w: 3, col: '#3a9a96' });
      c.tint(potato(x - 4 * s, y - 2 * s, 12 * s, 12 * s, 8, 0.04), GLOW, { wash: 1 });
    };
    /** The guardian's head centred on (hx, hy), `s` its size, turned `rot` degrees: calm, solemn, golden-eyed. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the very tall ears: dark tips, a small gold band under each tip
      shape(h([[-80, -60], [-166, -380], [-178, -420], [-132, -396], [-10, -96]]), FARS, { angle: 80, over: 0.2 });
      c.tint(h([[-150, -320], [-178, -420], [-132, -396], [-110, -320]]), DARK, { wash: 1 });
      c.tint(h([[-150, -312], [-106, -314], [-102, -296], [-146, -292]]), GOLD, { wash: 1, angle: 0 });
      c.part('oreille', { pivot: H([70, -90]), motion: 'swing', amp: 2, period: 3.4 }, () => {
        shape(h([[4, -96], [60, -420], [84, -464], [116, -428], [160, -70]]), SAND, { angle: 80, over: 0.2 });
        c.tint(h([[44, -120], [76, -330], [96, -340], [124, -120]]), EAR, { wash: 0.7 });
        c.tint(h([[60, -352], [84, -464], [116, -428], [128, -350]]), DARK, { wash: 1 });
        shape(h([[56, -350], [130, -346], [132, -324], [52, -328]]), GOLD, { angle: 0, over: 0, wash: 1 }, { w: 2.5 });
      });
      // a long fine snout, cream underneath, its tip dark
      const outline = h([[-310, 40], [-302, 20], [-236, 0], [-146, -40], [-54, -92], [40, -98], [112, -66], [142, -6], [130, 52], [84, 94], [0, 104], [-100, 86], [-204, 70], [-284, 60]]);
      shape(outline, SAND, { angle: 78, over: 0.45 }, { w: 0.1 });
      c.tint(h([[-310, 40], [-230, 30], [-150, 46], [-60, 62], [40, 70], [130, 52], [84, 94], [0, 104], [-100, 86], [-204, 70], [-284, 60]]), CREAM, { angle: 60, wash: 0.9 });
      c.tint(h([[-310, 40], [-302, 20], [-250, 4], [-226, 30], [-240, 64], [-284, 60]]), DARK, { wash: 0.95 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      // calm and solemn: golden eyes lined with gold, a little lidded, looking ahead; the mouth closed
      const [e1, e2] = [H([-140, -20]), H([-34, -28])];
      golden(e1[0], e1[1], 19 * s, 23 * s, 8 + rot);
      golden(e2[0], e2[1], 25 * s, 30 * s, -4 + rot);
      dot(...H([-306, 30]), 16 * s, 12 * s, NOSE);
      stroke(h([[-280, 66], [-230, 74], [-176, 70]]), { w: 5 });
      c.part('paupieres', { pivot: H([-80, -24]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 19 * s, 23 * s, SAND);
        c.lid(e2[0], e2[1], 25 * s, 30 * s, SAND);
      });
    };
    /** A sandy front leg through its joints, a dark sock from the wrist down with a thin gold band, the paw. */
    const leg = (pts: P[], ws: number[], col: string, line = true) => {
      const out = lineOfAction(pts, ws);
      c.shape(out, col, { angle: 85, over: 0.3 }, { w: 0.1 });
      const n = pts.length, [a, b] = [pts[n - 3], pts[n - 2]];
      const sk: P[] = [[a[0] + (b[0] - a[0]) * 0.55, a[1] + (b[1] - a[1]) * 0.55], b, pts[n - 1]];
      c.tint(lineOfAction(sk, [ws[n - 3] * 0.85, ws[n - 2], ws[n - 1]]), DARK, { wash: 0.95, angle: 85 });
      c.tint(band([sk[0], [sk[0][0] + (b[0] - sk[0][0]) * 0.25, sk[0][1] + (b[1] - sk[0][1]) * 0.25]], ws[n - 3] * 0.9, ws[n - 3] * 0.88), GOLD, { wash: 1 });
      if (line) stroke(out.slice(1, out.length - 1), { w: 5 });
      const [x, y] = pts[n - 1];
      paw(c, x - 8, y + 6, DARK, ws[n - 1] * 0.78);
    };
    /** A ghostly trail streaming back from (x, y): an afterimage, `l` long, `w` wide, `wash` its strength. */
    const trail = (x: number, y: number, l: number, w: number, wash: number, rise = -10) => {
      mist(c, [[x, y], [x + l * 0.4, y + rise * 0.3], [x + l * 0.75, y + rise], [x + l, y + rise * 1.6]], w, LAV, 4, wash);
      mist(c, [[x, y], [x + l * 0.35, y + rise * 0.3], [x + l * 0.6, y + rise * 0.8]], w * 0.6, PALE, 3, wash * 0.8);
    };
    /** A ghostly hind leg through its joints, fading into wisps at the paw, a strong trail streaming behind it. */
    const ghostLeg = (pts: P[], ws: number[], wash: number) => {
      const n = pts.length;
      trail(pts[n - 3][0], pts[n - 3][1] + 30, 330, ws[n - 3] * 1.4, 0.75, -30);
      trail(pts[n - 2][0], pts[n - 2][1] + 20, 260, ws[n - 2] * 1.3, 0.6, -10);
      ghost(lineOfAction(pts.slice(0, -1), ws.slice(0, -1)), wash);
      mist(c, [pts[n - 2], pts[n - 1], [pts[n - 1][0] + 40, pts[n - 1][1] + 10]], ws[n - 2], PALE, 3, 0.7);
    };

    // standing proud on watch, head high: the front half solid, the back half its own ghost, leaving trails in the air
    c.part('ombre', { pivot: [560, 1100], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(560, 1106, 300, 22, 12, 0.03), '#e2dccc', { wash: 0.8 });
    });
    // the long ghostly tail sweeping back, fraying into its trail
    c.part('queue', { pivot: [900, 700], motion: 'swing', amp: 2, period: 3.4, behind: true }, () => {
      // its trail first, behind: a few faint separate streaks below and behind the tail
      mist(c, [[1010, 760], [1110, 740], [1220, 690], [1300, 650]], 22, LAV, 3, 0.5);
      mist(c, [[960, 800], [1060, 800], [1170, 770], [1260, 740]], 18, LAV, 3, 0.4);
      mist(c, [[1120, 680], [1220, 630], [1300, 590]], 16, PALE, 3, 0.5);
      // one long tapered ghostly tail sweeping back and up, ending in a single soft curl
      const sp: P[] = [[880, 690], [980, 694], [1070, 666], [1150, 614], [1206, 556], [1232, 496], [1218, 452], [1184, 450], [1172, 480]];
      const tail = lineOfAction(sp, [96, 90, 80, 66, 52, 38, 26, 16, 8]);
      ghost(tail, 0.65);
    });
    // far legs: the ghostly hind one, the solid front one (a subtle trail behind it)
    ghostLeg([[790, 760], [760, 870], [816, 950], [806, 1050], [800, 1090]], [96, 64, 44, 38, 30], 0.5);
    trail(540, 1000, 160, 40, 0.35, -6);
    leg([[510, 770], [520, 900], [526, 1000], [534, 1070]], [72, 56, 46, 42], FARS, false);
    // the ghostly back half of the body: see-through, glowing
    const back: P[] = [[560, 590], [680, 610], [800, 620], [880, 650], [920, 720], [890, 800], [800, 830], [680, 840], [560, 840]];
    ghost(back, 0.65);
    // the near hind leg, ghostly: the haunch, the stifle, the hock, fading at the paw
    ghostLeg([[840, 720], [810, 860], [880, 950], [866, 1050], [858, 1090]], [130, 74, 50, 42, 34], 0.65);
    dashed([[770, 710], [790, 660], [860, 646], [910, 690]]);
    // ghost lights drifting off its back
    c.part('feux', { pivot: [900, 570], motion: 'swing', amp: 4, period: 4 }, () => {
      light(960, 540, 0.7);
      light(840, 500, 0.5);
      light(1180, 860, 0.55);
    });
    // the solid front half: chest and shoulder in sandy fur, its back edge fraying into the ghost in soft tongues
    const fray: P[] = [[630, 600], [700, 616], [662, 640], [742, 670], [678, 692], [724, 730], [670, 754], [732, 792], [662, 812], [690, 840], [630, 842]];
    const front: P[] = [[460, 600], [560, 582], ...fray, [520, 850], [430, 830], [380, 760], [376, 670], [400, 620]];
    shape(front, SAND, { angle: 80, over: 0.4 }, { w: 0.1 });
    stroke([[560, 582], [460, 600], [400, 620], [376, 670], [380, 760], [430, 830], [520, 850], [640, 840]], { w: 5 });
    // the sand fades out into the ghost: soft tongues reaching back over it
    for (const sp of [[[650, 616], [740, 630], [800, 610]], [[690, 690], [790, 700], [850, 690]], [[690, 770], [780, 790], [840, 780]]] as P[][]) {
      mist(c, sp, 46, SAND, 4, 0.8);
    }
    // the long neck up to the head, the cream throat and chest
    shape(band([[470, 690], [426, 560], [394, 430]], 160, 112), SAND, { angle: 80, over: 0.3 }, { w: 0.1 });
    c.tint([[346, 440], [380, 440], [400, 560], [420, 680], [430, 800], [396, 760], [380, 660], [356, 560]], CREAM, { angle: 80, wash: 0.85 });
    stroke([[338, 440], [350, 560], [376, 670]], { w: 5 });
    stroke([[444, 400], [470, 520], [520, 590]], { w: 5 });
    // a small gold pattern grown in the fur of its chest: three soft chevrons
    for (const [y, w] of [[670, 40], [706, 34], [740, 26]] as const) {
      shape([[400 - w * 0.2, y - 10], [420, y + 8], [420 + w, y - 12], [420 + w, y - 2], [420, y + 20], [398 - w * 0.2, y + 2]], GOLD, { angle: 20, over: 0, wash: 1 }, { w: 2.5 });
    }
    // the near front leg: a slight bend at the wrist, its paw a little forward, a faint trail behind
    trail(420, 1010, 180, 44, 0.35, -6);
    leg([[440, 760], [432, 880], [416, 980], [388, 1066]], [90, 66, 54, 48], SAND);
    head(370, 400, 0.74, -4);
  },
} satisfies Redraw;
