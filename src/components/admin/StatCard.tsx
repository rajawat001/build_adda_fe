import React from 'react';
import { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'revenue' | 'orders' | 'users' | 'distributors' | 'products';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  variant = 'revenue'
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${variant}`}>
          <Icon />
        </div>
      </div>

      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>

      {(trend || subtitle) && (
        <div className="stat-card-footer">
          {trend && (
            <div className={`stat-trend ${trend.isPositive ? 'up' : 'down'}`}>
              {trend.isPositive ? (
                <FiTrendingUp size={14} />
              ) : (
                <FiTrendingDown size={14} />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
