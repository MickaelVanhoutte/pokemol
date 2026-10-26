import { signal } from '@preact/signals';
import { artUrl, creature } from '../data/creatures';

/**
 * Sparkly ("pailleté") drawings: the card is recoloured once per species on a canvas (coloured
 * strokes change hue, black outlines and paper stay) and sprinkled with gold glitter, then kept
 * as a data URL. Until it is ready, the normal drawing is shown.
 */
const cache = new Map<string, string>();
const pending = new Set<string>();
const ready = signal(0);

/** Longest side of the recoloured image (battle and summary art are smaller than this). */
const MAX_SIDE = 640;

function hash(s: string): number {
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

function star(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const d = i % 2 ? r * 0.32 : r;
    g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  g.closePath();
  g.fillStyle = '#ffd84a';
  g.fill();
  g.beginPath();
  g.arc(x, y, r * 0.22, 0, Math.PI * 2);
  g.fillStyle = '#fffbe6';
  g.fill();
}

function makeShiny(id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d')!;
      g.drawImage(img, 0, 0, w, h);
      const data = g.getImageData(0, 0, w, h);
      const px = data.data;
      const seed = hash(id);
      const shift = 130 + (seed % 100);
      const coloured: number[] = [];
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3] < 20) continue;
        const [hu, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
        // pencil outlines (dark or grey) keep their colour
        if (s < 0.18 || l < 0.14 || l > 0.94) continue;
        const [r, gg, b] = hslToRgb((hu + shift) % 360, Math.min(1, s * 1.15), l);
        px[i] = r;
        px[i + 1] = gg;
        px[i + 2] = b;
        if (px[i + 3] > 200) coloured.push(i / 4);
      }
      g.putImageData(data, 0, 0);
      // glitter on the coloured parts, the same pattern every time
      let rnd = seed || 1;
      const next = () => ((rnd = Math.imul(rnd ^ (rnd >>> 15), 2246822507) ^ Math.imul(rnd ^ (rnd >>> 13), 3266489909)) >>> 0) / 4294967296;
      const count = Math.max(6, Math.min(22, Math.round(coloured.length / 2500)));
      const r = Math.max(4, Math.round(Math.max(w, h) / 45));
      for (let n = 0; n < count && coloured.length; n++) {
        const p = coloured[Math.floor(next() * coloured.length)];
        star(g, p % w, Math.floor(p / w), r * (0.6 + next() * 0.7));
      }
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`art ${id}`));
    img.src = artUrl(creature(id));
  });
}

/** Image of a particular creature: its sparkly version when it is one. */
export function monArtUrl(m: { species: string; shiny?: boolean }): string {
  const sp = creature(m.species);
  if (!m.shiny) return artUrl(sp);
  // reading the signal re-renders the component once the sparkly version is ready
  void ready.value;
  const hit = cache.get(sp.id);
  if (hit) return hit;
  if (!pending.has(sp.id) && typeof document !== 'undefined') {
    pending.add(sp.id);
    makeShiny(sp.id)
      .then((url) => {
        cache.set(sp.id, url);
        ready.value++;
      })
      .catch(() => pending.delete(sp.id));
  }
  return artUrl(sp);
}
