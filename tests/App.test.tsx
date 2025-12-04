import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '@/App'
import { useUIStore } from '@/store'

describe('App', () => {
  beforeEach(() => {
    // Reset store between tests
    useUIStore.setState({
      currentPage: 'dashboard',
      selectedStrategyId: null,
      isLoading: false,
    })
  })

  it('renders the app with header and navigation', () => {
    render(<App />)

    expect(screen.getByText('Flowline Finance Studio')).toBeInTheDocument()
  })

  it('shows Dashboard as the default page', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Financial Health Dashboard' })).toBeInTheDocument()
  })

  it('navigates to Data Entry when clicking the tab', () => {
    render(<App />)

    // Find navigation tabs (not mobile)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const dataEntryTab = nav.querySelector('button:nth-child(2)')

    if (dataEntryTab) {
      fireEvent.click(dataEntryTab)
      expect(screen.getByRole('heading', { name: 'Data Entry' })).toBeInTheDocument()
    }
  })

  it('navigates to Compare when clicking the tab', () => {
    render(<App />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const compareTab = nav.querySelector('button:nth-child(3)')

    if (compareTab) {
      fireEvent.click(compareTab)
      expect(screen.getByRole('heading', { name: 'Compare' })).toBeInTheDocument()
    }
  })

  it('navigates to Track when clicking the tab', () => {
    render(<App />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const trackTab = nav.querySelector('button:nth-child(4)')

    if (trackTab) {
      fireEvent.click(trackTab)
      expect(screen.getByRole('heading', { name: 'Track' })).toBeInTheDocument()
    }
  })

  it('updates active tab indicator on navigation', () => {
    render(<App />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })

    // Initially Dashboard is active
    const dashboardTab = nav.querySelector('button:first-child')
    expect(dashboardTab).toHaveAttribute('aria-current', 'page')

    // Click on Compare
    const compareTab = nav.querySelector('button:nth-child(3)')
    if (compareTab) {
      fireEvent.click(compareTab)
      expect(compareTab).toHaveAttribute('aria-current', 'page')
      expect(dashboardTab).not.toHaveAttribute('aria-current')
    }
  })

  it('renders mobile hamburger menu', () => {
    render(<App />)

    const hamburger = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(hamburger).toBeInTheDocument()
  })
})
