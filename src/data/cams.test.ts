import { describe, expect, it } from 'vitest'
import { cams } from './cams'
import { breeds } from './breeds'

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('cams data integrity', () => {
  it('has unique kebab-case ids', () => {
    const ids = cams.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(KEBAB_CASE)
    }
  })

  it('has non-empty label and description, and an https url', () => {
    for (const cam of cams) {
      expect(cam.label.length).toBeGreaterThan(0)
      expect(cam.description.length).toBeGreaterThan(0)
      expect(cam.url.startsWith('https://')).toBe(true)
    }
  })

  it('has a breedId that matches an existing breed when present', () => {
    const breedIds = new Set(breeds.map((b) => b.id))
    for (const cam of cams) {
      if (cam.breedId !== undefined && cam.breedId !== '') {
        expect(breedIds.has(cam.breedId)).toBe(true)
      }
    }
  })
})
