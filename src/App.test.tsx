import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function setHash(hash: string) {
  act(() => {
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

describe('App navigation', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('shows the stable by default and switches views on hashchange', () => {
    render(<App />)

    expect(screen.getByText('🐴 Horse Breeds Explorer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stable', level: 2 })).toBeInTheDocument()

    setHash('#/live')
    expect(screen.getByRole('heading', { name: 'Live', level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Stable', level: 2 })).not.toBeInTheDocument()

    setHash('#/breeds')
    expect(screen.queryByRole('heading', { name: 'Live', level: 2 })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()

    setHash('#/')
    expect(screen.getByRole('heading', { name: 'Stable', level: 2 })).toBeInTheDocument()
  })
})
