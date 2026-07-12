import { describe, expect, it } from 'vitest'
import { scaleFor, MIN_SCALE, MAX_SCALE } from './scale'
import { breeds } from '../data/breeds'

describe('scaleFor', () => {
  it('maps 9hh to the minimum scale', () => {
    expect(scaleFor([9, 9])).toBeCloseTo(MIN_SCALE)
  })

  it('maps 17.5hh to the maximum scale', () => {
    expect(scaleFor([17.5, 17.5])).toBeCloseTo(MAX_SCALE)
  })

  it('is monotonic through the midpoint', () => {
    const low = scaleFor([10, 10])
    const mid = scaleFor([13.25, 13.25])
    const high = scaleFor([16, 16])
    expect(low).toBeLessThan(mid)
    expect(mid).toBeLessThan(high)
  })

  it('clamps outside the mapped range', () => {
    expect(scaleFor([4, 6])).toBe(MIN_SCALE)
    expect(scaleFor([20, 22])).toBe(MAX_SCALE)
  })

  it('scales a Shire at least 1.8x a Shetland', () => {
    const shire = breeds.find((b) => b.id === 'shire')!
    const shetland = breeds.find((b) => b.id === 'shetland')!
    expect(scaleFor(shire.heightHands) / scaleFor(shetland.heightHands)).toBeGreaterThanOrEqual(1.8)
  })
})
