import { describe, expect, it } from 'vitest';
import { BOTTOM_STYLES, CLOTH_COLORS, DEFAULT_LOOKS, EXTRAS, HAIR_COLORS, HAIR_STYLES, SKIN_COLORS, TOP_STYLES, fromLook, randomLook } from './appearance';
import { LOOKS, lookOf } from '../overworld/sprites';

describe('the player’s look', () => {
  it('picks only offered options at random', () => {
    let seed = 1;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 200; i++) {
      const a = randomLook(r);
      expect(HAIR_STYLES.map((o) => o.id)).toContain(a.hair);
      expect(TOP_STYLES.map((o) => o.id)).toContain(a.top);
      expect(BOTTOM_STYLES.map((o) => o.id)).toContain(a.bottom);
      expect(EXTRAS.map((o) => o.id)).toContain(a.extra);
      expect(HAIR_COLORS).toContain(a.hairColor);
      expect(SKIN_COLORS).toContain(a.skin);
      expect(CLOTH_COLORS).toContain(a.topColor);
    }
  });

  it('turns into the world’s chibi: hairstyle, skirt, cap colour', () => {
    const girl = lookOf(DEFAULT_LOOKS.f);
    expect(girl).toMatchObject({ style: 'couettes', skirt: true, hair: DEFAULT_LOOKS.f.hairColor });
    expect(lookOf(DEFAULT_LOOKS.m).hat).toBe(DEFAULT_LOOKS.m.extraColor);
    expect(lookOf({ ...DEFAULT_LOOKS.m, hair: 'long' })).toMatchObject({ longHair: true, style: undefined });
  });

  it('draws the story’s characters from their chibi: the Prof in his lab coat', () => {
    expect(fromLook(LOOKS.prof).top).toBe('blouse');
    expect(fromLook(LOOKS.mom).hair).toBe('long');
    const kid = fromLook(LOOKS.kid);
    expect(kid.top).toBe('tshirt');
    expect(kid.face ?? kid.mask ?? kid.cape).toBeUndefined();
  });

  it('dresses all of Team Gomme alike: uniform and eraser cap, masks for grunts, capes for the ranks', () => {
    for (const k of ['gomme', 'gommeF', 'rature', 'blanche', 'buvard', 'effaceur'] as const) {
      expect(fromLook(LOOKS[k])).toMatchObject({ top: 'uniforme', extra: 'gomme' });
    }
    expect(fromLook(LOOKS.gomme)).toMatchObject({ mask: true, face: 'mean', cape: undefined });
    expect(fromLook(LOOKS.rature)).toMatchObject({ mask: false, face: 'mean', cape: LOOKS.rature.cape });
    expect(fromLook(LOOKS.effaceur).face).toBe('blank');
  });
});
