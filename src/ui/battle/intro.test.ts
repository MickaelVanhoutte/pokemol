import { describe, expect, it } from 'vitest';
import { introOf, vsCardOf } from './intro';
import { COVER_KINDS, COVER_MS, COVER_SOUNDS, REVEAL_KINDS, REVEAL_MS, SHEET } from '../curtain/wipes';
import { DEFAULT_LOOKS } from '../../data/appearance';
import { L } from '../../i18n';

describe('battle intros', () => {
  it('wild Bestioles: the transition follows where they jumped out', () => {
    expect(introOf({ kind: 'wild', ground: 'tallgrass' })).toEqual({ cover: 'grass', reveal: 'lift' });
    expect(introOf({ kind: 'wild', ground: 'cave' }).cover).toBe('cave');
    expect(introOf({ kind: 'wild', ground: 'water' }).cover).toBe('water');
    expect(introOf({ kind: 'wild' }).cover).toBe('grass');
    expect(introOf({ kind: 'wild', ground: 'water' }).vs).toBeUndefined();
  });

  it('legends and the story’s big wild encounters get the stars and a VS splash', () => {
    expect(introOf({ kind: 'wild', legendary: true })).toEqual({ cover: 'legend', reveal: 'tear', vs: 'legend' });
    expect(introOf({ kind: 'wild', music: 'final', ground: 'cave' }).vs).toBe('legend');
  });

  it('trainers: ink hatching, Team Gomme rubs the screen out', () => {
    expect(introOf({ kind: 'trainer', music: 'trainer', trainerId: 'zoe' })).toEqual({ cover: 'trainer', reveal: 'tear' });
    expect(introOf({ kind: 'trainer', music: 'gommeBattle', grey: true, trainerId: 'e2g1' })).toEqual({ cover: 'gomme', reveal: 'erase' });
  });

  it('bosses get a VS splash', () => {
    expect(introOf({ kind: 'trainer', music: 'leader', badge: 'pastel', trainerId: 'mireille' }).vs).toBe('leader');
    // a rematch keeps its badge
    expect(introOf({ kind: 'trainer', music: 'leader', badge: 'pastel', trainerId: 'mireille:rematch' }).vs).toBe('leader');
    expect(introOf({ kind: 'trainer', music: 'rival' }).vs).toBe('rival');
    expect(introOf({ kind: 'trainer', music: 'final', trainerId: 'effaceur', grey: true })).toEqual({ cover: 'boss', reveal: 'erase', vs: 'boss' });
    expect(introOf({ kind: 'trainer', music: 'leader' }).vs).toBe('concours');
    expect(introOf({ kind: 'trainer', music: 'champion' }).vs).toBe('champion');
  });

  it('the Challenge Tower has no splash', () => {
    expect(introOf({ kind: 'trainer', music: 'leader', borrowed: true }).vs).toBeUndefined();
    expect(introOf({ kind: 'trainer', music: 'trainer', borrowed: true }).vs).toBeUndefined();
  });

  it('a leader’s card shows the name alone, in the badge’s colour', () => {
    const me = { person: DEFAULT_LOOKS.f, name: 'Léa' };
    const card = vsCardOf('leader', { name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), badge: 'pastel' }, me);
    expect(card.name).toBe('Mireille');
    expect(card.color).toBe('#9ed36a');
    expect(card.title).toBeTruthy();
    expect(vsCardOf('rival', { name: L('Feutre', 'Marker') }, me).name).toBe('Feutre');
  });
});

describe('transitions', () => {
  it('every cover and reveal has a duration, a sheet and sounds', () => {
    for (const k of COVER_KINDS) {
      expect(COVER_MS[k]).toBeGreaterThan(200);
      expect(SHEET[k].fill).toMatch(/^#[0-9a-f]{6}$/i);
      expect(COVER_SOUNDS[k]).toBeDefined();
    }
    for (const k of REVEAL_KINDS) expect(REVEAL_MS[k]).toBeGreaterThan(200);
  });
});
