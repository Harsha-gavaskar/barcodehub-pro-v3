import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { FileUp, Printer, Trash2, CheckCircle, FileSpreadsheet, Plus, Minus, Pencil, Eye, X, Save } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import PrintableBarcodeGrid from '../../components/print/PrintableBarcodeGrid';
// ─── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ item, onClose }) {
    const svgRef = useRef(null);
    useEffect(() => {
        if (svgRef.current && item.barcode) {
            try {
                JsBarcode(svgRef.current, item.barcode, {
                    format: 'CODE128',
                    width: 2,
                    height: 60,
                    displayValue: false,
                    margin: 0,
                });
            }
            catch (err) {
                console.error('Invalid barcode:', item.barcode);
            }
        }
    }, [item.barcode]);
    return (_jsx("div", { className: "modal-backdrop", onClick: onClose, children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "modal-panel max-w-sm w-full", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "font-semibold text-dark-100 flex items-center gap-2", children: [_jsx(Eye, { size: 16, className: "text-brand-400" }), " Label Preview"] }), _jsx("button", { onClick: onClose, className: "btn-icon", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 shadow-inner", children: _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("div", { className: "text-[11px] font-semibold text-gray-800 truncate uppercase tracking-wider", children: item.name || 'UNKNOWN PRODUCT' }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsxs("div", { className: "text-xl font-bold text-black tracking-tight", children: ["\u20B9 ", item.price || '0.00'] }), _jsx("div", { className: "text-[12px] font-bold text-gray-800", children: item.hashCode })] }), _jsx("div", { className: "flex justify-center w-full py-1", children: _jsx("svg", { ref: svgRef, className: "max-w-full" }) }), _jsxs("div", { className: "flex justify-between text-[10px] font-semibold text-gray-800", children: [_jsx("span", { children: item.barcode }), _jsx("span", { children: item.subCode })] })] }) }), _jsx("p", { className: "text-xs text-dark-400 mt-3 text-center", children: "This is an exact preview of how your label will print." })] }) }));
}
// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ item, onSave, onClose }) {
    const [form, setForm] = useState({ ...item });
    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    const handleSave = () => {
        if (!form.name.trim()) {
            toast.error('Product name cannot be empty');
            return;
        }
        onSave(form);
        toast.success('Product updated!');
    };
    return (_jsx("div", { className: "modal-backdrop", onClick: onClose, children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "modal-panel max-w-md w-full", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsxs("h3", { className: "font-semibold text-dark-100 flex items-center gap-2", children: [_jsx(Pencil, { size: 16, className: "text-brand-400" }), " Edit Product"] }), _jsx("button", { onClick: onClose, className: "btn-icon", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "space-y-4", children: [
                        { label: 'Product Name', field: 'name', placeholder: 'e.g. BASKET COLANDER G9' },
                        { label: 'Price (₹)', field: 'price', placeholder: 'e.g. 500.00' },
                        { label: 'Hash Code', field: 'hashCode', placeholder: 'e.g. # ZI' },
                        { label: 'Barcode Value', field: 'barcode', placeholder: 'e.g. CBG9' },
                        { label: 'Sub-code', field: 'subCode', placeholder: 'e.g. ZCOS ZEO BM' },
                    ].map(({ label, field, placeholder }) => (_jsxs("div", { children: [_jsx("label", { className: "input-label", children: label }), _jsx("input", { className: "input-field", value: String(form[field] ?? ''), placeholder: placeholder, onChange: (e) => handleChange(field, e.target.value) })] }, field))) }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx("button", { onClick: onClose, className: "btn-secondary flex-1", children: "Cancel" }), _jsxs("button", { onClick: handleSave, className: "btn-primary flex-1", children: [_jsx(Save, { size: 15 }), " Save Changes"] })] })] }) }));
}
// ─── Single-item print helper ──────────────────────────────────────────────────
// Renders a hidden popup with qty copies of that barcode and prints it
function printSingleItem(item) {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    try {
        JsBarcode(svgEl, item.barcode, { format: 'CODE128', width: 2, height: 50, displayValue: false, margin: 0 });
    }
    catch (e) {
        toast.error('Invalid barcode value, cannot print.');
        return;
    }
    const svgHTML = svgEl.outerHTML;
    // Build one label block
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
  `;
    // Repeat the label block qty times
    const allLabels = Array(item.qty).fill(labelHTML).join('');
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
  `;
    const win = window.open('', '_blank', 'width=400,height=400');
    if (win) {
        win.document.write(html);
        win.document.close();
    }
}
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BatchBarcodePage() {
    const [items, setItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [previewItem, setPreviewItem] = useState(null);
    const fileInputRef = useRef(null);
    const handleFileUpload = (file) => {
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const rows = json.length > 0 && typeof json[0][0] === 'string' && json[0][0].toLowerCase().includes('name')
                    ? json.slice(1) : json;
                const newItems = [];
                const seenBarcodes = new Set();
                const generateUniqueId = () => {
                    let id;
                    do {
                        id = 'BH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                    } while (seenBarcodes.has(id));
                    return id;
                };
                rows.forEach((row, idx) => {
                    if (!row || row.length === 0 || (!row[0] && !row[3]))
                        return;
                    const name = row[0] ? String(row[0]).trim() : 'Unknown Product';
                    const price = row[1] ? String(row[1]).trim() : '0.00';
                    const hashCode = row[2] ? String(row[2]).trim() : '';
                    let barcode = row[3] ? String(row[3]).trim() : '';
                    const subCode = row[4] ? String(row[4]).trim() : '';
                    let qty = 1;
                    if (row[5] && !isNaN(Number(row[5])))
                        qty = Math.max(1, Number(row[5]));
                    if (barcode && !barcode.match(/^[a-zA-Z0-9-\.]+$/))
                        barcode = '';
                    if (!barcode || seenBarcodes.has(barcode))
                        barcode = generateUniqueId();
                    seenBarcodes.add(barcode);
                    newItems.push({ id: `item-${Date.now()}-${idx}`, name, price, hashCode, barcode, subCode, qty });
                });
                setItems(newItems);
                toast.success(`Successfully loaded ${newItems.length} products`);
            }
            catch (err) {
                toast.error('Failed to parse file. Please check the format.');
            }
        };
        reader.readAsBinaryString(file);
    };
    const updateQuantity = (id, newQty) => setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, newQty) } : item));
    const handleSaveEdit = (updated) => {
        setItems(items.map(item => item.id === updated.id ? updated : item));
        setEditItem(null);
    };
    const handleDelete = (id) => {
        setItems(items.filter(item => item.id !== id));
        toast.success('Product removed');
    };
    const expandedPrintItems = useMemo(() => {
        const expanded = [];
        items.forEach(item => {
            for (let i = 0; i < item.qty; i++)
                expanded.push({ ...item, id: `${item.id}-copy-${i}` });
        });
        return expanded;
    }, [items]);
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
    return (_jsxs(_Fragment, { children: [_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-6 screen-only", children: [_jsxs(motion.div, { variants: itemVariant, className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-dark-50", children: "Batch Excel Print" }), _jsx("p", { className: "text-sm text-dark-400 mt-0.5", children: "Upload your Excel sheet \u2022 Edit, preview, and print each label individually." })] }), items.length > 0 && (_jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: () => setItems([]), className: "btn-secondary text-sm", children: [_jsx(Trash2, { size: 15 }), " Clear All"] }), _jsxs("button", { onClick: () => window.print(), className: "btn-primary text-sm px-5", children: [_jsx(Printer, { size: 16 }), " Print All (", expandedPrintItems.length, ")"] })] }))] }), items.length === 0 ? (_jsx(motion.div, { variants: itemVariant, className: "glass-card p-12", children: _jsxs("div", { className: `border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700/50 bg-dark-800/30'}`, onDragOver: (e) => { e.preventDefault(); setIsDragging(true); }, onDragLeave: () => setIsDragging(false), onDrop: (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0])
                                handleFileUpload(e.dataTransfer.files[0]); }, children: [_jsx(FileSpreadsheet, { size: 48, className: `mx-auto mb-4 ${isDragging ? 'text-brand-400' : 'text-dark-500'}` }), _jsx("h3", { className: "text-lg font-semibold text-dark-100 mb-2", children: "Upload Excel or CSV File" }), _jsxs("p", { className: "text-sm text-dark-400 mb-6 max-w-lg mx-auto", children: ["Drag and drop your spreadsheet here. The system expects up to 6 columns:", _jsx("br", {}), _jsx("span", { className: "font-mono text-xs text-brand-300", children: "Name | Price | Hash Code | Barcode | Sub-code | Quantity (Optional)" })] }), _jsx("input", { type: "file", ref: fileInputRef, className: "hidden", accept: ".xlsx,.xls,.csv", onChange: (e) => { if (e.target.files?.[0])
                                        handleFileUpload(e.target.files[0]); } }), _jsxs("button", { onClick: () => fileInputRef.current?.click(), className: "btn-primary mx-auto", children: [_jsx(FileUp, { size: 16 }), " Browse Files"] })] }) })) : (_jsxs(motion.div, { variants: itemVariant, className: "glass-card overflow-hidden", children: [_jsxs("div", { className: "p-5 border-b border-dark-700/50 flex items-center justify-between", children: [_jsxs("h3", { className: "font-semibold text-dark-100 flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16, className: "text-emerald-400" }), "Products (", items.length, ")"] }), _jsxs("div", { className: "text-xs text-dark-400 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700/50", children: ["Total labels: ", _jsx("span", { className: "text-brand-300 font-semibold", children: expandedPrintItems.length })] })] }), _jsx("div", { className: "max-h-[600px] overflow-y-auto custom-scrollbar", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { className: "sticky top-0 bg-dark-900/90 backdrop-blur z-10", children: _jsxs("tr", { className: "border-b border-dark-700/50", children: [_jsx("th", { className: "p-3 text-xs font-semibold text-dark-400 w-10 text-center", children: "#" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400", children: "Name" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400", children: "Price (\u20B9)" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400", children: "Hash" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400", children: "Barcode" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400", children: "Sub-code" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400 text-center", children: "Qty" }), _jsx("th", { className: "p-3 text-xs font-semibold text-dark-400 text-center", children: "Actions" })] }) }), _jsx("tbody", { children: items.map((item, idx) => (_jsxs("tr", { className: "border-b border-dark-700/20 hover:bg-dark-800/30 transition-colors group", children: [_jsx("td", { className: "p-3 text-sm text-dark-500 text-center", children: idx + 1 }), _jsx("td", { className: "p-3 text-sm text-dark-200 font-medium max-w-[180px] truncate", children: item.name }), _jsxs("td", { className: "p-3 text-sm text-emerald-400 font-semibold", children: ["\u20B9", item.price] }), _jsx("td", { className: "p-3 text-sm text-purple-400", children: item.hashCode }), _jsx("td", { className: "p-3 text-sm text-brand-300 font-mono", children: item.barcode }), _jsx("td", { className: "p-3 text-sm text-dark-300", children: item.subCode }), _jsx("td", { className: "p-3 text-sm text-center", children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: [_jsx("button", { onClick: () => updateQuantity(item.id, item.qty - 1), disabled: item.qty <= 1, className: "p-1 rounded bg-dark-700/50 text-dark-300 hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: _jsx(Minus, { size: 12 }) }), _jsx("span", { className: "w-6 text-center font-bold text-dark-100 text-sm", children: item.qty }), _jsx("button", { onClick: () => updateQuantity(item.id, item.qty + 1), className: "p-1 rounded bg-dark-700/50 text-dark-300 hover:bg-dark-600 transition-colors", children: _jsx(Plus, { size: 12 }) })] }) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [_jsx("button", { onClick: () => setPreviewItem(item), title: "Preview Label", className: "p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-brand-600/30 hover:text-brand-300 transition-colors border border-transparent hover:border-brand-600/30", children: _jsx(Eye, { size: 14 }) }), _jsx("button", { onClick: () => setEditItem(item), title: "Edit Product", className: "p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-amber-600/30 hover:text-amber-300 transition-colors border border-transparent hover:border-amber-600/30", children: _jsx(Pencil, { size: 14 }) }), _jsx("button", { onClick: () => printSingleItem(item), title: "Print This Label", className: "p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-emerald-600/30 hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-600/30", children: _jsx(Printer, { size: 14 }) }), _jsx("button", { onClick: () => handleDelete(item.id), title: "Remove Product", className: "p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-red-600/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-600/30", children: _jsx(Trash2, { size: 14 }) })] }) })] }, item.id))) })] }) })] }))] }), _jsxs(AnimatePresence, { children: [previewItem && _jsx(PreviewModal, { item: previewItem, onClose: () => setPreviewItem(null) }), editItem && _jsx(EditModal, { item: editItem, onSave: handleSaveEdit, onClose: () => setEditItem(null) })] }), _jsx(PrintableBarcodeGrid, { items: expandedPrintItems })] }));
}
