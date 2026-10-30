import { creature, mirrored, monLabel } from '../../data/creatures';
import { monArtUrl, rigLayerUrl } from '../monArt';
import { activeMon, type BattleState, type Side } from '../../engine/pk/battle';
import { maxHp, xpAt, MAX_LEVEL, type Mon } from '../../engine/pk/creature';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Ref } from 'preact';
import { HpBar, StatusTag, XpBar, lv } from '../paper';
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
        <HpBar hp={m.hp} max={max} numbers={side === 0} />
      </div>
      {side === 1 && st.kind === 'trainer' && <TeamBalls st={st} />}
      {side === 0 && <XpLine key={m.uid} xp={m.xp} pct={xpPct} level={m.level} />}
    </div>
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

/** Experience: a thin blue line over the box, shown only while it fills after a win. */
function XpLine({ xp, pct, level }: { xp: number; pct: number; level: number }) {
  const [shown, setShown] = useState(false);
  const last = useRef(xp);
  useEffect(() => {
    if (xp <= last.current) { last.current = xp; return; }
    last.current = xp;
    setShown(true);
    const t = setTimeout(() => setShown(false), 2600);
    return () => clearTimeout(t);
  }, [xp]);
  return <div class={`pk-hp__xp ${shown ? 'is-on' : ''}`}><XpBar pct={pct} level={level} /></div>;
}

/**
 * A Bestiole on its platform: the box takes the move motions, mirroring and states (`cls`); inside, a
 * layer breathes or flies on the spot while it waits (`idleOf`), and a Bestiole with a battle rig moves
 * its parts (`src/data/rigs.ts`). A fair copy shows its own rig (`dark`: scribbled black by the Great
 * Eraser). The paper doll (`mon` null) keeps still.
 */
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
    <div class={`pk-sprite ${cls}`}>
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
export function BattleScene({ view, fx, captured, backdrop, intro, foeTrainer, playerBack, grey, recolored, sceneRef }: {
  view: BattleState; fx: Fx; captured: boolean; backdrop: Backdrop; intro: boolean;
  foeTrainer?: Look; playerBack?: Appearance; grey: boolean; recolored: string[];
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
  return (
    <div ref={sceneRef} class={`pk-scene ${intro ? 'is-intro' : ''} ${prefs.value.moveFx ? '' : 'no-idle'}`} style={{ backgroundImage: `url(${backdropUrl(backdrop)})`, '--plat': `url(${platformUrl(backdrop)})` }}>
      <canvas class="pk-fx-back" aria-hidden="true" />
      {view.weather && <div class={`pk-weather pk-weather--${view.weather.kind}`} aria-hidden="true" />}
      {/* the foe stands under its HP box, you stand over yours */}
      <div class="pk-side pk-side--foe">
      {!foeTrainer && !intro && <HpBox st={view} side={1} />}
      <div class="pk-plat pk-plat--foe">
        {foeTrainer ? (
          <img class="pk-trainer" src={personUrl(fromLook(foeTrainer))} alt="" />
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
      {/* your box: just over the panel in portrait, top left in landscape (battle.css) */}
      {!playerBack && !intro && <HpBox st={view} side={0} />}
      <div class="pk-side pk-side--me">
      <div class="pk-plat pk-plat--me">
        {playerBack ? (
          <img class="pk-trainer pk-trainer--me" src={personUrl(playerBack, 'back')} alt="" />
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
  );
}
