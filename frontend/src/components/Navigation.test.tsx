import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navigation from './Navigation'

function renderNav(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navigation />
    </MemoryRouter>
  )
}

describe('Navigation', () => {
  it('renders all nav items', () => {
    renderNav()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Game')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('renders correct icons', () => {
    renderNav()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('🎮')).toBeInTheDocument()
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })

  it('highlights active link for Dashboard at /', () => {
    renderNav('/')
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('text-blue-500')
  })

  it('highlights active link for Game at /game', () => {
    renderNav('/game')
    const gameLink = screen.getByText('Game').closest('a')
    expect(gameLink).toHaveClass('text-blue-500')
  })

  it('highlights active link for Search at /search', () => {
    renderNav('/search')
    const searchLink = screen.getByText('Search').closest('a')
    expect(searchLink).toHaveClass('text-blue-500')
  })

  it('non-active links have gray styling', () => {
    renderNav('/')
    const gameLink = screen.getByText('Game').closest('a')
    expect(gameLink).toHaveClass('text-gray-400')
  })

  it('links have correct href attributes', () => {
    renderNav()
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    const gameLink = screen.getByText('Game').closest('a')
    const searchLink = screen.getByText('Search').closest('a')

    expect(dashboardLink).toHaveAttribute('href', '/')
    expect(gameLink).toHaveAttribute('href', '/game')
    expect(searchLink).toHaveAttribute('href', '/search')
  })
})
