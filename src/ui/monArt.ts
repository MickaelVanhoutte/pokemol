import { signal } from '@preact/signals';
import { CUSTOM_ID, artUrl, creature, customRevision } from '../data/creatures';
import { shinyHash, shinyRecolour } from '../art/shiny';
import { save } from '../state/game';

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

/** The species' card (or `src`, a piece of its battle rig) recoloured; `glitter` sprinkles the stars. */
function makeShiny(id: string, src = artUrl(creature(id)), glitter = true): Promise<string> {
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
      const seed = shinyHash(id);
      const coloured = shinyRecolour(data.data, id);
      g.putImageData(data, 0, 0);
      // glitter on the coloured parts, the same pattern every time
      let rnd = seed || 1;
      const next = () => ((rnd = Math.imul(rnd ^ (rnd >>> 15), 2246822507) ^ Math.imul(rnd ^ (rnd >>> 13), 3266489909)) >>> 0) / 4294967296;
      const count = Math.max(6, Math.min(22, Math.round(coloured.length / 2500)));
      const r = Math.max(4, Math.round(Math.max(w, h) / 45));
      for (let n = 0; n < count && coloured.length && glitter; n++) {
        const p = coloured[Math.floor(next() * coloured.length)];
        star(g, p % w, Math.floor(p / w), r * (0.6 + next() * 0.7));
      }
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`art ${id}`));
    img.src = src;
  });
}

let eggUrl = '';

/** A paper egg with coloured-pencil spots, drawn once. */
function eggArt(): string {
  if (eggUrl || typeof document === 'undefined') return eggUrl;
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 300;
  const g = c.getContext('2d')!;
  g.beginPath();
  g.ellipse(120, 160, 92, 126, 0, 0, Math.PI * 2);
  g.fillStyle = '#fffaf0';
  g.fill();
  g.lineWidth = 7;
  g.strokeStyle = '#2b2536';
  g.stroke();
  g.save();
  g.clip();
  // coloured-pencil spots and a zigzag band
  const spots: [number, number, number, string][] = [[80, 90, 22, '#9ad978'], [160, 120, 18, '#f2c14e'], [95, 200, 26, '#e07aa6'], [170, 225, 20, '#5b9be0'], [130, 60, 12, '#f08a3a']];
  for (const [x, y, r, col] of spots) {
    g.fillStyle = col;
    for (let k = 0; k < 9; k++) g.fillRect(x - r + k * (r / 4.5), y - r * 0.7 + (k % 2) * 3, r / 6, r * 1.4);
  }
  g.beginPath();
  for (let x = 20; x <= 230; x += 20) g.lineTo(x, 160 + (x / 20) % 2 * 18 - 9);
  g.lineWidth = 6;
  g.strokeStyle = '#7a5ad6';
  g.stroke();
  g.restore();
  eggUrl = c.toDataURL('image/png');
  return eggUrl;
}

/** Coconfus after the Great Eraser rubbed it, until the ending (`coconPale`, src/story/act3.ts). */
const isPale = (species: string) => species === '073' && !!save.value?.flags.coconPale && !save.value.flags.ending;

/** The drawing rubbed half away: colours washed out towards the paper, the dark lines kept a little. */
function makePale(src: string): Promise<string> {
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
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
        const wash = lum < 80 ? 0.45 : 0.7;
        for (let j = 0; j < 3; j++) px[i + j] = Math.round((px[i + j] * 0.25 + lum * 0.75) * (1 - wash) + 244 * wash);
        px[i + 3] = Math.round(px[i + 3] * 0.9);
      }
      g.putImageData(data, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`pale ${src}`));
    img.src = src;
  });
}

/**
 * The player's own Bestiole as a fair copy: its drawing gone over in felt-tip (colours brighter, a thick dark
 * outline) with the gold star in a corner.
 */
