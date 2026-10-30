import { useMemo } from 'preact/hooks';
import { backToWorld, playerLook } from '../../overworld/controller';
import { save } from '../../state/game';
import { TownMapView, type BalloonPick } from '../views/TownMapView';
import { avatarImage } from './TrainerCardScreen';

export function TownMapScreen({ pick }: { pick?: BalloonPick }) {
  const d = save.value!;
  const avatar = useMemo(() => avatarImage(playerLook()), [d.player.look]);
  const flyTo = pick && { ...pick, onPick: (town: string) => { pick.onPick(town); backToWorld(); } };
  return <TownMapView save={d} avatar={avatar} onClose={backToWorld} pick={flyTo} />;
}
