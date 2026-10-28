import type { Rig } from '../data/rigs';

/** A battle rig put back together as one still picture (its body and its parts in place), for the Bestiodex. */
export function RigPicture({ rig, file, class: cls = '' }: { rig: Rig; file: (layer: string) => string; class?: string }) {
  const part = (p: Rig['parts'][number]) => (
    <img src={file(p.name)} alt="" style={{ position: 'absolute', left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%`, height: `${p.height}%`, maxWidth: 'none' }} />
  );
  return (
    <div class={`rig-picture ${cls}`}>
      <div class="rig-picture__box">
        {rig.parts.filter((p) => p.behind).map(part)}
        <img class="rig-picture__base" src={file('base')} alt="" />
        {rig.parts.filter((p) => !p.behind).map(part)}
      </div>
    </div>
  );
}
