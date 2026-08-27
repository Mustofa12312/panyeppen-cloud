import { useState, useEffect } from 'react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children, headerProps }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  return (
    <div className="page flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Main content wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-dvh transition-all duration-300 w-full ${isCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>
        <Header {...headerProps} />

        {/* Main content */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-4 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (mobile + tablet) */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
