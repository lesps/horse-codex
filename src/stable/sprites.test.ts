import { describe, expect, it } from 'vitest'
import { allFrames, sprites } from './sprites'

const VALID_SLOTS = new Set([0, 1, 2, 3, 4])

describe('sprite sheets', () => {
  for (const [key, sheet] of Object.entries(sprites)) {
    describe(key, () => {
      it('has a 4-frame walk cycle plus idle and graze', () => {
        expect(sheet.walk).toHaveLength(4)
        expect(allFrames(sheet)).toHaveLength(6)
      })

      it('has rectangular frames matching the declared dimensions', () => {
        for (const frame of allFrames(sheet)) {
          expect(frame).toHaveLength(sheet.height)
          for (const row of frame) {
            expect(row).toHaveLength(sheet.width)
          }
        }
      })

      it('only uses defined palette slots', () => {
        for (const frame of allFrames(sheet)) {
          for (const row of frame) {
            for (const cell of row) {
              expect(VALID_SLOTS.has(cell)).toBe(true)
            }
          }
        }
      })

      it('is not empty and has hooves on the baseline', () => {
        const idle = sheet.idle
        expect(idle.flat().some((cell) => cell !== 0)).toBe(true)
        expect(idle[sheet.height - 1].some((cell) => cell === 4)).toBe(true)
      })
    })
  }

  it('draft is the largest silhouette and pony the smallest', () => {
    expect(sprites.draft.width).toBeGreaterThan(sprites.horse.width)
    expect(sprites.horse.width).toBeGreaterThan(sprites.pony.width)
    expect(sprites.draft.height).toBeGreaterThan(sprites.horse.height)
    expect(sprites.horse.height).toBeGreaterThan(sprites.pony.height)
  })
})
