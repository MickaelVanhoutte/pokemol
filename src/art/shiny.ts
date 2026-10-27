/**
 * The colours of a sparkly ("pailleté") Bestiole: every coloured pixel turns by the same hue for a
 * species, pencil outlines and paper stay. Shared by its card (`src/ui/monArt.ts`) and its overworld
 * miniature (`miniFor` in `src/overworld/game.ts`), so the follower matches the drawing.
 */

export function shinyHash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Recolours RGBA pixels in place for species `id`; returns the (pixel) indices of the solid ones it changed. */
export function shinyRecolour(px: Uint8ClampedArray, id: string): number[] {
  const shift = 130 + (shinyHash(id) % 100);
  const coloured: number[] = [];
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 20) continue;
    const [hu, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
    // pencil outlines (dark or grey) keep their colour
    if (s < 0.18 || l < 0.14 || l > 0.94) continue;
    const [r, g, b] = hslToRgb((hu + shift) % 360, Math.min(1, s * 1.15), l);
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    if (px[i + 3] > 200) coloured.push(i / 4);
  }
  return coloured;
}
