import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import { CREATURES, artUrl, creature } from '../../data/creatures';
import { DUNGEONS } from '../../data/dungeons';
import { support } from '../../data/supportCards';
import { TALISMAN_BY_ID } from '../../data/talismans';
import { LANES, reachable, type MapNode, type NodeKind, type RunState } from '../../engine/dungeon/run';
import { maxHpAt } from '../../engine/progression';
import { backToWorld } from '../../overworld/controller';
import {
  chooseEvent, enterNode, eventChoices, finishRun, leavePending, restHeal, restUpgrade, run, runSummary, setRunTeam,
  SHOP_HEAL_PRICE, SHOP_REMOVE_PRICE, shopBuy, shopHeal, shopPrice, shopRemove, takeReward, takeTreasure,
} from '../../state/dungeon';
import { save, update } from '../../state/game';
import { TEAM_MAX } from '../../save/schema';
import { SupportCard } from '../Card';
import { CardChooser } from '../CardChooser';
import './dungeon.css';

const ICON: Record<NodeKind, string> = {
  combat: '⚔️', elite: '😈', rest: '🔥', shop: '🛒', event: '❓', treasure: '🎁', wild: '🌿', boss: '👑',
};
const KIND_NAME: Record<NodeKind, LText> = {
  combat: L('Dresseur', 'Trainer'), elite: L('Élite', 'Elite'), rest: L('Repos', 'Rest'), shop: L('Boutique', 'Shop'),
  event: L('Mystère', 'Mystery'), treasure: L('Trésor', 'Treasure'), wild: L('Bestiole sauvage', 'Wild Critter'), boss: L('Boss', 'Boss'),
};

