import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { item } from '../../data/items';
import { backToWorld } from '../../overworld/controller';
import { save, takeItem, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { canUseOn, tmStatus, useOn } from '../logic/bag';
import { move } from '../../data/moves';
import { learnMove } from '../../engine/pk/creature';
import { SummaryView } from '../views/SummaryView';
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
  const [teaching, setTeaching] = useState<string | null>(null);
  const [forgetFor, setForgetFor] = useState<number | null>(null);
  if (reading !== null) return <PageView n={reading} onClose={() => setReading(null)} />;
  if (teaching) {
    const mv = item(teaching).move!;
    const vars = (i: number) => ({ n: tr(creature(d.party[i].species).name), m: tr(move(mv).name) });
    const learn = (i: number, slot: number | null) => {
      if (slot === null) setNote(tr(L('{n} n’apprend pas {m}.', '{n} did not learn {m}.'), vars(i)));
      else {
        const old = d.party[i].moves[slot]?.id;
        update((x) => learnMove(x.party[i], slot, mv));
        sfx.levelUp();
        setNote(old
          ? tr(L('1, 2 et… Tadaa ! {n} oublie {o} et apprend {m} !', '1, 2 and… Poof! {n} forgot {o} and learned {m}!'), { ...vars(i), o: tr(move(old).name) })
          : tr(L('{n} apprend {m} !', '{n} learned {m}!'), vars(i)));
      }
      setForgetFor(null);
      setTeaching(null);
    };
    if (forgetFor !== null) {
      return <SummaryView mon={d.party[forgetFor]} onClose={() => learn(forgetFor, null)} learn={{ move: mv, onPick: (forget) => learn(forgetFor, forget) }} />;
    }
    const TAG = { able: L('APTE', 'ABLE'), unable: L('PAS APTE', 'NOT ABLE'), learned: L('DÉJÀ APPRIS', 'LEARNED') };
    return (
      <PartyView
        party={d.party}
        mode="target"
        tag={(i) => tr(TAG[tmStatus(teaching, d.party[i])])}
        canPick={(i) => tmStatus(teaching, d.party[i]) === 'able'}
        refuse={(i) => tmStatus(teaching, d.party[i]) === 'learned'
          ? tr(L('{n} connaît déjà {m}.', '{n} already knows {m}.'), vars(i))
          : tr(L('{n} ne peut pas apprendre {m}.', '{n} can’t learn {m}.'), vars(i))}
        message={tr(L('Apprendre {m} à quelle Bestiole ?', 'Teach {m} to which Critter?'), { m: tr(move(mv).name) })}
        onPick={(i) => (d.party[i].moves.length < 4 ? learn(i, d.party[i].moves.length) : setForgetFor(i))}
        onClose={() => setTeaching(null)}
      />
    );
  }
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
      onUse={(id) => { setNote(''); if (item(id).kind === 'tm') setTeaching(id); else setUsing(id); }}
      onGive={d.party.length ? (id) => { setNote(''); setGiving(id); } : undefined}
      onRead={(id) => (id.startsWith('page-') ? setReading(Number(id.slice(5))) : setNote(tr(item(id).desc)))}
      onClose={backToWorld}
    />
  );
}
