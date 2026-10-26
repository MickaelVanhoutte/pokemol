import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { monLabel } from '../../data/creatures';
import { item } from '../../data/items';
import { backToWorld, fieldItemProblem, toggleBike, useFieldItem } from '../../overworld/controller';
import { save, see, takeItem, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { canUseOn, evolveWith, stencilStatus, useOn } from '../logic/bag';
import { move } from '../../data/moves';
import { evolutionMoves, evolve, learnMove } from '../../engine/pk/creature';
import { EvolutionView } from '../views/EvolutionView';
import { SummaryView } from '../views/SummaryView';
import { BagView } from '../views/BagView';
import { PartyView } from '../views/PartyView';
import { PageView } from '../views/PageView';
import { TownMapView } from '../views/TownMapView';
import { avatarImage } from './TrainerCardScreen';
import { SwapAsk, giveToParty } from './give';

export function BagScreen() {
  const d = save.value!;
  const [using, setUsing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [reading, setReading] = useState<number | null>(null);
  const [map, setMap] = useState(false);
  const [giving, setGiving] = useState<string | null>(null);
  const [ask, setAsk] = useState<number | null>(null);
  const [teaching, setTeaching] = useState<string | null>(null);
  const [forgetFor, setForgetFor] = useState<number | null>(null);
  const [evolving, setEvolving] = useState<{ item: string; i?: number; to?: string } | null>(null);
  // moves a freshly evolved Bestiole wants to learn while it already knows four
  const [evoLearn, setEvoLearn] = useState<{ i: number; moves: string[] } | null>(null);
  if (reading !== null) return <PageView n={reading} onClose={() => setReading(null)} />;
  if (map) return <TownMapView save={d} avatar={avatarImage(d.player.avatar)} onClose={() => setMap(false)} />;
  if (teaching) {
    const mv = item(teaching).move!;
    const vars = (i: number) => ({ n: monLabel(d.party[i]), m: tr(move(mv).name) });
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
        tag={(i) => tr(TAG[stencilStatus(teaching, d.party[i])])}
        canPick={(i) => stencilStatus(teaching, d.party[i]) === 'able'}
        refuse={(i) => stencilStatus(teaching, d.party[i]) === 'learned'
          ? tr(L('{n} connaît déjà {m}.', '{n} already knows {m}.'), vars(i))
          : tr(L('{n} ne peut pas apprendre {m}.', '{n} can’t learn {m}.'), vars(i))}
        message={tr(L('Apprendre {m} à quelle Bestiole ?', 'Teach {m} to which Critter?'), { m: tr(move(mv).name) })}
        onPick={(i) => (d.party[i].moves.length < 4 ? learn(i, d.party[i].moves.length) : setForgetFor(i))}
        onClose={() => setTeaching(null)}
      />
    );
  }
  if (evoLearn) {
    const { i, moves } = evoLearn;
    const mv = moves[0];
    const next = () => setEvoLearn(moves.length > 1 ? { i, moves: moves.slice(1) } : null);
    const skip = () => {
      setNote(tr(L('{n} n’apprend pas {m}.', '{n} did not learn {m}.'), { n: monLabel(d.party[i]), m: tr(move(mv).name) }));
      next();
    };
    return (
      <SummaryView
        mon={d.party[i]}
        onClose={skip}
        learn={{
          move: mv,
          onPick: (slot) => {
            if (slot === null) return skip();
            const old = d.party[i].moves[slot]?.id;
            update((x) => learnMove(x.party[i], slot, mv));
            sfx.levelUp();
            setNote(tr(L('{n} oublie {o} et apprend {m} !', '{n} forgot {o} and learned {m}!'), { n: monLabel(d.party[i]), o: old ? tr(move(old).name) : '', m: tr(move(mv).name) }));
            next();
          },
        }}
      />
    );
  }
  if (evolving) {
    const pencil = evolving.item;
    const { i, to } = evolving;
    if (i !== undefined && to) {
      return (
        <EvolutionView
          key={d.party[i].uid}
          mon={d.party[i]}
          to={to}
          onEnd={(done) => {
            if (done) {
              const learned: string[] = [];
              const waiting: string[] = [];
              update((x) => {
                if (!takeItem(x, pencil)) return;
                const m = x.party[i];
                evolve(m, to);
                see(x, to);
                if (!x.dex.caught.includes(to)) x.dex.caught.push(to);
                // the new form learns its evolution moves and those of its level; past four moves, it asks
                for (const id of evolutionMoves(to, m.level)) {
                  if (m.moves.some((s) => s.id === id)) continue;
                  if (m.moves.length < 4) {
                    learnMove(m, m.moves.length, id);
                    learned.push(id);
                  } else waiting.push(id);
                }
              });
              sfx.levelUp();
              setNote(learned.length
                ? tr(L('{n} apprend {m} !', '{n} learned {m}!'), { n: monLabel(save.value!.party[i]), m: learned.map((id) => tr(move(id).name)).join(', ') })
                : '');
              if (waiting.length) setEvoLearn({ i, moves: waiting });
            }
            setEvolving(null);
          }}
        />
      );
    }
    const TAG = { able: L('APTE', 'ABLE'), unable: L('PAS APTE', 'NOT ABLE') };
    return (
      <PartyView
        party={d.party}
        mode="target"
        tag={(k) => tr(evolveWith(pencil, d.party[k]) ? TAG.able : TAG.unable)}
        canPick={(k) => !!evolveWith(pencil, d.party[k])}
        refuse={(k) => tr(L('Ça n’a aucun effet sur {n}.', 'It won’t have any effect on {n}.'), { n: monLabel(d.party[k]) })}
        message={tr(L('Utiliser {i} sur quelle Bestiole ?', 'Use the {i} on which Critter?'), { i: tr(item(pencil).name) })}
        onPick={(k) => setEvolving({ item: pencil, i: k, to: evolveWith(pencil, d.party[k])! })}
        onClose={() => setEvolving(null)}
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
          setNote(tr(L('Tu utilises {i} sur {n}.', 'You used {i} on {n}.'), { i: tr(item(using).name), n: monLabel(d.party[i]) }));
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
      onUse={(id) => {
        setNote('');
        const def = item(id);
        if (def.kind === 'evo') setEvolving({ item: id });
        else if (def.kind === 'field') {
          const no = fieldItemProblem(id);
          if (no) setNote(tr(no));
          else void useFieldItem(id);
        } else if (def.kind === 'stencil') setTeaching(id);
        else setUsing(id);
      }}
      onGive={d.party.length ? (id) => { setNote(''); setGiving(id); } : undefined}
      onRead={(id) => {
        if (id === 'velo') {
          const no = toggleBike();
          return no ? setNote(tr(no)) : backToWorld();
        }
        return id.startsWith('page-') ? setReading(Number(id.slice(5))) : id === 'carte' ? setMap(true) : setNote(tr(item(id).desc));
      }}
      onClose={backToWorld}
    />
  );
}
