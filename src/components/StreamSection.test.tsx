import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StreamSection } from './StreamSection'
import type { Breed } from '../data/types'

const baseBreed: Breed = {
  id: 'test-breed',
  name: 'Test Breed',
  origin: 'Testland',
  category: 'Pony',
  heightHands: [10, 12],
  temperament: 'Calm',
  description: 'A breed for testing.',
  uses: ['Testing'],
  image: { url: '', credit: 'Someone', license: 'CC BY-SA 4.0' },
}

describe('StreamSection', () => {
  it('renders an iframe with the id in its src when liveStreamId is set', () => {
    render(<StreamSection breed={{ ...baseBreed, liveStreamId: 'abc12345678' }} />)
    const iframe = document.querySelector('iframe')
    expect(iframe).toBeTruthy()
    expect(iframe?.getAttribute('src')).toContain('abc12345678')
  })

  it('renders a link to the live-search URL and no iframe when liveStreamId is absent', () => {
    render(<StreamSection breed={baseBreed} />)
    expect(document.querySelector('iframe')).toBeNull()
    const link = screen.getByRole('link', { name: /watch live on youtube/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('youtube.com/results'))
  })
})
