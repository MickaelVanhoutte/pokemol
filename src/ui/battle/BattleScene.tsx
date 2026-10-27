import { L, tr } from '../../i18n';
import { creature, mirrored, monLabel } from '../../data/creatures';
import { monArtUrl } from '../monArt';
import { activeMon, type BattleState, type Side } from '../../engine/pk/battle';
import { maxHp, xpAt, MAX_LEVEL } from '../../engine/pk/creature';
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
import { idleOf } from '../../data/rigs';
import { prefs } from '../../state/prefs';

export type Fx = Partial<Record<Side, string>>;

function HpBox({ st, side }: { st: BattleState; side: Side }) {
  const m = activeMon(st.sides[side]);
  const max = maxHp(m);
  const xpPct = side === 0 && m.level < MAX_LEVEL ? ((m.xp - xpAt(m.level)) / (xpAt(m.level + 1) - xpAt(m.level))) * 100 : 0;
  return (
    <div class={`pk-hp pk-hp--${side === 0 ? 'me' : 'foe'}`}>
      <div class="pk-hp__top">
        {/* just the name: "wild" / "foe" stay in the battle messages */}
        <b>{monLabel(m)}{m.shiny && <i class="shiny-mark" aria-label="✦">✦</i>}</b>
        {m.status && <StatusTag s={m.status} />}
        <span>{lv(m.level)}</span>
      </div>
      <div class="pk-hp__bar">
        <span class="hp-label">{tr(L('PV', 'HP'))}</span>
        <HpBar hp={m.hp} max={max} numbers={side === 0} />
      </div>
      {side === 1 && st.kind === 'trainer' && <TeamBalls st={st} />}
      {side === 0 && <XpLine key={m.uid} xp={m.xp} pct={xpPct} level={m.level} />}
    </div>
  );
}

/** A trainer's team as little Crayon-balls: black when knocked out, grey with a status. */
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
 * layer breathes or flies on the spot while it waits (`idleOf`). The paper doll keeps still.
 */
function Sprite({ side, species, src, cls }: { side: Side; species: string | null; src: string; cls: string }) {
  return (
    <div class={`pk-sprite ${cls}`}>
      <div class={`pk-idle pk-idle--${species ? idleOf(species) : 'still'} pk-idle--side${side}`}>
        <img class="pk-art" src={src} alt="" />
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
            species={doll(1) ? null : foe.species}
            src={doll(1) ? dollUrl() : monArtUrl(foe)}
            cls={`${mirrored(foeSp, true) ? 'is-mirrored' : ''} ${isGrey ? 'is-grey' : ''} ${fx[1] ? `fx-${fx[1]}` : ''} ${captured ? 'is-captured' : ''} ${foe.hp <= 0 && !fx[1] ? 'is-gone' : ''} ${away(1)} ${doll(1) ? 'is-doll' : ''}`}
          />
        )}
      </div>
      </div>
      <div class="pk-side pk-side--me">
      {!playerBack && !intro && <HpBox st={view} side={0} />}
      <div class="pk-plat pk-plat--me">
        {playerBack ? (
          <img class="pk-trainer pk-trainer--me" src={personUrl(playerBack, 'back')} alt="" />
        ) : (
          <Sprite
            side={0}
            species={doll(0) ? null : mine.species}
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
