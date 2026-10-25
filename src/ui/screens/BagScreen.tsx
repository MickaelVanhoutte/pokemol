import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { ITEMS, item } from '../../data/items';
import { maxHp } from '../../engine/pk/creature';
import { backToWorld } from '../../overworld/controller';
import { save, takeItem, update } from '../../state/game';
import { MonRow } from './PartyScreen';
import '../screens.css';

export function BagScreen() {
  const d = save.value!;
  const [using, setUsing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const owned = ITEMS.filter((it) => (d.bag[it.id] ?? 0) > 0);

  const useOn = (i: number) => {
    const it = item(using!);
    const m = d.party[i];
    const ok = it.kind === 'heal' ? m.hp > 0 && m.hp < maxHp(m) : it.kind === 'status' ? m.hp > 0 && !!m.status : m.hp <= 0;
    if (!ok) return setNote(tr(L('Ça n’aura aucun effet.', 'It won’t have any effect.')));
    update((x) => {
      if (!takeItem(x, it.id)) return;
      const t = x.party[i];
      if (it.kind === 'heal') t.hp = Math.min(maxHp(t), t.hp + it.amount);
      if (it.kind === 'status') { t.status = null; t.sleepTurns = 0; }
      if (it.kind === 'revive') { t.hp = Math.max(1, Math.floor((maxHp(t) * it.amount) / 100)); t.status = null; }
    });
    setNote(tr(L('Tu utilises {i} sur {n}.', 'You used {i} on {n}.'), { i: tr(it.name), n: tr(creature(m.species).name) }));
    setUsing(null);
  };

  return (
    <div class="screen mscreen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={() => (using ? setUsing(null) : backToWorld())}>← {tr(L('Retour', 'Back'))}</button>
        <h1>{tr(L('Sac', 'Bag'))}</h1>
        <span class="money">{d.money} ₽</span>
      </div>
      {note && <p class="mscreen__note">{note}</p>}
      {using ? (
        <>
          <p class="mscreen__note">{tr(L('Utiliser {i} sur quelle Bestiole ?', 'Use {i} on which Critter?'), { i: tr(item(using).name) })}</p>
          <div class="mscreen__list">{d.party.map((m, i) => <MonRow m={m} onClick={() => useOn(i)} />)}</div>
        </>
      ) : (
        <div class="mscreen__list">
          {owned.length === 0 && <p class="mscreen__note">{tr(L('Ton sac est vide.', 'Your bag is empty.'))}</p>}
          {owned.map((it) => (
            <button
              class="mrow"
              onClick={() => {
                setNote('');
                if (it.kind === 'ball') setNote(tr(L('Les Crayon-balls se lancent pendant un combat contre une Bestiole sauvage.', 'Pencil Balls are thrown during battles against wild Critters.')));
                else setUsing(it.id);
              }}
            >
              <span class="mrow__icon">{it.icon}</span>
              <span class="mrow__main"><b>{tr(it.name)}</b><small>{tr(it.desc)}</small></span>
              <span class="mrow__side pixel">×{d.bag[it.id]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
