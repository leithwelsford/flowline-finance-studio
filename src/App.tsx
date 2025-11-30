import { useState } from 'react'
import { Header, Navigation, MobileNav, PageContainer } from '@/components/layout'
import { DashboardPage, DataEntryPage, ComparePage, TrackPage } from '@/pages'
import { useUIStore } from '@/store'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const currentPage = useUIStore((state) => state.currentPage)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'data-entry':
        return <DataEntryPage />
      case 'compare':
        return <ComparePage />
      case 'track':
        return <TrackPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center bg-white border-b border-slate-200">
        <MobileNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          className="pl-2"
        />
        <Header className="flex-1 border-b-0" />
      </div>
      <Navigation />
      <PageContainer>
        {renderPage()}
      </PageContainer>
      <Toaster />
    </div>
  )
}

export default App
