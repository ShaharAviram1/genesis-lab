import { useEffect } from 'react';
import { useContext } from 'react';
import { ToastContext } from '../src/context/ToastContext';
import './ToastContainer.css';

const ICONS = {
    error:     '✗',
    success:   '✓',
    info:      '◈',
    milestone: '✦',
};

function Toast({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
            <span className="toast-icon">{ICONS[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts, removeToast } = useContext(ToastContext);

    return (
        <div className="toast-stack">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}
