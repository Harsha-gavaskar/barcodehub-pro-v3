import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'

import DashboardPage from './pages/dashboard/DashboardPage'
import ProductsPage from './pages/products/ProductsPage'
import BarcodeGeneratorPage from './pages/barcodes/BarcodeGeneratorPage'
import BatchBarcodePage from './pages/barcodes/BatchBarcodePage'
import LabelDesignerPage from './pages/labels/LabelDesignerPage'
import PrintManagerPage from './pages/print/PrintManagerPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import InventoryPage from './pages/inventory/InventoryPage'
import ReportsPage from './pages/reports/ReportsPage'
import SettingsPage from './pages/settings/SettingsPage'
import PrinterGuidePage from './pages/settings/PrinterGuidePage'
import AdminPage from './pages/admin/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MainLayout />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="barcodes" element={<BarcodeGeneratorPage />} />
          <Route path="batch-barcodes" element={<BatchBarcodePage />} />
          <Route path="labels" element={<LabelDesignerPage />} />
          <Route path="print" element={<PrintManagerPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="printer-guide" element={<PrinterGuidePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
