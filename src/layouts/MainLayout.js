import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
export default function MainLayout() {
    const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
    return (_jsxs("div", { className: "flex h-screen bg-dark-950 overflow-hidden", children: [_jsx("div", { className: "fixed inset-0 bg-mesh-gradient opacity-40 pointer-events-none" }), _jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col min-w-0 transition-all duration-300", style: { marginLeft: collapsed ? '72px' : '256px' }, children: [_jsx(Topbar, {}), _jsx("main", { className: "flex-1 overflow-y-auto p-6 scrollable", children: _jsx(Outlet, {}) })] })] }));
}
