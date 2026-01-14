import React, { createContext, useState, useContext, useCallback } from "react";
import { ToastContainer } from "../components/Toast";

const ToastContext = createContext(null);

/**
 * Provider pour gérer les toasts globalement
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Ajoute un nouveau toast
   * @param {Object} toast - { type, title, message, duration }
   */
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || "info",
      title: toast.title || null,
      message: toast.message || "",
      duration: toast.duration !== undefined ? toast.duration : 5000,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  /**
   * Supprime un toast
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Raccourcis pour différents types de toasts
   */
  const success = useCallback(
    (message, title = "Succès") => {
      return addToast({ type: "success", title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (message, title = "Erreur") => {
      return addToast({ type: "error", title, message, duration: 7000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, title = "Attention") => {
      return addToast({ type: "warning", title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (message, title = "Information") => {
      return addToast({ type: "info", title, message });
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook pour utiliser les toasts
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
