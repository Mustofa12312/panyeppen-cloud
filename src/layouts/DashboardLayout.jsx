import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children, headerProps }) {
  return (
    <div className="page flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-dvh md:ml-72 w-full">
        <Header {...headerProps} />

        {/* Main content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-24 md:pb-8">
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
