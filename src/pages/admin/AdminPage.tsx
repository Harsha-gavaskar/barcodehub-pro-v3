import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Building, Shield, Printer, FileText, Activity, Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const USERS = [
  { id: '1', name: 'Alex Johnson', email: 'alex@barcodehub.pro', role: 'admin', company: 'HQ', status: 'active', lastLogin: '2 min ago' },
  { id: '2', name: 'Sarah Lee', email: 'sarah@barcodehub.pro', role: 'manager', company: 'Warehouse', status: 'active', lastLogin: '1h ago' },
  { id: '3', name: 'Mike Davis', email: 'mike@barcodehub.pro', role: 'operator', company: 'Warehouse', status: 'active', lastLogin: '3h ago' },
  { id: '4', name: 'Emma Wilson', email: 'emma@barcodehub.pro', role: 'viewer', company: 'Office B', status: 'inactive', lastLogin: '2d ago' },
  { id: '5', name: 'Tom Brown', email: 'tom@barcodehub.pro', role: 'operator', company: 'Retail', status: 'active', lastLogin: '5h ago' },
]

const AUDIT_LOGS = [
  { user: 'Alex Johnson', action: 'Exported PDF Report', resource: 'Analytics', time: '10:23 AM', ip: '192.168.1.10' },
  { user: 'Sarah Lee', action: 'Bulk Imported 48 Products', resource: 'Products', time: '09:45 AM', ip: '192.168.1.11' },
  { user: 'Mike Davis', action: 'Sent 50 Labels to Printer', resource: 'Print Queue', time: '09:12 AM', ip: '192.168.1.20' },
  { user: 'Alex Johnson', action: 'Updated Settings', resource: 'Settings', time: '08:55 AM', ip: '192.168.1.10' },
  { user: 'Tom Brown', action: 'Generated 20 QR Codes', resource: 'Barcodes', time: '08:30 AM', ip: '192.168.1.22' },
]

const ROLE_BADGE: Record<string, string> = {
  admin: 'badge-purple',
  manager: 'badge-blue',
  operator: 'badge-green',
  viewer: 'badge-gray',
}

const ADMIN_TABS = ['Users', 'Roles', 'Companies', 'Printers', 'Audit Log']

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Users')
  const [users, setUsers] = useState(USERS)

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
    toast.success('User status updated')
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark-50">Admin Panel</h2>
          <p className="text-sm text-dark-400">Manage users, roles, companies, and system logs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-purple"><Shield size={12} /> Super Admin</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '24', icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Companies', value: '3', icon: Building, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Active Printers', value: '4', icon: Printer, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Audit Events', value: '1,248', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                <Icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">{s.value}</p>
                <p className="text-xs text-dark-400">{s.label}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 bg-dark-800/60 rounded-xl p-1 border border-dark-700/40 w-fit">
        {ADMIN_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab ? 'bg-brand-500/20 text-brand-300' : 'text-dark-400 hover:text-dark-200'
            )}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Users Table */}
      {activeTab === 'Users' && (
        <motion.div variants={item} className="table-container">
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/50">
            <h3 className="font-semibold text-dark-100">System Users</h3>
            <button onClick={() => toast.success('Invite user modal coming soon!')} className="btn-primary text-sm">
              <Plus size={14} /> Invite User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  {['User', 'Email', 'Role', 'Company', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="table-row"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-purple-500/30 flex items-center justify-center text-brand-300 font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-dark-100">{u.name}</p>
                      </div>
                    </td>
                    <td className="table-cell text-dark-400 text-sm">{u.email}</td>
                    <td className="table-cell"><span className={ROLE_BADGE[u.role]}>{u.role}</span></td>
                    <td className="table-cell text-dark-400 text-sm">{u.company}</td>
                    <td className="table-cell text-dark-500 text-xs">{u.lastLogin}</td>
                    <td className="table-cell">
                      {u.status === 'active'
                        ? <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={10} /> Active</span>
                        : <span className="badge-gray flex items-center gap-1 w-fit"><XCircle size={10} /> Inactive</span>
                      }
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast.success(`Editing ${u.name}...`)} className="btn-icon"><Edit3 size={13} /></button>
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className="btn-icon text-amber-400 hover:bg-amber-500/10"
                          title="Toggle status"
                        >
                          {u.status === 'active' ? <XCircle size={13} /> : <CheckCircle size={13} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Audit Log */}
      {activeTab === 'Audit Log' && (
        <motion.div variants={item} className="table-container">
          <div className="px-6 py-4 border-b border-dark-700/50">
            <h3 className="font-semibold text-dark-100">System Audit Log</h3>
          </div>
          <div className="divide-y divide-dark-800/50">
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-700/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-100 font-medium">
                    <span className="text-brand-400">{log.user}</span> — {log.action}
                  </p>
                  <p className="text-xs text-dark-500">{log.resource} · {log.ip}</p>
                </div>
                <span className="text-xs text-dark-600 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Other tabs placeholder */}
      {!['Users', 'Audit Log'].includes(activeTab) && (
        <motion.div variants={item} className="glass-card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-brand-400" />
          </div>
          <p className="text-dark-400 font-medium">{activeTab} management</p>
          <p className="text-dark-600 text-sm mt-1">This section is part of Phase 2 (Backend integration)</p>
        </motion.div>
      )}
    </motion.div>
  )
}
