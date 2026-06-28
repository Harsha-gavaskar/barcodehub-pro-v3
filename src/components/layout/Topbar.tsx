import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { RootState } from '../../redux/store'
import { markNotificationRead, markAllRead } from '../../redux/slices/uiSlice'
import {
  Bell, Search, Sun, Moon, ChevronDown,
  CheckCheck, X, AlertTriangle, Info, CheckCircle
} from 'lucide-react'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening today.' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalog and SKUs.' },
  '/barcodes': { title: 'Barcode Generator', subtitle: 'Generate barcodes in multiple formats.' },
  '/labels': { title: 'Label Designer', subtitle: 'Design custom labels with drag & drop.' },
  '/print': { title: 'Print Queue', subtitle: 'Manage and send print jobs.' },
  '/analytics': { title: 'Analytics', subtitle: 'Insights on label and print activity.' },
  '/inventory': { title: 'Inventory', subtitle: 'Track stock levels and movements.' },
  '/reports': { title: 'Reports', subtitle: 'Download PDF, Excel, and CSV reports.' },
  '/settings': { title: 'Settings', subtitle: 'Configure your account and integrations.' },
  '/admin': { title: 'Admin Panel', subtitle: 'Manage users, roles, and system settings.' },
}

const NOTIF_ICONS = {
  success: <CheckCircle size={14} className="text-emerald-400" />,
  warning: <AlertTriangle size={14} className="text-amber-400" />,
  info: <Info size={14} className="text-blue-400" />,
  error: <X size={14} className="text-red-400" />,
}

export default function Topbar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const notifications = useSelector((s: RootState) => s.ui.notifications)
  const user = useSelector((s: RootState) => s.auth.user)
  const [showNotifs, setShowNotifs] = useState(false)
  const [search, setSearch] = useState('')
  const [dark, setDark] = useState(true)
  const notifRef = useRef<HTMLDivElement>(null)

  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'BarcodeHub Pro', subtitle: '' }
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/40 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-20">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-dark-50 truncate">{pageInfo.title}</h1>
        <p className="text-xs text-dark-500 truncate hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products, SKUs..."
          className="pl-9 pr-4 py-2 bg-dark-800/60 border border-dark-600/40 rounded-xl text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-brand-500/50 focus:bg-dark-800 w-56 transition-all duration-200"
        />
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifs(v => !v)}
          className="btn-icon relative"
          id="notifications-button"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 glass-panel border border-dark-700/50 shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700/50">
                <span className="font-semibold text-dark-100 text-sm">Notifications</span>
                <button onClick={() => dispatch(markAllRead())} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  <CheckCheck size={12} /> Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto scrollable">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => dispatch(markNotificationRead(n.id))}
                    className={clsx(
                      'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-dark-700/30 border-b border-dark-800/50 last:border-0',
                      !n.read && 'bg-brand-500/5'
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{NOTIF_ICONS[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark-100">{n.title}</p>
                      <p className="text-xs text-dark-400 truncate">{n.message}</p>
                      <p className="text-[10px] text-dark-600 mt-0.5">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme toggle */}
      <button onClick={() => setDark(v => !v)} className="btn-icon" title="Toggle theme">
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
          {user?.name?.charAt(0) ?? 'A'}
        </div>
        <ChevronDown size={14} className="text-dark-500 group-hover:text-dark-300 transition-colors" />
      </div>
    </header>
  )
}
