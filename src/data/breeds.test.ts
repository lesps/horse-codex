import { describe, expect, it } from 'vitest'
import { breeds } from './breeds'
import type { BreedCategory } from './types'

const VALID_CATEGORIES: BreedCategory[] = [
  'Light / Riding',
  'Stock',
  'Draft',
  'Baroque',
  'Pony',
  'Gaited',
  'Feral / Wild',
]

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const COMMONS_FILEPATH_PREFIX = 'https://commons.wikimedia.org/wiki/Special:FilePath/'
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

describe('breeds data integrity', () => {
  it('has unique kebab-case ids', () => {
    const ids = breeds.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(KEBAB_CASE)
    }
  })

  it('has non-empty name, origin, description, and at least one use per breed', () => {
    for (const breed of breeds) {
      expect(breed.name.length).toBeGreaterThan(0)
      expect(breed.origin.length).toBeGreaterThan(0)
      expect(breed.description.length).toBeGreaterThan(0)
      expect(breed.uses.length).toBeGreaterThan(0)
    }
  })

  it('has non-empty image credit and license, and a url that is empty or a Commons FilePath link', () => {
    for (const breed of breeds) {
      expect(breed.image.credit.length).toBeGreaterThan(0)
      expect(breed.image.license.length).toBeGreaterThan(0)
      if (breed.image.url !== '') {
        expect(breed.image.url.startsWith(COMMONS_FILEPATH_PREFIX)).toBe(true)
      }
    }
  })

  it('has a valid heightHands tuple with min <= max and both positive', () => {
    for (const breed of breeds) {
      const [min, max] = breed.heightHands
      expect(min).toBeGreaterThan(0)
      expect(max).toBeGreaterThan(0)
      expect(min).toBeLessThanOrEqual(max)
    }
  })

  it('has a category from the BreedCategory union', () => {
    for (const breed of breeds) {
      expect(VALID_CATEGORIES).toContain(breed.category)
    }
  })

  it('has a well-formed liveStreamId when present', () => {
    for (const breed of breeds) {
      if (breed.liveStreamId !== undefined) {
        expect(breed.liveStreamId).toMatch(YOUTUBE_ID)
      }
    }
  })
})
