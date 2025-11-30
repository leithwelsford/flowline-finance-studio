import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '@/components/layout'
import { useUIStore } from '@/store'

describe('Navigation', () => {
  beforeEach(() => {
    // Reset store between tests
    useUIStore.setState({
      currentPage: 'dashboard',
      selectedStrategyId: null,
      isLoading: false,
    })
  })

  it('renders all four navigation tabs', () => {
    render(<Navigation />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Data Entry')).toBeInTheDocument()
    expect(screen.getByText('Compare')).toBeInTheDocument()
    expect(screen.getByText('Track')).toBeInTheDocument()
  })

  it('marks the current page with aria-current', () => {
    useUIStore.setState({ currentPage: 'data-entry' })
    render(<Navigation />)

    const dataEntryButton = screen.getByText('Data Entry')
    expect(dataEntryButton).toHaveAttribute('aria-current', 'page')

    const dashboardButton = screen.getByText('Dashboard')
    expect(dashboardButton).not.toHaveAttribute('aria-current')
  })

  it('applies teal-600 text color to active tab', () => {
    useUIStore.setState({ currentPage: 'compare' })
    render(<Navigation />)

    const compareButton = screen.getByText('Compare')
    expect(compareButton).toHaveClass('text-teal-600')
  })

  it('shows teal underline indicator for active tab', () => {
    render(<Navigation />)

    const dashboardButton = screen.getByText('Dashboard')
    const underline = dashboardButton.querySelector('span')
    expect(underline).toBeInTheDocument()
    expect(underline).toHaveClass('bg-teal-600')
  })

  it('updates store when clicking a tab', () => {
    render(<Navigation />)

    fireEvent.click(screen.getByText('Data Entry'))
    expect(useUIStore.getState().currentPage).toBe('data-entry')

    fireEvent.click(screen.getByText('Compare'))
    expect(useUIStore.getState().currentPage).toBe('compare')

    fireEvent.click(screen.getByText('Track'))
    expect(useUIStore.getState().currentPage).toBe('track')
  })

  it('has navigation role and aria-label', () => {
    render(<Navigation />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
  })

  it('is hidden on mobile (sm:flex class)', () => {
    render(<Navigation />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toHaveClass('hidden')
    expect(nav).toHaveClass('sm:flex')
  })

  it('reads currentPage from Zustand store', () => {
    useUIStore.setState({ currentPage: 'track' })
    render(<Navigation />)

    const trackButton = screen.getByText('Track')
    expect(trackButton).toHaveAttribute('aria-current', 'page')
  })
})
