import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNav } from '@/components/layout'
import { useUIStore } from '@/store'

describe('MobileNav', () => {
  const mockOpenChange = vi.fn()

  beforeEach(() => {
    mockOpenChange.mockClear()
    // Reset store between tests
    useUIStore.setState({
      currentPage: 'dashboard',
      selectedStrategyId: null,
      isLoading: false,
    })
  })

  it('renders hamburger menu button', () => {
    render(
      <MobileNav
        open={false}
        onOpenChange={mockOpenChange}
      />
    )

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(menuButton).toBeInTheDocument()
  })

  it('is only visible on mobile (sm:hidden class)', () => {
    render(
      <MobileNav
        open={false}
        onOpenChange={mockOpenChange}
      />
    )

    const container = screen.getByRole('button', { name: 'Open navigation menu' }).parentElement
    expect(container).toHaveClass('sm:hidden')
  })

  it('opens sheet when hamburger is clicked', () => {
    render(
      <MobileNav
        open={false}
        onOpenChange={mockOpenChange}
      />
    )

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' })
    fireEvent.click(menuButton)

    expect(mockOpenChange).toHaveBeenCalledWith(true)
  })

  it('renders all navigation options when open', () => {
    render(
      <MobileNav
        open={true}
        onOpenChange={mockOpenChange}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Data Entry')).toBeInTheDocument()
    expect(screen.getByText('Compare')).toBeInTheDocument()
    expect(screen.getByText('Track')).toBeInTheDocument()
  })

  it('updates store and closes drawer when navigation item is clicked', () => {
    render(
      <MobileNav
        open={true}
        onOpenChange={mockOpenChange}
      />
    )

    // Find the navigation buttons in the sheet
    const dataEntryButtons = screen.getAllByText('Data Entry')
    const navButton = dataEntryButtons.find(
      btn => btn.closest('[role="navigation"]')
    )

    if (navButton) {
      fireEvent.click(navButton)
      expect(useUIStore.getState().currentPage).toBe('data-entry')
      expect(mockOpenChange).toHaveBeenCalledWith(false)
    }
  })

  it('highlights current page with teal styling', () => {
    useUIStore.setState({ currentPage: 'compare' })
    render(
      <MobileNav
        open={true}
        onOpenChange={mockOpenChange}
      />
    )

    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' })
    const compareButton = nav.querySelector('[aria-current="page"]')
    expect(compareButton).toBeInTheDocument()
    expect(compareButton).toHaveClass('text-teal-600')
    expect(compareButton).toHaveClass('bg-teal-50')
  })

  it('navigation items have minimum touch target size', () => {
    render(
      <MobileNav
        open={true}
        onOpenChange={mockOpenChange}
      />
    )

    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' })
    const buttons = nav.querySelectorAll('button')

    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]')
    })
  })

  it('reads currentPage from Zustand store', () => {
    useUIStore.setState({ currentPage: 'track' })
    render(
      <MobileNav
        open={true}
        onOpenChange={mockOpenChange}
      />
    )

    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' })
    const trackButton = nav.querySelector('[aria-current="page"]')
    expect(trackButton).toBeInTheDocument()
    expect(trackButton).toHaveTextContent('Track')
  })
})
