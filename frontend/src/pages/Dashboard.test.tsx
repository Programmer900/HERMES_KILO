import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

const mockUseWebApp = vi.fn()
vi.mock('../hooks/useWebApp', () => ({
  useWebApp: () => mockUseWebApp()
}))

describe('Dashboard', () => {
  it('shows prompt when user is not available', () => {
    mockUseWebApp.mockReturnValue({ user: null, tg: null, isAuthenticated: false })
    render(<Dashboard />)
    expect(screen.getByText('Open in Telegram to see your profile')).toBeInTheDocument()
  })

  it('renders page title', () => {
    mockUseWebApp.mockReturnValue({ user: null, tg: null, isAuthenticated: false })
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows welcome message when user is present', () => {
    mockUseWebApp.mockReturnValue({
      user: { id: 1, first_name: 'Alice', username: 'alice' },
      tg: null,
      isAuthenticated: true
    })
    render(<Dashboard />)
    expect(screen.getByText('Welcome, Alice!')).toBeInTheDocument()
  })

  it('displays username when available', () => {
    mockUseWebApp.mockReturnValue({
      user: { id: 1, first_name: 'Alice', username: 'alice' },
      tg: null,
      isAuthenticated: true
    })
    render(<Dashboard />)
    expect(screen.getByText('@alice')).toBeInTheDocument()
  })

  it('shows premium badge for premium users', () => {
    mockUseWebApp.mockReturnValue({
      user: { id: 1, first_name: 'Alice', username: 'alice', is_premium: true },
      tg: null,
      isAuthenticated: true
    })
    render(<Dashboard />)
    expect(screen.getByText(/Premium/)).toBeInTheDocument()
  })

  it('does not show premium badge for non-premium users', () => {
    mockUseWebApp.mockReturnValue({
      user: { id: 1, first_name: 'Bob', username: 'bob', is_premium: false },
      tg: null,
      isAuthenticated: true
    })
    render(<Dashboard />)
    expect(screen.queryByText(/Premium/)).not.toBeInTheDocument()
  })

  it('renders stat cards', () => {
    mockUseWebApp.mockReturnValue({
      user: { id: 1, first_name: 'Alice' },
      tg: null,
      isAuthenticated: true
    })
    render(<Dashboard />)
    expect(screen.getByText('Score')).toBeInTheDocument()
    expect(screen.getByText('Level')).toBeInTheDocument()
    expect(screen.getByText('Stars')).toBeInTheDocument()
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })
})
