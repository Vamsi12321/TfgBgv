"use client";

import { FileQuestion } from "lucide-react";

/**
 * Enterprise-level Empty State Component
 * Shows when no data is available
 */
export default function EmptyState({
  icon: Icon = FileQuestion,
  title = "No data available",
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Icon size={40} className="text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
