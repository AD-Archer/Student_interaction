/**
 * Custom toast notification system for the application.
 * Provides a hook `useToast` to display toast messages.
 */

import { useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description: string;
  variant: 'success' | 'error' | 'info' | 'destructive';
}

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${toastIdCounter++}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Automatically remove the toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return {
    toast: addToast,
    toasts,
  };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded shadow-lg text-white ${
            toast.variant === 'success'
              ? 'bg-green-500'
              : toast.variant === 'error'
              ? 'bg-red-500'
              : toast.variant === 'info'
              ? 'bg-blue-500'
              : 'bg-gray-800'
          }`}
        >
          <strong>{toast.title}</strong>
          <p>{toast.description}</p>
        </div>
      ))}
    </div>
  );
}
