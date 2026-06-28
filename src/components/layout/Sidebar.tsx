import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { RootState } from '../../redux/store'
import { toggleSidebar } from '../../redux/slices/uiSlice'
import { logout } from '../../redux/slices/authSlice'
import {
  LayoutDashboard, Package, QrCode, Layers, Printer, FileSpreadsheet,
  BarChart3, Warehouse, FileText, Settings, Users,
  LogOut, ChevronLeft, ChevronRight, Zap, ShoppingCart,
  Bell, CreditCard
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', exact: true },
  { section: 'Products' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Inventory', icon: Warehouse, path: '/inventory' },
  { section: 'Barcodes' },
  { label: 'Barcode Generator', icon: QrCode, path: '/barcodes' },
  { label: 'Batch Excel Print', icon: FileSpreadsheet, path: '/batch-barcodes' },
  { label: 'Label Designer', icon: Layers, path: '/labels' },
  { label: 'Print Queue', icon: Printer, path: '/print' },
  { section: 'Insights' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { section: 'System' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Admin Panel', icon: Users, path: '/admin' },
  { label: 'Billing', icon: CreditCard, path: '/settings?tab=billing' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const collapsed = useSelector((s: RootState) => s.ui.sidebarCollapsed)
  const user = useSelector((s: RootState) => s.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-30 flex flex-col bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-dark-700/40 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-glow-sm">
            <QrCode size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-bold text-dark-50 text-sm">BarcodeHub</span>
                <span className="text-brand-400 font-bold text-sm"> Pro</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => dispatch(toggleSidebar())}
          className="ml-auto btn-icon shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar px-2">
        {NAV_ITEMS.map((item, idx) => {
          if ('section' in item) {
            if (collapsed) return null
            return (
              <p key={idx} className="nav-section-title mt-4 mb-1">
                {item.section}
              </p>
            )
          }

          const Icon = item.icon!
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              end={item.exact}
              className={({ isActive }) =>
                clsx('nav-item mb-0.5', isActive && 'active', collapsed && 'justify-center px-2')
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* Google Sheets Status */}
      {!collapsed && (
        <div className="mx-2 mb-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-emerald-400 font-medium">Sheets Synced</span>
          </div>
          <p className="text-xs text-dark-500 mt-0.5">Last sync: 2 min ago</p>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-dark-700/40 p-3 shrink-0">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden min-w-0"
              >
                <p className="text-sm font-semibold text-dark-100 truncate">{user?.name}</p>
                <p className="text-xs text-dark-500 truncate capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={handleLogout} className="btn-icon shrink-0" title="Logout">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
