import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/store/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useUIStore.setState({
      currentPage: 'dashboard',
      selectedStrategyId: null,
      isLoading: false,
    })
  })

  describe('initial state', () => {
    it('has correct initial currentPage', () => {
      const state = useUIStore.getState()
      expect(state.currentPage).toBe('dashboard')
    })

    it('has correct initial selectedStrategyId', () => {
      const state = useUIStore.getState()
      expect(state.selectedStrategyId).toBeNull()
    })

    it('has correct initial isLoading', () => {
      const state = useUIStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setCurrentPage', () => {
    it('updates currentPage to dashboard', () => {
      useUIStore.getState().setCurrentPage('dashboard')
      expect(useUIStore.getState().currentPage).toBe('dashboard')
    })

    it('updates currentPage to data-entry', () => {
      useUIStore.getState().setCurrentPage('data-entry')
      expect(useUIStore.getState().currentPage).toBe('data-entry')
    })

    it('updates currentPage to compare', () => {
      useUIStore.getState().setCurrentPage('compare')
      expect(useUIStore.getState().currentPage).toBe('compare')
    })

    it('updates currentPage to track', () => {
      useUIStore.getState().setCurrentPage('track')
      expect(useUIStore.getState().currentPage).toBe('track')
    })
  })

  describe('setSelectedStrategy', () => {
    it('updates selectedStrategyId to a valid ID', () => {
      useUIStore.getState().setSelectedStrategy('strategy-123')
      expect(useUIStore.getState().selectedStrategyId).toBe('strategy-123')
    })

    it('updates selectedStrategyId to null', () => {
      useUIStore.getState().setSelectedStrategy('strategy-123')
      useUIStore.getState().setSelectedStrategy(null)
      expect(useUIStore.getState().selectedStrategyId).toBeNull()
    })
  })

  describe('setIsLoading', () => {
    it('updates isLoading to true', () => {
      useUIStore.getState().setIsLoading(true)
      expect(useUIStore.getState().isLoading).toBe(true)
    })

    it('updates isLoading to false', () => {
      useUIStore.getState().setIsLoading(true)
      useUIStore.getState().setIsLoading(false)
      expect(useUIStore.getState().isLoading).toBe(false)
    })
  })

  describe('state isolation', () => {
    it('setting currentPage does not affect other state', () => {
      useUIStore.getState().setSelectedStrategy('test-id')
      useUIStore.getState().setIsLoading(true)
      useUIStore.getState().setCurrentPage('compare')

      const state = useUIStore.getState()
      expect(state.currentPage).toBe('compare')
      expect(state.selectedStrategyId).toBe('test-id')
      expect(state.isLoading).toBe(true)
    })
  })
})
