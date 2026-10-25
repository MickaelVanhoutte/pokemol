import { useState } from 'preact/hooks';
import { L, gender, setGlobalVars, tr, type LText } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { AVATARS, LOOKS, lookImage } from '../../overworld/sprites';
import { enterWorld, runScript } from '../../overworld/controller';
import { newGame } from '../../state/game';
import { go } from '../../state/router';
import { MenuList, TextBox, Window } from '../paper';
import '../screens.css';

type Step =
  | { kind: 'night'; text: LText }
  | { kind: 'say'; text: LText; show?: 'prof' | 'mon' | 'player' | 'rival' }
  | { kind: 'gender' }
  | { kind: 'avatar' }
  | { kind: 'name' }
  | { kind: 'rival' }
  | { kind: 'end' };

const STEPS: Step[] = [
  { kind: 'night', text: L('… encore un dessin… juste un dernier…', '… one more drawing… just one more…') },
  { kind: 'night', text: L('… zzz …', '… zzz …') },
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
  const [avatar, setAvatar] = useState(0);
  const [name, setName] = useState('');
  const [rival, setRival] = useState('');
  const [typing, setTyping] = useState(false);
  const step = STEPS[i];
  const next = () => setI((n) => Math.min(STEPS.length - 1, n + 1));
  const finish = () => {
    newGame(name || tr(NAMES[g][0]), avatar, g, rival || tr(RIVALS[0]));
    enterWorld();
    void runScript('intro');
  };

  const show = step.kind === 'say' ? step.show : step.kind === 'avatar' || step.kind === 'name' ? 'player' : step.kind === 'rival' ? 'rival' : step.kind === 'gender' ? 'prof' : undefined;

  if (step.kind === 'night') {
    return (
      <div class="prologue prologue--night" onClick={next}>
        <p key={i} class="prologue__night">{tr(step.text)}</p>
        <TextBox class="prologue__hidden" text="" keys onAdvance={next} instant />
      </div>
    );
  }

  const chooser = (label: string, value: string, set: (v: string) => void, presets: LText[], done: () => void) => (
    <div class="prologue__ask">
      <TextBox text={label} arrow={false} instant />
      {typing ? (
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
            items={[
              ...presets.map((p) => ({ label: tr(p), onSelect: () => { set(tr(p)); done(); } })),
              { label: tr(L('AUTRE NOM…', 'NEW NAME…')), onSelect: () => setTyping(true) },
            ]}
          />
        </Window>
      )}
    </div>
  );

  // the names chosen so far are used by the next lines
  setGlobalVars({ name: name || tr(NAMES[g][0]), rival: rival || tr(RIVALS[0]) });
  gender.value = g;

  return (
    <div class="prologue graph">
      <div class="prologue__stage">
        {show === 'prof' && <img class="prologue__pic" src={lookImage(LOOKS.prof, 'down', 10)} alt="" />}
        {show === 'mon' && <img class="prologue__mon mon-art" src={artUrl(creature('001'))} alt="" />}
        {show === 'player' && <img class="prologue__pic" src={lookImage(AVATARS[avatar], 'down', 10)} alt="" />}
        {show === 'rival' && <img class="prologue__pic" src={lookImage(LOOKS.rival, 'down', 10)} alt="" />}
        {step.kind === 'avatar' && (
          <div class="prologue__avatars">
            {AVATARS.map((look, k) => k % 2 === (g === 'f' ? 0 : 1) && (
              <button class={`newgame__avatar ${k === avatar ? 'is-on' : ''}`} onClick={() => setAvatar(k)}>
                <img src={lookImage(look, 'down', 4)} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div class="prologue__bottom">
        {step.kind === 'say' && <TextBox key={i} text={tr(step.text)} keys onAdvance={next} />}
        {step.kind === 'gender' && (
          <div class="prologue__ask">
            <TextBox text={tr(L('Es-tu une fille ou un garçon ?', 'Are you a girl or a boy?'))} arrow={false} instant />
            <Window class="prologue__choices">
              <MenuList items={[
                { label: tr(L('FILLE', 'GIRL')), onSelect: () => { setG('f'); setAvatar(0); next(); } },
                { label: tr(L('GARÇON', 'BOY')), onSelect: () => { setG('m'); setAvatar(1); next(); } },
              ]} />
            </Window>
          </div>
        )}
        {step.kind === 'avatar' && (
          <div class="prologue__ask">
            <TextBox text={tr(L('Lequel de ces portraits te ressemble ?', 'Which of these looks like you?'))} arrow={false} instant />
            <button class="pbtn pbtn--accent" onClick={next}>OK ▶</button>
          </div>
        )}
        {step.kind === 'name' && chooser(tr(L('Comment t’appelles-tu ?', 'What is your name?')), name, setName, NAMES[g], next)}
        {step.kind === 'rival' && chooser(tr(L('Son nom ?', 'His name?')), rival, setRival, RIVALS, next)}
        {step.kind === 'end' && <TextBox text="… … …" keys onAdvance={finish} />}
      </div>
      <button class="prologue__skip pbtn pbtn--b" onClick={() => go({ id: 'title' })}>{tr(L('Retour', 'Back'))}</button>
    </div>
  );
}
