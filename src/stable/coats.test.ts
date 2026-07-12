import { describe, expect, it } from 'vitest'
import { coats } from './coats'
import { slotsUsed, sprites } from './sprites'
import { breeds } from '../data/breeds'

const HEX_COLOR = /^#[0-9a-f]{6}$/i

describe('coats', () => {
  it('covers every breed id, with no strays', () => {
    const breedIds = breeds.map((b) => b.id).sort()
    expect(Object.keys(coats).sort()).toEqual(breedIds)
  })

  it('references only real sprite keys', () => {
    for (const coat of Object.values(coats)) {
      expect(sprites[coat.sprite]).toBeDefined()
    }
  })

  it('maps exactly the palette slots its sprite uses, with valid hex colors', () => {
    for (const [breedId, coat] of Object.entries(coats)) {
      const used = [...slotsUsed(sprites[coat.sprite])].sort()
      const mapped = Object.keys(coat.palette)
        .map(Number)
        .sort()
      expect(mapped, `palette slots for ${breedId}`).toEqual(used)
      for (const color of Object.values(coat.palette)) {
        expect(color, `color for ${breedId}`).toMatch(HEX_COLOR)
      }
    }
  })

  it('puts the draft breeds on the draft sheet (except the pony-sized Fjord)', () => {
    for (const id of ['clydesdale', 'shire', 'percheron', 'gypsy-vanner']) {
      expect(coats[id].sprite).toBe('draft')
    }
    expect(coats.fjord.sprite).toBe('pony')
    expect(coats.shetland.sprite).toBe('pony')
  })
})
