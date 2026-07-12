import { describe, expect, it } from 'vitest'
import { artSize, itemById, items } from './items'

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('toy items', () => {
  it('has unique kebab-case ids', () => {
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(KEBAB)
  })

  it('covers every kind', () => {
    for (const kind of ['hat', 'saddle', 'decoration', 'treat'] as const) {
      expect(items.some((i) => i.kind === kind)).toBe(true)
    }
  })

  it('only paints chars that have a defined, valid color', () => {
    for (const item of items) {
      expect(item.rows.length, item.id).toBeGreaterThan(0)
      for (const row of item.rows) {
        for (const char of row) {
          if (char === '.') continue
          expect(item.colors[char], `char '${char}' in ${item.id}`).toMatch(HEX_COLOR)
        }
      }
    }
  })

  it('anchors every item inside its own art', () => {
    for (const item of items) {
      const { w, h } = artSize(item)
      expect(item.anchor.x, item.id).toBeGreaterThanOrEqual(0)
      expect(item.anchor.x, item.id).toBeLessThan(w)
      expect(item.anchor.y, item.id).toBeGreaterThanOrEqual(0)
      expect(item.anchor.y, item.id).toBeLessThan(h)
    }
  })

  it('gives every treat a positive feed time, and only treats', () => {
    for (const item of items) {
      if (item.kind === 'treat') {
        expect(item.feedSeconds, item.id).toBeGreaterThan(0)
      } else {
        expect(item.feedSeconds, item.id).toBeUndefined()
      }
    }
  })

  it('names and blurbs are non-empty, and itemById indexes everything', () => {
    for (const item of items) {
      expect(item.name.trim()).not.toBe('')
      expect(item.blurb.trim()).not.toBe('')
      expect(itemById.get(item.id)).toBe(item)
    }
  })
})
