// The toy box catalog: every discoverable item, with its pixel art authored
// as ASCII rows + a char→hex color map (same data-not-assets philosophy as
// sprites.ts — '.' is transparent, everything else must appear in `colors`).
//
// `anchor` is the art pixel that sits on the attach point: for hats that's
// the bottom-center resting on the horse's head, for saddles the top-center
// on the back line (lower rows drape over the barrel), and for decorations
// and treats the bottom-center standing on the ground.

export type ItemKind = 'hat' | 'saddle' | 'decoration' | 'treat'

export interface ToyItem {
  id: string
  name: string
  kind: ItemKind
  /** One-liner shown on the discovery card. */
  blurb: string
  rows: string[]
  colors: Record<string, string>
  anchor: { x: number; y: number }
  /** Treats only: seconds of shared munching before it's gone. */
  feedSeconds?: number
}

export const items: ToyItem[] = [
  // --- hats -----------------------------------------------------------------
  {
    id: 'straw-hat',
    name: 'Straw Hat',
    kind: 'hat',
    blurb: 'Sun protection, farm chic.',
    rows: ['..sss..', '.sssss.', 'bbbbbbb'],
    colors: { s: '#e6c565', b: '#cfa94f' },
    anchor: { x: 3, y: 2 },
  },
  {
    id: 'party-hat',
    name: 'Party Hat',
    kind: 'hat',
    blurb: 'Every day is a pony party.',
    rows: ['..w..', '..p..', '..y..', '.ppp.', 'yyyyy'],
    colors: { w: '#f7f3ec', p: '#e0559a', y: '#f0c33c' },
    anchor: { x: 2, y: 4 },
  },
  {
    id: 'cowboy-hat',
    name: 'Cowboy Hat',
    kind: 'hat',
    blurb: 'Yee, and indeed, haw.',
    rows: ['..ccc..', '..kkk..', 'ccccccc'],
    colors: { c: '#9a6434', k: '#5e3a1c' },
    anchor: { x: 3, y: 2 },
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    kind: 'hat',
    blurb: 'For the noblest steed in the paddock.',
    rows: ['g.g.g', 'gjgjg', 'ggggg'],
    colors: { g: '#ecc93f', j: '#d04545' },
    anchor: { x: 2, y: 2 },
  },
  {
    id: 'wizard-hat',
    name: 'Wizard Hat',
    kind: 'hat',
    blurb: 'Neigh-gical powers included.',
    rows: ['...p...', '...pp..', '..ppp..', '.pppsp.', 'ppppppp'],
    colors: { p: '#6b4fa8', s: '#f2e28a' },
    anchor: { x: 3, y: 4 },
  },
  {
    id: 'flower-crown',
    name: 'Flower Crown',
    kind: 'hat',
    blurb: 'Fresh-picked from the paddock.',
    rows: ['fgfgfgf', '.ggggg.'],
    colors: { f: '#e88bb8', g: '#5c9648' },
    anchor: { x: 3, y: 1 },
  },
  {
    id: 'top-hat',
    name: 'Top Hat',
    kind: 'hat',
    blurb: 'Formal wear for fancy trots.',
    rows: ['.kkk.', '.kkk.', '.rrr.', 'kkkkk'],
    colors: { k: '#26222c', r: '#c23b4e' },
    anchor: { x: 2, y: 3 },
  },

  // --- saddles ----------------------------------------------------------------
  {
    id: 'classic-saddle',
    name: 'Leather Saddle',
    kind: 'saddle',
    blurb: 'Broken in and ready to ride.',
    rows: ['..lll..', 'lllllll', '...s...', '...s...'],
    colors: { l: '#7a4526', s: '#4e2d16' },
    anchor: { x: 3, y: 1 },
  },
  {
    id: 'racing-blanket',
    name: 'Racing Blanket',
    kind: 'saddle',
    blurb: 'Built for speed. Results may vary.',
    rows: ['bbbbbbb', 'bbwwbbb', 'bbwwbbb', '.b...b.'],
    colors: { b: '#3a62b8', w: '#f0f2f5' },
    anchor: { x: 3, y: 0 },
  },
  {
    id: 'western-blanket',
    name: 'Western Blanket',
    kind: 'saddle',
    blurb: 'Warm, woven, and well-traveled.',
    rows: ['rrrrrrr', 'ryryryr', 'rrrrrrr', '.r...r.'],
    colors: { r: '#b8402e', y: '#e8c96a' },
    anchor: { x: 3, y: 0 },
  },
  {
    id: 'royal-caparison',
    name: 'Royal Caparison',
    kind: 'saddle',
    blurb: 'Fit for a parade.',
    rows: ['ppppppppp', 'pgpgpgpgp', 'ppppppppp', '.ppppppp.', '..g...g..'],
    colors: { p: '#5d3a8c', g: '#ecc93f' },
    anchor: { x: 4, y: 0 },
  },

  // --- decorations -------------------------------------------------------------
  {
    id: 'apple-tree',
    name: 'Apple Tree',
    kind: 'decoration',
    blurb: 'Shade now, snacks later.',
    rows: [
      '.....ggggggg.....',
      '...hggggghgggg...',
      '..gghggrgggghgg..',
      '.gggggghgggggrg..',
      '.ghggrggggghggg..',
      '.gggggggghgggggg.',
      '..ggrgghggggrgg..',
      '..gghggggghgggg..',
      '...gggghgggggg...',
      '.....ggggggg.....',
      '.......tt........',
      '.......tt........',
      '.......tt........',
      '.......tt........',
      '.......tt........',
      '.......tt........',
      '.......tt........',
      '......tttt.......',
    ],
    colors: { g: '#4f8a44', h: '#5e9a4e', r: '#d04545', t: '#6e4a28' },
    anchor: { x: 8, y: 17 },
  },
  {
    id: 'pond',
    name: 'Little Pond',
    kind: 'decoration',
    blurb: 'For reflection (and splashing).',
    rows: [
      '.......wwwwwwww.......',
      '....wwwwwwwwwwwwww....',
      '..wwwlwwwwwwwwwwwww...',
      '.wwwwwwwwlwwwwwwwwww..',
      '.wwwwwwwwwwwwwwwwwww..',
      'wwwwlwwwwwwwwwlwwwwww.',
      '.wwwwwwwwwwwwwwwwwww..',
      '...wwwwwwwwwwwwwwww...',
      '......wwwwwwwwww......',
    ],
    colors: { w: '#5f9fd8', l: '#9ccbe8' },
    anchor: { x: 10, y: 8 },
  },
  {
    id: 'flower-bed',
    name: 'Flower Bed',
    kind: 'decoration',
    blurb: 'Please do not eat the begonias.',
    rows: ['f..y..p..f..', 'g..g..g..g..', 'gggggggggggg', '.gggggggggg.'],
    colors: { f: '#e88bb8', y: '#f0c33c', p: '#b06ac9', g: '#5c9648' },
    anchor: { x: 6, y: 3 },
  },
  {
    id: 'scarecrow',
    name: 'Scarecrow',
    kind: 'decoration',
    blurb: "Scares crows. Horses think he's friendly.",
    rows: [
      '...sss...',
      '..sssss..',
      '...fff...',
      '...fff...',
      'rrrrrrrrr',
      '...rrr...',
      '...rrr...',
      '....t....',
      '....t....',
      '....t....',
      '...ttt...',
    ],
    colors: { s: '#cfa94f', f: '#e8c9a0', r: '#b8402e', t: '#6e4a28' },
    anchor: { x: 4, y: 10 },
  },
  {
    id: 'jump-rail',
    name: 'Jump Rail',
    kind: 'decoration',
    blurb: 'Some horses go over it. Most go around.',
    rows: [
      'p............p',
      'prwrwrwrwrwrwp',
      'p............p',
      'prwrwrwrwrwrwp',
      'p............p',
      'pp..........pp',
    ],
    colors: { p: '#8a6238', r: '#c23b4e', w: '#f0f2f5' },
    anchor: { x: 7, y: 5 },
  },

  // --- treats -------------------------------------------------------------------
  {
    id: 'hay-bale',
    name: 'Hay Bale',
    kind: 'treat',
    blurb: 'Drop it in the paddock — dinner is served.',
    rows: [
      'yyoyyyoyy',
      'ydoyydoyy',
      'yyoydyoyy',
      'ydoyyyoyd',
      'yyoydyoyy',
      'ddoddyodd',
    ],
    colors: { y: '#d9b24a', d: '#bb943c', o: '#8a6238' },
    anchor: { x: 4, y: 5 },
    feedSeconds: 10,
  },
  {
    id: 'carrots',
    name: 'Carrot Bunch',
    kind: 'treat',
    blurb: "The fastest way to a horse's heart.",
    rows: ['.g.g.g.', '.c.c.c.', '.c.c.c.', '.c.c.c.'],
    colors: { g: '#5c9648', c: '#e07b2a' },
    anchor: { x: 3, y: 3 },
    feedSeconds: 6,
  },
  {
    id: 'apples',
    name: 'Crisp Apples',
    kind: 'treat',
    blurb: 'Crunchy, sweet, and gone in seconds.',
    rows: ['.g..g', 'rr.rr', 'rr.rr'],
    colors: { g: '#5c9648', r: '#d04545' },
    anchor: { x: 2, y: 2 },
    feedSeconds: 5,
  },
  {
    id: 'sugar-cubes',
    name: 'Sugar Cubes',
    kind: 'treat',
    blurb: 'A little treat for good ponies.',
    rows: ['..ww..', '.wwww.', 'wwwwww', 'sswwss'],
    colors: { w: '#f4f4f0', s: '#d8d8d2' },
    anchor: { x: 2, y: 3 },
    feedSeconds: 4,
  },
]

export const itemById = new Map(items.map((item) => [item.id, item]))

export function artSize(item: ToyItem): { w: number; h: number } {
  return { w: Math.max(...item.rows.map((r) => r.length)), h: item.rows.length }
}
