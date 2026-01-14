import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Composant Toast pour afficher des notifications
 */
const Toast = ({
  id,
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6" />;
      case "error":
        return <AlertCircle className="w-6 h-6" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6" />;
      case "info":
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "rounded-lg border border-green-600 bg-green-50 p-4 mb-3 flex items-start gap-3 shadow-lg";
      case "error":
        return "rounded-lg border border-red-600 bg-red-50 p-4 mb-3 flex items-start gap-3 shadow-lg";
      case "warning":
        return "rounded-lg border border-yellow-600 bg-yellow-50 p-4 mb-3 flex items-start gap-3 shadow-lg";
      case "info":
      default:
        return "rounded-lg border border-blue-600 bg-blue-50 p-4 mb-3 flex items-start gap-3 shadow-lg";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-900";
      case "error":
        return "text-red-900";
      case "warning":
        return "text-yellow-900";
      case "info":
      default:
        return "text-blue-900";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "text-green-700 hover:bg-green-100";
      case "error":
        return "text-red-700 hover:bg-red-100";
      case "warning":
        return "text-yellow-700 hover:bg-yellow-100";
      case "info":
      default:
        return "text-blue-700 hover:bg-blue-100";
    }
  };

  return (
    <div className={getStyles()} role="alert">
      <div className="flex-shrink-0">{getIcon()}</div>

      <div className="flex-1">
        {title && (
          <p className={`font-semibold text-sm mb-1 ${getTextColor()}`}>
            {title}
          </p>
        )}
        {message && <p className={`text-sm ${getTextColor()}`}>{message}</p>}
      </div>

      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 p-1 rounded ${getButtonColor()}`}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Conteneur pour les toasts (position fixe en haut à droite)
 */
export const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] w-full max-w-md pointer-events-none px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default Toast;
