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
                    ? "text-[#ff004f] font-medium"
                    : ""
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </nav>
      )}

      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* 🔥 Title color updated here */}
          <h1 className="text-3xl font-bold text-[#ff004f] mb-2">
            {title}
          </h1>

          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent"></div>
    </div>
  );
}