export function DungeonScreen() {
  const r = run();
  const [deckOpen, setDeckOpen] = useState(false);
  const [bossIntro, setBossIntro] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  if (!r) {
    return (
      <div class="screen">
        <button class="btn" onClick={backToWorld}>← {tr(L('Retour', 'Back'))}</button>
      </div>
    );
  }
  const dg = DUNGEONS[r.dungeonId];
  const go = async (id: number) => {
    if (busy) return;
    if (r.map.nodes[id].kind === 'boss' && bossIntro === null) return setBossIntro(id);
    setBossIntro(null);
    setBusy(true);
    try {
      await enterNode(id);
    } finally {
      setBusy(false);
    }
  };
  const abandon = () => {
    if (!confirm(tr(L('Abandonner l’exploration ? Tu gardes la moitié des pièces et paillettes.', 'Give up the expedition? You keep half the coins and glitter.')))) return;
    update((d) => (d.run!.pending = { kind: 'defeat' }));
  };

  return (
    <div class={`screen dg dg--${dg.backdrop}`}>
      <div class="screen__bar">
        <h1>{tr(dg.name)}</h1>
        <span class="dg__money pixel">🪙 {r.coins} · ✨ {r.glitter}</span>
        {r.team.length > 0 && <button class="btn btn--small" onClick={() => setDeckOpen(true)}>🂠 {r.deck.length}</button>}
      </div>
      {r.team.length > 0 && (
        <div class="dg__status">
          <div class="dg__team">
            {r.team.map((m) => {
              const max = maxHpAt(m.defId, m.level);
              return (
                <div class={`dg__mate ${m.hp <= 0 ? 'is-ko' : ''}`} title={tr(creature(m.defId).name)}>
                  <img src={artUrl(creature(m.defId))} alt="" />
                  <div class="dg__hp"><div style={{ width: `${(m.hp / max) * 100}%` }} /></div>
                  <small>{m.hp}/{max}</small>
                </div>
              );
            })}
          </div>
          <div class="dg__tals">
            {r.talismans.map((id) => <span title={`${tr(TALISMAN_BY_ID[id].name)} — ${tr(TALISMAN_BY_ID[id].text)}`}>{TALISMAN_BY_ID[id].icon}</span>)}
          </div>
        </div>
      )}

      {r.team.length === 0 ? (
        <TeamPicker />
      ) : r.pending ? (
        <Pending r={r} />
      ) : bossIntro !== null ? (
        <div class="dg__panel">
          {dg.boss.intro.map((l) => <p>{tr(l)}</p>)}
          <button class="btn btn--primary" onClick={() => go(bossIntro)}>⚔️ {tr(L('Combattre !', 'Fight!'))}</button>
          <button class="btn btn--ghost" onClick={() => setBossIntro(null)}>{tr(L('Pas encore', 'Not yet'))}</button>
        </div>
      ) : (
        <>
          <RunMap r={r} onPick={go} />
          <div class="dg__foot">
            <button class="btn btn--ghost btn--small" onClick={abandon}>{tr(L('Abandonner', 'Give up'))}</button>
          </div>
        </>
      )}

      {deckOpen && (
        <div class="overlay" onClick={() => setDeckOpen(false)}>
          <div class="dg__deck">
            {r.deck.map((id) => <SupportCard def={support(id)} width={110} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPicker() {
  const d = save.value!;
  const [picked, setPicked] = useState<string[]>(d.team.slice(0, TEAM_MAX));
  const owned = CREATURES.filter((c) => d.collection[c.id]);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < TEAM_MAX ? [...p, id] : p));
  return (
    <div class="dg__panel">
      <h2 class="pixel">{tr(L('Choisis jusqu’à 4 Bestioles', 'Pick up to 4 Critters'))}</h2>
      <p>{tr(L('Leurs PV ne se régénèrent pas entre les combats. Bonne chance !', 'Their HP doesn’t refill between battles. Good luck!'))}</p>
      <div class="dg__pick">
        {owned.map((c) => {
          const i = picked.indexOf(c.id);
          return (
            <button class={`dg__pickcell ${i >= 0 ? 'is-on' : ''}`} onClick={() => toggle(c.id)}>
              {i >= 0 && <span class="dg__order">{i + 1}</span>}
              <img src={artUrl(c)} alt="" />
              <b>{tr(c.name)}</b>
              <small>{tr(L('Niv.', 'Lv.'))} {d.collection[c.id].level}</small>
            </button>
          );
        })}
      </div>
      <button class="btn btn--primary" disabled={!picked.length} onClick={() => setRunTeam(picked)}>{tr(L('Entrer !', 'Go in!'))}</button>
      <button class="btn btn--ghost" onClick={() => { update((x) => (x.run = null)); backToWorld(); }}>{tr(L('Finalement non', 'Never mind'))}</button>
    </div>
  );
}

function RunMap({ r, onPick }: { r: RunState; onPick: (id: number) => void }) {
  const can = new Set(reachable(r));
  const rows = r.map.rows;
  const H = rows * 86 + 40;
  const pos = (n: MapNode) => ({ x: ((n.col + 0.5) / LANES) * 100, y: H - 40 - n.row * 86 });
  const wrap = useRef<HTMLDivElement>(null);
  // keep the current row in view (the start is at the bottom)
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const row = r.at === null ? 0 : r.map.nodes[r.at].row;
    el.scrollTop = H - 40 - row * 86 - el.clientHeight * 0.65;
  }, [r.at]);
  return (
    <div class="dg__mapwrap" ref={wrap}>
      <div class="dg__map" style={{ height: `${H}px` }}>
        <svg class="dg__lines" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
          {r.map.nodes.flatMap((n) =>
            n.next.map((m) => {
              const a = pos(n), b = pos(r.map.nodes[m]);
              const used = r.visited.includes(n.id) && r.visited.includes(m);
              return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class={used ? 'is-used' : ''} vector-effect="non-scaling-stroke" />;
            }),
          )}
        </svg>
        {r.map.nodes.map((n) => {
          const p = pos(n);
          const visited = r.visited.includes(n.id);
          const here = r.at === n.id;
          return (
            <button
              class={`dg__node k-${n.kind} ${visited ? 'is-visited' : ''} ${here ? 'is-here' : ''} ${can.has(n.id) ? 'is-open' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}px` }}
              disabled={!can.has(n.id)}
              title={tr(KIND_NAME[n.kind])}
              onClick={() => onPick(n.id)}
            >
              {ICON[n.kind]}
            </button>
          );
        })}
      </div>
      <div class="dg__legend">
        {(Object.keys(ICON) as NodeKind[]).map((k) => <span>{ICON[k]} {tr(KIND_NAME[k])}</span>)}
      </div>
    </div>
  );
}

function DeckPick({ filter, onPick, onCancel, title }: { filter: (id: string) => boolean; onPick: (i: number) => void; onCancel: () => void; title: string }) {
  const r = run()!;
  return (
    <div class="dg__panel">
      <h2 class="pixel">{title}</h2>
      <div class="dg__deckpick">
        {r.deck.map((id, i) => (filter(id) ? <SupportCard def={support(id)} width={110} onClick={() => onPick(i)} /> : null))}
      </div>
      <button class="btn btn--ghost" onClick={onCancel}>{tr(L('Annuler', 'Cancel'))}</button>
    </div>
  );
}

function Pending({ r }: { r: RunState }) {
  const p = r.pending!;
  const dg = DUNGEONS[r.dungeonId];
  const [mode, setMode] = useState<'upgrade' | 'remove' | null>(null);
  const [eventMsg, setEventMsg] = useState<LText | null>(null);
  const [keep, setKeep] = useState<string | null>(null);

  if (eventMsg) {
    return (
      <div class="dg__panel">
        <p>{tr(eventMsg)}</p>
        <button class="btn btn--primary" onClick={() => setEventMsg(null)}>OK</button>
      </div>
    );
  }
  if (mode === 'upgrade') {
    return <DeckPick title={tr(L('Quelle carte améliorer ?', 'Which card to upgrade?'))} filter={(id) => !!support(id).upgrade} onPick={(i) => { restUpgrade(i); setMode(null); }} onCancel={() => setMode(null)} />;
  }
  if (mode === 'remove') {
    return <DeckPick title={tr(L('Quelle carte retirer ?', 'Which card to remove?'))} filter={() => true} onPick={(i) => { shopRemove(i); setMode(null); }} onCancel={() => setMode(null)} />;
  }

  switch (p.kind) {
    case 'reward':
      return (
        <div class="dg__panel">
          <h2 class="pixel">{tr(L('Victoire !', 'Victory!'))}</h2>
          <p>🪙 +{p.coins} · ✨ +{p.glitter}</p>
          {p.talisman && (
            <p class="dg__tal">{TALISMAN_BY_ID[p.talisman].icon} <b>{tr(TALISMAN_BY_ID[p.talisman].name)}</b> — {tr(TALISMAN_BY_ID[p.talisman].text)}</p>
          )}
          {p.cards.length > 0 && (
            <CardChooser
              inline
              mode="pick"
              title={tr(L('Choisis une carte à ajouter à ton deck :', 'Pick a card to add to your deck:'))}
              items={p.cards.map((id) => ({ kind: 'support', id }))}
              chooseLabel={(n) => tr(L('Prendre {name}', 'Take {name}'), { name: n })}
              onChoose={(i) => takeReward(p.cards[i])}
            />
          )}
          <button class="btn" onClick={() => takeReward(null)}>{p.cards.length ? tr(L('Passer', 'Skip')) : tr(L('Continuer', 'Continue'))}</button>
        </div>
      );
    case 'treasure': {
      const tal = TALISMAN_BY_ID[p.talisman];
      return (
        <div class="dg__panel">
          <h2 class="pixel">🎁 {tr(L('Un trésor !', 'A treasure!'))}</h2>
          <p class="dg__big">{tal.icon}</p>
          <p><b>{tr(tal.name)}</b> — {tr(tal.text)}</p>
          <button class="btn btn--primary" onClick={takeTreasure}>{tr(L('Prendre', 'Take'))}</button>
        </div>
      );
    }
    case 'event': {
      const ev = eventChoices(p.event);
      return (
        <div class="dg__panel">
          <h2 class="pixel">❓</h2>
          <p>{tr(ev.text)}</p>
          {ev.choices.map((c) => <button class="btn" onClick={() => setEventMsg(chooseEvent(c))}>{tr(c.label)}</button>)}
        </div>
      );
    }
    case 'shop':
      return (
        <div class="dg__panel">
          <h2 class="pixel">🛒 {tr(L('Marchand des profondeurs', 'Deep Merchant'))}</h2>
          <p>🪙 {r.coins}</p>
          <div class="dg__choices">
            {p.cards.map((id, i) => (
              <div class="dg__ware">
                <SupportCard def={support(id)} width={120} class={p.sold.includes(i) ? 'is-dim' : ''} />
                <button class="btn btn--small" disabled={p.sold.includes(i) || r.coins < shopPrice(id)} onClick={() => shopBuy(i)}>
                  {p.sold.includes(i) ? tr(L('Vendu', 'Sold')) : `🪙 ${shopPrice(id)}`}
                </button>
              </div>
            ))}
          </div>
          <button class="btn" disabled={r.coins < SHOP_REMOVE_PRICE || r.deck.length <= 6} onClick={() => setMode('remove')}>
            ✂️ {tr(L('Retirer une carte', 'Remove a card'))} · 🪙 {SHOP_REMOVE_PRICE}
          </button>
          <button class="btn" disabled={r.coins < SHOP_HEAL_PRICE} onClick={shopHeal}>💗 {tr(L('Soigner l’équipe (+25 PV)', 'Heal team (+25 HP)'))} · 🪙 {SHOP_HEAL_PRICE}</button>
          <button class="btn btn--primary" onClick={leavePending}>{tr(L('Partir', 'Leave'))}</button>
        </div>
      );
    case 'rest':
      return (
        <div class="dg__panel">
          <h2 class="pixel">🔥 {tr(L('Un coin pour se reposer', 'A place to rest'))}</h2>
          <button class="btn btn--primary" onClick={restHeal}>💤 {tr(L('Dormir : +40 % PV (les K.O. se relèvent)', 'Sleep: +40% HP (knocked out ones get up)'))}</button>
          <button class="btn" disabled={!r.deck.some((id) => support(id).upgrade)} onClick={() => setMode('upgrade')}>
            ✏️ {tr(L('Améliorer une carte', 'Upgrade a card'))}
          </button>
        </div>
      );
    case 'victory': {
      const sum = runSummary(true);
      const gained = [...new Set(r.gained)];
      return (
        <div class="dg__panel">
          {dg.boss.outro.map((l) => <p>{tr(l)}</p>)}
          <h2 class="pixel">🏅 {tr(dg.badgeName)}</h2>
          <p>🪙 +{sum.coins} · ✨ +{sum.glitter} · {sum.xp} XP</p>
          {r.captured.length > 0 && <p>{tr(L('Capturées : {list}', 'Caught: {list}'), { list: r.captured.map((id) => tr(creature(id).name)).join(', ') })}</p>}
          {gained.length > 0 && (
            <>
              <CardChooser
                inline
                mode="pick"
                title={tr(L('Garde une carte trouvée pendant l’aventure :', 'Keep one card found during the adventure:'))}
                items={gained.map((id) => ({ kind: 'support', id }))}
                chooseLabel={(n) => tr(L('Garder {name}', 'Keep {name}'), { name: n })}
                itemClass={(i) => (gained[i] === keep ? 'is-picked' : '')}
                onChoose={(i) => setKeep(gained[i])}
              />
            </>
          )}
          <button class="btn btn--primary" onClick={() => { finishRun(true, keep); backToWorld(); }}>{tr(L('Rentrer en ville', 'Head back to town'))}</button>
        </div>
      );
    }
    case 'defeat': {
      const sum = runSummary(false);
      return (
        <div class="dg__panel">
          <h2 class="pixel">{tr(L('Expédition terminée', 'Expedition over'))}</h2>
          <p>{tr(L('Tes Bestioles sont épuisées. Tu rentres avec la moitié du butin.', 'Your Critters are worn out. You head home with half the loot.'))}</p>
          <p>🪙 +{sum.coins} · ✨ +{sum.glitter} · {sum.xp} XP</p>
          {r.captured.length > 0 && <p>{tr(L('Tu gardes tes captures : {list}', 'You keep your catches: {list}'), { list: r.captured.map((id) => tr(creature(id).name)).join(', ') })}</p>}
          <button class="btn btn--primary" onClick={() => { finishRun(false, null); backToWorld(); }}>{tr(L('Rentrer', 'Go home'))}</button>
        </div>
      );
    }
  }
}
