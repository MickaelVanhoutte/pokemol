import { L } from '../i18n';
import { monLabel } from '../data/creatures';
import { newSeed } from '../engine/rng';
import { ask, say, scripts } from '../overworld/controller';
import { save, update } from '../state/game';
import { canBreed, DAYCARE_MAX, makeEgg, withdrawPrice } from '../state/daycare';
import { PARTY_MAX } from '../save/schema';
import { sfx } from '../audio/sfx';

const KEEPER = L('Mamie Pension', 'Granny Daycare');

/** The Pension Crayonnée: leave up to two Bestioles, take them back (for a fee), collect eggs. */
scripts.pension = async () => {
  const d = save.value!;
  const dc = d.daycare ?? { slots: [], egg: false };
  if (dc.egg) {
    await say(L('Ah, te voilà ! Pendant que tu te promenais, on a trouvé un œuf près de tes Bestioles !', 'Ah, there you are! While you were out walking, we found an egg near your Critters!'), KEEPER);
    if (d.party.length >= PARTY_MAX) {
      await say(L('Mais ton équipe est complète. Reviens quand tu auras de la place !', 'But your party is full. Come back when you have room!'), KEEPER);
      return;
    }
    if ((await ask(L('Tu le prends ?', 'Will you take it?'), [L('Oui', 'Yes'), L('Non', 'No')], KEEPER)) !== 0) return;
    update((x) => {
      const [a, b] = (x.daycare?.slots ?? []).map((s) => s.mon);
      if (!x.daycare || !a || !b) return;
      x.party.push(makeEgg(a, b, { rng: newSeed() }));
      x.daycare.egg = false;
    });
    sfx.capture();
    await say(L('{name} reçoit un Œuf ! Garde-le dans ton équipe : il éclora en marchant.', '{name} received an Egg! Keep it in your party: it will hatch as you walk.'));
    return;
  }
  const hello = dc.slots.length === 2
    ? canBreed(dc.slots[0].mon, dc.slots[1].mon)
      ? L('Tes deux Bestioles s’entendent à merveille !', 'Your two Critters get along wonderfully!')
      : L('Tes deux Bestioles s’ignorent un peu…', 'Your two Critters don’t pay each other much attention…')
    : L('Bienvenue à la Pension Crayonnée ! Je garde tes Bestioles pendant que tu te promènes.', 'Welcome to the Pencil Day Care! I look after your Critters while you go for walks.');
  const options = [
    ...(dc.slots.length < DAYCARE_MAX ? [{ label: L('Déposer', 'Leave one'), act: deposit }] : []),
    ...(dc.slots.length ? [{ label: L('Reprendre', 'Take one back'), act: withdraw }] : []),
  ];
  const c = await ask(hello, [...options.map((o) => o.label), L('Au revoir', 'Bye')], KEEPER);
  if (c < options.length) await options[c].act();
};

async function deposit() {
  const party = save.value!.party;
  const able = party.map((m, i) => ({ m, i })).filter(({ m }) => !m.egg);
  const c = await ask(L('Quelle Bestiole veux-tu me confier ?', 'Which Critter will you leave with me?'), [...able.map(({ m }) => monLabel(m)), L('Aucune', 'None')], KEEPER);
  if (c >= able.length) return;
  const { m, i } = able[c];
  // keep at least one Bestiole able to fight
  if (!party.some((o, j) => j !== i && !o.egg && o.hp > 0)) {
    await say(L('Garde au moins une Bestiole en forme pour la route !', 'Keep at least one healthy Critter for the road!'), KEEPER);
    return;
  }
  update((x) => {
    x.daycare ??= { slots: [], egg: false };
    x.daycare.slots.push({ mon: x.party.splice(i, 1)[0], level: m.level });
  });
  await say(L('Je m’occupe bien de {n}. Il gagnera de l’expérience pendant que tu marches !', 'I’ll take good care of {n}. It will gain experience while you walk!'), KEEPER, { n: monLabel(m) });
}

async function withdraw() {
  const d = save.value!;
  const slots = d.daycare?.slots ?? [];
  const c = await ask(L('Quelle Bestiole reprends-tu ?', 'Which Critter will you take back?'),
    [...slots.map((s) => `${monLabel(s.mon)} N.${s.mon.level} (+${s.mon.level - s.level})`), L('Aucune', 'None')], KEEPER);
  if (c >= slots.length) return;
  if (d.party.length >= PARTY_MAX) {
    await say(L('Ton équipe est complète !', 'Your party is full!'), KEEPER);
    return;
  }
  const price = withdrawPrice(slots[c]);
  if ((await ask(L('Ça fera {p} ₽. D’accord ?', 'That’ll be ₽{p}. All right?'), [L('Oui', 'Yes'), L('Non', 'No')], KEEPER, { p: price })) !== 0) return;
  if (d.money < price) {
    await say(L('Tu n’as pas assez d’argent…', 'You don’t have enough money…'), KEEPER);
    return;
  }
  const name = monLabel(slots[c].mon);
  update((x) => {
    x.money -= price;
    x.party.push(x.daycare!.slots.splice(c, 1)[0].mon);
  });
  sfx.coin();
  await say(L('Voilà {n}, en pleine forme ! Merci de ta confiance.', 'Here’s {n}, in top shape! Thank you.'), KEEPER, { n: name });
}
