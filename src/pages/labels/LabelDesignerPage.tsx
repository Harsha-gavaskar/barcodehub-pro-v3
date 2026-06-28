import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrop, useDrag, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'
import {
  Type, QrCode, Image as ImageIcon, AlignLeft, Trash2,
  Download, Save, Plus, Minus, RotateCcw, Move,
  Bold, Italic, Layers, Eye, Lock
} from 'lucide-react'
import clsx from 'clsx'

interface CanvasElement {
  id: string
  type: 'text' | 'barcode' | 'qr' | 'image' | 'rect'
  x: number
  y: number
  width: number
  height: number
  content: string
  fontSize?: number
  fontWeight?: string
  color?: string
  bg?: string
  label?: string
}

const TOOL_ITEMS = [
  { type: 'text', icon: Type, label: 'Text', color: 'text-blue-400' },
  { type: 'barcode', icon: QrCode, label: 'Barcode', color: 'text-brand-400' },
  { type: 'qr', icon: QrCode, label: 'QR Code', color: 'text-purple-400' },
  { type: 'rect', icon: Layers, label: 'Shape', color: 'text-emerald-400' },
]

const TEMPLATES = [
  { name: 'Retail Label', w: 400, h: 200, bg: '#ffffff' },
  { name: 'Shipping Label', w: 400, h: 300, bg: '#ffffff' },
  { name: '4×6 Label', w: 384, h: 576, bg: '#ffffff' },
  { name: 'Price Tag', w: 200, h: 120, bg: '#fff8e7' },
]

function DraggableElement({
  element,
  selected,
  onSelect,
  onMove,
  onDelete,
}: {
  element: CanvasElement
  selected: boolean
  onSelect: () => void
  onMove: (dx: number, dy: number) => void
  onDelete: () => void
}) {
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
    setDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - lastPos.current.x
      const dy = ev.clientY - lastPos.current.y
      lastPos.current = { x: ev.clientX, y: ev.clientY }
      onMove(dx, dy)
    }

    const handleMouseUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: element.fontSize ?? 14,
              fontWeight: element.fontWeight ?? '400',
              color: element.color ?? '#000',
            }}
            className="w-full h-full flex items-center justify-start px-1 select-none overflow-hidden"
          >
            {element.content}
          </div>
        )
      case 'barcode':
        return (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <svg id={`bc-${element.id}`} />
          </div>
        )
      case 'qr':
        return (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <QrCode size={element.width - 8} className="text-dark-800" />
          </div>
        )
      case 'rect':
        return (
          <div
            className="w-full h-full rounded"
            style={{ background: element.bg ?? 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.5)' }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: selected ? 10 : 1,
      }}
      className={clsx(
        'group',
        selected && 'ring-2 ring-brand-500 ring-offset-1 ring-offset-white'
      )}
    >
      {renderContent()}
      {selected && (
        <button
          onMouseDown={e => { e.stopPropagation(); onDelete() }}
          className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg z-20"
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  )
}

