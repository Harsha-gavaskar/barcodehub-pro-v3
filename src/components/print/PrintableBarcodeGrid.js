import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
function Barcode({ item }) {
    const svgRef = useRef(null);
    useEffect(() => {
        if (svgRef.current && item.barcode) {
            try {
                JsBarcode(svgRef.current, item.barcode, {
                    format: 'CODE128',
                    width: 2,
                    height: 40,
                    displayValue: false, // We render our own text below
                    margin: 0,
                });
            }
            catch (err) {
                console.error('Invalid barcode value:', item.barcode);
            }
        }
    }, [item.barcode]);
    return (_jsxs("div", { className: "flex flex-col justify-between p-3 border border-gray-200 border-dashed rounded bg-white overflow-hidden", style: { minHeight: '120px' }, children: [_jsx("div", { className: "text-[11px] font-semibold text-gray-800 truncate uppercase tracking-wider mb-1", children: item.name || 'UNKNOWN PRODUCT' }), _jsxs("div", { className: "flex items-end justify-between mb-2", children: [_jsxs("div", { className: "text-xl font-bold text-black tracking-tight", children: ["\u20B9 ", item.price || '0.00'] }), _jsx("div", { className: "text-[12px] font-bold text-gray-800", children: item.hashCode || '' })] }), _jsx("div", { className: "flex justify-center w-full mb-1", children: _jsx("svg", { ref: svgRef, className: "max-w-full h-[40px]", preserveAspectRatio: "none" }) }), _jsxs("div", { className: "flex justify-between items-center text-[10px] font-semibold text-gray-800 tracking-wide mt-1", children: [_jsx("div", { children: item.barcode }), _jsx("div", { children: item.subCode })] })] }));
}
export default function PrintableBarcodeGrid({ items }) {
    return (_jsx("div", { className: "print-only", children: _jsx("div", { className: "print-grid", children: items.map((item) => (_jsx(Barcode, { item: item }, item.id))) }) }));
}
