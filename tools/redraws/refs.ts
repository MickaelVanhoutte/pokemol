/**
 * npm run redraws:refs
 * Writes tools/out/refs-sheet.png: the Bestioles the owner approved and liked, at card size and at battle size, the bar a
 * new design must reach. The critic (.claude/skills/bestiole-design, « The process ») compares each candidate to it.
 * Add an id to APPROVED when the owner praises a design.
 */
import { join } from 'node:path';
import sharp from 'sharp';
import { creature } from '../../src/data/creatures.ts';

export const APPROVED = ['011', '054', '001', '020', '002', '021', '025', '033', '043', '049', '125', '128'];

const root = new URL('../..', import.meta.url).pathname;
const S = 260, B = 140, W = S + B + 30, H = S + 30, COLS = 2;
const tiles: { input: Buffer; left: number; top: number }[] = [];
for (const [i, id] of APPROVED.entries()) {
  const sp = creature(id), file = join(root, 'public/cards', `${id}-${sp.slug}.webp`);
  const x = (i % COLS) * W, y = Math.floor(i / COLS) * H;
  const fit = (n: number) => sharp(file).resize({ width: n, height: n, fit: 'contain', background: '#ffffff00' }).png().toBuffer();
  tiles.push({ input: await fit(S), left: x, top: y + 24 });
  tiles.push({ input: await fit(B), left: x + S + 20, top: y + 24 + S - B });
  tiles.push({ input: Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='22'><text x='4' y='17' font-family='sans-serif' font-size='16' fill='#333'>${id} ${sp.slug}</text></svg>`), left: x, top: y });
}
await sharp({ create: { width: COLS * W, height: Math.ceil(APPROVED.length / COLS) * H, channels: 4, background: '#ffffff' } })
  .composite(tiles).png().toFile(join(root, 'tools/out/refs-sheet.png'));
console.log('tools/out/refs-sheet.png');
