import { describe, expect, it } from 'vitest'
import { buildLiveSearchUrl, youtubeEmbedUrl } from './stream'

describe('buildLiveSearchUrl', () => {
  it('includes the encoded breed name, "live", and the live filter param', () => {
    const url = buildLiveSearchUrl('Mustang')
    expect(url).toContain(encodeURIComponent('Mustang'))
    expect(url).toContain('live')
    expect(url).toContain('sp=EgJAAQ%3D%3D')
  })
})

describe('youtubeEmbedUrl', () => {
  it('returns a youtube-nocookie.com embed URL containing the id', () => {
    const url = youtubeEmbedUrl('abc12345678')
    expect(url).toBe('https://www.youtube-nocookie.com/embed/abc12345678')
  })
})
