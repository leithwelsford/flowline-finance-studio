import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageContainer } from '@/components/layout'

describe('PageContainer', () => {
  it('renders children content', () => {
    render(
      <PageContainer>
        <div data-testid="child-content">Test Content</div>
      </PageContainer>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('has main role for accessibility', () => {
    render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('applies slate-50 background', () => {
    render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    )

    expect(screen.getByRole('main')).toHaveClass('bg-slate-50')
  })

  it('applies responsive padding classes', () => {
    render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('p-4')
    expect(main).toHaveClass('sm:p-6')
    expect(main).toHaveClass('lg:p-8')
  })

  it('applies custom className', () => {
    render(
      <PageContainer className="custom-class">
        <div>Content</div>
      </PageContainer>
    )

    expect(screen.getByRole('main')).toHaveClass('custom-class')
  })
})
