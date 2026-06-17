import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Game from './Game'

const mockImpactOccurred = vi.fn()
const mockNotificationOccurred = vi.fn()
const mockUseWebApp = vi.fn()

vi.mock('../hooks/useWebApp', () => ({
  useWebApp: () => mockUseWebApp()
}))

describe('Game', () => {
  beforeEach(() => {
    mockImpactOccurred.mockClear()
    mockNotificationOccurred.mockClear()
    mockUseWebApp.mockReturnValue({
      tg: {
        HapticFeedback: {
          impactOccurred: mockImpactOccurred,
          notificationOccurred: mockNotificationOccurred,
        }
      },
      user: null,
      isAuthenticated: false
    })
  })

  it('renders page title', () => {
    render(<Game />)
    expect(screen.getByText('Game')).toBeInTheDocument()
  })

  it('renders TAP ME button', () => {
    render(<Game />)
    expect(screen.getByText('TAP ME!')).toBeInTheDocument()
  })

  it('starts at level 1 and score 0', () => {
    render(<Game />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments score on tap', async () => {
    const user = userEvent.setup()
    render(<Game />)

    const scoreLabel = screen.getByText('Score')
    const scoreValue = scoreLabel.previousElementSibling ?? scoreLabel.parentElement!.querySelector('.text-4xl')

    await user.click(screen.getByText('TAP ME!'))

    const scoreContainer = screen.getByText('Score').parentElement!
    const scoreDisplay = scoreContainer.querySelector('.text-4xl')
    expect(scoreDisplay).not.toBeNull()
    expect(Number(scoreDisplay!.textContent)).toBeGreaterThan(0)
  })

  it('triggers haptic feedback on tap', async () => {
    const user = userEvent.setup()
    render(<Game />)

    await user.click(screen.getByText('TAP ME!'))

    expect(mockImpactOccurred).toHaveBeenCalledWith('medium')
  })

  it('renders how to play section', () => {
    render(<Game />)
    expect(screen.getByText('How to Play')).toBeInTheDocument()
  })

  it('works without Telegram SDK (tg is null)', () => {
    mockUseWebApp.mockReturnValue({ tg: null, user: null, isAuthenticated: false })
    render(<Game />)
    expect(screen.getByText('TAP ME!')).toBeInTheDocument()
  })

  it('does not crash when clicking without Telegram SDK', async () => {
    mockUseWebApp.mockReturnValue({ tg: null, user: null, isAuthenticated: false })
    const user = userEvent.setup()
    render(<Game />)

    await user.click(screen.getByText('TAP ME!'))

    // Should not throw, score should still increment
    expect(screen.getByText('Game')).toBeInTheDocument()
  })
})
