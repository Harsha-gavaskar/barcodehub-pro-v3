import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { LabelTemplate } from '../../api/labels'

export interface PrintItem {
  id: string
  name: string
  price: string
  hashCode: string
  barcode: string
  subCode: string
}

interface PrintableBarcodeGridProps {
  items: PrintItem[]
  template: LabelTemplate | null
}

function DynamicBarcodeElement({ element, value }: { element: any; value: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: element.format || 'CODE128',
          width: element.width ? Math.max(1, Math.floor(Number(element.width) / 100)) : 2,
          height: element.height || 40,
          displayValue: element.displayValue !== undefined ? element.displayValue : false,
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
        transform: element.rotate ? `rotate(${element.rotate}deg)` : undefined,
        transformOrigin: 'center',
      }}
    >
      <svg ref={svgRef} style={{ maxWidth: '100%', height: '100%' }} />
    </div>
  )
}

function TemplateLabel({ item, template }: { item: PrintItem; template: LabelTemplate }) {
  const canvasJson = template.canvas_json || {}
  const elements = canvasJson.elements || []
  const width = template.width || 400
  const height = template.height || 100

  return (
    <div
      className="bg-white border border-gray-300 border-dashed rounded relative overflow-hidden break-inside-avoid"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: template.background_color || '#ffffff',
      }}
    >
      {elements.map((el: any, index: number) => {
        if (el.type === 'text') {
          // Dynamic substitution of values
          let displayText = el.text || ''
          if (displayText.startsWith('SQPR2')) {
            displayText = item.name // Product name/details
          } else if (displayText.startsWith('CTZ9') || displayText.startsWith('DCF3') || displayText.startsWith('89042')) {
            displayText = item.name
          } else if (displayText.includes('₹')) {
            displayText = `₹ ${item.price}`
          } else if (displayText.includes('#')) {
            displayText = item.hashCode || displayText
          } else if (displayText === '12345678') {
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
                whiteSpace: 'nowrap',
                transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined,
                transformOrigin: 'center',
              }}
            >
              {displayText}
            </div>
          )
        } else if (el.type === 'barcode') {
          return (
            <DynamicBarcodeElement
              key={el.id || index}
              element={el}
              value={item.barcode}
            />
          )
        }
        return null
      })}
    </div>
  )
}

function DefaultBarcodeLabel({ item }: { item: PrintItem }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && item.barcode) {
      try {
        JsBarcode(svgRef.current, item.barcode, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: false,
          margin: 0,
        })
      } catch (err) {
        console.error('Invalid barcode:', item.barcode)
      }
    }
  }, [item.barcode])

  return (
    <div
      className="flex flex-col justify-between p-3 border border-gray-200 border-dashed rounded bg-white overflow-hidden break-inside-avoid"
      style={{ width: '400px', height: '120px' }}
    >
      <div className="text-[11px] font-semibold text-gray-800 truncate uppercase tracking-wider mb-1">
        {item.name || 'UNKNOWN PRODUCT'}
      </div>
      <div className="flex items-end justify-between mb-2">
        <div className="text-xl font-bold text-black tracking-tight">
          ₹ {item.price || '0.00'}
        </div>
        <div className="text-[12px] font-bold text-gray-800">
          {item.hashCode || ''}
        </div>
      </div>
      <div className="flex justify-center w-full mb-1">
        <svg ref={svgRef} className="max-w-full h-[40px]" />
      </div>
      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-800 tracking-wide mt-1">
        <div>{item.barcode}</div>
        <div>{item.subCode}</div>
      </div>
    </div>
  )
}

export default function PrintableBarcodeGrid({ items, template }: PrintableBarcodeGridProps) {
  return (
    <div className="print-only">
      <div className="print-grid flex flex-wrap gap-2 justify-center">
        {items.map((item) => (
          template ? (
            <TemplateLabel key={item.id} item={item} template={template} />
          ) : (
            <DefaultBarcodeLabel key={item.id} item={item} />
          )
        ))}
      </div>
    </div>
  )
}
