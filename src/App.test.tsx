import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App navigation', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('shows the breed grid by default, switches to Live on hashchange, and back again', () => {
    render(<App />)

    expect(screen.getByText('🐴 Horse Breeds Explorer')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Live', level: 2 })).not.toBeInTheDocument()

    act(() => {
      window.location.hash = '#/live'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(screen.getByRole('heading', { name: 'Live', level: 2 })).toBeInTheDocument()

    act(() => {
      window.location.hash = '#/'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(screen.queryByRole('heading', { name: 'Live', level: 2 })).not.toBeInTheDocument()
  })
})
