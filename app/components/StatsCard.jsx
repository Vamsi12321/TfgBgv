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
    <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-blue-100 hover:shadow-2xl hover:scale-105 hover:border-indigo-200 transition-all duration-300 overflow-hidden">
      {/* Enhanced Gradient Background Effect */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${color}40, ${color}20)` 
        }}
      />

      {/* Enhanced Accent Line */}
      <div
        className="absolute top-0 left-0 w-2 h-full rounded-r-full transition-all duration-300 group-hover:w-3 shadow-lg"
        style={{ 
          background: `linear-gradient(to bottom, ${color}, ${color}80)` 
        }}
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
              className="p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `1px solid ${color}30`
              }}
            >
              <Icon size={22} style={{ color }} strokeWidth={2.5} />
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

      {/* Enhanced Hover Effect Border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 2px ${color}30, 0 0 20px ${color}20`,
        }}
      />
    </div>
  );
}
