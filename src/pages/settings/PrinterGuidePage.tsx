import { motion } from 'framer-motion'
import { Printer, Settings, Download, MonitorCheck, AlertTriangle } from 'lucide-react'

export default function PrinterGuidePage() {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div variants={itemVariant}>
        <h2 className="text-2xl font-bold text-dark-50">Thermal Printer Setup Guide</h2>
        <p className="text-sm text-dark-400 mt-1">
          Follow these instructions to configure your TSC TTP-244 Pro (or similar thermal printer) for perfect barcode printing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <motion.div variants={itemVariant} className="card p-6 border border-brand-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center border border-dark-700 mb-4 shadow-lg shadow-dark-950/50">
            <Download className="text-brand-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-dark-100 mb-2">1. Install Drivers</h3>
          <p className="text-sm text-dark-400 mb-4">
            Do not use the default Windows drivers. Download the official Seagull Scientific BarTender drivers for best results.
          </p>
          <a
            href="https://www.bartendersoftware.com/resources/printer-drivers/tsc/download/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2"
          >
            Download TSC Seagull Drivers &rarr;
          </a>
        </motion.div>

        {/* Step 2 */}
        <motion.div variants={itemVariant} className="card p-6 border border-dark-700/50 relative overflow-hidden group">
          <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center border border-dark-700 mb-4 shadow-lg shadow-dark-950/50">
            <Settings className="text-accent-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-dark-100 mb-2">2. Set Label Size</h3>
          <p className="text-sm text-dark-400 mb-3">
            Open Windows <strong>Printers & Scanners</strong>. Select your TSC printer &rarr; <strong>Printing Preferences</strong>.
          </p>
          <div className="bg-dark-800/80 p-3 rounded-lg border border-dark-700/50">
            <p className="text-xs text-dark-300 font-mono">
              Tab: <span className="text-dark-100">Page Setup</span><br/>
              Stock: <span className="text-dark-100">New...</span><br/>
              Width/Height: <span className="text-dark-100">Match your sticker roll</span>
            </p>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div variants={itemVariant} className="card p-6 border border-dark-700/50 relative overflow-hidden group">
          <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center border border-dark-700 mb-4 shadow-lg shadow-dark-950/50">
            <MonitorCheck className="text-green-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-dark-100 mb-2">3. Browser Printing</h3>
          <p className="text-sm text-dark-400 mb-3">
            When you click Print in BarcodeHub Pro, the browser print dialog will appear. Set these exact settings:
          </p>
          <ul className="text-xs text-dark-300 space-y-1.5 list-disc pl-4">
            <li><strong>Printer:</strong> Select TSC TTP-244 Pro</li>
            <li><strong>Paper Size:</strong> Select the stock you created</li>
            <li><strong>Margins:</strong> None</li>
            <li><strong>Scale:</strong> Default (or 100%)</li>
          </ul>
        </motion.div>
      </div>

      {/* Troubleshooting Section */}
      <motion.div variants={itemVariant} className="bg-dark-800/40 border border-dark-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-dark-100 flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-400" size={20} />
          Common Troubleshooting
        </h3>
        
        <div className="space-y-4">
          <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-800">
            <h4 className="text-sm font-bold text-dark-200 mb-1">Printer is skipping labels or printing across the gap</h4>
            <p className="text-xs text-dark-400">
              The printer needs calibration. Turn off the printer. Hold the PAUSE button while turning it back on. Release the button when the printer starts feeding labels and the lights flash. It will measure the gap automatically.
            </p>
          </div>
          
          <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-800">
            <h4 className="text-sm font-bold text-dark-200 mb-1">Barcodes are too light or blurry</h4>
            <p className="text-xs text-dark-400">
              Go to Printing Preferences &rarr; Options tab. Uncheck "Use Current Printer Settings" and increase the <strong>Darkness</strong> level (try 10-12) and lower the <strong>Print Speed</strong>.
            </p>
          </div>

          <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-800">
            <h4 className="text-sm font-bold text-dark-200 mb-1">The browser adds URLs and Dates to the top/bottom</h4>
            <p className="text-xs text-dark-400">
              In the browser print dialog, expand "More settings" and uncheck <strong>"Headers and footers"</strong>.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
