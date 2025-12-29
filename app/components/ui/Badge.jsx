"use client";

/**
 * Enhanced Badge Component
 * Provides consistent badge styling for status indicators
 */
export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    primary: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200",
    success: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
    warning: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200",
    danger: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
    info: "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border border-cyan-200",
    gradient: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
