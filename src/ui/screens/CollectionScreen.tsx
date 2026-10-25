import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { CREATURES, artUrl, creature } from '../../data/creatures';
import { SUPPORT_CARDS, support } from '../../data/supportCards';
import { maxHpAt, xpToNext, MAX_LEVEL } from '../../engine/progression';
import { backToWorld } from '../../overworld/controller';
import { DECK_MAX, DECK_MIN, TEAM_MAX } from '../../save/schema';
import { save, update } from '../../state/game';
import { go, type Screen } from '../../state/router';
import { Card, SupportCard } from '../Card';
import './collection.css';

export function CollectionScreen({ back }: { back: Screen }) {
  const [tab, setTab] = useState<'team' | 'deck' | 'dex'>('team');
  const [detail, setDetail] = useState<string | null>(null);
  const [supDetail, setSupDetail] = useState<string | null>(null);
  const d = save.value!;
  const deckOk = d.deck.length >= DECK_MIN && d.deck.length <= DECK_MAX;
  const leave = () => {
    if (!deckOk || !d.team.length) return;
    if (back.id === 'overworld') backToWorld();
    else go(back);
  };
  const cardW = Math.min(170, Math.floor((Math.min(window.innerWidth, 1000) - 56) / 3));

  return (
    <div class="screen coll">
      <div class="screen__bar">
        <button class="btn btn--small" disabled={!deckOk || !d.team.length} onClick={leave}>← {tr(L('Retour', 'Back'))}</button>
        <h1>{tr(L('Mes cartes', 'My cards'))}</h1>
        <div class="tabs">
          <button class="btn btn--small" aria-pressed={tab === 'team'} onClick={() => setTab('team')}>{tr(L('Équipe', 'Team'))}</button>
          <button class="btn btn--small" aria-pressed={tab === 'deck'} onClick={() => setTab('deck')}>{tr(L('Deck', 'Deck'))} {d.deck.length}</button>
          <button class="btn btn--small" aria-pressed={tab === 'dex'} onClick={() => setTab('dex')}>{tr(L('Bestiodex', 'Critterdex'))}</button>
        </div>
      </div>
      {!deckOk && <p class="coll__warn">{tr(L('Ton deck doit avoir entre {a} et {b} cartes.', 'Your deck needs {a} to {b} cards.'), { a: DECK_MIN, b: DECK_MAX })}</p>}

      {tab === 'team' && (
        <>
          <h2 class="pixel coll__h">{tr(L('Équipe ({n}/{max}) — la première commence le combat', 'Team ({n}/{max}) — the first one starts the battle'), { n: d.team.length, max: TEAM_MAX })}</h2>
          <div class="coll__team">
            {d.team.map((id, i) => <TeamSlot id={id} index={i} onOpen={() => setDetail(id)} />)}
            {Array.from({ length: TEAM_MAX - d.team.length }, () => <div class="slot-empty">+</div>)}
          </div>
          <h2 class="pixel coll__h">{tr(L('Toutes mes Bestioles', 'All my Critters'))}</h2>
          <div class="card-grid">
            {CREATURES.filter((c) => d.collection[c.id]).map((c) => (
              <div class="coll__item">
                <Card def={c} width={cardW} level={d.collection[c.id].level} onClick={() => setDetail(c.id)} />
                {d.team.includes(c.id) && <span class="coll__badge">{tr(L('Équipe', 'Team'))}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'deck' && <DeckEditor onOpen={setSupDetail} />}

      {tab === 'dex' && (
        <div class="dex">
          {CREATURES.map((c) => {
            const owned = !!d.collection[c.id];
            const seen = d.seen.includes(c.id);
            return (
              <button class={`dex__cell ${owned ? 'is-owned' : seen ? 'is-seen' : ''}`} onClick={() => owned && setDetail(c.id)}>
                <span class="dex__num">N° {c.id}</span>
                {seen || owned ? <img src={artUrl(c)} alt="" /> : <span class="dex__q">?</span>}
                <span class="dex__name">{seen || owned ? tr(c.name) : '???'}</span>
              </button>
            );
          })}
        </div>
      )}

      {detail && <CreatureDetail id={detail} onClose={() => setDetail(null)} />}
      {supDetail && (
        <div class="overlay" onClick={() => setSupDetail(null)}>
          <SupportCard def={support(supDetail)} width={Math.min(320, window.innerWidth - 32)} />
        </div>
      )}
    </div>
  );
}

function TeamSlot({ id, index, onOpen }: { id: string; index: number; onOpen: () => void }) {
  const d = save.value!;
  const o = d.collection[id];
  const max = maxHpAt(id, o.level);
  const hp = d.hp[id] ?? max;
  const move = (dir: -1 | 1) =>
    update((x) => {
      const j = index + dir;
      if (j < 0 || j >= x.team.length) return;
      [x.team[index], x.team[j]] = [x.team[j], x.team[index]];
    });
  return (
    <div class="tslot">
      <button class="tslot__art" onClick={onOpen}>
        <img src={artUrl(creature(id))} alt="" />
      </button>
      <b>{tr(creature(id).name)}</b>
      <small>{tr(L('Niv.', 'Lv.'))} {o.level} · {hp}/{max} {tr(L('PV', 'HP'))}</small>
      <div class="tslot__btns">
        <button class="btn btn--small" disabled={index === 0} onClick={() => move(-1)}>◀</button>
        <button class="btn btn--small" disabled={index === d.team.length - 1} onClick={() => move(1)}>▶</button>
      </div>
    </div>
  );
}

function CreatureDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const d = save.value!;
  const o = d.collection[id];
  const inTeam = d.team.includes(id);
  const def = creature(id);
  const toggle = () =>
    update((x) => {
      if (x.team.includes(id)) {
        if (x.team.length > 1) x.team = x.team.filter((t) => t !== id);
      } else if (x.team.length < TEAM_MAX) x.team.push(id);
    });
  return (
    <div class="overlay" onClick={onClose}>
      <div class="detail" onClick={(e) => e.stopPropagation()}>
        <Card def={def} width={Math.min(300, window.innerWidth - 48)} level={o.level} />
        <div class="detail__info">
          <p class="pixel">{tr(L('Niveau', 'Level'))} {o.level}{o.level >= MAX_LEVEL ? ' (max)' : ''}</p>
          {o.level < MAX_LEVEL && (
            <div class="xpbar"><div style={{ width: `${(o.xp / xpToNext(o.level)) * 100}%` }} /></div>
          )}
          <p>{tr(L('Exemplaires : {n}', 'Copies: {n}'), { n: o.copies })}</p>
          {def.evolvesTo && def.evolveLevel && (
            <p>{tr(L('Évolue au niveau {n}', 'Evolves at level {n}'), { n: def.evolveLevel })}</p>
          )}
          <div class="detail__btns">
            <button class="btn" disabled={(inTeam && d.team.length <= 1) || (!inTeam && d.team.length >= TEAM_MAX)} onClick={toggle}>
              {inTeam ? tr(L('Retirer de l’équipe', 'Remove from team')) : tr(L('Ajouter à l’équipe', 'Add to team'))}
            </button>
            <button class="btn btn--primary" onClick={onClose}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeckEditor({ onOpen }: { onOpen: (id: string) => void }) {
  const d = save.value!;
  const inDeck = (id: string) => d.deck.filter((x) => x === id).length;
  const owned = SUPPORT_CARDS.filter((c) => (d.supplies[c.id] ?? 0) > 0);
  const add = (id: string) =>
    update((x) => {
      if (x.deck.length < DECK_MAX && x.deck.filter((y) => y === id).length < (x.supplies[id] ?? 0)) x.deck.push(id);
    });
  const remove = (id: string) =>
    update((x) => {
      const i = x.deck.lastIndexOf(id);
      if (i >= 0) x.deck.splice(i, 1);
    });
  return (
    <>
      <h2 class="pixel coll__h">
        {tr(L('Deck : {n} cartes ({a}–{b})', 'Deck: {n} cards ({a}–{b})'), { n: d.deck.length, a: DECK_MIN, b: DECK_MAX })}
      </h2>
      <div class="deck">
        {owned.map((c) => (
          <div class={`deck__row ${inDeck(c.id) ? 'is-in' : ''}`}>
            <button class="deck__icon" onClick={() => onOpen(c.id)}>{c.icon}</button>
            <div class="deck__text">
              <b>{tr(c.name)}</b>
              <small>{tr(c.text)}</small>
            </div>
            <div class="deck__count">
              <button class="btn btn--small" disabled={!inDeck(c.id)} onClick={() => remove(c.id)}>−</button>
              <span>{inDeck(c.id)} / {d.supplies[c.id]}</span>
              <button class="btn btn--small" disabled={inDeck(c.id) >= (d.supplies[c.id] ?? 0) || d.deck.length >= DECK_MAX} onClick={() => add(c.id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
