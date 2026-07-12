import { beforeEach, describe, expect, it } from 'vitest'
import { items } from './items'
import { mulberry32 } from './sim'
import {
  MAX_DECORATIONS,
  PITY_LIMIT,
  TOYBOX_STORAGE_KEY,
  addDiscovery,
  anythingOut,
  emptyToyBox,
  loadToyBox,
  placeDecoration,
  putAwayAll,
  recordMiss,
  removeDecoration,
  rollDiscovery,
  saveToyBox,
  toggleAccessory,
  unequipAll,
} from './toybox'

describe('rollDiscovery', () => {
  it('finds the hay bale first, so feeding unlocks the mechanic', () => {
    const found = rollDiscovery(emptyToyBox(), () => 0, 1)
    expect(found?.id).toBe('hay-bale')
  })

  it('misses when the roll fails and nothing is owed', () => {
    expect(rollDiscovery(emptyToyBox(), () => 0.99, 0.25)).toBeNull()
  })

  it('guarantees a find once the pity limit is reached', () => {
    let state = emptyToyBox()
    for (let i = 0; i < PITY_LIMIT; i++) state = recordMiss(state)
    expect(rollDiscovery(state, () => 0.99, 0.25)).not.toBeNull()
  })

  it('only ever returns undiscovered items, and null once everything is found', () => {
    let state = emptyToyBox()
    const rng = mulberry32(11)
    while (state.discovered.length < items.length) {
      const found = rollDiscovery(state, rng, 1)!
      expect(state.discovered).not.toContain(found.id)
      state = addDiscovery(state, found.id)
    }
    expect(rollDiscovery(state, rng, 1)).toBeNull()
  })
})

describe('toy box state transitions', () => {
  it('addDiscovery resets the pity counter and is idempotent', () => {
    let state = recordMiss(recordMiss(emptyToyBox()))
    state = addDiscovery(state, 'crown')
    expect(state.misses).toBe(0)
    expect(state.discovered).toEqual(['crown'])
    expect(addDiscovery(state, 'crown')).toBe(state)
  })

  it('toggleAccessory equips, swaps, and removes per slot', () => {
    let state = emptyToyBox()
    state = toggleAccessory(state, 'shire', 'crown')
    expect(state.equipped.shire.hat).toBe('crown')
    state = toggleAccessory(state, 'shire', 'classic-saddle')
    expect(state.equipped.shire).toEqual({ hat: 'crown', saddle: 'classic-saddle' })
    state = toggleAccessory(state, 'shire', 'top-hat')
    expect(state.equipped.shire.hat).toBe('top-hat')
    state = toggleAccessory(state, 'shire', 'top-hat')
    expect(state.equipped.shire.hat).toBeUndefined()
    expect(state.equipped.shire.saddle).toBe('classic-saddle')
  })

  it('toggleAccessory ignores non-accessory items', () => {
    const state = emptyToyBox()
    expect(toggleAccessory(state, 'shire', 'hay-bale')).toBe(state)
    expect(toggleAccessory(state, 'shire', 'nope')).toBe(state)
  })

  it('unequipAll strips one horse without touching the others', () => {
    let state = emptyToyBox()
    state = toggleAccessory(state, 'shire', 'crown')
    state = toggleAccessory(state, 'shire', 'classic-saddle')
    state = toggleAccessory(state, 'welsh', 'top-hat')

    state = unequipAll(state, 'shire')
    expect(state.equipped.shire).toBeUndefined()
    expect(state.equipped.welsh.hat).toBe('top-hat')
    expect(unequipAll(state, 'arabian')).toBe(state)
  })

  it('putAwayAll clears equipment and decorations but keeps discoveries', () => {
    let state = addDiscovery(emptyToyBox(), 'crown')
    state = toggleAccessory(state, 'shire', 'crown')
    state = placeDecoration(state, 'apple-tree', 50, 120)
    expect(anythingOut(state)).toBe(true)

    state = putAwayAll(state)
    expect(anythingOut(state)).toBe(false)
    expect(state.equipped).toEqual({})
    expect(state.decorations).toEqual([])
    expect(state.discovered).toEqual(['crown'])
  })

  it('anythingOut is false for a fresh box and after a toggle-off', () => {
    let state = emptyToyBox()
    expect(anythingOut(state)).toBe(false)
    state = toggleAccessory(state, 'shire', 'crown')
    state = toggleAccessory(state, 'shire', 'crown')
    expect(anythingOut(state)).toBe(false)
  })

  it('places and removes decorations, capped at the max', () => {
    let state = emptyToyBox()
    state = placeDecoration(state, 'apple-tree', 100, 100)
    expect(state.decorations).toHaveLength(1)
    state = removeDecoration(state, state.decorations[0].id)
    expect(state.decorations).toHaveLength(0)

    for (let i = 0; i < MAX_DECORATIONS + 3; i++) {
      state = placeDecoration(state, 'flower-bed', 10 + i, 100)
    }
    expect(state.decorations).toHaveLength(MAX_DECORATIONS)
  })
})

describe('persistence', () => {
  beforeEach(() => {
    window.localStorage.removeItem(TOYBOX_STORAGE_KEY)
  })

  it('round-trips through localStorage', () => {
    let state = addDiscovery(emptyToyBox(), 'crown')
    state = toggleAccessory(state, 'shire', 'crown')
    state = placeDecoration(state, 'apple-tree', 50, 120)
    saveToyBox(state)
    const loaded = loadToyBox()
    expect(loaded.discovered).toEqual(['crown'])
    expect(loaded.equipped.shire.hat).toBe('crown')
    expect(loaded.decorations).toHaveLength(1)
  })

  it('returns a fresh box for missing or corrupt storage', () => {
    expect(loadToyBox()).toEqual(emptyToyBox())
    window.localStorage.setItem(TOYBOX_STORAGE_KEY, 'not json{{{')
    expect(loadToyBox()).toEqual(emptyToyBox())
  })

  it('drops unknown item ids and undiscovered equipment on load', () => {
    window.localStorage.setItem(
      TOYBOX_STORAGE_KEY,
      JSON.stringify({
        discovered: ['crown', 'deleted-item'],
        equipped: { shire: { hat: 'crown', saddle: 'classic-saddle' } },
        decorations: [{ id: 'd1', itemId: 'deleted-item', x: 1, y: 2 }],
        misses: 3,
      }),
    )
    const loaded = loadToyBox()
    expect(loaded.discovered).toEqual(['crown'])
    expect(loaded.equipped.shire.hat).toBe('crown')
    // classic-saddle isn't in the discovered list, so it can't stay equipped
    expect(loaded.equipped.shire.saddle).toBeUndefined()
    expect(loaded.decorations).toHaveLength(0)
    expect(loaded.misses).toBe(3)
  })
})
