import { useState } from 'preact/hooks';
import { L, locale, tr } from '../../i18n';
import { SpriteSheet, lookOf } from '../../overworld/sprites';
import { backToWorld, playerLook, refreshPlayerLook } from '../../overworld/controller';
import { addItem, save, update } from '../../state/game';
import { TRACKS, collect, trackState, tracksFor, type Milestone } from '../../data/progress';
import { ACTIVITIES, pips, realLevel } from '../../data/realLife';
import { playJingle } from '../../audio/music';
import { sfx } from '../../audio/sfx';
import type { Appearance } from '../../data/appearance';
import { personUrl } from '../personArt';
import { LookView } from '../views/LookView';
import { TrainerCardView, rewardText } from '../views/TrainerCardView';

/** The player's chibi as a little picture (the « you are here » of the Town Map). */
export function avatarImage(a: Appearance): string {
  const sheet = new SpriteSheet(lookOf(a));
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  c.getContext('2d')!.drawImage(sheet.canvas, 0, 0, 16, 16, 0, 0, 16, 16);
  return c.toDataURL();
}

export function TrainerCardScreen() {
  const d = save.value!;
  const look = playerLook();
  const [editing, setEditing] = useState<Appearance | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // after changing your look, back on the card page; otherwise the Progress page when a reward waits
  const [first, setFirst] = useState<0 | 1>(() => (tracksFor(d).some((t) => trackState(d, t).ready) ? 1 : 0));
  if (editing) {
    return (
      <LookView
        look={editing}
        title={tr(L('Change ton look !', 'Change your look!'))}
        onChange={setEditing}
        onCancel={() => setEditing(null)}
        onDone={() => {
          update((x) => { x.player.look = editing; });
          refreshPlayerLook();
          setEditing(null);
        }}
      />
    );
  }
  const onCollect = (track: string) => {
    let got: Milestone | null = null;
    update((x) => { got = collect(x, track, addItem); });
    if (!got) return;
    playJingle('item', { fallback: sfx.confirm });
    setNote(tr(L('{name} reçoit : {i} !', '{name} received: {i}!'), { name: d.player.name, i: rewardText((got as Milestone).reward) }));
  };
  return (
    <TrainerCardView
      save={d}
      avatar={personUrl(look)}
      onLook={() => { setFirst(0); setEditing({ ...look }); }}
      onClose={backToWorld}
      progress={tracksFor(d).map((t) => trackState(d, t))}
      more={tracksFor(d).length < TRACKS.length}
      onCollect={onCollect}
      note={note}
      initialPage={first}
      real={d.flags['reel:jour'] ? ACTIVITIES.map((a) => {
        const l = realLevel(d.flags, a.id);
        return { name: tr(a.name), pips: pips(l), effect: tr(a.effect, { p: a.amount(l).toLocaleString(locale.value === 'fr' ? 'fr-FR' : 'en-GB') }) };
      }) : undefined}
    />
  );
}
