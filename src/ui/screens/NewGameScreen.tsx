import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { L, gender, setGlobalVars, tr, type LText } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { LOOKS } from '../../overworld/sprites';
import { DEFAULT_LOOKS, fromLook, type Appearance } from '../../data/appearance';
import { personUrl } from '../personArt';
import { LookView } from '../views/LookView';
import { SleepIntroView } from '../views/SleepIntroView';
import { enterWorld, runScript } from '../../overworld/controller';
import { newGame } from '../../state/game';
import { go } from '../../state/router';
import { MenuList, TextBox, Window } from '../paper';
import '../screens.css';

type Step =
  /** Falling asleep at the desk, before the dream (SleepIntroView). */
  | { kind: 'sleep' }
  | { kind: 'say'; text: LText; show?: 'prof' | 'mon' | 'player' | 'rival' }
  | { kind: 'gender' }
  | { kind: 'avatar' }
  | { kind: 'name' }
  | { kind: 'rival' }
  | { kind: 'end' };

const STEPS: Step[] = [
  { kind: 'sleep' },
  { kind: 'say', show: 'prof', text: L('Bonjour ! Bienvenue dans le monde des Bestioles !', 'Hello there! Welcome to the world of Critters!') },
  { kind: 'say', show: 'prof', text: L('Je m’appelle Fusain. Tout le monde m’appelle le Prof des Bestioles.', 'My name is Charcoal. People call me the Critter Prof.') },
  { kind: 'say', show: 'mon', text: L('Ce monde est peuplé de créatures étonnantes : les Bestioles.', 'This world is home to amazing creatures: Critters.') },
  { kind: 'say', show: 'mon', text: L('On dit qu’elles sont nées… de dessins d’enfants. Moi, je les prends toutes en photo, pour ne jamais les perdre.', 'They say they were born… from children’s drawings. I take a picture of every one of them, so none ever gets lost.') },
  { kind: 'say', show: 'prof', text: L('Mais parle-moi un peu de toi.', 'But tell me a little about yourself.') },
  { kind: 'gender' },
  { kind: 'avatar' },
  { kind: 'name' },
  { kind: 'say', show: 'player', text: L('Alors tu t’appelles {name} ! Enchanté !', 'So your name is {name}! Nice to meet you!') },
  { kind: 'say', show: 'rival', text: L('Et voici ton voisin. Il est un peu… vantard. Comment s’appelle-t-il, déjà ?', 'And this is your neighbour. He’s a bit of a… show-off. What was his name again?') },
  { kind: 'rival' },
  { kind: 'say', show: 'rival', text: L('Ah oui, {rival} ! Ça me revient.', 'That’s right, {rival}! I remember now.') },
  { kind: 'say', show: 'player', text: L('{name} ! Ton aventure à Papeterre va commencer. Un monde de rêves et de dessins t’attend !', '{name}! Your adventure in Papeterra is about to begin. A world of dreams and drawings awaits!') },
  { kind: 'end' },
];

const NAMES: Record<'f' | 'm', LText[]> = {
  f: [L('Lili', 'Lily'), L('Zoé', 'Zoe'), L('Jade', 'Jade')],
  m: [L('Léo', 'Leo'), L('Noé', 'Noah'), L('Sacha', 'Sasha')],
};
const RIVALS = [L('Feutre', 'Marker'), L('Crayon', 'Crayon'), L('Pinceau', 'Brush')];

