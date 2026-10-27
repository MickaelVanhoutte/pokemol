import { useState } from 'preact/hooks';
import { backToWorld } from '../../overworld/controller';
import { save, takeHeld, update } from '../../state/game';
import { BagView } from '../views/BagView';
import { PartyView } from '../views/PartyView';
import { SwapAsk, giveToParty } from './give';

/** Party from the start menu: summaries, held items and order (the first one leads battles). */
export function PartyScreen() {
  const d = save.value!;
  const [giveTo, setGiveTo] = useState<number | null>(null);
  const [ask, setAsk] = useState<string | null>(null);
  const [note, setNote] = useState<string | undefined>();
  const give = (i: number, id: string) => {
    setNote(giveToParty(i, id, d.party[i]));
    setAsk(null);
    setGiveTo(null);
  };
  if (giveTo !== null) {
    return (
      <>
        <BagView
          bag={d.bag}
          context="give"
          onUse={() => undefined}
          onGive={(id) => (d.party[giveTo].item ? setAsk(id) : give(giveTo, id))}
          onClose={() => setGiveTo(null)}
        />
        {ask && <SwapAsk mon={d.party[giveTo]} id={ask} onAnswer={(yes) => (yes ? give(giveTo, ask) : setAsk(null))} />}
      </>
    );
  }
  return (
    <PartyView
      party={d.party}
      mode="field"
      message={note}
      onSwap={(i, j) => update((x) => { [x.party[i], x.party[j]] = [x.party[j], x.party[i]]; })}
      onSwapMoves={(i, a, b) => update((x) => { const m = x.party[i].moves; [m[a], m[b]] = [m[b], m[a]]; })}
      onGive={(i) => { setNote(undefined); setGiveTo(i); }}
      onTake={(i) => update((x) => void takeHeld(x, x.party[i]))}
      onClose={backToWorld}
    />
  );
}
