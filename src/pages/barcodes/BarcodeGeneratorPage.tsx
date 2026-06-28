import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'
import {
  QrCode, Download, Copy, RefreshCw, Sliders,
  Check, ChevronDown, Settings2, Zap
} from 'lucide-react'
import clsx from 'clsx'

const BARCODE_FORMATS = [
  { id: 'CODE128', label: 'CODE 128', description: 'Alphanumeric, most versatile', group: 'Linear' },
  { id: 'CODE39', label: 'CODE 39', description: 'Alphanumeric, industrial use', group: 'Linear' },
  { id: 'EAN13', label: 'EAN-13', description: '13-digit retail standard', group: 'Linear' },
  { id: 'EAN8', label: 'EAN-8', description: '8-digit compact retail', group: 'Linear' },
  { id: 'UPC', label: 'UPC-A', description: '12-digit North American retail', group: 'Linear' },
  { id: 'QR', label: 'QR Code', description: '2D matrix, scan with phone', group: '2D' },
]

const AI_SUGGESTIONS: Record<string, { format: string; reason: string }> = {
  retail: { format: 'EAN13', reason: 'EAN-13 is the global retail standard for product identification' },
  warehouse: { format: 'CODE128', reason: 'CODE128 handles alphanumeric SKUs efficiently for warehouse operations' },
  url: { format: 'QR', reason: 'QR Code is best for URLs and web links' },
  numeric: { format: 'EAN8', reason: 'EAN-8 is compact and efficient for short numeric codes' },
}

function detectAISuggestion(value: string): { format: string; reason: string } | null {
  if (!value) return null
  if (value.startsWith('http') || value.startsWith('www')) return AI_SUGGESTIONS.url
  if (/^\d{12,13}$/.test(value)) return AI_SUGGESTIONS.retail
  if (/^\d{7,8}$/.test(value)) return AI_SUGGESTIONS.numeric
  if (/^[A-Z]{2,}-\d+$/.test(value)) return AI_SUGGESTIONS.warehouse
  return null
}

