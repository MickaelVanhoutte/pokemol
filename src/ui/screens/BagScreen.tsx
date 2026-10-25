import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { item } from '../../data/items';
import { backToWorld } from '../../overworld/controller';
import { save, takeItem, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { canUseOn, useOn } from '../logic/bag';
import { BagView } from '../views/BagView';
import { PartyView } from '../views/PartyView';
import { PageView } from '../views/PageView';
import { SwapAsk, giveToParty } from './give';

export function BagScreen() {
  const d = save.value!;
  const [using, setUsing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [reading, setReading] = useState<number | null>(null);
  const [giving, setGiving] = useState<string | null>(null);
  const [ask, setAsk] = useState<number | null>(null);
  if (reading !== null) return <PageView n={reading} onClose={() => setReading(null)} />;
  if (giving) {
    const give = (i: number) => {
      setNote(giveToParty(i, giving, d.party[i]));
      setAsk(null);
      setGiving(null);
    };
    return (
      <>
        <PartyView
          party={d.party}
          mode="target"
          message={tr(L('Donner {i} à quelle Bestiole ?', 'Give the {i} to which Critter?'), { i: tr(item(giving).name) })}
          onPick={(i) => (d.party[i].item ? setAsk(i) : give(i))}
          onClose={() => setGiving(null)}
        />
        {ask !== null && <SwapAsk mon={d.party[ask]} id={giving} onAnswer={(yes) => (yes ? give(ask) : setAsk(null))} />}
      </>
    );
  }
  if (using) {
    return (
      <PartyView
        party={d.party}
        mode="target"
        canPick={(i) => canUseOn(using, d.party[i])}
        message={tr(L('Utiliser {i} sur quelle Bestiole ?', 'Use {i} on which Critter?'), { i: tr(item(using).name) })}
        onPick={(i) => {
          update((x) => {
            if (takeItem(x, using)) useOn(using, x.party[i]);
          });
          sfx.heal();
          setNote(tr(L('Tu utilises {i} sur {n}.', 'You used {i} on {n}.'), { i: tr(item(using).name), n: tr(creature(d.party[i].species).name) }));
          setUsing(null);
        }}
        onClose={() => setUsing(null)}
      />
    );
  }
  return (
    <BagView
      bag={d.bag}
      context="field"
      note={note}
      onUse={(id) => { setNote(''); setUsing(id); }}
      onGive={d.party.length ? (id) => { setNote(''); setGiving(id); } : undefined}
      onRead={(id) => (id.startsWith('page-') ? setReading(Number(id.slice(5))) : setNote(tr(item(id).desc)))}
      onClose={backToWorld}
    />
  );
}
