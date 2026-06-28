import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { setUser, setToken } from '../../redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { QrCode, Eye, EyeOff, Mail, Lock, ArrowRight, Zap, BarChart3, Printer } from 'lucide-react'
import clsx from 'clsx'

interface LoginForm {
  email: string
  password: string
}

const FEATURES = [
  { icon: QrCode, label: 'Barcode Generation', desc: '8 formats including QR Code' },
  { icon: BarChart3, label: 'Analytics Dashboard', desc: 'Real-time insights and reports' },
  { icon: Printer, label: 'Label Printing', desc: 'Any printer, any paper size' },
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tab, setTab] = useState<'email' | 'otp'>('email')
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    dispatch(setUser({ id: '1', name: 'Alex Johnson', email: data.email, role: 'admin', company: 'BarcodeHub Industries' }))
    dispatch(setToken('jwt-demo-token'))
    toast.success('Welcome back!')
    navigate('/')
    setIsLoading(false)
  }

  const onGoogleLogin = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    dispatch(setUser({ id: '1', name: 'Alex Johnson', email: 'alex@barcodehub.pro', role: 'admin', company: 'BarcodeHub Industries' }))
    dispatch(setToken('jwt-google-token'))
    toast.success('Logged in with Google!')
    navigate('/')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-brand-950 via-dark-900 to-dark-950 relative overflow-hidden p-12 justify-between">
        <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">BarcodeHub <span className="text-brand-400">Pro</span></span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              The professional<br />
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                barcode platform
              </span>
            </h1>
            <p className="text-dark-300 text-lg mb-10">
              Generate, design, and print barcodes at enterprise scale. Built for retail, warehouses, and manufacturing.
            </p>

            <div className="space-y-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                      <Icon size={18} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{f.label}</p>
                      <p className="text-dark-400 text-xs">{f.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <p className="text-dark-600 text-sm">Trusted by 500+ businesses worldwide</p>
          <div className="flex gap-4 mt-3">
            {['Retail', 'Warehouse', 'Healthcare', 'Manufacturing'].map(sector => (
              <span key={sector} className="text-xs text-dark-500 bg-dark-800/40 px-2 py-1 rounded">{sector}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">BarcodeHub <span className="text-brand-400">Pro</span></span>
          </div>

          <div className="glass-panel p-8">
            <h2 className="text-2xl font-bold text-dark-50 mb-1">Welcome back</h2>
            <p className="text-dark-400 text-sm mb-6">Sign in to your account to continue</p>

            {/* Tab */}
            <div className="flex gap-1 bg-dark-800/60 rounded-xl p-1 border border-dark-700/40 mb-6">
              {(['email', 'otp'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                    tab === t ? 'bg-brand-500/20 text-brand-300' : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  {t === 'email' ? '📧 Email' : '📱 OTP'}
                </button>
              ))}
            </div>

            {tab === 'email' && (
              <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                      placeholder="alex@company.com"
                      className={clsx('input-field pl-10', errors.email && 'border-red-500/60')}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="input-label mb-0">Password</label>
                    <button type="button" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      {...register('password', { required: 'Password is required' })}
                      placeholder="••••••••"
                      className={clsx('input-field pl-10 pr-10', errors.password && 'border-red-500/60')}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full justify-center mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
                  )}
                </button>
              </form>
            )}

            {tab === 'otp' && (
              <div className="space-y-4">
                <div>
                  <label className="input-label">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">+1</span>
                    <input placeholder="(555) 000-0000" className="input-field pl-10" />
                  </div>
                </div>
                <button onClick={() => toast.success('OTP sent to your phone!')} className="btn-primary w-full justify-center">
                  Send OTP <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-700/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-dark-900 px-3 text-dark-500">or continue with</span>
              </div>
            </div>

            <button
              onClick={onGoogleLogin}
              disabled={isLoading}
              className="w-full btn-secondary justify-center py-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-dark-500 mt-5">
              Don't have an account?{' '}
              <button className="text-brand-400 hover:text-brand-300 font-medium" onClick={() => toast.success('Registration coming soon!')}>
                Sign up free
              </button>
            </p>

            {/* Demo hint */}
            <div className="mt-4 p-3 rounded-xl bg-brand-500/8 border border-brand-500/15">
              <p className="text-xs text-brand-400 flex items-center gap-1.5">
                <Zap size={11} /> <strong>Demo mode:</strong> Enter any email & password to log in
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
