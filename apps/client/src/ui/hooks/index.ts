import { useCallback } from 'react';
import { useUIStore, Toast } from '../stores';

export function useToast() {
  const addToast = useUIStore(state => state.addToast);
  const removeToast = useUIStore(state => state.removeToast);

  const toast = useCallback(
    (options: Omit<Toast, 'id'>) => {
      addToast(options);
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      toast({ message, type: 'success', duration });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      toast({ message, type: 'error', duration });
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      toast({ message, type: 'warning', duration });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      toast({ message, type: 'info', duration });
    },
    [toast]
  );

  return { toast, success, error, warning, info, dismiss: removeToast };
}

export function useDialog() {
  const showDialog = useUIStore(state => state.showDialog);
  const hideDialog = useUIStore(state => state.hideDialog);
  const dialog = useUIStore(state => state.dialog);

  const confirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: { title?: string; confirmText?: string; cancelText?: string }
    ) => {
      showDialog({
        title: options?.title || 'Confirm',
        message,
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        onConfirm,
        onCancel: hideDialog,
      });
    },
    [showDialog, hideDialog]
  );

  return { dialog, confirm, hideDialog };
}

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      const combo = [ctrl && 'ctrl', shift && 'shift', key].filter(Boolean).join('+');

      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      } else if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    },
    [shortcuts]
  );

  return handleKeyDown;
}
