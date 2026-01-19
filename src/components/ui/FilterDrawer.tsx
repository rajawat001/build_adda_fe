import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';

interface FilterDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when the drawer should close */
  onClose: () => void;
  /** Callback when filters are applied */
  onApply?: () => void;
  /** Callback when filters are reset */
  onReset?: () => void;
  /** Filter form content */
  children: ReactNode;
  /** Number of active filters */
  activeFiltersCount?: number;
  /** Title for the drawer */
  title?: string;
  /** Show apply button */
  showApplyButton?: boolean;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  activeFiltersCount = 0,
  title = 'Filters',
  showApplyButton = true,
}) => {
  const handleApply = () => {
    onApply?.();
    onClose();
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--bg-card,#ffffff)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-[var(--border-primary,#e5e7eb)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiFilter className="w-5 h-5 text-[var(--text-secondary)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary,#1a202c)]">
                  {title}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg hover:bg-[var(--bg-hover,#f3f4f6)] transition-colors"
                aria-label="Close filters"
              >
                <FiX className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {children}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-4 border-t border-[var(--border-primary,#e5e7eb)] bg-[var(--bg-tertiary,#f9fafb)]"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
            >
              <div className="flex gap-3">
                {onReset && (
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--border-primary,#e5e7eb)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-hover,#f3f4f6)] transition-colors"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                )}
                {showApplyButton && (
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-colors"
                  >
                    Apply Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Filter button component to toggle the filter drawer
 */
interface FilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
  label?: string;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  activeFiltersCount = 0,
  label = 'Filters',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl
        border border-[var(--border-primary,#e5e7eb)]
        bg-[var(--bg-card,#ffffff)] text-[var(--text-primary,#1a202c)]
        hover:bg-[var(--bg-hover,#f3f4f6)] transition-colors
        min-h-tap font-medium
        ${className}
      `}
    >
      <FiFilter className="w-4 h-4" />
      <span>{label}</span>
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full">
          {activeFiltersCount}
        </span>
      )}
    </button>
  );
};

/**
 * Filter section component for grouping filters
 */
interface FilterSectionProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full mb-3
          ${collapsible ? 'cursor-pointer' : 'cursor-default'}
        `}
        disabled={!collapsible}
      >
        <h4 className="text-sm font-semibold text-[var(--text-primary,#1a202c)] uppercase tracking-wide">
          {title}
        </h4>
        {collapsible && (
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="w-4 h-4 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Filter checkbox component
 */
interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  label,
  checked,
  onChange,
  count,
}) => {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer group">
      <div
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
          ${checked
            ? 'bg-primary border-primary'
            : 'border-gray-300 group-hover:border-primary'
          }
        `}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="flex-1 text-[var(--text-primary,#1a202c)]">{label}</span>
      {count !== undefined && (
        <span className="text-sm text-[var(--text-secondary)]">({count})</span>
      )}
    </label>
  );
};

/**
 * Filter radio group component
 */
interface FilterRadioOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterRadioGroupProps {
  options: FilterRadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export const FilterRadioGroup: React.FC<FilterRadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
}) => {
  return (
    <div className="space-y-1">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 py-2 cursor-pointer group">
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
              ${value === option.value
                ? 'border-primary'
                : 'border-gray-300 group-hover:border-primary'
              }
            `}
          >
            {value === option.value && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="flex-1 text-[var(--text-primary,#1a202c)]">{option.label}</span>
          {option.count !== undefined && (
            <span className="text-sm text-[var(--text-secondary)]">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  );
};

export default FilterDrawer;
