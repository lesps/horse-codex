import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LivePage } from './LivePage'
import { BreedLiveList } from './BreedLiveList'
import type { Breed } from '../data/types'
import type { LiveCam } from '../data/cams'

const breeds: Breed[] = [
  {
    id: 'arabian',
    name: 'Arabian',
    origin: 'Arabian Peninsula',
    category: 'Light / Riding',
    heightHands: [14.1, 15.1],
    temperament: 'Spirited',
    description: 'desc',
    uses: ['Endurance'],
    image: { url: '', credit: 'x', license: 'CC BY-SA 4.0' },
  },
  {
    id: 'clydesdale',
    name: 'Clydesdale',
    origin: 'Scotland',
    category: 'Draft',
    heightHands: [16, 18],
    temperament: 'Gentle',
    description: 'desc',
    uses: ['Driving'],
    image: { url: '', credit: 'x', license: 'CC BY-SA 4.0' },
  },
]

const testCams: LiveCam[] = [
  {
    id: 'cam-one',
    label: 'Cam One',
    url: 'https://example.com/cam-one',
    description: 'First cam.',
  },
  {
    id: 'cam-two',
    label: 'Cam Two',
    url: 'https://example.com/cam-two',
    description: 'Second cam.',
    breedId: 'arabian',
  },
]

describe('LivePage', () => {
  it('renders a CamCard outbound link for each cam', () => {
    render(<LivePage breeds={breeds} cams={testCams} onSelectBreed={vi.fn()} />)

    const links = screen.getAllByRole('link', { name: 'Watch' })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://example.com/cam-one')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[1]).toHaveAttribute('href', 'https://example.com/cam-two')
    expect(links[1]).toHaveAttribute('target', '_blank')
  })

  it('omits the embedded section when no breed has a liveStreamId, and renders an iframe when one does', () => {
    const { rerender } = render(<LivePage breeds={breeds} cams={testCams} onSelectBreed={vi.fn()} />)
    expect(screen.queryByText('Live now (embedded)')).not.toBeInTheDocument()
    expect(screen.queryByTitle(/Live cam:/)).not.toBeInTheDocument()

    const breedsWithLive: Breed[] = [{ ...breeds[0], liveStreamId: 'abc12345678' }, breeds[1]]
    rerender(<LivePage breeds={breedsWithLive} cams={testCams} onSelectBreed={vi.fn()} />)
    expect(screen.getByText('Live now (embedded)')).toBeInTheDocument()
    const iframe = screen.getByTitle('Live cam: Arabian')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/abc12345678')
  })
})

describe('BreedLiveList', () => {
  it('renders one link per breed whose href contains the encoded breed name and "live"', () => {
    render(<BreedLiveList breeds={breeds} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(breeds.length)

    const arabianLink = screen.getByRole('link', { name: 'Arabian' })
    expect(arabianLink.getAttribute('href')).toContain(encodeURIComponent('Arabian'))
    expect(arabianLink.getAttribute('href')).toContain('live')

    const clydesdaleLink = screen.getByRole('link', { name: 'Clydesdale' })
    expect(clydesdaleLink.getAttribute('href')).toContain(encodeURIComponent('Clydesdale'))
    expect(clydesdaleLink.getAttribute('href')).toContain('live')
  })
})
