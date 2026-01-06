import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  hoverable = false,
  gradient = false,
  glass = false,
  onClick,
}) => {
  const baseStyles = 'rounded-xl border border-[var(--border-primary)] transition-all duration-300';
  const backgroundStyles = glass
    ? 'glass-effect'
    : gradient
    ? 'gradient-bg text-white'
    : 'bg-[var(--bg-card)]';
  const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${backgroundStyles} ${hoverStyles} ${className}`}
      style={{ opacity: 0, animation: 'fadeIn 0.3s ease-in-out forwards' }}
      onClick={onClick}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
          <div>
            {title && (
              <h3 className={`text-lg font-semibold ${gradient ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm mt-1 ${gradient ? 'text-white opacity-80' : 'text-[var(--text-secondary)]'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};
