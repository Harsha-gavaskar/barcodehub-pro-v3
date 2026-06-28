import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

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
}

function Barcode({ item }: { item: PrintItem }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && item.barcode) {
      try {
        JsBarcode(svgRef.current, item.barcode, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: false, // We render our own text below
          margin: 0,
        })
      } catch (err) {
        console.error('Invalid barcode value:', item.barcode)
      }
    }
  }, [item.barcode])

  return (
    <div className="flex flex-col justify-between p-3 border border-gray-200 border-dashed rounded bg-white overflow-hidden" style={{ minHeight: '120px' }}>
      
      {/* Top Line: Product Name */}
      <div className="text-[11px] font-semibold text-gray-800 truncate uppercase tracking-wider mb-1">
        {item.name || 'UNKNOWN PRODUCT'}
      </div>
      
      {/* Second Line: Price & HashCode */}
      <div className="flex items-end justify-between mb-2">
        <div className="text-xl font-bold text-black tracking-tight">
          ₹ {item.price || '0.00'}
        </div>
        <div className="text-[12px] font-bold text-gray-800">
          {item.hashCode || ''}
        </div>
      </div>
      
      {/* Third Line: Barcode */}
      <div className="flex justify-center w-full mb-1">
        <svg ref={svgRef} className="max-w-full h-[40px]" preserveAspectRatio="none" />
      </div>
      
      {/* Bottom Line: Barcode Value & SubCode */}
      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-800 tracking-wide mt-1">
        <div>{item.barcode}</div>
        <div>{item.subCode}</div>
      </div>

    </div>
  )
}

export default function PrintableBarcodeGrid({ items }: PrintableBarcodeGridProps) {
  return (
    <div className="print-only">
      <div className="print-grid">
        {items.map((item) => (
          <Barcode key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
