import { creature, mirrored, monLabel } from '../../data/creatures';
import { monArtUrl, rigLayerUrl } from '../monArt';
import { activeMon, type BattleState, type Side } from '../../engine/pk/battle';
import { maxHp, xpAt, MAX_LEVEL, type Mon } from '../../engine/pk/creature';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Ref } from 'preact';
import { StatusTag, XpBar, lv } from '../paper';
import { sketchIconUrl } from '../sketchIcons';
import { backdropUrl, platformUrl } from './backdrops';
import type { Backdrop } from '../../data/schema';
import type { Look } from '../../overworld/sprites';
import { fromLook, type Appearance } from '../../data/appearance';
import { personUrl } from '../personArt';
import { dollUrl } from './fx/doll';
import { FAIR_RIG_OF, MOTION_DEFAULTS, RIG_OF, fairFile, idleOf, rigFile, type RigPart } from '../../data/rigs';
import { monTypes } from '../../data/fairCopies';
import { FairStar } from './FairStar';
import { prefs } from '../../state/prefs';
import { sfx } from '../../audio/sfx';
import { drainMs, isLow } from './tally';

export type Fx = Partial<Record<Side, string>>;

function HpBox({ st, side }: { st: BattleState; side: Side }) {
  const m = activeMon(st.sides[side]);
  const max = maxHp(m);
  const xpPct = side === 0 && m.level < MAX_LEVEL ? ((m.xp - xpAt(m.level)) / (xpAt(m.level + 1) - xpAt(m.level))) * 100 : 0;
  // one line: level, name, status and a short bar (yours with your HP written in it)
  return (
    <div class={`pk-hp pk-hp--${side === 0 ? 'me' : 'foe'}`}>
      <div class="pk-hp__top">
        <span>{lv(m.level)}</span>
        {/* just the name: "wild" / "foe" stay in the battle messages */}
        <b>{monLabel(m)}{m.shiny && <i class="shiny-mark" aria-label="✦">✦</i>}{m.fair && <FairStar class="pk-hp__fair" />}</b>
        {m.status && <StatusTag s={m.status} />}
        <BattleHp key={m.uid} hp={m.hp} max={max} numbers={side === 0} mine={side === 0} />
      </div>
      {side === 1 && st.kind === 'trainer' && <TeamBalls st={st} />}
      {side === 0 && <XpLine key={m.uid} xp={m.xp} pct={xpPct} level={m.level} />}
    </div>
  );
}

/**
 * The HP bar of a battle: the number runs down (or up) while the bar drains, like the GBA games, and
 * the bar blinks when it is low (yours beeps once as it gets there). Same look as `HpBar`.
 */
function BattleHp({ hp, max, numbers, mine }: { hp: number; max: number; numbers: boolean; mine: boolean }) {
  const [shown, setShown] = useState(hp);
  const now = useRef(hp);
  useEffect(() => {
    const from = now.current, to = hp;
    if (from === to) return;
    const ms = drainMs(to - from, max) * prefs.value.battleAnim;
    const t0 = performance.now();
    let raf = 0;
    const set = (v: number) => {
      if (mine && !isLow(now.current, max) && isLow(v, max)) sfx.lowHp();
      now.current = v;
      setShown(v);
    };
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      set(Math.round(from + (to - from) * k));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // frames stop in a hidden page: the bar still ends where it should
    const guard = setTimeout(() => set(to), ms + 120);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(guard);
    };
  }, [hp]);
  const pct = Math.max(0, (shown / max) * 100);
  return (
    <span class={`hpbar hpbar--${pct > 50 ? 'ok' : pct > 20 ? 'mid' : 'low'} ${numbers ? 'hpbar--num' : ''} ${isLow(shown, max) ? 'is-low' : ''}`}>
      <span style={{ width: `${pct}%`, transition: 'none' }} />
      {numbers && <i class="hpbar__num">{shown}/{max}</i>}
    </span>
  );
}

/** A trainer's team as little Croque-Carnets: black when knocked out, grey with a status. */
function TeamBalls({ st }: { st: BattleState }) {
  const src = sketchIconUrl('party')!;
  return (
    <span class="pk-team" aria-label={`${st.sides[1].party.length}`}>
      {st.sides[1].party.map((m) => <img src={src} alt="" class={m.hp <= 0 ? 'is-ko' : m.status ? 'is-status' : ''} />)}
    </span>
  );
}

