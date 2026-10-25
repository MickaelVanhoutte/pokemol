import { useState } from 'preact/hooks';
import { closeDialog, dialog } from '../overworld/dialog';
import { MenuList, TextBox, Window } from './paper';
import './dialog.css';

/** Overworld text on notebook paper; questions get a choice window with the pencil cursor. */
export function DialogBox() {
  const d = dialog.value;
  const [doneFor, setDoneFor] = useState(0);
  if (!d) return null;
  const done = doneFor === d.id;
  return (
    <div class="dialog-layer">
      {d.choices && done && (
        <Window class="dialog-choices">
          <MenuList
            items={d.choices.map((c, i) => ({ label: c, onSelect: () => closeDialog(i) }))}
            onCancel={() => closeDialog(d.choices!.length - 1)}
          />
        </Window>
      )}
      <TextBox
        key={d.id}
        class="dialog"
        text={d.text}
        speaker={d.speaker}
        keys={!d.choices}
        onDone={() => setDoneFor(d.id)}
        onAdvance={d.choices ? undefined : () => closeDialog(0)}
      />
    </div>
  );
}
