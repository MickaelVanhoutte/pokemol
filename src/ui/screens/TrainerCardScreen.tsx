import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { SpriteSheet, lookOf } from '../../overworld/sprites';
import { backToWorld, playerLook, refreshPlayerLook } from '../../overworld/controller';
import { save, update } from '../../state/game';
import type { Appearance } from '../../data/appearance';
import { personUrl } from '../personArt';
import { LookView } from '../views/LookView';
import { TrainerCardView } from '../views/TrainerCardView';

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
  return <TrainerCardView save={d} avatar={personUrl(look)} onLook={() => setEditing({ ...look })} onClose={backToWorld} />;
}
