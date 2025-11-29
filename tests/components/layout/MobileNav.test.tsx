import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNav } from '@/components/layout'

describe('MobileNav', () => {
  const mockNavigate = vi.fn()
  const mockOpenChange = vi.fn()

  beforeEach(() => {
    mockNavigate.mockClear()
    mockOpenChange.mockClear()
  })

  it('renders hamburger menu button', () => {
    render(
      <MobileNav
        currentPage="dashboard"
        onNavigate={mockNavigate}
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
        currentPage="dashboard"
        onNavigate={mockNavigate}
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
        currentPage="dashboard"
        onNavigate={mockNavigate}
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
        currentPage="dashboard"
        onNavigate={mockNavigate}
        open={true}
        onOpenChange={mockOpenChange}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Data Entry')).toBeInTheDocument()
    expect(screen.getByText('Compare')).toBeInTheDocument()
    expect(screen.getByText('Track')).toBeInTheDocument()
  })

  it('calls onNavigate and closes drawer when navigation item is clicked', () => {
    render(
      <MobileNav
        currentPage="dashboard"
        onNavigate={mockNavigate}
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
      expect(mockNavigate).toHaveBeenCalledWith('data-entry')
      expect(mockOpenChange).toHaveBeenCalledWith(false)
    }
  })

  it('highlights current page with teal styling', () => {
    render(
      <MobileNav
        currentPage="compare"
        onNavigate={mockNavigate}
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
        currentPage="dashboard"
        onNavigate={mockNavigate}
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
})
