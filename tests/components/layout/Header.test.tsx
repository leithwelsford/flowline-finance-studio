import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout'

describe('Header', () => {
  it('renders the app title "Flowline Finance Studio"', () => {
    render(<Header />)
    expect(screen.getByText('Flowline Finance Studio')).toBeInTheDocument()
  })

  it('renders the logo SVG', () => {
    render(<Header />)
    const logo = document.querySelector('svg')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass('text-teal-600')
  })

  it('applies custom className', () => {
    render(<Header className="custom-class" />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('custom-class')
  })
})
