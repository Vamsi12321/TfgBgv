"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Enhanced Modal Component with Blue Theme
 * Provides consistent modal styling across the application
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = "",
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Backdrop */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Enhanced Modal Content */}
        <div
          className={`
            relative w-full ${sizes[size]} transform rounded-3xl 
            bg-white shadow-2xl transition-all duration-300 
            border border-blue-100 ${className}
          `}
          style={{
            boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
          }}
        >
          {/* Enhanced Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
              {title && (
                <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-blue-100 rounded-xl transition-all duration-200 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
                </button>
              )}
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Footer Component
 */
export function ModalFooter({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-end gap-3 p-6 border-t border-blue-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-3xl ${className}`}>
      {children}
    </div>
  );
}

/**
 * Confirmation Modal Component
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}) {
  const variants = {
    primary: "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
    danger: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    success: "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-3 rounded-xl bg-gradient-to-r ${variants[variant]} text-white font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 flex items-center gap-2`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}