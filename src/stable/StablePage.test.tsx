import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { breeds } from '../data/breeds'
import { StablePage } from './StablePage'
import type { HorseAgent } from './sim'
import { TOYBOX_STORAGE_KEY, addDiscovery, emptyToyBox, type ToyBoxState } from './toybox'

function agentAt(breedId: string, x: number, y: number, scale: number): HorseAgent {
  return { breedId, x, y, facing: 1, state: 'idle', stateT: 0, stateDur: 60, frame: 0, scale }
}

function mockCanvasRect(canvas: HTMLCanvasElement) {
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 320,
    bottom: 180,
    width: 320,
    height: 180,
    toJSON: () => ({}),
  } as DOMRect)
}

const neverFind = () => 0.99
const alwaysFind = () => 0

function discoveredBox(...itemIds: string[]): ToyBoxState {
  return itemIds.reduce((state, id) => addDiscovery(state, id), emptyToyBox())
}

function storedToyBox(): ToyBoxState {
  return JSON.parse(window.localStorage.getItem(TOYBOX_STORAGE_KEY) ?? 'null')
}

function paddockCanvas(): HTMLCanvasElement {
  const canvas = screen.getByRole('img', { name: /paddock/i }) as HTMLCanvasElement
  mockCanvasRect(canvas)
  return canvas
}

beforeEach(() => {
  window.localStorage.removeItem(TOYBOX_STORAGE_KEY)
})

