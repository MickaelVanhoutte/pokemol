import { signal } from '@preact/signals';
import { tr, type LText } from '../i18n';

export interface DialogState {
  /** Changes with every new box (the text box restarts its typewriter). */
  id: number;
  text: string;
  speaker?: string;
  choices?: string[];
  resolve: (choice: number) => void;
}

/** The dialog box currently shown over the overworld (or null). */
export const dialog = signal<DialogState | null>(null);

type Text = LText | string;
let nextId = 1;
const str = (t: Text, vars?: Record<string, string | number>) => (typeof t === 'string' ? t : tr(t, vars));

/** Boxes asked for while another one is open (a door's script and an egg hatching on the same step):
 * they wait their turn instead of replacing it, which would leave the first script waiting forever. */
const waiting: DialogState[] = [];

function show(d: DialogState) {
  if (dialog.value) waiting.push(d);
  else dialog.value = d;
}

export function say(text: Text, speaker?: Text, vars?: Record<string, string | number>): Promise<void> {
  return new Promise((resolve) => {
    show({ id: nextId++, text: str(text, vars), speaker: speaker ? str(speaker) : undefined, resolve: () => resolve() });
  });
}

export async function sayAll(lines: Text[], speaker?: Text, vars?: Record<string, string | number>) {
  for (const l of lines) await say(l, speaker, vars);
}

export function ask(text: Text, choices: Text[], speaker?: Text, vars?: Record<string, string | number>): Promise<number> {
  return new Promise((resolve) => {
    show({ id: nextId++, text: str(text, vars), speaker: speaker ? str(speaker) : undefined, choices: choices.map((c) => str(c)), resolve });
  });
}

export function closeDialog(choice = 0) {
  const d = dialog.value;
  dialog.value = waiting.shift() ?? null;
  d?.resolve(choice);
}
