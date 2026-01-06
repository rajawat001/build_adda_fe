import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]',
    error: 'bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error)]',
    info: 'bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info)]',
    purple: 'bg-purple-100 text-purple-700 border border-purple-300',
    pink: 'bg-pink-100 text-pink-700 border border-pink-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    default: 'bg-[var(--text-secondary)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    error: 'bg-[var(--error)]',
    info: 'bg-[var(--info)]',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`}></span>}
      {children}
    </span>
  );
};