export default function BarcodeGeneratorPage() {
  const products = useSelector((s: RootState) => s.products.products)
  const [format, setFormat] = useState('CODE128')
  const [value, setValue] = useState('BH-PRO-001234')
  const [label, setLabel] = useState('Sample Product')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(80)
  const [showText, setShowText] = useState(true)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#000000')
  const [generated, setGenerated] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<{ format: string; reason: string } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isQR = format === 'QR'

  const generate = useCallback(async () => {
    if (!value.trim()) {
      toast.error('Please enter a barcode value')
      return
    }
    setGenerated(false)
    try {
      if (isQR) {
        const url = await QRCode.toDataURL(value, {
          width: 200,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: 'H',
        })
        setQrDataUrl(url)
      } else {
        if (svgRef.current) {
          JsBarcode(svgRef.current, value, {
            format,
            width,
            height,
            displayValue: showText,
            background: bgColor,
            lineColor: fgColor,
            margin: 10,
            font: 'monospace',
            fontSize: 13,
          })
        }
      }
      setGenerated(true)
      toast.success('Barcode generated!')
    } catch (err: any) {
      toast.error(`Invalid value for ${format}: ${err.message}`)
    }
  }, [value, format, width, height, showText, bgColor, fgColor, isQR])

  useEffect(() => {
    generate()
  }, [format])

  useEffect(() => {
    const suggestion = detectAISuggestion(value)
    setAiSuggestion(suggestion)
  }, [value])

  const downloadSVG = () => {
    if (isQR && qrDataUrl) {
      const a = document.createElement('a')
      a.href = qrDataUrl
      a.download = `qrcode-${value}.png`
      a.click()
      toast.success('QR Code downloaded!')
      return
    }
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barcode-${value}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('SVG downloaded!')
  }

  const downloadPNG = async () => {
    if (isQR && qrDataUrl) {
      const a = document.createElement('a')
      a.href = qrDataUrl
      a.download = `qrcode-${value}.png`
      a.click()
      return
    }
    if (!svgRef.current) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * 3
      canvas.height = img.height * 3
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `barcode-${value}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PNG downloaded!')
    }
    img.src = url
  }

  const copyValue = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-50">Barcode Generator</h2>
          <p className="text-sm text-dark-400 mt-0.5">Generate barcodes in 8 formats with AI format detection</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Controls Panel */}
        <motion.div variants={item} className="xl:col-span-2 space-y-4">
          {/* Format selector */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <QrCode size={15} className="text-brand-400" /> Barcode Format
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {BARCODE_FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={clsx(
                    'text-left p-3 rounded-xl border text-xs transition-all duration-200',
                    format === f.id
                      ? 'border-brand-500/60 bg-brand-500/10 text-brand-300'
                      : 'border-dark-600/40 bg-dark-800/40 text-dark-400 hover:border-dark-500/60 hover:text-dark-300'
                  )}
                >
                  <div className="font-semibold mb-0.5">{f.label}</div>
                  <div className="text-[10px] opacity-70">{f.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestion */}
          {aiSuggestion && aiSuggestion.format !== format && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4 border border-purple-500/20 bg-purple-500/5"
            >
              <div className="flex items-start gap-2">
                <Zap size={14} className="text-purple-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-300">AI Suggestion</p>
                  <p className="text-xs text-dark-400 mt-0.5">{aiSuggestion.reason}</p>
                  <button
                    onClick={() => setFormat(aiSuggestion.format)}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Switch to {aiSuggestion.format} →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Value & Settings */}
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="input-label">Barcode Value</label>
              <div className="relative">
                <input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Enter barcode value..."
                  className="input-field pr-10"
                  id="barcode-value"
                />
                <button onClick={copyValue} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Display Label</label>
              <input value={label} onChange={e => setLabel(e.target.value)} className="input-field" placeholder="Product name..." />
            </div>

            {/* Quick-fill from product */}
            <div>
              <label className="input-label">Quick-fill from Product</label>
              <select
                onChange={e => {
                  const p = products.find(p => p.id === e.target.value)
                  if (p) { setValue(p.barcode); setLabel(p.name); setFormat(p.barcodeFormat === 'QR' ? 'QR' : p.barcodeFormat) }
                }}
                className="select-field"
                defaultValue=""
              >
                <option value="" disabled>Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>
                ))}
              </select>
            </div>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-2 text-xs text-dark-400 hover:text-dark-200 transition-colors"
            >
              <Settings2 size={13} />
              Advanced Settings
              <ChevronDown size={13} className={clsx('transition-transform', showAdvanced && 'rotate-180')} />
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pt-2 border-t border-dark-700/50"
              >
                {!isQR && (
                  <>
                    <div>
                      <label className="input-label">Bar Width: {width}px</label>
                      <input type="range" min={1} max={4} step={0.5} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="input-label">Height: {height}px</label>
                      <input type="range" min={40} max={160} step={10} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="showText" checked={showText} onChange={e => setShowText(e.target.checked)} className="rounded" />
                      <label htmlFor="showText" className="text-xs text-dark-400 cursor-pointer">Show value text</label>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Background</label>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-9 rounded-lg cursor-pointer border border-dark-600/40 bg-transparent" />
                  </div>
                  <div>
                    <label className="input-label">Foreground</label>
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-full h-9 rounded-lg cursor-pointer border border-dark-600/40 bg-transparent" />
                  </div>
                </div>
              </motion.div>
            )}

            <button onClick={generate} className="btn-primary w-full">
              <RefreshCw size={16} /> Generate Barcode
            </button>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div variants={item} className="xl:col-span-3 space-y-4">
          <div className="glass-card p-8 flex flex-col items-center justify-center min-h-72">
            {!generated ? (
              <div className="text-center">
                <QrCode size={48} className="text-dark-700 mx-auto mb-3" />
                <p className="text-dark-500 text-sm">Click "Generate Barcode" to preview</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="text-center"
              >
                {label && <p className="text-dark-400 text-sm font-medium mb-4">{label}</p>}
                <div className="barcode-wrapper inline-flex">
                  {isQR && qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-44 h-44" />
                  ) : (
                    <svg ref={svgRef} className="max-w-full" />
                  )}
                </div>
                <p className="text-dark-500 text-xs mt-3 font-mono">{value}</p>
                <div className="mt-2">
                  <span className={clsx('badge', format === 'QR' ? 'badge-purple' : 'badge-blue')}>{format}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Download Buttons */}
          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <button onClick={downloadSVG} className="btn-secondary flex-1">
                <Download size={15} /> Download SVG
              </button>
              <button onClick={downloadPNG} className="btn-primary flex-1">
                <Download size={15} /> Download PNG
              </button>
            </motion.div>
          )}

          {/* Batch Generator Info */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-dark-200 mb-3 text-sm">Batch Generation</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'From Products', desc: 'Generate for all products in catalog', action: 'Generate All' },
                { label: 'From CSV/Excel', desc: 'Upload a file with barcodes list', action: 'Upload File' },
                { label: 'Google Sheets', desc: 'Pull directly from connected sheet', action: 'Sync & Generate' },
              ].map(b => (
                <div key={b.label} className="bg-dark-800/60 rounded-xl p-3 border border-dark-700/40 hover:border-dark-600/60 transition-colors cursor-pointer group">
                  <p className="text-xs font-semibold text-dark-200 group-hover:text-dark-100">{b.label}</p>
                  <p className="text-[10px] text-dark-500 mt-1">{b.desc}</p>
                  <button className="mt-2 text-[10px] text-brand-400 font-semibold">{b.action} →</button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
