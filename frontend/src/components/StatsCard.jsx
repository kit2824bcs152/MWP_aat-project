import React from 'react';

export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  badgeText,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  borderColor = 'border-slate-100',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border ${borderColor} card-shadow card-hover transition relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {value !== undefined ? value : '—'}
          </h4>
        </div>
        <div className={`p-3 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
        <span>{subtitle || 'Updated in real-time'}</span>
        {badgeText && (
          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
