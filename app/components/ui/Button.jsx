"use client";

/**
 * Enhanced Button Component with Beautiful Gradients
 * Provides consistent styling across the TFG Reports application
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-blue-500 hover:shadow-xl hover:shadow-blue-200",
    secondary:
      "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 focus:ring-blue-500 hover:shadow-lg",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 hover:shadow-xl hover:shadow-emerald-200",
    warning:
      "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 focus:ring-orange-500 hover:shadow-xl hover:shadow-orange-200",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 hover:shadow-xl hover:shadow-red-200",
    outline:
      "bg-transparent text-gray-700 border-2 border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 focus:ring-gray-400",
    ghost: 
      "bg-transparent text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 focus:ring-blue-400",
    gradient:
      "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 focus:ring-indigo-500 hover:shadow-2xl",
    ai:
      "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:ring-purple-500 hover:shadow-xl hover:shadow-purple-200",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && Icon && iconPosition === "left" && <Icon size={20} />}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={20} />}
    </button>
  );
}
