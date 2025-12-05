"use client";

/**
 * Enterprise-level Stats Card Component
 * Used for displaying key metrics on dashboards
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  subtitle,
}) {
  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:scale-105 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Gradient Background Effect */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-15 transition-opacity duration-500"
        style={{ backgroundColor: color }}
      />

      {/* Accent Line */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
            <h3 className="text-3xl font-black text-gray-900">{value}</h3>
          </div>

          {Icon && (
            <div
              className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={20} style={{ color }} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{trend === "up" ? "↑" : "↓"}</span>
              <span>{trendValue}</span>
            </div>
          )}

          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${color}20`,
        }}
      />
    </div>
  );
}
