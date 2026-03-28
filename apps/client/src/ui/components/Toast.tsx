import { useUIStore, Toast as ToastType } from '../stores';

export function ToastContainer() {
  const toasts = useUIStore(state => state.toasts);
  const removeToast = useUIStore(state => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="ui-toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const icons: Record<ToastType['type'], string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className={`ui-toast ui-toast--${toast.type}`} role="alert">
      <span className="ui-toast__icon">{icons[toast.type]}</span>
      <span className="ui-toast__message">{toast.message}</span>
      <button className="ui-toast__dismiss" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
