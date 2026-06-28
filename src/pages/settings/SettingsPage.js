import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { User, Bell, Shield, Link, Palette, Building, Key, Save, Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'company', label: 'Company', icon: Building },
];
export default function SettingsPage() {
    const user = useSelector((s) => s.auth.user);
    const [activeTab, setActiveTab] = useState('profile');
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(false);
    const [slackNotifs, setSlackNotifs] = useState(true);
    const [lowStockAlert, setLowStockAlert] = useState(true);
    const [twoFA, setTwoFA] = useState(false);
    const [googleConnected, setGoogleConnected] = useState(true);
    const [autoSync, setAutoSync] = useState(true);
    const save = () => toast.success('Settings saved!');
    const Toggle = ({ on, onToggle }) => (_jsx("button", { onClick: onToggle, className: clsx('relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0', on ? 'bg-brand-500' : 'bg-dark-600'), children: _jsx("div", { className: clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', on ? 'translate-x-5' : 'translate-x-0.5') }) }));
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
    return (_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-5", children: [_jsxs(motion.div, { variants: item, children: [_jsx("h2", { className: "text-xl font-bold text-dark-50", children: "Settings" }), _jsx("p", { className: "text-sm text-dark-400", children: "Manage your account and platform configuration" })] }), _jsxs("div", { className: "flex gap-5 flex-col xl:flex-row", children: [_jsx(motion.div, { variants: item, className: "xl:w-52 shrink-0", children: _jsx("div", { className: "glass-card p-2 space-y-0.5", children: TABS.map(tab => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all', activeTab === tab.id
                                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                                        : 'text-dark-400 hover:bg-dark-700/40 hover:text-dark-200'), children: [_jsx(Icon, { size: 15 }), tab.label, activeTab === tab.id && _jsx(ChevronRight, { size: 13, className: "ml-auto" })] }, tab.id));
                            }) }) }), _jsxs(motion.div, { variants: item, className: "flex-1 min-w-0 space-y-4", children: [activeTab === 'profile' && (_jsxs("div", { className: "glass-card p-6 space-y-5", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Profile Information" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold", children: user?.name?.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "text-dark-100 font-semibold", children: user?.name }), _jsx("p", { className: "text-dark-500 text-sm", children: user?.email }), _jsx("button", { className: "text-xs text-brand-400 mt-1 hover:text-brand-300", children: "Change avatar" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "First Name" }), _jsx("input", { defaultValue: "Alex", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Last Name" }), _jsx("input", { defaultValue: "Johnson", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Email" }), _jsx("input", { defaultValue: user?.email, className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Phone" }), _jsx("input", { placeholder: "+1 (555) 000-0000", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Role" }), _jsx("input", { defaultValue: user?.role, disabled: true, className: "input-field opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Company" }), _jsx("input", { defaultValue: user?.company, className: "input-field" })] })] }), _jsxs("button", { onClick: save, className: "btn-primary", children: [_jsx(Save, { size: 15 }), " Save Changes"] })] })), activeTab === 'notifications' && (_jsxs("div", { className: "glass-card p-6 space-y-4", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Notification Preferences" }), [
                                        { label: 'Email Notifications', desc: 'Receive updates via email', on: emailNotifs, toggle: () => setEmailNotifs(v => !v) },
                                        { label: 'SMS Notifications', desc: 'Get alerts via SMS', on: smsNotifs, toggle: () => setSmsNotifs(v => !v) },
                                        { label: 'Slack Notifications', desc: 'Post updates to Slack', on: slackNotifs, toggle: () => setSlackNotifs(v => !v) },
                                        { label: 'Low Stock Alerts', desc: 'Alert when stock drops below 10 units', on: lowStockAlert, toggle: () => setLowStockAlert(v => !v) },
                                    ].map(n => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-dark-800/40 border border-dark-700/40", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-dark-100", children: n.label }), _jsx("p", { className: "text-xs text-dark-500", children: n.desc })] }), _jsx(Toggle, { on: n.on, onToggle: n.toggle })] }, n.label))), _jsxs("button", { onClick: save, className: "btn-primary", children: [_jsx(Save, { size: 15 }), " Save Preferences"] })] })), activeTab === 'security' && (_jsxs("div", { className: "glass-card p-6 space-y-5", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Security Settings" }), _jsx("div", { className: "p-4 rounded-xl bg-dark-800/40 border border-dark-700/40 space-y-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-dark-100", children: "Two-Factor Authentication" }), _jsx("p", { className: "text-xs text-dark-500", children: "Add an extra layer of security to your account" })] }), _jsx(Toggle, { on: twoFA, onToggle: () => setTwoFA(v => !v) })] }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-dark-200 mb-3", children: "Change Password" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Current Password" }), _jsx("input", { type: "password", className: "input-field", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "New Password" }), _jsx("input", { type: "password", className: "input-field", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Confirm New Password" }), _jsx("input", { type: "password", className: "input-field", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] })] })] }), _jsxs("button", { onClick: save, className: "btn-primary", children: [_jsx(Key, { size: 15 }), " Update Password"] })] })), activeTab === 'integrations' && (_jsxs("div", { className: "glass-card p-6 space-y-4", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Integrations" }), [
                                        {
                                            name: 'Google Sheets',
                                            desc: 'Sync products from Google Sheets automatically',
                                            icon: '📊',
                                            connected: googleConnected,
                                            onToggle: () => setGoogleConnected(v => !v),
                                        },
                                        {
                                            name: 'Auto-Sync (Hourly)',
                                            desc: 'Automatically sync every hour in the background',
                                            icon: '🔄',
                                            connected: autoSync,
                                            onToggle: () => setAutoSync(v => !v),
                                        },
                                        {
                                            name: 'Slack Webhook',
                                            desc: 'Post notifications to your Slack workspace',
                                            icon: '💬',
                                            connected: false,
                                            onToggle: () => toast.error('Configure Slack webhook URL first'),
                                        },
                                        {
                                            name: 'AWS S3 Storage',
                                            desc: 'Store generated labels and exports on S3',
                                            icon: '☁️',
                                            connected: false,
                                            onToggle: () => toast.error('Configure AWS credentials first'),
                                        },
                                    ].map(int => (_jsxs("div", { className: "flex items-center gap-4 p-4 rounded-xl bg-dark-800/40 border border-dark-700/40", children: [_jsx("span", { className: "text-2xl", children: int.icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-dark-100", children: int.name }), _jsx("p", { className: "text-xs text-dark-500", children: int.desc })] }), _jsxs("div", { className: "flex items-center gap-2", children: [int.connected && _jsxs("span", { className: "badge-green", children: [_jsx(Check, { size: 10 }), " Active"] }), _jsx(Toggle, { on: int.connected, onToggle: int.onToggle })] })] }, int.name)))] })), activeTab === 'appearance' && (_jsxs("div", { className: "glass-card p-6 space-y-5", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Appearance" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-dark-200 mb-3", children: "Theme" }), _jsx("div", { className: "flex gap-3", children: ['Dark', 'Light', 'System'].map(t => (_jsxs("button", { className: clsx('flex-1 py-3 rounded-xl border text-sm font-medium transition-all', t === 'Dark'
                                                        ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                                                        : 'border-dark-600/40 text-dark-400 hover:border-dark-500/60'), children: [t === 'Dark' ? '🌙' : t === 'Light' ? '☀️' : '💻', " ", t] }, t))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-dark-200 mb-3", children: "Accent Color" }), _jsx("div", { className: "flex gap-2", children: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(c => (_jsx("button", { className: "w-8 h-8 rounded-full ring-offset-2 ring-offset-dark-900 hover:ring-2 hover:ring-white transition-all", style: { background: c } }, c))) })] }), _jsxs("button", { onClick: save, className: "btn-primary", children: [_jsx(Save, { size: 15 }), " Save Appearance"] })] })), activeTab === 'company' && (_jsxs("div", { className: "glass-card p-6 space-y-5", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Company Settings" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Company Name" }), _jsx("input", { defaultValue: "BarcodeHub Industries", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Industry" }), _jsxs("select", { className: "select-field", children: [_jsx("option", { children: "Retail" }), _jsx("option", { children: "Manufacturing" }), _jsx("option", { children: "Warehouse" }), _jsx("option", { children: "Healthcare" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Address" }), _jsx("input", { placeholder: "123 Main St", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "City" }), _jsx("input", { placeholder: "New York", className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Country" }), _jsxs("select", { className: "select-field", children: [_jsx("option", { children: "United States" }), _jsx("option", { children: "India" }), _jsx("option", { children: "United Kingdom" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Tax ID" }), _jsx("input", { placeholder: "XX-XXXXXXX", className: "input-field" })] })] }), _jsxs("button", { onClick: save, className: "btn-primary", children: [_jsx(Save, { size: 15 }), " Save Company Info"] })] }))] })] })] }));
}
