import { useState } from 'react'
import { Header, Navigation, MobileNav, PageContainer, type PageType } from '@/components/layout'
import { DashboardPage, DataEntryPage, ComparePage, TrackPage } from '@/pages'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
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
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          className="pl-2"
        />
        <Header className="flex-1 border-b-0" />
      </div>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <PageContainer>
        {renderPage()}
      </PageContainer>
    </div>
  )
}

export default App
