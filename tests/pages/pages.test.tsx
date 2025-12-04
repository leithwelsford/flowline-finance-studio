import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataEntryPage, ComparePage, TrackPage } from '@/pages'

// Note: DashboardPage tests moved to DashboardPage.test.tsx

describe('Page Components', () => {
  describe('DataEntryPage', () => {
    it('renders centered "Data Entry" heading', () => {
      render(<DataEntryPage />)

      const heading = screen.getByRole('heading', { name: 'Data Entry' })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-2xl')
    })
  })

  describe('ComparePage', () => {
    it('renders centered "Compare" heading', () => {
      render(<ComparePage />)

      const heading = screen.getByRole('heading', { name: 'Compare' })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-2xl')
    })
  })

  describe('TrackPage', () => {
    it('renders centered "Track" heading', () => {
      render(<TrackPage />)

      const heading = screen.getByRole('heading', { name: 'Track' })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-2xl')
    })
  })
})
