import { L, type LText } from '../i18n';

/**
 * Torn pages of the little artist's sketchbook, hidden all over Papeterre.
 * Each one is a memory of the real world: little clues that all this is a dream.
 */
export const PAGES: LText[] = [
  L('Un dessin de chat vert, avec écrit en grosses lettres : MINOUSSE. En bas, une petite signature au crayon.', 'A drawing of a green cat, with big letters: SPROUTKIT. At the bottom, a little pencil signature.'),
  L('« Papa a pris mon dessin en photo avec son téléphone. Il dit que comme ça, il ne se perdra jamais. »', '“Daddy took a picture of my drawing with his phone. He says that way it will never get lost.”'),
  L('« Maman dit : au lit ! Mais je veux d’abord finir les ailes de mon papillon. »', '“Mommy says: bedtime! But first I want to finish my butterfly’s wings.”'),
  L('« À l’école, la maîtresse a demandé ce que je voulais faire plus tard. J’ai dit : {g:dessinatrice|dessinateur} de Bestioles ! »', '“At school, the teacher asked what I want to be when I grow up. I said: a Critter drawer!”'),
  L('« Une fois, j’ai raté un dessin. J’ai voulu le gommer très fort… et ça a fait un trou dans la feuille. J’ai pleuré. »', '“Once, I messed up a drawing. I rubbed it out really hard… and it made a hole in the paper. I cried.”'),
  L('« Papa a dit que les dessins ratés, ça n’existe pas. Il y a juste des dessins pas encore finis. »', '“Daddy said there’s no such thing as a bad drawing. Only drawings that aren’t finished yet.”'),
  L('« Le soir, je dessine sous la couette avec la lampe de poche. Chut, c’est un secret ! »', '“At night, I draw under the covers with a torch. Shh, it’s a secret!”'),
  L('« Parfois, une petite voix dans ma tête dit que mes dessins sont moches. Je n’aime pas cette voix. »', '“Sometimes a little voice in my head says my drawings are ugly. I don’t like that voice.”'),
  L('« Mon cahier est presque plein. Il ne reste plus que la toute dernière page… »', '“My sketchbook is almost full. There’s only the very last page left…”'),
  L('« Papa m’a montré l’album sur son téléphone : TOUS mes dessins sont dedans, même les tout petits ! »', '“Daddy showed me the album on his phone: ALL my drawings are in it, even the tiny ones!”'),
  L('« Je crois que je me suis {g:endormie|endormi} sur mon papillon pas fini, avec les crayons dans la main… »', '“I think I fell asleep on my unfinished butterfly, with the pencils still in my hand…”'),
  L('« Demain, je dessinerai une nouvelle Bestiole. Promis ! »', '“Tomorrow I’ll draw a new Critter. Promise!”'),
];

export const pageId = (n: number) => `page-${n}`;
