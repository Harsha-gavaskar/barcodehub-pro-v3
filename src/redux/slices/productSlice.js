import { createSlice } from '@reduxjs/toolkit';
export const DEMO_PRODUCTS = [
    { id: '1', name: 'Wireless Mouse Pro', sku: 'WM-001234', barcode: '012345678901', price: 49.99, category: 'Electronics', description: 'Ergonomic wireless mouse', weight: '0.12kg', manufacturer: 'TechGear', stock: 150, location: 'A-01', status: 'active', barcodeFormat: 'EAN13', createdAt: '2024-01-15', updatedAt: '2024-03-01' },
    { id: '2', name: 'USB-C Hub 7-in-1', sku: 'UC-005678', barcode: '567890123456', price: 34.99, category: 'Electronics', description: '7-port USB-C hub with 4K HDMI', weight: '0.18kg', manufacturer: 'ConnectPro', stock: 89, location: 'A-02', status: 'active', barcodeFormat: 'EAN13', createdAt: '2024-01-20', updatedAt: '2024-03-05' },
    { id: '3', name: 'Ergonomic Laptop Stand', sku: 'LS-009012', barcode: '901234567890', price: 79.99, category: 'Accessories', description: 'Adjustable aluminum laptop stand', weight: '0.65kg', manufacturer: 'DeskMate', stock: 42, location: 'B-01', status: 'active', barcodeFormat: 'CODE128', createdAt: '2024-02-01', updatedAt: '2024-03-10' },
    { id: '4', name: 'Mechanical Keyboard', sku: 'KB-003456', barcode: '345678901234', price: 129.99, category: 'Electronics', description: 'TKL mechanical keyboard - Blue switches', weight: '0.9kg', manufacturer: 'KeyMaster', stock: 67, location: 'A-03', status: 'active', barcodeFormat: 'EAN13', createdAt: '2024-02-10', updatedAt: '2024-03-15' },
    { id: '5', name: 'Monitor Arm Dual', sku: 'MA-007890', barcode: '789012345678', price: 89.99, category: 'Accessories', description: 'Dual monitor arm, VESA compatible', weight: '2.1kg', manufacturer: 'FlexArm', stock: 23, location: 'C-01', status: 'active', barcodeFormat: 'CODE128', createdAt: '2024-02-15', updatedAt: '2024-03-20' },
    { id: '6', name: 'Webcam 4K Ultra', sku: 'WC-002345', barcode: '234567890123', price: 199.99, category: 'Electronics', description: '4K webcam with auto-focus and noise cancellation', weight: '0.22kg', manufacturer: 'VisionTech', stock: 5, location: 'A-04', status: 'active', barcodeFormat: 'EAN13', createdAt: '2024-03-01', updatedAt: '2024-03-22' },
    { id: '7', name: 'LED Desk Lamp Pro', sku: 'DL-006789', barcode: '678901234567', price: 55.99, category: 'Lighting', description: '10-level dimming, wireless charging base', weight: '0.95kg', manufacturer: 'LumiDesk', stock: 0, location: 'D-01', status: 'active', barcodeFormat: 'UPC', createdAt: '2024-03-05', updatedAt: '2024-03-23' },
    { id: '8', name: 'Mouse Pad XXL', sku: 'MP-001234', barcode: '012345000001', price: 29.99, category: 'Accessories', description: 'Extended desk mat, waterproof, non-slip', weight: '0.45kg', manufacturer: 'SmoothPad', stock: 200, location: 'B-02', status: 'active', barcodeFormat: 'UPC', createdAt: '2024-03-10', updatedAt: '2024-03-24' },
    { id: '9', name: 'USB-A Hub 4-Port', sku: 'UH-005678', barcode: '56789001234', price: 18.99, category: 'Electronics', description: 'USB 3.0 4-port hub, bus powered', weight: '0.08kg', manufacturer: 'ConnectPro', stock: 312, location: 'A-05', status: 'active', barcodeFormat: 'EAN8', createdAt: '2024-03-12', updatedAt: '2024-03-25' },
    { id: '10', name: 'Noise Cancelling Headphones', sku: 'NC-008901', barcode: '890123456789', price: 249.99, category: 'Audio', description: '40hr battery, ANC, foldable design', weight: '0.28kg', manufacturer: 'AudioPro', stock: 34, location: 'A-06', status: 'active', barcodeFormat: 'EAN13', createdAt: '2024-03-15', updatedAt: '2024-03-26' },
    { id: '11', name: 'Portable SSD 1TB', sku: 'PS-007234', barcode: '723456789012', price: 99.99, category: 'Storage', description: 'USB-C, 1050MB/s read speed', weight: '0.05kg', manufacturer: 'SpeedDrive', stock: 78, location: 'E-01', status: 'active', barcodeFormat: 'CODE128', createdAt: '2024-03-18', updatedAt: '2024-03-27' },
    { id: '12', name: 'Webcam Mount Clip', sku: 'WM-009999', barcode: '999900001234', price: 9.99, category: 'Accessories', description: 'Universal webcam mount for monitors', weight: '0.06kg', manufacturer: 'MountPro', stock: 8, location: 'B-03', status: 'inactive', barcodeFormat: 'CODE39', createdAt: '2024-01-05', updatedAt: '2024-02-20' },
];
const initialState = {
    products: DEMO_PRODUCTS,
    selectedProduct: null,
    searchQuery: '',
    selectedCategory: 'All',
    currentPage: 1,
    pageSize: 10,
    sortBy: 'name',
    sortOrder: 'asc',
};
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        addProduct(state, action) {
            state.products.unshift(action.payload);
        },
        updateProduct(state, action) {
            const idx = state.products.findIndex(p => p.id === action.payload.id);
            if (idx !== -1)
                state.products[idx] = action.payload;
        },
        deleteProduct(state, action) {
            state.products = state.products.filter(p => p.id !== action.payload);
        },
        setSelectedProduct(state, action) {
            state.selectedProduct = action.payload;
        },
        setSearchQuery(state, action) {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setSelectedCategory(state, action) {
            state.selectedCategory = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        },
        setSortBy(state, action) {
            if (state.sortBy === action.payload) {
                state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
            }
            else {
                state.sortBy = action.payload;
                state.sortOrder = 'asc';
            }
        },
        bulkAddProducts(state, action) {
            state.products = [...action.payload, ...state.products];
        },
    },
});
export const { addProduct, updateProduct, deleteProduct, setSelectedProduct, setSearchQuery, setSelectedCategory, setCurrentPage, setSortBy, bulkAddProducts } = productSlice.actions;
export default productSlice.reducer;
