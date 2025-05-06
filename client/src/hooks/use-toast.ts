// Simplified toast hook and toast function for our application
import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Store for singleton pattern
let toastFn: (options: ToastOptions) => string;
let dismissFn: (id: string) => void;

// Direct toast function for components that don't want to use the hook
export const toast = (options: ToastOptions) => {
  if (!toastFn) {
    console.error("Toast function called before it was initialized. Make sure ToastProvider is mounted.");
    return "";
  }
  return toastFn(options);
};

// Direct dismiss function
export const dismiss = (id: string) => {
  if (!dismissFn) {
    console.error("Dismiss function called before it was initialized. Make sure ToastProvider is mounted.");
    return;
  }
  return dismissFn(id);
};

// Hook for components that need access to the toast list or prefer the hook pattern
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(({ title, description, variant = "default", duration = 5000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto dismiss after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Set the singleton functions on first render
  if (!toastFn) toastFn = showToast;
  if (!dismissFn) dismissFn = dismissToast;

  return {
    toast: showToast,
    dismiss: dismissToast,
    toasts,
  };
}