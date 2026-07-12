// Base sprite sheets for the pixel stable, authored as ASCII grids and
// parsed into palette-index arrays at module load. Sprites are data, not
// image assets: they stay diffable, palette-swappable per breed (coats.ts),
// and test-guarded (sprites.test.ts). Polishing a frame is a data edit.
//
// Palette slots are semantic:
//   0 '.' transparent
//   1 'b' body
//   2 'm' mane / tail
//   3 'k' marking (blaze, feathering, procedural spots)
//   4 'o' outline / hoof / muzzle
//
// All sheets face right; left-facing is a horizontal flip at draw time.

export type SpriteKey = 'pony' | 'horse' | 'draft'
export type Grid = number[][]

export interface SpriteSheet {
  width: number
  height: number
  /** 4-frame walk cycle: splayed, gathered, crossed, gathered. */
  walk: [Grid, Grid, Grid, Grid]
  idle: Grid
  graze: Grid
}

const CHAR_TO_SLOT: Record<string, number> = { '.': 0, b: 1, m: 2, k: 3, o: 4 }

function g(width: number, height: number, rows: string[]): Grid {
  return Array.from({ length: height }, (_, y) => {
    const row = rows[y] ?? ''
    return Array.from({ length: width }, (_, x) => CHAR_TO_SLOT[row[x] ?? '.'] ?? 0)
  })
}

export function allFrames(sheet: SpriteSheet): Grid[] {
  return [...sheet.walk, sheet.idle, sheet.graze]
}

export function slotsUsed(sheet: SpriteSheet): Set<number> {
  const slots = new Set<number>()
  for (const frame of allFrames(sheet)) {
    for (const row of frame) {
      for (const cell of row) {
        if (cell !== 0) slots.add(cell)
      }
    }
  }
  return slots
}

// --- horse: standard riding silhouette, 24x16 -------------------------------

const HORSE_BODY = [
  '..................b.b...',
  '.................mbbbb..',
  '................mbbbbbk.',
  '.................bbbbo..',
  '................mbbb....',
  '...............mbbb.....',
  '...mmbbbbbbbbbbbbbb.....',
  '..mmbbbbbbbbbbbbbbb.....',
  '..m.bbbbbbbbbbbbbbb.....',
  '..m.bbbbbbbbbbbbbb......',
  '...m.bbbbbbbbbbbb.......',
]

const HORSE_LEGS_STAND = [
  '.....b..b....b..b.......',
  '.....b..b....b..b.......',
  '.....b..b....b..b.......',
  '.....b..b....b..b.......',
  '.....o..o....o..o.......',
]

const HORSE_LEGS_SPLAY = [
  '.....b..b....b..b.......',
  '.....b..b....b..b.......',
  '....b....b..b....b......',
  '....b....b..b....b......',
  '....o....o..o....o......',
]

const HORSE_LEGS_CROSS = [
  '.....b..b....b..b.......',
  '.....b..b....b..b.......',
  '......bb......bb........',
  '......bb......bb........',
  '......oo......oo........',
]

const HORSE_GRAZE = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '...mmbbbbbbbbbbbbbb.....',
  '..mmbbbbbbbbbbbbbbbb....',
  '..m.bbbbbbbbbbbbbbbbm...',
  '..m.bbbbbbbbbbbbbbbbb...',
  '...m.bbbbbbbbbbbb.bbb...',
  '.....b..b....b..b.bbbk..',
  '.....b..b....b..b..bbo..',
  '.....b..b....b..b.......',
  '.....b..b....b..b.......',
  '.....o..o....o..o.......',
]

const horse: SpriteSheet = {
  width: 24,
  height: 16,
  walk: [
    g(24, 16, [...HORSE_BODY, ...HORSE_LEGS_SPLAY]),
    g(24, 16, [...HORSE_BODY, ...HORSE_LEGS_STAND]),
    g(24, 16, [...HORSE_BODY, ...HORSE_LEGS_CROSS]),
    g(24, 16, [...HORSE_BODY, ...HORSE_LEGS_STAND]),
  ],
  idle: g(24, 16, [...HORSE_BODY, ...HORSE_LEGS_STAND]),
  graze: g(24, 16, HORSE_GRAZE),
}

// --- pony: chubbier, shorter-legged, 20x14 ----------------------------------

const PONY_BODY = [
  '...............b.b..',
  '..............mbbbb.',
  '.............mbbbbbk',
  '..............bbbbo.',
  '.............mbbb...',
  '..mmbbbbbbbbbbbb....',
  '.mmbbbbbbbbbbbbb....',
  '.m.bbbbbbbbbbbbb....',
  '.m.bbbbbbbbbbbb.....',
  '....bbbbbbbbbbb.....',
]

const PONY_LEGS_STAND = [
  '....b..b...b..b.....',
  '....b..b...b..b.....',
  '....b..b...b..b.....',
  '....o..o...o..o.....',
]

const PONY_LEGS_SPLAY = [
  '....b..b...b..b.....',
  '...b....b.b....b....',
  '...b....b.b....b....',
  '...o....o.o....o....',
]

const PONY_LEGS_CROSS = [
  '....b..b...b..b.....',
  '.....bb.....bb......',
  '.....bb.....bb......',
  '.....oo.....oo......',
]

