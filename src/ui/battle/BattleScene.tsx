import { L, tr } from '../../i18n';
import { creature, mirrored, monLabel } from '../../data/creatures';
import { monArtUrl } from '../monArt';
import { activeMon, type BattleState, type Side } from '../../engine/pk/battle';
import { maxHp, xpAt, MAX_LEVEL } from '../../engine/pk/creature';
import { useEffect, useRef, useState } from 'preact/hooks';
import { HpBar, PixelIcon, StatusTag, XpBar, lv } from '../paper';
import { sketchIconUrl } from '../sketchIcons';
import { monName } from './messages';
import { backdropUrl, platformUrl } from './backdrops';
import type { Backdrop } from '../../data/schema';
import { lookImage, type Look } from '../../overworld/sprites';

export type Fx = Partial<Record<Side, string>>;
export interface BallFx { shakes: number; caught: boolean; key: number }

function HpBox({ st, side }: { st: BattleState; side: Side }) {
  const m = activeMon(st.sides[side]);
  const max = maxHp(m);
  const xpPct = side === 0 && m.level < MAX_LEVEL ? ((m.xp - xpAt(m.level)) / (xpAt(m.level + 1) - xpAt(m.level))) * 100 : 0;
  return (
    <div class={`pk-hp pk-hp--${side === 0 ? 'me' : 'foe'}`}>
      <div class="pk-hp__top">
        <b>{side === 0 ? monLabel(m) : monName(st, 1)}</b>
        {m.status && <StatusTag s={m.status} />}
        <span>{lv(m.level)}</span>
      </div>
      <div class="pk-hp__bar">
        <span class="hp-label">{tr(L('PV', 'HP'))}</span>
        <HpBar hp={m.hp} max={max} numbers={side === 0} />
        {side === 1 && st.kind === 'trainer' && <TeamBalls st={st} />}
      </div>
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

/** Upper part of the battle: backdrop, platforms, both drawings facing each other, HP boxes. */
export function BattleScene({ view, fx, ball, captured, backdrop, intro, foeTrainer, playerBack, grey, recolored }: {
  view: BattleState; fx: Fx; ball: BallFx | null; captured: boolean; backdrop: Backdrop; intro: boolean;
  foeTrainer?: Look; playerBack?: Look; grey: boolean; recolored: string[];
}) {
  const mine = activeMon(view.sides[0]);
  const foe = activeMon(view.sides[1]);
  const mySp = creature(mine.species);
  const foeSp = creature(foe.species);
  const isGrey = grey && !recolored.includes(foe.uid);
  return (
    <div class={`pk-scene ${intro ? 'is-intro' : ''}`} style={{ backgroundImage: `url(${backdropUrl(backdrop)})`, '--plat': `url(${platformUrl(backdrop)})` }}>
      {view.weather && <div class={`pk-weather pk-weather--${view.weather.kind}`} aria-hidden="true" />}
      {/* the foe stands under its HP box, you stand over yours */}
      <div class="pk-side pk-side--foe">
      {!foeTrainer && !intro && <HpBox st={view} side={1} />}
      <div class="pk-plat pk-plat--foe">
        {foeTrainer ? (
          <img class="pk-trainer" src={lookImage(foeTrainer, 'down')} alt="" />
        ) : (
          <img
            class={`pk-sprite ${mirrored(foeSp, true) ? 'is-mirrored' : ''} ${isGrey ? 'is-grey' : ''} ${fx[1] ? `fx-${fx[1]}` : ''} ${captured ? 'is-captured' : ''} ${foe.hp <= 0 && !fx[1] ? 'is-gone' : ''}`}
            src={monArtUrl(foe)}
            alt=""
          />
        )}
        {ball && (
          <div class={`pk-ball shakes-${ball.shakes} ${ball.caught ? 'is-caught' : ''}`} key={ball.key}>
            <PixelIcon id="crayon-ball" size={32} />
          </div>
        )}
      </div>
      </div>
      <div class="pk-side pk-side--me">
      <div class="pk-plat pk-plat--me">
        {playerBack ? (
          <img class="pk-trainer pk-trainer--me" src={lookImage(playerBack, 'up')} alt="" />
        ) : (
          <img
            class={`pk-sprite ${mirrored(mySp, false) ? 'is-mirrored' : ''} ${fx[0] ? `fx-${fx[0]}` : ''} ${mine.hp <= 0 && !fx[0] ? 'is-gone' : ''}`}
            src={monArtUrl(mine)}
            alt=""
          />
        )}
      </div>
      {!playerBack && !intro && <HpBox st={view} side={0} />}
      </div>
    </div>
  );
}