/** How long the experience bar takes to fill (ms at normal speed). */
const XP_MS = 700;

/** Experience: a thin blue line over the box, shown only while it fills after a win. */
function XpLine({ xp, pct, level }: { xp: number; pct: number; level: number }) {
  const [shown, setShown] = useState(false);
  const last = useRef(xp);
  useEffect(() => {
    if (xp <= last.current) { last.current = xp; return; }
    last.current = xp;
    setShown(true);
    // a rising glide while it fills
    sfx.xpFill((XP_MS * prefs.value.battleAnim) / 1000);
    const t = setTimeout(() => setShown(false), 2600);
    return () => clearTimeout(t);
  }, [xp]);
  return <div class={`pk-hp__xp ${shown ? 'is-on' : ''}`}><XpBar pct={pct} level={level} ms={XP_MS * prefs.value.battleAnim} /></div>;
}

/**
 * A Bestiole on its platform: the box takes the move motions, mirroring and states (`cls`); inside, a
 * layer breathes or flies on the spot while it waits (`idleOf`), and a Bestiole with a battle rig moves
 * its parts (`src/data/rigs.ts`). A fair copy shows its own rig (`dark`: scribbled black by the Great
 * Eraser). The paper doll (`mon` null) keeps still.
 */
/** How big a drawing stands on its platform: a first form smaller, a middle form a little smaller, a grown one full size. */
export function stageSize(species: string): number {
  const c = creature(species);
  if (!c.evolutions?.length) return 1;
  return c.evolvesFrom ? 0.88 : 0.76;
}

