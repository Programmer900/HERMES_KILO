import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Search from './Search'

describe('Search', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders page title', () => {
    render(<Search />)
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Search />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders search button', () => {
    render(<Search />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('updates input value on typing', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<Search />)

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test query')

    expect(input).toHaveValue('test query')
  })

  it('does not search when query is empty', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<Search />)

    await user.click(screen.getByRole('button'))

    expect(screen.queryByText('Result 1')).not.toBeInTheDocument()
  })

  it('shows loading spinner during search', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<Search />)

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'hello')
    await user.click(screen.getByRole('button'))

    // spinner should appear (animated div)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('displays search results after loading', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Search />)

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'hello')
    await user.click(screen.getByRole('button'))

    vi.advanceTimersByTime(600)

    await waitFor(() => {
      expect(screen.getByText('Result 1')).toBeInTheDocument()
      expect(screen.getByText('Result 2')).toBeInTheDocument()
      expect(screen.getByText('Result 3')).toBeInTheDocument()
    })
  })

  it('shows result descriptions', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Search />)

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'hello')
    await user.click(screen.getByRole('button'))

    vi.advanceTimersByTime(600)

    await waitFor(() => {
      expect(screen.getByText('This is a sample search result')).toBeInTheDocument()
    })
  })
})