const PONY_GRAZE = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..mmbbbbbbbbbbbbb...',
  '.mmbbbbbbbbbbbbbbm..',
  '.m.bbbbbbbbbbbbbbb..',
  '.m.bbbbbbbbbbbb.bb..',
  '....bbbbbbbbbbb.bbb.',
  '....b..b...b..b.bbk.',
  '....b..b...b..b..bo.',
  '....b..b...b..b.....',
  '....o..o...o..o.....',
]

const pony: SpriteSheet = {
  width: 20,
  height: 14,
  walk: [
    g(20, 14, [...PONY_BODY, ...PONY_LEGS_SPLAY]),
    g(20, 14, [...PONY_BODY, ...PONY_LEGS_STAND]),
    g(20, 14, [...PONY_BODY, ...PONY_LEGS_CROSS]),
    g(20, 14, [...PONY_BODY, ...PONY_LEGS_STAND]),
  ],
  idle: g(20, 14, [...PONY_BODY, ...PONY_LEGS_STAND]),
  graze: g(20, 14, PONY_GRAZE),
}

// --- draft: heavier barrel, thick legs, feathered hooves, 28x18 -------------
// Feathering pixels use the marking slot so Clydesdale/Shire render it white
// while Percheron maps it back to body color.

const DRAFT_BODY = [
  '......................b.b...',
  '.....................mbbbb..',
  '....................mbbbbbk.',
  '...................mbbbbbo..',
  '..................mbbbbb....',
  '.................mbbbbb.....',
  '...mmbbbbbbbbbbbbbbbbb......',
  '..mmbbbbbbbbbbbbbbbbbbb.....',
  '..mmbbbbbbbbbbbbbbbbbbb.....',
  '..m.bbbbbbbbbbbbbbbbbbb.....',
  '..m.bbbbbbbbbbbbbbbbbb......',
  '..m.bbbbbbbbbbbbbbbbbb......',
  '.....bbbbbbbbbbbbbbbb.......',
]

const DRAFT_LEGS_STAND = [
  '.....bb..bb...bb..bb........',
  '.....bb..bb...bb..bb........',
  '.....kk..kk...kk..kk........',
  '.....kk..kk...kk..kk........',
  '.....oo..oo...oo..oo........',
]

const DRAFT_LEGS_SPLAY = [
  '.....bb..bb...bb..bb........',
  '....bb....bb.bb....bb.......',
  '....kk....kk.kk....kk.......',
  '....kk....kk.kk....kk.......',
  '....oo....oo.oo....oo.......',
]

const DRAFT_LEGS_CROSS = [
  '.....bb..bb...bb..bb........',
  '......bbbb.....bbbb.........',
  '......kkkk.....kkkk.........',
  '......kkkk.....kkkk.........',
  '......oooo.....oooo.........',
]

const DRAFT_GRAZE = [
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '............................',
  '...mmbbbbbbbbbbbbbbbbb......',
  '..mmbbbbbbbbbbbbbbbbbbbb....',
  '..mmbbbbbbbbbbbbbbbbbbbbm...',
  '..m.bbbbbbbbbbbbbbbbbbbbm...',
  '..m.bbbbbbbbbbbbbbbbbbbbb...',
  '..m.bbbbbbbbbbbbbbbbb.bbbb..',
  '.....bbbbbbbbbbbbbbbb.bbbbk.',
  '.....bb..bb...bb..bb..bbbk..',
  '.....bb..bb...bb..bb...bbo..',
  '.....kk..kk...kk..kk........',
  '.....kk..kk...kk..kk........',
  '.....oo..oo...oo..oo........',
]

const draft: SpriteSheet = {
  width: 28,
  height: 18,
  walk: [
    g(28, 18, [...DRAFT_BODY, ...DRAFT_LEGS_SPLAY]),
    g(28, 18, [...DRAFT_BODY, ...DRAFT_LEGS_STAND]),
    g(28, 18, [...DRAFT_BODY, ...DRAFT_LEGS_CROSS]),
    g(28, 18, [...DRAFT_BODY, ...DRAFT_LEGS_STAND]),
  ],
  idle: g(28, 18, [...DRAFT_BODY, ...DRAFT_LEGS_STAND]),
  graze: g(28, 18, DRAFT_GRAZE),
}

export const sprites: Record<SpriteKey, SpriteSheet> = { pony, horse, draft }

// Accessory attach points, in sheet pixel coordinates (facing right).
// `hatUp` is the top of the skull in walk/idle frames, `hatDown` the same
// spot in the head-down graze frame, `saddle` the middle of the back.
export interface AttachPoints {
  hatUp: { x: number; y: number }
  hatDown: { x: number; y: number }
  saddle: { x: number; y: number }
}

export const attachPoints: Record<SpriteKey, AttachPoints> = {
  pony: { hatUp: { x: 16, y: 0 }, hatDown: { x: 17, y: 8 }, saddle: { x: 9, y: 5 } },
  horse: { hatUp: { x: 19, y: 0 }, hatDown: { x: 19, y: 10 }, saddle: { x: 11, y: 6 } },
  draft: { hatUp: { x: 23, y: 0 }, hatDown: { x: 24, y: 11 }, saddle: { x: 12, y: 6 } },
}
