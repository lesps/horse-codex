import { describe, expect, it } from 'vitest'
import { parseHash } from './route'

describe('parseHash', () => {
  it('maps "#/breeds" to the breeds view', () => {
    expect(parseHash('#/breeds')).toBe('breeds')
  })

  it('maps "#/live" to the live view', () => {
    expect(parseHash('#/live')).toBe('live')
  })

  it('maps "#/stable" to the stable view', () => {
    expect(parseHash('#/stable')).toBe('stable')
  })

  it('falls back to the stable view for empty, root, or unrecognized hashes', () => {
    expect(parseHash('')).toBe('stable')
    expect(parseHash('#/')).toBe('stable')
    expect(parseHash('#/junk')).toBe('stable')
  })
})
