"use client";

/**
 * Enterprise-level Page Header Component
 * Consistent header across all pages
 */
export default function PageHeader({ title, subtitle, action, breadcrumbs }) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-gray-400">/</span>}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "text-blue-600 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                    : "hover:text-blue-600 transition-colors"
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </nav>
      )}

      {/* Enhanced Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Enhanced Title */}
          <h1 className="text-3xl font-black text-gray-900 mb-3 flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>

          {subtitle && (
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Enhanced Divider */}
      <div className="mt-8 h-px bg-gradient-to-r from-blue-400 via-indigo-500 via-purple-500 to-transparent shadow-sm"></div>
    </div>
  );
}
