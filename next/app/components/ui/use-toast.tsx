"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Toast, ToastProps, ToastActionElement } from "./toast";
import { ToastClose, ToastTitle, ToastDescription } from "./toast";

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

interface ToastContextType {
  toasts: ToastType[];
  toast: (props: {
    title?: string;
    description?: string;
    action?: ToastActionElement;
    variant?: "default" | "destructive";
  }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = ({
    title,
    description,
    action,
    variant = "default",
  }: {
    title?: string;
    description?: string;
    action?: ToastActionElement;
    variant?: "default" | "destructive";
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, action, variant }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          <ToastClose onClick={() => dismiss(toast.id)} />
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          {toast.action}
        </Toast>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
