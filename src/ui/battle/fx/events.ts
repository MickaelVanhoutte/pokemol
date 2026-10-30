/**
 * Animations of battle events other than moves: a status taking hold, stats going up or down,
 * healing, weather arriving, shields and paper dolls, talents and held items, Bestioles coming
 * out or called back, the Croque-Carnet.
 */
import { creature } from '../../../data/creatures';
import type { Major, StageKey } from '../../../data/schema';
import { activeMon, type BattleEvent, type BattleState, type Side } from '../../../engine/pk/battle';
import { at, PAL, SPARK, type Builder, type Recipe } from './core';
import { drain, impactStar, sparkle, sparks, speedLines, wrap } from './effects';
import { aura, batter, crayonBall, crumbs, doll, fairTrace, orbit, popOut, pulse, rise, shield, shinyBurst, sweat, vines, weatherIn, whirl } from './statusFx';

/** Crayon of each stat for the rising (or falling) chevrons. */
const STAT: Record<StageKey, string> = {
  atk: '#ef5350', def: '#f7a530', spa: '#d05cb2', spd: '#5cb33c', spe: '#4a92e0', acc: '#8a6cd0', eva: '#9b907c',
};

const HEAL = (): Builder => rise({ kind: 'plus', color: PAL.plante[1], n: 5, size: 0.18 });

function statusLayers(s: Major, bad = false): Builder[] {
  switch (s) {
    case 'burn': return [rise({ kind: 'flame', color: PAL.feu[1], n: 6, size: 0.26 })];
    case 'poison': return [rise({ kind: 'bubble', color: bad ? PAL.poison[2] : PAL.poison[1], n: bad ? 8 : 6, size: 0.2 })];
    case 'paralyze': return [sparks({ who: 'user', n: 4, dur: 700 })];
    case 'sleep': return [rise({ kind: 'zzz', color: PAL.vol[2], n: 3, size: 0.24 })];
    case 'freeze': return [sparkle({ who: 'user', kind: 'shard', color: PAL.glace[1], n: 8, size: 0.3, dur: 720 })];
  }
}

/** Events a move's own animation already shows (a weather move, a shield, a paper doll…). */
const SHOWN_BY_MOVE = new Set<BattleEvent['t']>(['weather', 'protect', 'sub', 'rest', 'seeded', 'trapped']);

/**
 * The animation of an event, and the side it plays on (`who: 'user'` in its layers is that side).
 * `moveShown` tells if the move this event belongs to just played its animation.
 */
export function eventFx(e: BattleEvent, snap: BattleState, moveShown: { side: Side; status: boolean } | null): { side: Side; recipe: Recipe } | null {
  if (moveShown && SHOWN_BY_MOVE.has(e.t)) return null;
  const on = (side: Side, layers: Builder[]) => ({ side, recipe: { hit: 'none' as const, layers } });
  const typeColor = (side: Side) => PAL[creature(activeMon(snap.sides[side]).species).type][1];
  switch (e.t) {
    case 'sendOut': return on(e.side, snap.sides[e.side].party[e.idx]?.shiny ? [popOut(), at(280, shinyBurst())] : [popOut()]);
    case 'withdraw': return on(e.side, [whirl()]);
    case 'fairCopy': return on(e.side, e.dark ? [fairTrace({ dark: true })] : [fairTrace(), at(650, shinyBurst({ dur: 1000 }))]);
    case 'status': return on(e.side, statusLayers(e.status, e.bad));
    case 'residual': return on(e.side, statusLayers(e.status));
    case 'asleep': return on(e.side, statusLayers('sleep'));
    case 'paralyzed': return on(e.side, statusLayers('paralyze'));
    case 'frozen': return on(e.side, statusLayers('freeze'));
    case 'thaw': return on(e.side, [sparkle({ who: 'user', kind: 'shard', color: PAL.glace[0], n: 6, size: 0.24, dur: 520 })]);
    case 'wake': case 'snapOut': return on(e.side, [sparkle({ who: 'user', kind: 'star', color: SPARK, n: 4, size: 0.2, dur: 520 })]);
    case 'confuse': case 'isConfused': case 'confusedHit': return on(e.side, [orbit({ kind: 'star', color: PAL.electrique[1], n: 3 })]);
    case 'flinch': return on(e.side, [sweat()]);
    case 'stage': return on(e.side, e.capped ? [pulse({ color: '#b9b2c8', n: 1, dur: 420 })] : [aura({ color: STAT[e.stat], down: e.delta < 0 })]);
    case 'guarded': return on(e.side, [shield({ flash: true, dur: 560 })]);
    case 'heal': return moveShown?.status && moveShown.side === e.side ? null : on(e.side, [HEAL()]);
    case 'regen': case 'itemHeal': return on(e.side, [HEAL()]);
    case 'rest': return on(e.side, [rise({ kind: 'zzz', color: PAL.vol[2], n: 3 })]);
    case 'weather': return e.on ? on(0, [weatherIn({ kind: e.kind })]) : null;
    case 'weatherHurt': return e.kind === 'sable' || e.kind === 'grele' ? on(e.side, [batter({ kind: e.kind })]) : null;
    case 'protect': return on(e.side, [shield()]);
    case 'protected': return on(e.side, [shield({ flash: true, dur: 560 })]);
    case 'sub': return on(e.side, [doll()]);
    case 'subBroke': return on(e.side, [doll({ torn: true })]);
    case 'seeded': return on(e.side, [vines({ who: 'user' })]);
    // leech seed: bits of the seeded one flow to the other side
    case 'seedDrain': return on((1 - e.side) as Side, [drain({ color: PAL.plante[1] })]);
    case 'nightmare': return on(e.side, [rise({ kind: 'zzz', color: PAL.spectre[2], n: 3 }), at(150, sparkle({ who: 'user', kind: 'spark', color: PAL.spectre[1], n: 4, size: 0.2 }))]);
    case 'trapped': case 'trapHurt': return on(e.side, [wrap({ who: 'user', loops: 3, dur: 640 })]);
    case 'talent': return on(e.side, [pulse({ color: typeColor(e.side) }), at(120, sparkle({ who: 'user', color: SPARK, n: 4, size: 0.18, dur: 500 }))]);
    case 'berry': return on(e.side, [crumbs({ color: '#e0453a' }), at(250, HEAL())]);
    case 'hangOn': return on(e.side, [pulse({ color: '#e0453a', n: 1 }), sparkle({ who: 'user', color: SPARK, n: 3 })]);
    case 'quick': return on(e.side, [speedLines({ who: 'user', n: 8, dur: 460 }), sparkle({ who: 'user', kind: 'feather', color: PAL.vol[0], n: 3, size: 0.24 })]);
    case 'itemHurt': return on(e.side, [impactStar({ who: 'user', size: 0.35 })]);
    case 'useItem': return e.target === snap.sides[0].active ? on(0, [rise({ kind: 'spark', color: '#8fd0ff', n: 6, size: 0.2 })]) : null;
    case 'focus': return on(e.side, [pulse({ color: '#e0453a', n: 2 })]);
    case 'guard': return e.on ? on(e.side, [shield({ dur: 600 })]) : null;
    default: return null;
  }
}

/** The Croque-Carnet (a little sketchbook) thrown at the foe (played from your side). */
export function ballFx(item: string, shakes: number, caught: boolean): Recipe {
  const superBall = item === 'super-crayon-ball';
  return { hit: 'none', layers: [crayonBall({ kind: superBall ? 'superbook' : 'book', color: superBall ? '#4a7fd6' : '#f2c94c', shakes, caught })] };
}

