import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { FileUp, Printer, Trash2, CheckCircle, FileSpreadsheet, Plus, Minus, Pencil, Eye, X, Save, Layers, Search, LayoutGrid, Check, ArrowRight } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import PrintableBarcodeGrid, { PrintItem } from '../../components/print/PrintableBarcodeGrid'
import { useLabelTemplates, LabelTemplate } from '../../api/labels'

interface TableItem extends PrintItem {
  qty: number
}

interface UploadedData {
  rows: any[][]
  headers: string[]
}

interface ColumnMapping {
  nameIdx: number
  priceIdx: number
  hashIdx: number
  barcodeIdx: number
  subCodeIdx: number
  qtyIdx: number
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ item, template, onClose }: { item: TableItem; template: LabelTemplate | null; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!template && svgRef.current && item.barcode) {
      try {
        JsBarcode(svgRef.current, item.barcode, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: false,
          margin: 0,
        })
      } catch (err) {
        console.error('Invalid barcode:', item.barcode)
      }
    }
  }, [item.barcode, template])

  return (
    <div className="modal-backdrop z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-panel max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-100 flex items-center gap-2">
            <Eye size={16} className="text-brand-400" /> Label Preview
          </h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div className="flex justify-center p-6 bg-dark-900/40 rounded-2xl border border-dark-700/50">
          {template ? (
            <div
              className="bg-white border-2 border-dashed border-gray-300 relative overflow-hidden shadow-inner shrink-0"
              style={{
                width: `${template.width || 400}px`,
                height: `${template.height || 100}px`,
                backgroundColor: template.background_color || '#ffffff',
              }}
            >
              {(template.canvas_json?.elements || []).map((el: any, index: number) => {
                if (el.type === 'text') {
                  let displayText = el.text || ''
                  if (displayText.startsWith('IMPORT:')) {
                    displayText = item.name
                  } else if (displayText.includes('BH-IMPORT')) {
                    displayText = item.barcode
                  }
                  return (
                    <div
                      key={el.id || index}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        fontSize: `${el.fontSize || 12}px`,
                        fontWeight: el.fontWeight || 'normal',
                        color: el.color || '#000000',
                        fontFamily: 'sans-serif',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayText}
                    </div>
                  )
                } else if (el.type === 'barcode') {
                  return (
                    <PreviewBarcodeElement key={el.id || index} element={el} value={item.barcode} />
                  )
                }
                return null
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 shadow-inner w-[320px]">
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-semibold text-gray-800 truncate uppercase tracking-wider">
                  {item.name || 'UNKNOWN PRODUCT'}
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-black tracking-tight">
                    ₹ {item.price || '0.00'}
                  </div>
                  <div className="text-[12px] font-bold text-gray-800">{item.hashCode}</div>
                </div>
                <div className="flex justify-center w-full py-1">
                  <svg ref={svgRef} className="max-w-full" />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-gray-800">
                  <span>{item.barcode}</span>
                  <span>{item.subCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-dark-400 mt-3 text-center">This is an exact preview of how your label will print.</p>
      </motion.div>
    </div>
  )
}

function PreviewBarcodeElement({ element, value }: { element: any; value: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: element.format || 'CODE128',
          width: element.width ? Math.max(1, Math.floor(Number(element.width) / 100)) : 2,
          height: element.height || 40,
          displayValue: false,
          margin: 0,
        })
      } catch (err) {
        console.error('Invalid barcode:', value)
      }
    }
  }, [value, element])

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width || 300}px`,
        height: `${element.height || 50}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg ref={svgRef} style={{ maxWidth: '100%', height: '100%' }} />
    </div>
  )
}

// ─── Import Wizard Modal ────────────────────────────────────────────────────────
interface ImportWizardModalProps {
  uploadedData: UploadedData
  templates: LabelTemplate[]
  onConfirm: (items: TableItem[], templateId: string) => void
  onClose: () => void
}