/** FRLG-style prologue: the professor's speech, girl or boy, names. Ends by waking up in the dream. */
export function NewGameScreen() {
  const [i, setI] = useState(0);
  const [g, setG] = useState<'f' | 'm'>('f');
  const [look, setLook] = useState<Appearance>(DEFAULT_LOOKS.f);
  const [name, setName] = useState('');
  const [rival, setRival] = useState('');
  const [typing, setTyping] = useState(false);
  const step = STEPS[i];
  const next = () => setI((n) => Math.min(STEPS.length - 1, n + 1));
  const finish = () => {
    newGame(name || tr(NAMES[g][0]), look, g, rival || tr(RIVALS[0]));
    enterWorld();
    void runScript('intro');
  };

  const show = step.kind === 'say' ? step.show : step.kind === 'name' ? 'player' : step.kind === 'rival' ? 'rival' : step.kind === 'gender' ? 'prof' : undefined;

  if (step.kind === 'sleep') {
    return (
      <div class="prologue prologue--night">
        <SleepIntroView onDone={next} />
      </div>
    );
  }

  // « Dessine-toi ! »: the whole screen goes to the look picker
  if (step.kind === 'avatar') {
    return <LookView look={look} onChange={setLook} onDone={next} title={tr(L('Dessine-toi !', 'Draw yourself!'))} />;
  }

  const chooser = (label: string, value: string, set: (v: string) => void, presets: LText[], done: () => void) => (
    <Ask key={i} text={label}>{(ready) => typing ? (
        <Window class="prologue__input">
          <input
            class="newgame__input"
            maxLength={10}
            value={value}
            autoFocus
            onInput={(e) => set((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { setTyping(false); done(); } }}
          />
          <button class="pbtn pbtn--accent" disabled={!value.trim()} onClick={() => { setTyping(false); done(); }}>OK</button>
        </Window>
      ) : (
        <Window class="prologue__choices">
          <MenuList
            active={ready}
            items={[
              ...presets.map((p) => ({ label: tr(p), onSelect: () => { set(tr(p)); done(); } })),
              { label: tr(L('AUTRE NOM…', 'NEW NAME…')), onSelect: () => setTyping(true) },
            ]}
          />
        </Window>
      )}
    </Ask>
  );

  // the names chosen so far are used by the next lines
  setGlobalVars({ name: name || tr(NAMES[g][0]), rival: rival || tr(RIVALS[0]) });
  gender.value = g;

  return (
    <div class="prologue graph">
      <div class="prologue__stage">
        {show === 'prof' && <img class="prologue__pic" src={personUrl(fromLook(LOOKS.prof))} alt="" />}
        {show === 'mon' && <img class="prologue__mon mon-art" src={artUrl(creature('001'))} alt="" />}
        {show === 'player' && <img class="prologue__pic" src={personUrl(look)} alt="" />}
        {show === 'rival' && <img class="prologue__pic" src={personUrl(fromLook(LOOKS.rival))} alt="" />}
      </div>
      <div class="prologue__bottom">
        {step.kind === 'say' && <TextBox key={i} text={tr(step.text)} keys onAdvance={next} />}
        {step.kind === 'gender' && (
          <Ask key={i} text={tr(L('Es-tu une fille ou un garçon ?', 'Are you a girl or a boy?'))}>{(ready) => (
            <Window class="prologue__choices">
              <MenuList active={ready} items={[
                { label: tr(L('FILLE', 'GIRL')), onSelect: () => { setG('f'); setLook(DEFAULT_LOOKS.f); next(); } },
                { label: tr(L('GARÇON', 'BOY')), onSelect: () => { setG('m'); setLook(DEFAULT_LOOKS.m); next(); } },
              ]} />
            </Window>
          )}</Ask>
        )}
        {step.kind === 'name' && chooser(tr(L('Comment t’appelles-tu ?', 'What is your name?')), name, setName, NAMES[g], next)}
        {step.kind === 'rival' && chooser(tr(L('Son nom ?', 'His name?')), rival, setRival, RIVALS, next)}
        {step.kind === 'end' && <TextBox text="… … …" keys onAdvance={finish} />}
      </div>
      <button class="prologue__skip pbtn pbtn--back" onClick={() => go({ id: 'title' })}>{tr(L('Retour', 'Back'))}</button>
    </div>
  );
}

/**
 * A question typed in the text box like any other line (A finishes it); its answers keep their
 * place but only appear, and take the keys, once the question is typed.
 */
function Ask({ text, children }: { text: string; children: (ready: boolean) => ComponentChildren }) {
  const [ready, setReady] = useState(false);
  return (
    <div class="prologue__ask">
      <TextBox text={text} arrow={false} keys={!ready} onDone={() => setReady(true)} />
      <div class={`prologue__answers ${ready ? '' : 'is-waiting'}`}>{children(ready)}</div>
    </div>
  );
}
