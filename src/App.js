import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import BarcodeGeneratorPage from './pages/barcodes/BarcodeGeneratorPage';
import BatchBarcodePage from './pages/barcodes/BatchBarcodePage';
import LabelDesignerPage from './pages/labels/LabelDesignerPage';
import PrintManagerPage from './pages/print/PrintManagerPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AdminPage from './pages/admin/AdminPage';
function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
    return isAuthenticated ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login", replace: true });
}
export default function App() {
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "products", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "barcodes", element: _jsx(BarcodeGeneratorPage, {}) }), _jsx(Route, { path: "batch-barcodes", element: _jsx(BatchBarcodePage, {}) }), _jsx(Route, { path: "labels", element: _jsx(LabelDesignerPage, {}) }), _jsx(Route, { path: "print", element: _jsx(PrintManagerPage, {}) }), _jsx(Route, { path: "analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "inventory", element: _jsx(InventoryPage, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "admin", element: _jsx(AdminPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