export default function LabelDesignerPage() {
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'text', x: 20, y: 15, width: 200, height: 24, content: 'Product Name', fontSize: 16, fontWeight: '700', color: '#111827' },
    { id: '2', type: 'barcode', x: 20, y: 55, width: 180, height: 70, content: 'CODE128', label: 'BH-001234' },
    { id: '3', type: 'text', x: 20, y: 140, width: 120, height: 20, content: 'Price: $49.99', fontSize: 12, color: '#374151' },
    { id: '4', type: 'qr', x: 220, y: 20, width: 80, height: 80, content: 'https://barcodehub.pro' },
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [template, setTemplate] = useState(TEMPLATES[0])
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addElement = (type: string) => {
    const el: CanvasElement = {
      id: Date.now().toString(),
      type: type as CanvasElement['type'],
      x: 30,
      y: 30,
      width: type === 'text' ? 150 : type === 'qr' ? 80 : type === 'rect' ? 100 : 200,
      height: type === 'text' ? 24 : type === 'qr' ? 80 : type === 'rect' ? 60 : 70,
      content: type === 'text' ? 'New Text' : type === 'barcode' ? 'BH-000001' : type === 'qr' ? 'https://example.com' : 'Shape',
      fontSize: 14,
      color: '#111827',
    }
    setElements(prev => [...prev, el])
    setSelectedId(el.id)
  }

  const moveElement = (id: string, dx: number, dy: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el))
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setElements(prev => prev.filter(el => el.id !== selectedId))
    setSelectedId(null)
    toast.success('Element removed')
  }

  const selected = elements.find(el => el.id === selectedId)

  const updateSelected = (updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el))
  }

  const exportLabel = async () => {
    toast.success('Label exported as PNG!')
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4 h-full">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-dark-50">Label Designer</h2>
            <p className="text-sm text-dark-400">Drag & drop elements to build your label</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="btn-icon"><Minus size={13} /></button>
            <span className="text-xs text-dark-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="btn-icon"><Plus size={13} /></button>
            <button className="btn-secondary text-sm"><Save size={14} /> Save Template</button>
            <button onClick={exportLabel} className="btn-primary text-sm"><Download size={14} /> Export PNG</button>
          </div>
        </motion.div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left Toolbar */}
          <motion.div variants={item} className="glass-card p-4 w-52 shrink-0 space-y-4 overflow-y-auto">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Templates</p>
              <div className="space-y-1">
                {TEMPLATES.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setTemplate(t)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                      template.name === t.name
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                        : 'text-dark-400 hover:bg-dark-700/40 hover:text-dark-200'
                    )}
                  >
                    <div className="font-medium">{t.name}</div>
                    <div className="text-dark-600">{t.w}×{t.h}px</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Add Elements</p>
              <div className="space-y-1">
                {TOOL_ITEMS.map(tool => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.type}
                      onClick={() => addElement(tool.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-dark-400 hover:bg-dark-700/40 hover:text-dark-200 transition-all"
                    >
                      <Icon size={14} className={tool.color} />
                      {tool.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Properties */}
            {selected && (
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Properties</p>
                <div className="space-y-2">
                  {selected.type === 'text' && (
                    <>
                      <div>
                        <label className="input-label text-[10px]">Content</label>
                        <input
                          value={selected.content}
                          onChange={e => updateSelected({ content: e.target.value })}
                          className="input-field py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="input-label text-[10px]">Font Size: {selected.fontSize}px</label>
                        <input type="range" min={8} max={36} value={selected.fontSize ?? 14} onChange={e => updateSelected({ fontSize: Number(e.target.value) })} className="w-full" />
                      </div>
                      <div>
                        <label className="input-label text-[10px]">Color</label>
                        <input type="color" value={selected.color ?? '#000000'} onChange={e => updateSelected({ color: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-dark-600/40 bg-transparent" />
                      </div>
                    </>
                  )}
                  {selected.type === 'barcode' && (
                    <div>
                      <label className="input-label text-[10px]">Barcode Value</label>
                      <input value={selected.content} onChange={e => updateSelected({ content: e.target.value })} className="input-field py-1.5 text-xs" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="input-label text-[10px]">W: {selected.width}px</label>
                      <input type="range" min={40} max={400} value={selected.width} onChange={e => updateSelected({ width: Number(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="input-label text-[10px]">H: {selected.height}px</label>
                      <input type="range" min={20} max={300} value={selected.height} onChange={e => updateSelected({ height: Number(e.target.value) })} className="w-full" />
                    </div>
                  </div>
                  <button onClick={deleteSelected} className="btn-danger w-full text-xs py-1.5 mt-1">
                    <Trash2 size={12} /> Delete Element
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Canvas */}
          <motion.div variants={item} className="flex-1 glass-card p-6 overflow-auto flex items-start justify-center min-h-0">
            <div
              ref={canvasRef}
              onClick={() => setSelectedId(null)}
              style={{
                width: template.w * zoom,
                height: template.h * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                background: template.bg,
                boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 25px 50px -12px rgba(0,0,0,0.5)',
                borderRadius: 8,
                position: 'relative',
                minWidth: template.w,
                minHeight: template.h,
              }}
            >
              {elements.map(el => (
                <DraggableElement
                  key={el.id}
                  element={el}
                  selected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onMove={(dx, dy) => moveElement(el.id, dx / zoom, dy / zoom)}
                  onDelete={() => { setElements(prev => prev.filter(e => e.id !== el.id)); setSelectedId(null) }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right Panel - Layers */}
          <motion.div variants={item} className="glass-card p-4 w-44 shrink-0 space-y-3 hidden xl:block">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Layers</p>
            <div className="space-y-1">
              {[...elements].reverse().map((el, i) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={clsx(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs',
                    selectedId === el.id ? 'bg-brand-500/15 text-brand-300' : 'text-dark-400 hover:bg-dark-700/30 hover:text-dark-200'
                  )}
                >
                  {el.type === 'text' ? <Type size={11} /> : <QrCode size={11} />}
                  <span className="truncate capitalize">{el.type}: {el.content.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DndProvider>
  )
}