function makeFair(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
      const pad = Math.round(Math.max(w, h) * 0.06);
      const c = document.createElement('canvas');
      c.width = w + pad * 2;
      c.height = h + pad * 2;
      const g = c.getContext('2d')!;
      // the felt-tip outline: the drawing's shape in ink, drawn around it a few pixels out
      const ink = document.createElement('canvas');
      ink.width = c.width;
      ink.height = c.height;
      const gi = ink.getContext('2d')!;
      gi.drawImage(img, pad, pad, w, h);
      gi.globalCompositeOperation = 'source-in';
      gi.fillStyle = '#231d2b';
      gi.fillRect(0, 0, ink.width, ink.height);
      const r = Math.max(2, Math.round(Math.max(w, h) * 0.012));
      for (let a = 0; a < 16; a++) g.drawImage(ink, Math.round(Math.cos((a / 16) * Math.PI * 2) * r), Math.round(Math.sin((a / 16) * Math.PI * 2) * r));
      // the colours, brighter, like felt-tip over pencil
      g.drawImage(img, pad, pad, w, h);
      const data = g.getImageData(pad, pad, w, h);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
        for (let j = 0; j < 3; j++) px[i + j] = Math.max(0, Math.min(255, Math.round(lum + (px[i + j] - lum) * 1.6)));
      }
      g.putImageData(data, pad, pad);
      star(g, c.width - pad * 1.4, pad * 1.4, pad * 1.1);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`fair ${src}`));
    img.src = src;
  });
}

/** Image of a particular creature: its sparkly version when it is one, a paper egg for an egg. */
export function monArtUrl(m: { species: string; shiny?: boolean; egg?: unknown; fair?: boolean }): string {
  if (m.egg) return eggArt();
  const sp = creature(m.species);
  if (sp.id === CUSTOM_ID && m.fair) {
    void ready.value;
    const key = `fair:${sp.id}@${customRevision()}`;
    const hit = cache.get(key);
    if (hit) return hit;
    if (!pending.has(key) && typeof document !== 'undefined') {
      pending.add(key);
      makeFair(artUrl(sp))
        .then((url) => {
          cache.set(key, url);
          ready.value++;
        })
        .catch(() => pending.delete(key));
    }
    return artUrl(sp);
  }
  if (isPale(sp.id)) {
    void ready.value;
    const key = `pale:${sp.id}`;
    const hit = cache.get(key);
    if (hit) return hit;
    if (!pending.has(key) && typeof document !== 'undefined') {
      pending.add(key);
      makePale(artUrl(sp))
        .then((url) => {
          cache.set(key, url);
          ready.value++;
        })
        .catch(() => pending.delete(key));
    }
    return artUrl(sp);
  }
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

/**
 * The Great Eraser's fair copy: the drawing greyed and darkened, scribbled over in black felt-tip (the same
 * scribbles for the same picture).
 */
function makeDark(src: string): Promise<string> {
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
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
        for (let j = 0; j < 3; j++) px[i + j] = Math.round((px[i + j] * 0.2 + lum * 0.8) * 0.62);
      }
      g.putImageData(data, 0, 0);
      // zig-zag scribbles, only over the drawing
      let seed = [...src].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
      const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
      g.globalCompositeOperation = 'source-atop';
      g.strokeStyle = 'rgba(16, 12, 20, 0.7)';
      g.lineWidth = Math.max(2, Math.min(w, h) * 0.02);
      g.lineJoin = g.lineCap = 'round';
      for (let n = 0; n < 4; n++) {
        g.beginPath();
        let x = rnd() * w * 0.3, y = h * (0.15 + rnd() * 0.7);
        g.moveTo(x, y);
        while (x < w) {
          x += w * (0.04 + rnd() * 0.05);
          y += (rnd() - 0.5) * h * 0.35;
          g.lineTo(x, y);
        }
        g.stroke();
      }
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`dark ${src}`));
    img.src = src;
  });
}

/**
 * A piece of a creature's battle rig (`src/data/rigs.ts`), recoloured like its card when it is sparkly
 * (the same hue turn, glitter only on its body) or rubbed pale, or scribbled black (`dark`: the Great
 * Eraser's fair copy).
 */
export function rigLayerUrl(m: { species: string; shiny?: boolean }, src: string, body: boolean, dark = false): string {
  const how = dark ? 'dark' : isPale(m.species) ? 'pale' : m.shiny ? 'shiny' : null;
  if (!how) return src;
  void ready.value;
  const key = `${how}:${src}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!pending.has(key) && typeof document !== 'undefined') {
    pending.add(key);
    (how === 'dark' ? makeDark(src) : how === 'pale' ? makePale(src) : makeShiny(m.species, src, body))
      .then((url) => {
        cache.set(key, url);
        ready.value++;
      })
      .catch(() => pending.delete(key));
  }
  return src;
}