function ImportWizardModal({ uploadedData, templates, onConfirm, onClose }: ImportWizardModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  
  // Mapping index state (-1 means unmapped)
  const [mapping, setMapping] = useState<ColumnMapping>({
    nameIdx: -1,
    priceIdx: -1,
    hashIdx: -1,
    barcodeIdx: -1,
    subCodeIdx: -1,
    qtyIdx: -1,
  })

  // Auto-detect columns on mount
  useEffect(() => {
    const headers = uploadedData.headers
    const nextMapping = {
      nameIdx: -1,
      priceIdx: -1,
      hashIdx: -1,
      barcodeIdx: -1,
      subCodeIdx: -1,
      qtyIdx: -1,
    }

    headers.forEach((h, idx) => {
      const lower = String(h).toLowerCase()
      if (lower.includes('name') || lower.includes('title') || lower.includes('product') || lower.includes('item')) {
        if (nextMapping.nameIdx === -1) nextMapping.nameIdx = idx
      } else if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('mrp')) {
        if (nextMapping.priceIdx === -1) nextMapping.priceIdx = idx
      } else if (lower.includes('hash') || lower.includes('tag')) {
        if (nextMapping.hashIdx === -1) nextMapping.hashIdx = idx
      } else if (lower.includes('barcode') || lower.includes('sku') || lower.includes('code') || lower.includes('upc') || lower.includes('ean')) {
        // Barcode or code
        if (lower.includes('sub')) {
          nextMapping.subCodeIdx = idx
        } else if (nextMapping.barcodeIdx === -1) {
          nextMapping.barcodeIdx = idx
        }
      } else if (lower.includes('qty') || lower.includes('quantity') || lower.includes('count')) {
        if (nextMapping.qtyIdx === -1) nextMapping.qtyIdx = idx
      }
    })

    // Fallbacks if not auto-detected
    if (nextMapping.nameIdx === -1 && headers.length > 0) nextMapping.nameIdx = 0
    if (nextMapping.priceIdx === -1 && headers.length > 1) nextMapping.priceIdx = 1
    if (nextMapping.hashIdx === -1 && headers.length > 2) nextMapping.hashIdx = 2
    if (nextMapping.barcodeIdx === -1 && headers.length > 3) nextMapping.barcodeIdx = 3
    if (nextMapping.subCodeIdx === -1 && headers.length > 4) nextMapping.subCodeIdx = 4
    if (nextMapping.qtyIdx === -1 && headers.length > 5) nextMapping.qtyIdx = 5

    setMapping(nextMapping)
  }, [uploadedData])

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || null
  }, [templates, selectedTemplateId])

  const handleImport = () => {
    const { rows } = uploadedData
    const mappedItems: TableItem[] = []
    const seenBarcodes = new Set<string>()

    const generateUniqueId = () => {
      let id
      do { id = 'BH-' + Math.random().toString(36).substring(2, 8).toUpperCase() }
      while (seenBarcodes.has(id))
      return id
    }

    // Skip header row
    const dataRows = rows.slice(1)

    dataRows.forEach((row, idx) => {
      if (!row || row.length === 0) return
      
      const name = mapping.nameIdx !== -1 && row[mapping.nameIdx] !== undefined 
        ? String(row[mapping.nameIdx]).trim() 
        : 'Unknown Product'
        
      const price = mapping.priceIdx !== -1 && row[mapping.priceIdx] !== undefined 
        ? String(row[mapping.priceIdx]).trim() 
        : '0.00'
        
      const hashCode = mapping.hashIdx !== -1 && row[mapping.hashIdx] !== undefined 
        ? String(row[mapping.hashIdx]).trim() 
        : ''
        
      let barcode = mapping.barcodeIdx !== -1 && row[mapping.barcodeIdx] !== undefined 
        ? String(row[mapping.barcodeIdx]).trim() 
        : ''
        
      const subCode = mapping.subCodeIdx !== -1 && row[mapping.subCodeIdx] !== undefined 
        ? String(row[mapping.subCodeIdx]).trim() 
        : ''
        
      let qty = 1
      if (mapping.qtyIdx !== -1 && row[mapping.qtyIdx] !== undefined && !isNaN(Number(row[mapping.qtyIdx]))) {
        qty = Math.max(1, Number(row[mapping.qtyIdx]))
      }

      if (barcode && !barcode.match(/^[a-zA-Z0-9-\.]+$/)) barcode = ''
      if (!barcode || seenBarcodes.has(barcode)) barcode = generateUniqueId()
      seenBarcodes.add(barcode)

      mappedItems.push({
        id: `item-${Date.now()}-${idx}`,
        name,
        price,
        hashCode,
        barcode,
        subCode,
        qty
      })
    })

    if (mappedItems.length === 0) {
      toast.error('No products found to import')
      return
    }

    onConfirm(mappedItems, selectedTemplateId)
    toast.success(`Successfully imported ${mappedItems.length} products!`)
  }

  return (
    <div className="modal-backdrop z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-panel max-w-3xl w-full flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-dark-50 flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-brand-400" /> Excel Import Wizard
            </h3>
            <p className="text-xs text-dark-400 mt-1">Configure layout template and map spreadsheet fields</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="px-6 py-3 border-b border-dark-700/30 bg-dark-900/30 flex items-center gap-6 shrink-0">
          <div className={`flex items-center gap-2 text-xs font-semibold ${step === 1 ? 'text-brand-300' : 'text-dark-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 1 ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300'
            }`}>1</span>
            Select Layout Template
          </div>
          <div className="h-px bg-dark-700 w-12 shrink-0" />
          <div className={`flex items-center gap-2 text-xs font-semibold ${step === 2 ? 'text-brand-300' : 'text-dark-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 2 ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300'
            }`}>2</span>
            Map Excel Columns
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {step === 1 ? (
            /* STEP 1: Select Layout Template */
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-dark-200 mb-3">Which template formatting should apply?</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Standard Grid */}
                <div
                  onClick={() => setSelectedTemplateId('')}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between h-[160px] ${
                    selectedTemplateId === ''
                      ? 'border-brand-500 bg-brand-500/5'
                      : 'border-dark-700/60 bg-dark-800/20 hover:bg-dark-750/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <LayoutGrid size={16} className="text-brand-400" />
                    </div>
                    {selectedTemplateId === '' && <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white"><Check size={10} /></span>}
                  </div>
                  <div className="mt-3">
                    <h5 className="font-bold text-dark-50 text-sm">Standard Grid Layout</h5>
                    <p className="text-[11px] text-dark-400 mt-1 line-clamp-2">Standard sequential columns. Fits any multi-row label sheets.</p>
                  </div>
                </div>

                {/* Templates */}
                {templates.map(t => {
                  const isActive = selectedTemplateId === t.id
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between h-[160px] ${
                        isActive
                          ? 'border-brand-500 bg-brand-500/5'
                          : 'border-dark-700/60 bg-dark-800/20 hover:bg-dark-750/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border ${
                          t.category === 'BarTender Import' 
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        }`}>
                          {t.category || 'Custom'}
                        </span>
                        {isActive && <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white"><Check size={10} /></span>}
                      </div>

                      {t.thumbnail_url && (
                        <div className="my-1.5 bg-white rounded-lg p-1 h-[40px] flex items-center justify-center overflow-hidden">
                          <img src={t.thumbnail_url} alt={t.name} className="max-h-full object-contain" />
                        </div>
                      )}

                      <div>
                        <h5 className="font-bold text-dark-50 text-sm truncate">{t.name}</h5>
                        <div className="text-[9px] text-dark-400 mt-0.5">{t.width} x {t.height} px</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* STEP 2: Map Columns */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-dark-400">Target Layout Template</span>
                  <p className="text-sm font-bold text-dark-100 mt-0.5">{selectedTemplate ? selectedTemplate.name : 'Standard Grid Layout'}</p>
                </div>
                {selectedTemplate?.thumbnail_url && (
                  <img src={selectedTemplate.thumbnail_url} alt="template" className="h-[40px] bg-white rounded p-1 border border-dark-700/30" />
                )}
              </div>

              <h4 className="text-sm font-semibold text-dark-200">Verify column mappings from Excel:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Product Name *', field: 'nameIdx' as keyof ColumnMapping },
                  { label: 'Price (₹) *', field: 'priceIdx' as keyof ColumnMapping },
                  { label: 'Barcode Value *', field: 'barcodeIdx' as keyof ColumnMapping },
                  { label: 'Hash Code', field: 'hashIdx' as keyof ColumnMapping },
                  { label: 'Sub-code', field: 'subCodeIdx' as keyof ColumnMapping },
                  { label: 'Print Quantity', field: 'qtyIdx' as keyof ColumnMapping },
                ].map(({ label, field }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs text-dark-300 font-medium">{label}</label>
                    <select
                      className="input-field py-2 text-sm bg-dark-800 cursor-pointer"
                      value={mapping[field]}
                      onChange={(e) => setMapping({ ...mapping, [field]: Number(e.target.value) })}
                    >
                      <option value={-1} className="bg-dark-900">-- Select Column / Unmapped --</option>
                      {uploadedData.headers.map((h, i) => (
                        <option key={i} value={i} className="bg-dark-900">
                          Column {i + 1}: {String(h || `(Empty Header ${i + 1})`)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dark-700/50 flex gap-3 justify-end shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="btn-primary text-sm">
              Next Step <ArrowRight size={15} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-secondary text-sm">Back</button>
              <button onClick={handleImport} className="btn-primary text-sm px-6">
                Confirm & Import
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ item, onSave, onClose }: { item: TableItem; onSave: (updated: TableItem) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...item })

  const handleChange = (field: keyof TableItem, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Product name cannot be empty'); return }
    onSave(form)
    toast.success('Product updated!')
  }

  return (
    <div className="modal-backdrop z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-panel max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-dark-100 flex items-center gap-2">
            <Pencil size={16} className="text-brand-400" /> Edit Product
          </h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Product Name', field: 'name' as keyof TableItem, placeholder: 'e.g. BASKET COLANDER G9' },
            { label: 'Price (₹)', field: 'price' as keyof TableItem, placeholder: 'e.g. 500.00' },
            { label: 'Hash Code', field: 'hashCode' as keyof TableItem, placeholder: 'e.g. # ZI' },
            { label: 'Barcode Value', field: 'barcode' as keyof TableItem, placeholder: 'e.g. CBG9' },
            { label: 'Sub-code', field: 'subCode' as keyof TableItem, placeholder: 'e.g. ZCOS ZEO BM' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="input-label">{label}</label>
              <input
                className="input-field"
                value={String(form[field] ?? '')}
                placeholder={placeholder}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1">
            <Save size={15} /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Single-item print helper ──────────────────────────────────────────────────
function printSingleItem(item: TableItem, template: LabelTemplate | null) {
  if (template) {
    const canvasJson = template.canvas_json || {}
    const elements = canvasJson.elements || []
    const width = template.width || 400
    const height = template.height || 100

    let elementsHTML = ''
    elements.forEach((el: any) => {
      if (el.type === 'text') {
        let displayText = el.text || ''
        if (displayText.startsWith('IMPORT:')) {
          displayText = item.name
        } else if (displayText.includes('BH-IMPORT')) {
          displayText = item.barcode
        }
        elementsHTML += `
          <div style="
            position: absolute;
            left: ${el.x}px;
            top: ${el.y}px;
            font-size: ${el.fontSize || 12}px;
            font-weight: ${el.fontWeight || 'normal'};
            color: ${el.color || '#000000'};
            font-family: sans-serif;
            white-space: nowrap;
          ">${displayText}</div>
        `
      } else if (el.type === 'barcode') {
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        try {
          JsBarcode(svgEl, item.barcode, {
            format: el.format || 'CODE128',
            width: el.width ? Math.max(1, Math.floor(Number(el.width) / 100)) : 2,
            height: el.height || 40,
            displayValue: el.displayValue !== undefined ? el.displayValue : false,
            margin: 0,
          })
          const svgHTML = svgEl.outerHTML
          elementsHTML += `
            <div style="
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              width: ${el.width || 300}px;
              height: ${el.height || 50}px;
              display: flex;
              justify-content: center;
              align-items: center;
            ">${svgHTML}</div>
          `
        } catch (e) {
          console.error(e)
        }
      }
    })

    const allLabels = Array(item.qty).fill(`
      <div class="label" style="
        position: relative;
        width: ${width}px;
        height: ${height}px;
        background-color: ${template.background_color || '#ffffff'};
        border: 1px dashed #ccc;
        page-break-inside: avoid;
        margin: 5px;
      ">
        ${elementsHTML}
      </div>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { margin: 5mm; }
          body { margin: 0; font-family: sans-serif; background: white; color: black; }
          .grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        </style>
      </head>
      <body>
        <div class="grid">${allLabels}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `
    const win = window.open('', '_blank', 'width=500,height=400')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  } else {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    try {
      JsBarcode(svgEl, item.barcode, { format: 'CODE128', width: 2, height: 50, displayValue: false, margin: 0 })
    } catch (e) {
      toast.error('Invalid barcode value, cannot print.')
      return
    }
    const svgHTML = svgEl.outerHTML

    const labelHTML = `
      <div class="label">
        <div class="name">${item.name}</div>
        <div class="row">
          <div class="price">&#8377; ${item.price}</div>
          <div class="hash">${item.hashCode}</div>
        </div>
        <div class="barcode-wrap">${svgHTML}</div>
        <div class="codes"><span>${item.barcode}</span><span>${item.subCode}</span></div>
      </div>
    `

    const allLabels = Array(item.qty).fill(labelHTML).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { margin: 5mm; }
          body { margin: 0; font-family: sans-serif; background: white; color: black; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .label {
            display: flex; flex-direction: column; gap: 4px;
            padding: 6px; border: 1px dashed #ccc; border-radius: 6px;
            break-inside: avoid;
          }
          .name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .row { display: flex; justify-content: space-between; align-items: flex-end; }
          .price { font-size: 18px; font-weight: 900; }
          .hash { font-size: 11px; font-weight: 700; }
          .barcode-wrap { display: flex; justify-content: center; }
          .barcode-wrap svg { max-width: 100%; }
          .codes { display: flex; justify-content: space-between; font-size: 9px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="grid">${allLabels}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `

    const win = window.open('', '_blank', 'width=450,height=400')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }
}


// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BatchBarcodePage() {
  const [items, setItems] = useState<TableItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [editItem, setEditItem] = useState<TableItem | null>(null)
  const [previewItem, setPreviewItem] = useState<TableItem | null>(null)
  
  // Template states
  const { data: templates } = useLabelTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  
  // Wizard states
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null)

  const selectedTemplate = useMemo(() => {
    return templates?.find(t => t.id === selectedTemplateId) || null
  }, [templates, selectedTemplateId])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

        if (json.length === 0) {
          toast.error('The uploaded file is empty')
          return
        }

        // Extract first row as headers, represent numbers/blanks as column index
        const firstRow = json[0] || []
        const headers = firstRow.map((cell: any, idx: number) => 
          cell !== null && cell !== undefined ? String(cell).trim() : `Column ${idx + 1}`
        )

        setUploadedData({ rows: json, headers })
      } catch (err) {
        toast.error('Failed to read file. Make sure it is a valid Excel/CSV document.')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleConfirmWizard = (mappedItems: TableItem[], templateId: string) => {
    setItems(mappedItems)
    setSelectedTemplateId(templateId)
    setUploadedData(null)
  }

  const updateQuantity = (id: string, newQty: number) =>
    setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, newQty) } : item))

  const handleSaveEdit = (updated: TableItem) => {
    setItems(items.map(item => item.id === updated.id ? updated : item))
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    toast.success('Product removed')
  }

  const expandedPrintItems = useMemo(() => {
    const expanded: PrintItem[] = []
    items.forEach(item => {
      for (let i = 0; i < item.qty; i++) expanded.push({ ...item, id: `${item.id}-copy-${i}` })
    })
    return expanded
  }, [items])

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 screen-only">
        {/* Header */}
        <motion.div variants={itemVariant} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-dark-50">Batch Excel Print</h2>
            <p className="text-sm text-dark-400 mt-0.5">Upload your Excel sheet • Map columns • Print labels dynamically.</p>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Template Selector */}
                <div className="flex items-center gap-2 bg-dark-800/60 border border-dark-700/60 rounded-xl px-3 py-1.5">
                  <Layers size={14} className="text-brand-400 shrink-0" />
                  <span className="text-xs text-dark-400 whitespace-nowrap">Template:</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="bg-transparent text-sm text-brand-300 font-semibold outline-none cursor-pointer pr-1"
                  >
                    <option value="" className="bg-dark-900 text-dark-200">Standard Grid</option>
                    {templates?.map(t => (
                      <option key={t.id} value={t.id} className="bg-dark-900 text-dark-200">{t.name}</option>
                    ))}
                  </select>
                </div>

                <button onClick={() => setItems([])} className="btn-secondary text-sm py-2 px-3">
                  <Trash2 size={14} /> Clear All
                </button>
                <button onClick={() => window.print()} className="btn-primary text-sm px-4 py-2">
                  <Printer size={15} /> Print All ({expandedPrintItems.length})
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upload Zone */}
        {items.length === 0 ? (
          <motion.div variants={itemVariant} className="glass-card p-12">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700/50 bg-dark-800/30'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]) }}
            >
              <FileSpreadsheet size={48} className={`mx-auto mb-4 ${isDragging ? 'text-brand-400' : 'text-dark-500'}`} />
              <h3 className="text-lg font-semibold text-dark-100 mb-2">Upload Excel or CSV File</h3>
              <p className="text-sm text-dark-400 mb-6 max-w-lg mx-auto">
                Drag and drop your spreadsheet here. Next, you will choose a label layout template and map columns to target fields!
              </p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv"
                onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]) }} />
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary mx-auto">
                <FileUp size={16} /> Browse Files
              </button>
            </div>
          </motion.div>
        ) : (
          /* Product Table + Selected Template Preview */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Table Area */}
            <motion.div variants={itemVariant} className="glass-card overflow-hidden lg:col-span-3">
              <div className="p-5 border-b border-dark-700/50 flex items-center justify-between">
                <h3 className="font-semibold text-dark-100 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  Products ({items.length})
                </h3>
                <div className="text-xs text-dark-400 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700/50">
                  Total labels: <span className="text-brand-300 font-semibold">{expandedPrintItems.length}</span>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-dark-900/90 backdrop-blur z-10">
                    <tr className="border-b border-dark-700/50">
                      <th className="p-3 text-xs font-semibold text-dark-400 w-10 text-center">#</th>
                      <th className="p-3 text-xs font-semibold text-dark-400">Name</th>
                      <th className="p-3 text-xs font-semibold text-dark-400">Price (₹)</th>
                      <th className="p-3 text-xs font-semibold text-dark-400">Hash</th>
                      <th className="p-3 text-xs font-semibold text-dark-400">Barcode</th>
                      <th className="p-3 text-xs font-semibold text-dark-400">Sub-code</th>
                      <th className="p-3 text-xs font-semibold text-dark-400 text-center">Qty</th>
                      <th className="p-3 text-xs font-semibold text-dark-400 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-dark-700/20 hover:bg-dark-800/30 transition-colors group">
                        <td className="p-3 text-sm text-dark-500 text-center">{idx + 1}</td>
                        <td className="p-3 text-sm text-dark-200 font-medium max-w-[180px] truncate">{item.name}</td>
                        <td className="p-3 text-sm text-emerald-400 font-semibold">₹{item.price}</td>
                        <td className="p-3 text-sm text-purple-400">{item.hashCode}</td>
                        <td className="p-3 text-sm text-brand-300 font-mono">{item.barcode}</td>
                        <td className="p-3 text-sm text-dark-300">{item.subCode}</td>

                        {/* Quantity Controls */}
                        <td className="p-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => updateQuantity(item.id, item.qty - 1)} disabled={item.qty <= 1}
                              className="p-1 rounded bg-dark-700/50 text-dark-300 hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center font-bold text-dark-100 text-sm">{item.qty}</span>
                            <button onClick={() => updateQuantity(item.id, item.qty + 1)}
                              className="p-1 rounded bg-dark-700/50 text-dark-300 hover:bg-dark-600 transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Preview */}
                            <button onClick={() => setPreviewItem(item)} title="Preview Label"
                              className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-brand-600/30 hover:text-brand-300 transition-colors border border-transparent hover:border-brand-600/30">
                              <Eye size={14} />
                            </button>
                            {/* Edit */}
                            <button onClick={() => setEditItem(item)} title="Edit Product"
                              className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-amber-600/30 hover:text-amber-300 transition-colors border border-transparent hover:border-amber-600/30">
                              <Pencil size={14} />
                            </button>
                            {/* Print Single */}
                            <button onClick={() => printSingleItem(item, selectedTemplate)} title="Print This Label"
                              className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-emerald-600/30 hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-600/30">
                              <Printer size={14} />
                            </button>
                            {/* Delete */}
                            <button onClick={() => handleDelete(item.id)} title="Remove Product"
                              className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-red-600/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-600/30">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Template Details sidebar */}
            <motion.div variants={itemVariant} className="glass-card p-5 space-y-4">
              <h4 className="font-semibold text-dark-100 flex items-center gap-2 text-sm">
                <Layers size={14} className="text-brand-400" /> Active Template
              </h4>
              
              {selectedTemplate ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-dark-800/40 border border-dark-700/50">
                    <h5 className="font-medium text-dark-100 text-sm">{selectedTemplate.name}</h5>
                    <p className="text-xs text-dark-400 mt-1">{selectedTemplate.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-dark-400">
                      <span>Width: <b className="text-dark-200">{selectedTemplate.width}px</b></span>
                      <span>Height: <b className="text-dark-200">{selectedTemplate.height}px</b></span>
                    </div>
                  </div>
                  
                  {selectedTemplate.thumbnail_url && (
                    <div className="rounded-xl overflow-hidden border border-dark-700/50 bg-white p-2">
                      <p className="text-[10px] text-dark-400 mb-1.5 uppercase font-semibold">BarTender Preview:</p>
                      <img
                        src={selectedTemplate.thumbnail_url}
                        alt="Template preview"
                        className="w-full object-contain h-[80px]"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-dark-500">
                  Standard layout is active. Label elements will align sequentially in a standard grid structure.
                </p>
              )}
            </motion.div>

          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {uploadedData && templates && (
          <ImportWizardModal
            uploadedData={uploadedData}
            templates={templates}
            onConfirm={handleConfirmWizard}
            onClose={() => setUploadedData(null)}
          />
        )}
        {previewItem && (
          <PreviewModal
            item={previewItem}
            template={selectedTemplate}
            onClose={() => setPreviewItem(null)}
          />
        )}
        {editItem && (
          <EditModal
            item={editItem}
            onSave={handleSaveEdit}
            onClose={() => setEditItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Print-only grid for "Print All" */}
      <PrintableBarcodeGrid items={expandedPrintItems} template={selectedTemplate} />
    </>
  )
}
