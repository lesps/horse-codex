import { describe, expect, it } from 'vitest'
import { parseHash } from './route'

describe('parseHash', () => {
  it('maps "#/live" to the live view', () => {
    expect(parseHash('#/live')).toBe('live')
  })

  it('falls back to the breeds view for empty, root, or unrecognized hashes', () => {
    expect(parseHash('')).toBe('breeds')
    expect(parseHash('#/')).toBe('breeds')
    expect(parseHash('#/junk')).toBe('breeds')
  })
})
