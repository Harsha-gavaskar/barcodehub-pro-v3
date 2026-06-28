import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './redux/store'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/auth/LoginPage'
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
import AdminPage from './pages/admin/AdminPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
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
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
