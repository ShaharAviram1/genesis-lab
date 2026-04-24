/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

const DURATIONS = {
    error:     5000,
    success:   2500,
    info:      3000,
    milestone: 6000,
};

const MAX_TOASTS = 3;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((type, message, duration) => {
        const id = Date.now() + Math.random();
        const ms = duration ?? DURATIONS[type] ?? 3000;

        setToasts(prev => {
            const next = [...prev, { id, type, message, duration: ms }];
            // If over the limit, drop the oldest
            return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
        });
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx.showToast;
}
