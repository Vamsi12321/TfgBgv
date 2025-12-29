"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

/**
 * Enhanced Toast Component with Blue Theme
 */
export default function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
  position = "top-right",
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const types = {
    success: {
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bg: "from-green-50 to-emerald-50",
      border: "border-green-200",
      text: "text-green-800",
    },
    error: {
      icon: XCircle,
      gradient: "from-red-500 to-red-600",
      bg: "from-red-50 to-pink-50",
      border: "border-red-200",
      text: "text-red-800",
    },
    warning: {
      icon: AlertCircle,
      gradient: "from-yellow-500 to-orange-500",
      bg: "from-yellow-50 to-orange-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
    },
    info: {
      icon: Info,
      gradient: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      text: "text-blue-800",
    },
  };

  const config = types[type];
  const Icon = config.icon;

  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  };

  return (
    <div
      className={`
        fixed z-50 ${positions[position]}
        ${isExiting ? "animate-out slide-out-to-right" : "animate-in slide-in-from-right"}
        transition-all duration-300
      `}
    >
      <div
        className={`
          flex items-center gap-3 p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-sm
          bg-gradient-to-r ${config.bg} ${config.border}
          max-w-md min-w-[300px]
        `}
        style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Icon */}
        <div className={`p-2 rounded-xl bg-gradient-to-r ${config.gradient} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className={`font-medium ${config.text} leading-relaxed`}>{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Container for managing multiple toasts
 */
export function ToastContainer({ toasts = [] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}