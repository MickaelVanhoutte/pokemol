import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOKS } from '../data/appearance';
import { beatAt, nextStop, scratchAt, soundsBetween } from '../ui/planche/planche';
import { camAt, fit } from '../ui/planche/draw';
import { PLANCHES, PHOTO, REVEIL_MS, VISAGE, wakeLids } from './planches';

const all = PLANCHES(DEFAULT_LOOKS.f);

describe('planches', () => {
  it.each(all.map((p) => [p.id, p] as const))('%s: beats in order, inside its length, captions in both languages', (_, p) => {
    expect(p.beats[0].at).toBe(0);
    for (let i = 1; i < p.beats.length; i++) expect(p.beats[i].at).toBeGreaterThan(p.beats[i - 1].at);
    expect(p.beats.at(-1)!.at).toBeLessThan(p.ms);
    for (const b of p.beats) {
      if (!b.caption) continue;
      expect(b.caption.fr.trim()).not.toBe('');
      expect(b.caption.en.trim()).not.toBe('');
    }
    for (const c of p.cues ?? []) {
      if ('at' in c) expect(c.at).toBeGreaterThan(0);
      else expect(c.to).toBeGreaterThan(c.from);
      expect('at' in c ? c.at : c.to).toBeLessThanOrEqual(p.ms);
    }
  });

  it('ids are unique (a planche showing is keyed on its id)', () => {
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length);
  });

  it('a press goes to the next beat, then to the end', () => {
    const p = all.find((x) => x.id === 'effaceurVisage')!;
    expect(nextStop(p, 0)).toBe(VISAGE.face);
    expect(nextStop(p, VISAGE.face)).toBe(VISAGE.cap);
    expect(nextStop(p, VISAGE.shown + 10)).toBe(p.ms);
    expect(beatAt(p, VISAGE.face - 1)).toBe(0);
    expect(beatAt(p, VISAGE.shown)).toBe(3);
    expect(p.beats[beatAt(p, p.ms + 5000)].caption?.fr).toContain('ton visage');
  });

  it('its sounds ring once, and the pencil or the eraser while they work', () => {
    const p = all.find((x) => x.id === 'effaceurVisage')!;
    expect(soundsBetween(p, VISAGE.shown - 10, VISAGE.shown)).toEqual(['thud']);
    expect(soundsBetween(p, VISAGE.shown, VISAGE.shown + 10)).toEqual([]);
    expect(scratchAt(p, VISAGE.face + 100)).toBe('pencil');
    expect(scratchAt(p, VISAGE.cap + 100)).toBe('rub');
    expect(scratchAt(p, VISAGE.end)).toBe(null);
    const ph = all.find((x) => x.id === 'photo')!;
    expect(soundsBetween(ph, 0, 30)).toEqual(['shutter']);
    expect(scratchAt(ph, PHOTO.write + 10)).toBe('pencil');
  });

  it('waking up: the eyes start shut, blink, and end open', () => {
    expect(wakeLids(0)).toBe(1);
    expect(wakeLids(REVEIL_MS)).toBe(0);
    let reopened = false, last = 1;
    for (let t = 0; t <= REVEIL_MS; t += 20) {
      const l = wakeLids(t);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(1);
      if (l > last + 0.2) reopened = true;
      last = l;
    }
    expect(reopened).toBe(true);
  });

  it('the camera eases from key to key and stays put in calm motion', () => {
    const keys = [{ at: 0, x: 0, y: 0, z: 1 }, { at: 1000, x: 100, y: 50, z: 2 }];
    expect(camAt(keys, 0)).toMatchObject({ x: 0, z: 1 });
    expect(camAt(keys, 500)).toMatchObject({ x: 50, y: 25, z: 1.5 });
    expect(camAt(keys, 2000)).toMatchObject({ x: 100, z: 2 });
    expect(camAt(keys, 700, true)).toMatchObject({ x: 0, z: 1 });
  });

  it('fit keeps the picture inside its box, centred', () => {
    expect(fit(400, 520, { x: 0, y: 0, w: 200, h: 520 })).toEqual({ x: 0, y: 130, w: 200, h: 260 });
  });
});
