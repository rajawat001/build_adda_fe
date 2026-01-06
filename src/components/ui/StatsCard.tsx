import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'red';
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  subtitle,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
  };

  const iconBgColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-primary)] relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      style={{ opacity: 0, animation: 'fadeIn 0.3s ease-in-out forwards' }}
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">{value}</h3>
            {subtitle && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBgColors[color]}`}>
            {icon}
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
              }`}
            >
              {trend.isPositive ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};
