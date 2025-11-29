import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '@/components/layout'

describe('Navigation', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders all four navigation tabs', () => {
    render(<Navigation currentPage="dashboard" onNavigate={mockNavigate} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Data Entry')).toBeInTheDocument()
    expect(screen.getByText('Compare')).toBeInTheDocument()
    expect(screen.getByText('Track')).toBeInTheDocument()
  })

  it('marks the current page with aria-current', () => {
    render(<Navigation currentPage="data-entry" onNavigate={mockNavigate} />)

    const dataEntryButton = screen.getByText('Data Entry')
    expect(dataEntryButton).toHaveAttribute('aria-current', 'page')

    const dashboardButton = screen.getByText('Dashboard')
    expect(dashboardButton).not.toHaveAttribute('aria-current')
  })

  it('applies teal-600 text color to active tab', () => {
    render(<Navigation currentPage="compare" onNavigate={mockNavigate} />)

    const compareButton = screen.getByText('Compare')
    expect(compareButton).toHaveClass('text-teal-600')
  })

  it('shows teal underline indicator for active tab', () => {
    render(<Navigation currentPage="dashboard" onNavigate={mockNavigate} />)

    const dashboardButton = screen.getByText('Dashboard')
    const underline = dashboardButton.querySelector('span')
    expect(underline).toBeInTheDocument()
    expect(underline).toHaveClass('bg-teal-600')
  })

  it('calls onNavigate when clicking a tab', () => {
    render(<Navigation currentPage="dashboard" onNavigate={mockNavigate} />)

    fireEvent.click(screen.getByText('Data Entry'))
    expect(mockNavigate).toHaveBeenCalledWith('data-entry')

    fireEvent.click(screen.getByText('Compare'))
    expect(mockNavigate).toHaveBeenCalledWith('compare')

    fireEvent.click(screen.getByText('Track'))
    expect(mockNavigate).toHaveBeenCalledWith('track')
  })

  it('has navigation role and aria-label', () => {
    render(<Navigation currentPage="dashboard" onNavigate={mockNavigate} />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
  })

  it('is hidden on mobile (sm:flex class)', () => {
    render(<Navigation currentPage="dashboard" onNavigate={mockNavigate} />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toHaveClass('hidden')
    expect(nav).toHaveClass('sm:flex')
  })
})
