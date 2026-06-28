import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import toast from 'react-hot-toast'
import {
  User, Bell, Shield, Link, Palette, Building,
  Key, Smartphone, Globe, Save, Check, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Link },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'company', label: 'Company', icon: Building },
]

export default function SettingsPage() {
  const user = useSelector((s: RootState) => s.auth.user)
  const [activeTab, setActiveTab] = useState('profile')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [slackNotifs, setSlackNotifs] = useState(true)
  const [lowStockAlert, setLowStockAlert] = useState(true)
  const [twoFA, setTwoFA] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(true)
  const [autoSync, setAutoSync] = useState(true)

  const save = () => toast.success('Settings saved!')

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={clsx(
        'relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0',
        on ? 'bg-brand-500' : 'bg-dark-600'
      )}
    >
      <div className={clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-dark-50">Settings</h2>
        <p className="text-sm text-dark-400">Manage your account and platform configuration</p>
      </motion.div>

      <div className="flex gap-5 flex-col xl:flex-row">
        {/* Tabs */}
        <motion.div variants={item} className="xl:w-52 shrink-0">
          <div className="glass-card p-2 space-y-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                      : 'text-dark-400 hover:bg-dark-700/40 hover:text-dark-200'
                  )}
                >
                  <Icon size={15} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={13} className="ml-auto" />}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={item} className="flex-1 min-w-0 space-y-4">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-dark-100">Profile Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-dark-100 font-semibold">{user?.name}</p>
                  <p className="text-dark-500 text-sm">{user?.email}</p>
                  <button className="text-xs text-brand-400 mt-1 hover:text-brand-300">Change avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">First Name</label><input defaultValue="Alex" className="input-field" /></div>
                <div><label className="input-label">Last Name</label><input defaultValue="Johnson" className="input-field" /></div>
                <div><label className="input-label">Email</label><input defaultValue={user?.email} className="input-field" /></div>
                <div><label className="input-label">Phone</label><input placeholder="+1 (555) 000-0000" className="input-field" /></div>
                <div><label className="input-label">Role</label><input defaultValue={user?.role} disabled className="input-field opacity-50" /></div>
                <div><label className="input-label">Company</label><input defaultValue={user?.company} className="input-field" /></div>
              </div>
              <button onClick={save} className="btn-primary"><Save size={15} /> Save Changes</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-dark-100">Notification Preferences</h3>
              {[
                { label: 'Email Notifications', desc: 'Receive updates via email', on: emailNotifs, toggle: () => setEmailNotifs(v => !v) },
                { label: 'SMS Notifications', desc: 'Get alerts via SMS', on: smsNotifs, toggle: () => setSmsNotifs(v => !v) },
                { label: 'Slack Notifications', desc: 'Post updates to Slack', on: slackNotifs, toggle: () => setSlackNotifs(v => !v) },
                { label: 'Low Stock Alerts', desc: 'Alert when stock drops below 10 units', on: lowStockAlert, toggle: () => setLowStockAlert(v => !v) },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/40 border border-dark-700/40">
                  <div>
                    <p className="text-sm font-medium text-dark-100">{n.label}</p>
                    <p className="text-xs text-dark-500">{n.desc}</p>
                  </div>
                  <Toggle on={n.on} onToggle={n.toggle} />
                </div>
              ))}
              <button onClick={save} className="btn-primary"><Save size={15} /> Save Preferences</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-dark-100">Security Settings</h3>
              <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-100">Two-Factor Authentication</p>
                    <p className="text-xs text-dark-500">Add an extra layer of security to your account</p>
                  </div>
                  <Toggle on={twoFA} onToggle={() => setTwoFA(v => !v)} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-dark-200 mb-3">Change Password</h4>
                <div className="space-y-3">
                  <div><label className="input-label">Current Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
                  <div><label className="input-label">New Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
                  <div><label className="input-label">Confirm New Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
                </div>
              </div>
              <button onClick={save} className="btn-primary"><Key size={15} /> Update Password</button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-dark-100">Integrations</h3>
              {[
                {
                  name: 'Google Sheets',
                  desc: 'Sync products from Google Sheets automatically',
                  icon: '📊',
                  connected: googleConnected,
                  onToggle: () => setGoogleConnected(v => !v),
                },
                {
                  name: 'Auto-Sync (Hourly)',
                  desc: 'Automatically sync every hour in the background',
                  icon: '🔄',
                  connected: autoSync,
                  onToggle: () => setAutoSync(v => !v),
                },
                {
                  name: 'Slack Webhook',
                  desc: 'Post notifications to your Slack workspace',
                  icon: '💬',
                  connected: false,
                  onToggle: () => toast.error('Configure Slack webhook URL first'),
                },
                {
                  name: 'AWS S3 Storage',
                  desc: 'Store generated labels and exports on S3',
                  icon: '☁️',
                  connected: false,
                  onToggle: () => toast.error('Configure AWS credentials first'),
                },
              ].map(int => (
                <div key={int.name} className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/40 border border-dark-700/40">
                  <span className="text-2xl">{int.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100">{int.name}</p>
                    <p className="text-xs text-dark-500">{int.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {int.connected && <span className="badge-green"><Check size={10} /> Active</span>}
                    <Toggle on={int.connected} onToggle={int.onToggle} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-dark-100">Appearance</h3>
              <div>
                <p className="text-sm font-medium text-dark-200 mb-3">Theme</p>
                <div className="flex gap-3">
                  {['Dark', 'Light', 'System'].map(t => (
                    <button
                      key={t}
                      className={clsx(
                        'flex-1 py-3 rounded-xl border text-sm font-medium transition-all',
                        t === 'Dark'
                          ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                          : 'border-dark-600/40 text-dark-400 hover:border-dark-500/60'
                      )}
                    >
                      {t === 'Dark' ? '🌙' : t === 'Light' ? '☀️' : '💻'} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-dark-200 mb-3">Accent Color</p>
                <div className="flex gap-2">
                  {['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                    <button
                      key={c}
                      className="w-8 h-8 rounded-full ring-offset-2 ring-offset-dark-900 hover:ring-2 hover:ring-white transition-all"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <button onClick={save} className="btn-primary"><Save size={15} /> Save Appearance</button>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-dark-100">Company Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Company Name</label><input defaultValue="BarcodeHub Industries" className="input-field" /></div>
                <div><label className="input-label">Industry</label><select className="select-field"><option>Retail</option><option>Manufacturing</option><option>Warehouse</option><option>Healthcare</option></select></div>
                <div><label className="input-label">Address</label><input placeholder="123 Main St" className="input-field" /></div>
                <div><label className="input-label">City</label><input placeholder="New York" className="input-field" /></div>
                <div><label className="input-label">Country</label><select className="select-field"><option>United States</option><option>India</option><option>United Kingdom</option></select></div>
                <div><label className="input-label">Tax ID</label><input placeholder="XX-XXXXXXX" className="input-field" /></div>
              </div>
              <button onClick={save} className="btn-primary"><Save size={15} /> Save Company Info</button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
