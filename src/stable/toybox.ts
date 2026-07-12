import { itemById, items, type ToyItem } from './items'

// Toy box state: which items have been discovered, what each horse is
// wearing, and where decorations sit in the paddock. All transitions are
// pure functions; persistence is a thin localStorage wrapper so the toy box
// survives reloads without any backend.

export interface PlacedDecoration {
  id: string
  itemId: string
  x: number
  y: number
}

export interface ToyBoxState {
  /** Item ids in the order they were found. */
  discovered: string[]
  /** breedId -> worn accessory per slot. */
  equipped: Record<string, { hat?: string; saddle?: string }>
  decorations: PlacedDecoration[]
  /** Interactions since the last find — drives the pity timer. */
  misses: number
}

export const TOYBOX_STORAGE_KEY = 'horse-codex-toybox-v1'

/** Selection value for the tidy-up tool — not an item id. */
export const TIDY_TOOL = 'tidy-up'

/** Chance to find something on a paddock click. */
export const CLICK_FIND_CHANCE = 0.25
/** Chance to find something just for opening the stable. */
export const OPEN_FIND_CHANCE = 0.5
/** A find is guaranteed once this many interactions miss in a row. */
export const PITY_LIMIT = 5
export const MAX_DECORATIONS = 12

export function emptyToyBox(): ToyBoxState {
  return { discovered: [], equipped: {}, decorations: [], misses: 0 }
}

/**
 * Rolls for a discovery. Returns the found item, or null on a miss.
 * The very first find is always the hay bale, so feeding unlocks the
 * mechanic legibly; after that it's uniform over whatever's left, with a
 * guaranteed find every PITY_LIMIT misses.
 */
export function rollDiscovery(
  state: ToyBoxState,
  rng: () => number,
  chance: number,
): ToyItem | null {
  const pool = items.filter((item) => !state.discovered.includes(item.id))
  if (pool.length === 0) return null
  if (state.misses < PITY_LIMIT && rng() >= chance) return null
  if (state.discovered.length === 0) return itemById.get('hay-bale')!
  return pool[Math.floor(rng() * pool.length) % pool.length]
}

export function recordMiss(state: ToyBoxState): ToyBoxState {
  return { ...state, misses: state.misses + 1 }
}

export function addDiscovery(state: ToyBoxState, itemId: string): ToyBoxState {
  if (state.discovered.includes(itemId)) return state
  return { ...state, discovered: [...state.discovered, itemId], misses: 0 }
}

/** Equips the accessory on the breed, replacing that slot; re-applying the same item takes it off. */
export function toggleAccessory(state: ToyBoxState, breedId: string, itemId: string): ToyBoxState {
  const item = itemById.get(itemId)
  if (!item || (item.kind !== 'hat' && item.kind !== 'saddle')) return state
  const slot = item.kind
  const current = state.equipped[breedId] ?? {}
  const next = { ...current, [slot]: current[slot] === itemId ? undefined : itemId }
  return { ...state, equipped: { ...state.equipped, [breedId]: next } }
}

export function placeDecoration(
  state: ToyBoxState,
  itemId: string,
  x: number,
  y: number,
): ToyBoxState {
  if (state.decorations.length >= MAX_DECORATIONS) return state
  const id = `deco-${state.decorations.length}-${Math.round(x)}-${Math.round(y)}`
  return { ...state, decorations: [...state.decorations, { id, itemId, x, y }] }
}

export function removeDecoration(state: ToyBoxState, id: string): ToyBoxState {
  return { ...state, decorations: state.decorations.filter((d) => d.id !== id) }
}

/** Takes the hat and saddle off one horse. */
export function unequipAll(state: ToyBoxState, breedId: string): ToyBoxState {
  if (!state.equipped[breedId]) return state
  const equipped = { ...state.equipped }
  delete equipped[breedId]
  return { ...state, equipped }
}

/** Undresses every horse and picks up every decoration. Toys stay discovered. */
export function putAwayAll(state: ToyBoxState): ToyBoxState {
  return { ...state, equipped: {}, decorations: [] }
}

/** True if any horse is dressed or any decoration is placed. */
export function anythingOut(state: ToyBoxState): boolean {
  return (
    state.decorations.length > 0 ||
    Object.values(state.equipped).some((slots) => slots.hat || slots.saddle)
  )
}

// --- persistence -------------------------------------------------------------

function sanitize(raw: unknown): ToyBoxState {
  const state = emptyToyBox()
  if (typeof raw !== 'object' || raw === null) return state
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.discovered)) {
    state.discovered = r.discovered.filter(
      (id): id is string => typeof id === 'string' && itemById.has(id),
    )
  }
  if (typeof r.equipped === 'object' && r.equipped !== null) {
    for (const [breedId, slots] of Object.entries(r.equipped as Record<string, unknown>)) {
      if (typeof slots !== 'object' || slots === null) continue
      const s = slots as Record<string, unknown>
      const entry: { hat?: string; saddle?: string } = {}
      if (typeof s.hat === 'string' && state.discovered.includes(s.hat)) entry.hat = s.hat
      if (typeof s.saddle === 'string' && state.discovered.includes(s.saddle)) {
        entry.saddle = s.saddle
      }
      state.equipped[breedId] = entry
    }
  }
  if (Array.isArray(r.decorations)) {
    state.decorations = r.decorations
      .filter(
        (d): d is PlacedDecoration =>
          typeof d === 'object' &&
          d !== null &&
          typeof (d as PlacedDecoration).id === 'string' &&
          typeof (d as PlacedDecoration).itemId === 'string' &&
          itemById.has((d as PlacedDecoration).itemId) &&
          Number.isFinite((d as PlacedDecoration).x) &&
          Number.isFinite((d as PlacedDecoration).y),
      )
      .slice(0, MAX_DECORATIONS)
  }
  if (typeof r.misses === 'number' && Number.isFinite(r.misses)) {
    state.misses = Math.max(0, Math.floor(r.misses))
  }
  return state
}

export function loadToyBox(): ToyBoxState {
  try {
    const raw = window.localStorage.getItem(TOYBOX_STORAGE_KEY)
    if (!raw) return emptyToyBox()
    return sanitize(JSON.parse(raw))
  } catch {
    return emptyToyBox()
  }
}

export function saveToyBox(state: ToyBoxState): void {
  try {
    window.localStorage.setItem(TOYBOX_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — the toy box just won't persist.
  }
}