describe('StablePage', () => {
  it('renders the paddock canvas, a shuffle button, and the toy box', () => {
    render(
      <StablePage breeds={breeds} onSelectBreed={() => {}} discoveryRng={neverFind} />,
    )
    expect(screen.getByRole('img', { name: /paddock/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new herd/i })).toBeInTheDocument()
    expect(screen.getByText(/toy box/i)).toBeInTheDocument()
    expect(screen.getByText(/0 of 20 toys discovered/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText('Undiscovered toy')).toHaveLength(20)
  })

  it('opens the breed detail for the horse under a click', () => {
    const onSelectBreed = vi.fn()
    const shire = agentAt('shire', 160, 120, 1.45)
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[shire]}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(paddockCanvas(), { clientX: 160, clientY: 112 })
    expect(onSelectBreed).toHaveBeenCalledTimes(1)
    expect(onSelectBreed.mock.calls[0][0].id).toBe('shire')
  })

  it('picks the topmost (lowest on screen) horse when sprites overlap', () => {
    const onSelectBreed = vi.fn()
    const behind = agentAt('welsh', 160, 110, 0.9)
    const inFront = agentAt('shire', 160, 122, 1.45)
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[behind, inFront]}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(paddockCanvas(), { clientX: 160, clientY: 108 })
    expect(onSelectBreed.mock.calls[0][0].id).toBe('shire')
  })

  it('ignores clicks on empty grass', () => {
    const onSelectBreed = vi.fn()
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[agentAt('arabian', 40, 100, 1)]}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(paddockCanvas(), { clientX: 300, clientY: 170 })
    expect(onSelectBreed).not.toHaveBeenCalled()
  })

  it('shows the breed name label on hover', () => {
    const shetland = agentAt('shetland', 100, 150, 0.65)
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={() => {}}
        initialAgents={[shetland]}
        discoveryRng={neverFind}
      />,
    )
    const canvas = paddockCanvas()

    fireEvent.pointerMove(canvas, { clientX: 100, clientY: 145 })
    expect(screen.getByText('Shetland Pony')).toBeInTheDocument()

    fireEvent.pointerLeave(canvas)
    expect(screen.queryByText('Shetland Pony')).not.toBeInTheDocument()
  })

  it('shows a discovery card when the open-roll finds a toy, and adds it to the box', () => {
    render(
      <StablePage breeds={breeds} onSelectBreed={() => {}} discoveryRng={alwaysFind} />,
    )
    expect(screen.getByRole('dialog', { name: /new discovery/i })).toBeInTheDocument()
    expect(screen.getByText('Hay Bale')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /add to toy box/i }))
    expect(screen.queryByRole('dialog', { name: /new discovery/i })).not.toBeInTheDocument()
    expect(storedToyBox().discovered).toContain('hay-bale')
    expect(screen.getByText(/1 of 20 toys discovered/i)).toBeInTheDocument()
  })

  it('equips a selected hat on the clicked horse instead of opening the detail', () => {
    const onSelectBreed = vi.fn()
    const shire = agentAt('shire', 160, 120, 1.45)
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[shire]}
        initialToyBox={discoveredBox('party-hat')}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Party Hat' }))
    const canvas = paddockCanvas()

    fireEvent.click(canvas, { clientX: 160, clientY: 112 })
    expect(onSelectBreed).not.toHaveBeenCalled()
    expect(storedToyBox().equipped.shire.hat).toBe('party-hat')

    // Clicking the same horse with the same hat selected takes it off.
    fireEvent.click(canvas, { clientX: 160, clientY: 112 })
    expect(storedToyBox().equipped.shire.hat).toBeUndefined()
  })

  it('places a decoration on the grass and picks it back up on a second click', () => {
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={() => {}}
        initialAgents={[agentAt('arabian', 40, 100, 1)]}
        initialToyBox={discoveredBox('apple-tree')}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apple Tree' }))
    const canvas = paddockCanvas()

    fireEvent.click(canvas, { clientX: 250, clientY: 140 })
    expect(storedToyBox().decorations).toHaveLength(1)
    expect(storedToyBox().decorations[0].itemId).toBe('apple-tree')

    fireEvent.click(canvas, { clientX: 250, clientY: 138 })
    expect(storedToyBox().decorations).toHaveLength(0)
  })

  it('does not open the breed detail while dropping a treat', () => {
    const onSelectBreed = vi.fn()
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[agentAt('arabian', 160, 120, 1)]}
        initialToyBox={discoveredBox('hay-bale')}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Hay Bale' }))
    fireEvent.click(paddockCanvas(), { clientX: 160, clientY: 120 })
    expect(onSelectBreed).not.toHaveBeenCalled()
  })

  it('tidy up strips a clicked horse and picks up a clicked decoration', () => {
    const onSelectBreed = vi.fn()
    let box = discoveredBox('crown', 'classic-saddle', 'apple-tree')
    box = {
      ...box,
      equipped: { shire: { hat: 'crown', saddle: 'classic-saddle' } },
      decorations: [{ id: 'd1', itemId: 'apple-tree', x: 250, y: 140 }],
    }
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[agentAt('shire', 100, 120, 1.45)]}
        initialToyBox={box}
        discoveryRng={neverFind}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /tidy up/i }))
    const canvas = paddockCanvas()

    fireEvent.click(canvas, { clientX: 100, clientY: 112 })
    expect(onSelectBreed).not.toHaveBeenCalled()
    expect(storedToyBox().equipped.shire).toBeUndefined()

    fireEvent.click(canvas, { clientX: 250, clientY: 138 })
    expect(storedToyBox().decorations).toHaveLength(0)
  })

  it('put everything away clears all equipment and decorations at once', () => {
    let box = discoveredBox('crown', 'top-hat', 'apple-tree')
    box = {
      ...box,
      equipped: { shire: { hat: 'crown' }, welsh: { hat: 'top-hat' } },
      decorations: [{ id: 'd1', itemId: 'apple-tree', x: 250, y: 140 }],
    }
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={() => {}}
        initialToyBox={box}
        discoveryRng={neverFind}
      />,
    )
    const putAway = screen.getByRole('button', { name: /put everything away/i })
    fireEvent.click(putAway)
    expect(storedToyBox().equipped).toEqual({})
    expect(storedToyBox().decorations).toHaveLength(0)
    expect(storedToyBox().discovered).toEqual(['crown', 'top-hat', 'apple-tree'])
    expect(putAway).toBeDisabled()
  })

  it('deselects the active toy on Escape', () => {
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={() => {}}
        initialToyBox={discoveredBox('crown')}
        discoveryRng={neverFind}
      />,
    )
    const slot = screen.getByRole('button', { name: 'Royal Crown' })
    fireEvent.click(slot)
    expect(slot).toHaveAttribute('aria-pressed', 'true')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(slot).toHaveAttribute('aria-pressed', 'false')
  })
})
