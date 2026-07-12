import { describe, expect, it } from 'vitest'
import { buildLiveSearchUrl, youtubeEmbedUrl } from './stream'

function queryOf(url: string): string {
  return decodeURIComponent(new URL(url).searchParams.get('search_query') ?? '')
}

describe('buildLiveSearchUrl', () => {
  it('includes the breed name and "live", and omits the live-only filter param', () => {
    const url = buildLiveSearchUrl('Mustang')
    expect(queryOf(url)).toBe('Mustang horse live')
    expect(url).not.toContain('sp=EgJAAQ')
  })

  it('does not add "horse" when the name already has an equine word', () => {
    expect(queryOf(buildLiveSearchUrl('Icelandic Horse'))).toBe('Icelandic Horse live')
    expect(queryOf(buildLiveSearchUrl('Shetland Pony'))).toBe('Shetland Pony live')
  })

  it('strips parenthetical qualifiers from the query', () => {
    expect(queryOf(buildLiveSearchUrl('Andalusian (PRE)'))).toBe('Andalusian horse live')
  })

  it('strips punctuation like ampersands but keeps hyphens', () => {
    expect(queryOf(buildLiveSearchUrl('Welsh Pony & Cob'))).toBe('Welsh Pony Cob live')
    expect(queryOf(buildLiveSearchUrl('Akhal-Teke'))).toBe('Akhal-Teke horse live')
  })

  it('falls back to the raw name if sanitizing removes everything', () => {
    expect(queryOf(buildLiveSearchUrl('(??)'))).toBe('(??) horse live')
  })
})

describe('youtubeEmbedUrl', () => {
  it('returns a youtube-nocookie.com embed URL containing the id', () => {
    const url = youtubeEmbedUrl('abc12345678')
    expect(url).toBe('https://www.youtube-nocookie.com/embed/abc12345678')
  })
})
