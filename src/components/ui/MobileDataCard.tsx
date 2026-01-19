import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DataField<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
}

interface CardAction<T> {
  icon: ReactNode;
  label: string;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

interface MobileDataCardProps<T> {
  /** The data object for this card */
  data: T;
  /** Key for the primary/title field */
  primaryField: keyof T;
  /** Optional key for secondary/subtitle field */
  secondaryField?: keyof T;
  /** Optional key for status badge field */
  statusField?: keyof T;
  /** Array of fields to display */
  fields: DataField<T>[];
  /** Array of action buttons */
  actions?: CardAction<T>[];
  /** Callback when card is clicked */
  onClick?: (row: T) => void;
  /** Whether the card is selectable */
  selectable?: boolean;
  /** Whether the card is selected */
  selected?: boolean;
  /** Callback when selection changes */
  onSelect?: (row: T) => void;
  /** Custom render for primary field */
  renderPrimary?: (value: any, row: T) => ReactNode;
  /** Custom render for status badge */
  renderStatus?: (value: any, row: T) => ReactNode;
  /** Animation delay for staggered animation */
  animationDelay?: number;
}

export function MobileDataCard<T extends Record<string, any>>({
  data,
  primaryField,
  secondaryField,
  statusField,
  fields,
  actions,
  onClick,
  selectable,
  selected,
  onSelect,
  renderPrimary,
  renderStatus,
  animationDelay = 0,
}: MobileDataCardProps<T>) {
  const primaryValue = data[primaryField];
  const secondaryValue = secondaryField ? data[secondaryField] : null;
  const statusValue = statusField ? data[statusField] : null;

  const handleCardClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(data);
    }
  };

  const getActionButtonClass = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50';
      case 'success':
        return 'text-green-600 hover:bg-green-50';
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50';
      default:
        return 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animationDelay }}
      className={`
        bg-[var(--bg-card,#ffffff)] rounded-xl border border-[var(--border-primary,#e5e7eb)]
        shadow-sm overflow-hidden
        ${onClick ? 'cursor-pointer active:bg-[var(--bg-hover,#f3f4f6)]' : ''}
        ${selected ? 'ring-2 ring-primary border-primary' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Header Row */}
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Checkbox */}
        {selectable && (
          <button
            onClick={handleSelectClick}
            className="mt-0.5 flex-shrink-0"
          >
            <div
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${selected
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 hover:border-primary'
                }
              `}
            >
              {selected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        )}

        {/* Primary Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--text-primary,#1a202c)] truncate">
                {renderPrimary ? renderPrimary(primaryValue, data) : String(primaryValue)}
              </h3>
              {secondaryValue && (
                <p className="text-sm text-[var(--text-secondary,#6b7280)] truncate mt-0.5">
                  {String(secondaryValue)}
                </p>
              )}
            </div>

            {/* Status Badge */}
            {statusValue && (
              <div className="flex-shrink-0">
                {renderStatus ? (
                  renderStatus(statusValue, data)
                ) : (
                  <StatusBadge status={String(statusValue)} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <div className="px-4 py-3 border-t border-[var(--border-primary,#e5e7eb)] space-y-2">
          {fields.map((field) => {
            const value = data[field.key];
            return (
              <div key={String(field.key)} className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary,#6b7280)]">{field.label}</span>
                <span className="font-medium text-[var(--text-primary,#1a202c)]">
                  {field.render ? field.render(value, data) : String(value ?? '-')}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="px-4 py-3 border-t border-[var(--border-primary,#e5e7eb)] flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(data);
              }}
              disabled={action.disabled}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-colors min-h-tap
                ${getActionButtonClass(action.variant)}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Default status badge component
 */
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
  const getVariantFromStatus = (status: string): string => {
    const s = status.toLowerCase();
    if (['approved', 'active', 'completed', 'delivered', 'success', 'paid'].includes(s)) {
      return 'success';
    }
    if (['pending', 'processing', 'in_progress', 'waiting'].includes(s)) {
      return 'warning';
    }
    if (['rejected', 'cancelled', 'failed', 'inactive', 'expired'].includes(s)) {
      return 'danger';
    }
    return 'default';
  };

  const v = variant || getVariantFromStatus(status);

  const variantClasses: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variantClasses[v]}`}>
      {status}
    </span>
  );
};

/**
 * Mobile Data Card List wrapper with loading and empty states
 */
interface MobileDataCardListProps<T> {
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  children: (item: T, index: number) => ReactNode;
}

export function MobileDataCardList<T>({
  data,
  isLoading,
  emptyMessage = 'No data found',
  emptyIcon,
  children,
}: MobileDataCardListProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] p-4 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-primary)] space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon || (
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
        <p className="text-[var(--text-secondary)] text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => children(item, index))}
    </div>
  );
}

export default MobileDataCard;
