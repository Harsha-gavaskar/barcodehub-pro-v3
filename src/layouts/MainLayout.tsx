import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function MainLayout() {
  const collapsed = useSelector((s: RootState) => s.ui.sidebarCollapsed)

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Mesh background */}
      <div className="fixed inset-0 bg-mesh-gradient opacity-40 pointer-events-none" />
      
      <Sidebar />
      
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? '72px' : '256px' }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 scrollable">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
