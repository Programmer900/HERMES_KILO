import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, renderHook } from '@testing-library/react'
import { WebAppProvider, useWebApp } from './useWebApp'

describe('WebAppProvider', () => {
  beforeEach(() => {
    delete (window as any).Telegram
  })

  afterEach(() => {
    delete (window as any).Telegram
  })

  it('renders children', () => {
    render(
      <WebAppProvider>
        <div data-testid="child">Hello</div>
      </WebAppProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides default context when Telegram SDK is not available', () => {
    function TestConsumer() {
      const { tg, user, isAuthenticated } = useWebApp()
      return (
        <div>
          <span data-testid="tg">{String(tg)}</span>
          <span data-testid="user">{String(user)}</span>
          <span data-testid="auth">{String(isAuthenticated)}</span>
        </div>
      )
    }

    render(
      <WebAppProvider>
        <TestConsumer />
      </WebAppProvider>
    )

    expect(screen.getByTestId('tg')).toHaveTextContent('null')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('initializes from Telegram WebApp when available', () => {
    const mockUser = {
      id: 123,
      first_name: 'Test',
      username: 'testuser',
    }

    const mockWebApp = {
      initData: 'mock-init-data',
      initDataUnsafe: { user: mockUser },
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn(),
      MainButton: {
        text: '',
        isVisible: false,
        isActive: false,
        show: vi.fn(),
        hide: vi.fn(),
        setText: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        onClick: vi.fn(),
        offClick: vi.fn(),
      },
      HapticFeedback: {
        impactOccurred: vi.fn(),
        notificationOccurred: vi.fn(),
      },
    }

    ;(window as any).Telegram = { WebApp: mockWebApp }

    function TestConsumer() {
      const { user, isAuthenticated } = useWebApp()
      return (
        <div>
          <span data-testid="username">{user?.username ?? 'none'}</span>
          <span data-testid="auth">{String(isAuthenticated)}</span>
        </div>
      )
    }

    render(
      <WebAppProvider>
        <TestConsumer />
      </WebAppProvider>
    )

    expect(mockWebApp.ready).toHaveBeenCalled()
    expect(mockWebApp.expand).toHaveBeenCalled()
    expect(screen.getByTestId('username')).toHaveTextContent('testuser')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
  })

  it('handles Telegram SDK without user data', () => {
    const mockWebApp = {
      initData: '',
      initDataUnsafe: {},
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn(),
      MainButton: {
        text: '',
        isVisible: false,
        isActive: false,
        show: vi.fn(),
        hide: vi.fn(),
        setText: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        onClick: vi.fn(),
        offClick: vi.fn(),
      },
      HapticFeedback: {
        impactOccurred: vi.fn(),
        notificationOccurred: vi.fn(),
      },
    }

    ;(window as any).Telegram = { WebApp: mockWebApp }

    function TestConsumer() {
      const { user, isAuthenticated } = useWebApp()
      return (
        <div>
          <span data-testid="user">{String(user)}</span>
          <span data-testid="auth">{String(isAuthenticated)}</span>
        </div>
      )
    }

    render(
      <WebAppProvider>
        <TestConsumer />
      </WebAppProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })
})
