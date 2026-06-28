import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Shield, Printer, FileText, Activity, Plus, Edit3, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
const USERS = [
    { id: '1', name: 'Alex Johnson', email: 'alex@barcodehub.pro', role: 'admin', company: 'HQ', status: 'active', lastLogin: '2 min ago' },
    { id: '2', name: 'Sarah Lee', email: 'sarah@barcodehub.pro', role: 'manager', company: 'Warehouse', status: 'active', lastLogin: '1h ago' },
    { id: '3', name: 'Mike Davis', email: 'mike@barcodehub.pro', role: 'operator', company: 'Warehouse', status: 'active', lastLogin: '3h ago' },
    { id: '4', name: 'Emma Wilson', email: 'emma@barcodehub.pro', role: 'viewer', company: 'Office B', status: 'inactive', lastLogin: '2d ago' },
    { id: '5', name: 'Tom Brown', email: 'tom@barcodehub.pro', role: 'operator', company: 'Retail', status: 'active', lastLogin: '5h ago' },
];
const AUDIT_LOGS = [
    { user: 'Alex Johnson', action: 'Exported PDF Report', resource: 'Analytics', time: '10:23 AM', ip: '192.168.1.10' },
    { user: 'Sarah Lee', action: 'Bulk Imported 48 Products', resource: 'Products', time: '09:45 AM', ip: '192.168.1.11' },
    { user: 'Mike Davis', action: 'Sent 50 Labels to Printer', resource: 'Print Queue', time: '09:12 AM', ip: '192.168.1.20' },
    { user: 'Alex Johnson', action: 'Updated Settings', resource: 'Settings', time: '08:55 AM', ip: '192.168.1.10' },
    { user: 'Tom Brown', action: 'Generated 20 QR Codes', resource: 'Barcodes', time: '08:30 AM', ip: '192.168.1.22' },
];
const ROLE_BADGE = {
    admin: 'badge-purple',
    manager: 'badge-blue',
    operator: 'badge-green',
    viewer: 'badge-gray',
};
const ADMIN_TABS = ['Users', 'Roles', 'Companies', 'Printers', 'Audit Log'];
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('Users');
    const [users, setUsers] = useState(USERS);
    const toggleStatus = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
        toast.success('User status updated');
    };
    return (_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-5", children: [_jsxs(motion.div, { variants: item, className: "flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-dark-50", children: "Admin Panel" }), _jsx("p", { className: "text-sm text-dark-400", children: "Manage users, roles, companies, and system logs" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "badge-purple", children: [_jsx(Shield, { size: 12 }), " Super Admin"] }) })] }), _jsx(motion.div, { variants: item, className: "grid grid-cols-2 xl:grid-cols-4 gap-4", children: [
                    { label: 'Total Users', value: '24', icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                    { label: 'Companies', value: '3', icon: Building, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Active Printers', value: '4', icon: Printer, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                    { label: 'Audit Events', value: '1,248', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map(s => {
                    const Icon = s.icon;
                    return (_jsxs("div", { className: "glass-card p-5 flex items-center gap-4", children: [_jsx("div", { className: clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg), children: _jsx(Icon, { size: 18, className: s.color }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-dark-50", children: s.value }), _jsx("p", { className: "text-xs text-dark-400", children: s.label })] })] }, s.label));
                }) }), _jsx(motion.div, { variants: item, className: "flex gap-1 bg-dark-800/60 rounded-xl p-1 border border-dark-700/40 w-fit", children: ADMIN_TABS.map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), className: clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === tab ? 'bg-brand-500/20 text-brand-300' : 'text-dark-400 hover:text-dark-200'), children: tab }, tab))) }), activeTab === 'Users' && (_jsxs(motion.div, { variants: item, className: "table-container", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-dark-700/50", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "System Users" }), _jsxs("button", { onClick: () => toast.success('Invite user modal coming soon!'), className: "btn-primary text-sm", children: [_jsx(Plus, { size: 14 }), " Invite User"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-dark-700/50", children: ['User', 'Email', 'Role', 'Company', 'Last Login', 'Status', 'Actions'].map(h => (_jsx("th", { className: "table-header text-left", children: h }, h))) }) }), _jsx("tbody", { children: users.map((u, i) => (_jsxs(motion.tr, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: i * 0.05 }, className: "table-row", children: [_jsx("td", { className: "table-cell", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-purple-500/30 flex items-center justify-center text-brand-300 font-bold text-sm", children: u.name.charAt(0) }), _jsx("p", { className: "text-sm font-medium text-dark-100", children: u.name })] }) }), _jsx("td", { className: "table-cell text-dark-400 text-sm", children: u.email }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: ROLE_BADGE[u.role], children: u.role }) }), _jsx("td", { className: "table-cell text-dark-400 text-sm", children: u.company }), _jsx("td", { className: "table-cell text-dark-500 text-xs", children: u.lastLogin }), _jsx("td", { className: "table-cell", children: u.status === 'active'
                                                    ? _jsxs("span", { className: "badge-green flex items-center gap-1 w-fit", children: [_jsx(CheckCircle, { size: 10 }), " Active"] })
                                                    : _jsxs("span", { className: "badge-gray flex items-center gap-1 w-fit", children: [_jsx(XCircle, { size: 10 }), " Inactive"] }) }), _jsx("td", { className: "table-cell", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => toast.success(`Editing ${u.name}...`), className: "btn-icon", children: _jsx(Edit3, { size: 13 }) }), _jsx("button", { onClick: () => toggleStatus(u.id), className: "btn-icon text-amber-400 hover:bg-amber-500/10", title: "Toggle status", children: u.status === 'active' ? _jsx(XCircle, { size: 13 }) : _jsx(CheckCircle, { size: 13 }) })] }) })] }, u.id))) })] }) })] })), activeTab === 'Audit Log' && (_jsxs(motion.div, { variants: item, className: "table-container", children: [_jsx("div", { className: "px-6 py-4 border-b border-dark-700/50", children: _jsx("h3", { className: "font-semibold text-dark-100", children: "System Audit Log" }) }), _jsx("div", { className: "divide-y divide-dark-800/50", children: AUDIT_LOGS.map((log, i) => (_jsxs("div", { className: "flex items-center gap-4 px-6 py-4 hover:bg-dark-700/20 transition-colors", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0", children: _jsx(Activity, { size: 14, className: "text-brand-400" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("p", { className: "text-sm text-dark-100 font-medium", children: [_jsx("span", { className: "text-brand-400", children: log.user }), " \u2014 ", log.action] }), _jsxs("p", { className: "text-xs text-dark-500", children: [log.resource, " \u00B7 ", log.ip] })] }), _jsx("span", { className: "text-xs text-dark-600 shrink-0", children: log.time })] }, i))) })] })), !['Users', 'Audit Log'].includes(activeTab) && (_jsxs(motion.div, { variants: item, className: "glass-card p-12 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3", children: _jsx(FileText, { size: 20, className: "text-brand-400" }) }), _jsxs("p", { className: "text-dark-400 font-medium", children: [activeTab, " management"] }), _jsx("p", { className: "text-dark-600 text-sm mt-1", children: "This section is part of Phase 2 (Backend integration)" })] }))] }));
}
