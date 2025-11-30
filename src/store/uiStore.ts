import { create } from 'zustand'

export type PageType = 'dashboard' | 'data-entry' | 'compare' | 'track'

interface UIState {
  currentPage: PageType
  selectedStrategyId: string | null
  isLoading: boolean
  setCurrentPage: (page: PageType) => void
  setSelectedStrategy: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'dashboard',
  selectedStrategyId: null,
  isLoading: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedStrategy: (id) => set({ selectedStrategyId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