function Sprite({ side, mon, src, cls, dark = false }: { side: Side; mon: Mon | null; src: string; cls: string; dark?: boolean }) {
  const fair = mon?.fair ? FAIR_RIG_OF[mon.species] : undefined;
  const rig = fair ?? (mon ? RIG_OF[mon.species] : undefined);
  const file = (layer: string) => (fair ? fairFile : rigFile)(mon!.species, rig!, layer);
  const part = (p: RigPart) => {
    const [amp, period] = MOTION_DEFAULTS[p.motion];
    const s = p.period ?? period;
    return (
      <img
        class={`pk-part pk-part--${p.motion} ${p.behind ? 'is-behind' : ''} ${p.inside ? 'is-inside' : ''}`}
        src={rigLayerUrl(mon!, file(p.name), false, dark)}
        alt=""
        style={{
          left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%`, height: `${p.height}%`,
          transformOrigin: `${p.ox}% ${p.oy}%`, animationDuration: `${s}s`,
          // each part and each side starts somewhere else in its movement
          animationDelay: `${-((p.phase ?? ((p.name.length * 7) % 10) / 10) + side * 0.37) * s}s`,
          '--amp': p.motion === 'fold' ? `${1 - (p.amp ?? amp) / 100}` : `${p.amp ?? amp}deg`,
          '--to-x': `${p.to?.[0] ?? 0}%`, '--to-y': `${p.to?.[1] ?? 0}%`,
          '--shrink': `${p.shrink ?? 1}`, '--fade': p.fade ? '0' : '1',
        }}
      />
    );
  };
  return (
    <div class={`pk-sprite ${cls}`} style={{ '--size': mon && !mon.fair ? stageSize(mon.species) : 1 }}>
      <div class={`pk-idle pk-idle--${mon ? idleOf(mon.species, mon.fair ? monTypes(mon) : undefined) : 'still'} pk-idle--side${side} ${rig?.parts.some((p) => p.clip) ? 'is-clipped' : ''}`}>
        {rig && mon ? (
          <>
            {rig.parts.filter((p) => p.behind).map(part)}
            <img class="pk-art pk-rig" src={rigLayerUrl(mon, file('base'), true, dark)} alt="" />
            {rig.parts.filter((p) => !p.behind).map(part)}
          </>
        ) : <img class="pk-art" src={src} alt="" />}
      </div>
    </div>
  );
}

/** Upper part of the battle: backdrop, platforms, both drawings facing each other, HP boxes. */
export function BattleScene({ view, fx, captured, backdrop, intro, foeTrainer, playerBack, leaving, grey, recolored, sceneRef }: {
  view: BattleState; fx: Fx; captured: boolean; backdrop: Backdrop; intro: boolean;
  foeTrainer?: Look; playerBack?: Appearance; grey: boolean; recolored: string[];
  /** Trainers stepping out of the scene before their first Bestiole comes out. */
  leaving?: Partial<Record<Side, boolean>>;
  /** The scene element, where the move animations draw. */
  sceneRef?: Ref<HTMLDivElement>;
}) {
  const mine = activeMon(view.sides[0]);
  const foe = activeMon(view.sides[1]);
  const mySp = creature(mine.species);
  const foeSp = creature(foe.species);
  const isGrey = grey && !recolored.includes(foe.uid);
  // up in the air or under the ground during a two-turn move
  const away = (side: 0 | 1) => (view.sides[side].vol.invuln ? 'is-away' : '');
  // behind a paper doll, the doll stands in its place
  const doll = (side: 0 | 1) => view.sides[side].vol.sub > 0;
  // the foe's box keeps its room once the trainer is gone; the boxes show once the Bestiole is out of its Croque-Carnet
  const foeRoom = !foeTrainer && !intro;
  const shown = (side: 0 | 1) => fx[side] !== 'hidden';
  return (
    <div ref={sceneRef} class={`pk-scene ${intro ? 'is-intro' : ''} ${prefs.value.moveFx ? '' : 'no-idle'}`} style={{ '--plat': `url(${platformUrl(backdrop)})` }}>
      {/* the camera: backdrop, drawings and effects (fx/camera.ts moves and zooms it) */}
      <div class="pk-cam" style={{ backgroundImage: `url(${backdropUrl(backdrop)})` }}>
        <canvas class="pk-fx-back" aria-hidden="true" />
        {view.weather && <div class={`pk-weather pk-weather--${view.weather.kind}`} aria-hidden="true" />}
        {/* the foe stands under its HP box (kept in the HUD, a spacer holds its room), you stand over yours */}
        <div class="pk-side pk-side--foe">
          {foeRoom && <div class="pk-hp-space" aria-hidden="true" />}
          <div class="pk-plat pk-plat--foe">
            {foeTrainer ? (
              <img class={`pk-trainer ${leaving?.[1] ? 'is-leaving' : ''}`} src={personUrl(fromLook(foeTrainer))} alt="" />
            ) : (
              <Sprite
                side={1}
                mon={doll(1) ? null : foe}
                src={doll(1) ? dollUrl() : monArtUrl(foe)}
                dark={!!foe.fair && !!view.sides[1].fairCopy?.dark}
                cls={`${mirrored(foeSp, true) ? 'is-mirrored' : ''} ${isGrey ? 'is-grey' : ''} ${fx[1] ? `fx-${fx[1]}` : ''} ${captured ? 'is-captured' : ''} ${foe.hp <= 0 && !fx[1] ? 'is-gone' : ''} ${away(1)} ${doll(1) ? 'is-doll' : ''}`}
              />
            )}
          </div>
        </div>
        <div class="pk-side pk-side--me">
          <div class="pk-plat pk-plat--me">
            {playerBack ? (
              <img class={`pk-trainer pk-trainer--me ${leaving?.[0] ? 'is-leaving' : ''}`} src={personUrl(playerBack, 'back')} alt="" />
            ) : (
              <Sprite
                side={0}
                mon={doll(0) ? null : mine}
                src={doll(0) ? dollUrl() : monArtUrl(mine)}
                cls={`${mirrored(mySp, false) ? 'is-mirrored' : ''} ${fx[0] ? `fx-${fx[0]}` : ''} ${mine.hp <= 0 && !fx[0] ? 'is-gone' : ''} ${away(0)} ${doll(0) ? 'is-doll' : ''}`}
              />
            )}
          </div>
        </div>
        <canvas class="pk-fx" aria-hidden="true" />
      </div>
      {/* the HUD stays still when the camera moves: the foe's box in a column like its drawing's, yours
          just over the panel (top left in landscape, battle.css) */}
      <div class="pk-hud">
        <div class="pk-side pk-side--foe">{foeRoom && shown(1) && <HpBox st={view} side={1} />}</div>
        {!playerBack && !intro && shown(0) && <HpBox st={view} side={0} />}
      </div>
    </div>
  );
}
