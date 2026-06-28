import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { store } from './redux/store.ts';
import './index.css';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(Provider, { store: store, children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(App, {}), _jsx(Toaster, { position: "top-right", toastOptions: {
                        duration: 4000,
                        style: {
                            background: 'rgba(15,23,42,0.95)',
                            color: '#f1f5f9',
                            border: '1px solid rgba(71,85,105,0.5)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#ef4444', secondary: '#fff' },
                        },
                    } })] }) }) }));
