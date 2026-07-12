import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { breeds } from '../data/breeds'
import { StablePage } from './StablePage'
import type { HorseAgent } from './sim'

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

describe('StablePage', () => {
  it('renders the paddock canvas and a shuffle button', () => {
    render(<StablePage breeds={breeds} onSelectBreed={() => {}} />)
    expect(screen.getByRole('img', { name: /paddock/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new herd/i })).toBeInTheDocument()
  })

  it('opens the breed detail for the horse under a click', () => {
    const onSelectBreed = vi.fn()
    const shire = agentAt('shire', 160, 120, 1.45)
    render(<StablePage breeds={breeds} onSelectBreed={onSelectBreed} initialAgents={[shire]} />)
    const canvas = screen.getByRole('img', { name: /paddock/i }) as HTMLCanvasElement
    mockCanvasRect(canvas)

    fireEvent.click(canvas, { clientX: 160, clientY: 112 })
    expect(onSelectBreed).toHaveBeenCalledTimes(1)
    expect(onSelectBreed.mock.calls[0][0].id).toBe('shire')
  })

  it('picks the topmost (lowest on screen) horse when sprites overlap', () => {
    const onSelectBreed = vi.fn()
    const behind = agentAt('welsh', 160, 110, 0.9)
    const inFront = agentAt('shire', 160, 122, 1.45)
    render(
      <StablePage breeds={breeds} onSelectBreed={onSelectBreed} initialAgents={[behind, inFront]} />,
    )
    const canvas = screen.getByRole('img', { name: /paddock/i }) as HTMLCanvasElement
    mockCanvasRect(canvas)

    fireEvent.click(canvas, { clientX: 160, clientY: 108 })
    expect(onSelectBreed.mock.calls[0][0].id).toBe('shire')
  })

  it('ignores clicks on empty grass', () => {
    const onSelectBreed = vi.fn()
    render(
      <StablePage
        breeds={breeds}
        onSelectBreed={onSelectBreed}
        initialAgents={[agentAt('arabian', 40, 100, 1)]}
      />,
    )
    const canvas = screen.getByRole('img', { name: /paddock/i }) as HTMLCanvasElement
    mockCanvasRect(canvas)

    fireEvent.click(canvas, { clientX: 300, clientY: 170 })
    expect(onSelectBreed).not.toHaveBeenCalled()
  })

  it('shows the breed name label on hover', () => {
    const shetland = agentAt('shetland', 100, 150, 0.65)
    render(<StablePage breeds={breeds} onSelectBreed={() => {}} initialAgents={[shetland]} />)
    const canvas = screen.getByRole('img', { name: /paddock/i }) as HTMLCanvasElement
    mockCanvasRect(canvas)

    fireEvent.pointerMove(canvas, { clientX: 100, clientY: 145 })
    expect(screen.getByText('Shetland Pony')).toBeInTheDocument()

    fireEvent.pointerLeave(canvas)
    expect(screen.queryByText('Shetland Pony')).not.toBeInTheDocument()
  })
})
