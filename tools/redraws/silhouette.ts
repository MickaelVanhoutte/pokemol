/**
 * How much two Bestioles' silhouettes overlap (intersection over union of their shadows, each trimmed and fitted in the
 * same square): the evolution guard. An evolution must change its silhouette (docs/bestioles.md): the families the owner
 * liked sit around 0.45-0.55; Clapoflot, sent back as « le même que sa sous-évolution », was 0.98.
 */
import sharp from 'sharp';

/** At or above this on the redraws sheet, the evolution is flagged in red: redesign its pose or body plan. */
export const WARN = 0.65;
/** At or above this the rules test fails: a copy or a recolour of the form before. */
export const FAIL = 0.9;

const N = 64;
export async function shadow(file: string): Promise<Uint8Array> {
  const a = await sharp(file).ensureAlpha().extractChannel(3).trim({ threshold: 10 })
    .resize(N, N, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).raw().toBuffer();
  return Uint8Array.from(a, (v) => (v > 100 ? 1 : 0));
}

export async function overlap(a: string, b: string): Promise<number> {
  const [m1, m2] = await Promise.all([shadow(a), shadow(b)]);
  let i = 0, u = 0;
  for (let k = 0; k < m1.length; k++) {
    i += m1[k] & m2[k];
    u += m1[k] | m2[k];
  }
  return u ? i / u : 0;
}
