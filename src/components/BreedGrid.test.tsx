import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BreedGrid } from './BreedGrid'
import type { Breed } from '../data/types'

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

describe('BreedGrid filtering', () => {
  it('narrows to matching name/origin case-insensitively', () => {
    render(<BreedGrid breeds={breeds} query="scotland" categories={[]} onSelect={vi.fn()} />)
    expect(screen.getByText('Clydesdale')).toBeInTheDocument()
    expect(screen.queryByText('Arabian')).not.toBeInTheDocument()
  })

  it('shows only the selected category, and all when cleared', () => {
    const { rerender } = render(
      <BreedGrid breeds={breeds} query="" categories={['Draft']} onSelect={vi.fn()} />,
    )
    expect(screen.getByText('Clydesdale')).toBeInTheDocument()
    expect(screen.queryByText('Arabian')).not.toBeInTheDocument()

    rerender(<BreedGrid breeds={breeds} query="" categories={[]} onSelect={vi.fn()} />)
    expect(screen.getByText('Clydesdale')).toBeInTheDocument()
    expect(screen.getByText('Arabian')).toBeInTheDocument()
  })
})
