import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiTrash2, FiDownload } from 'react-icons/fi';

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  onClick: () => void;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  actions,
  onClear
}) => {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '400px',
          border: '1px solid var(--admin-border-primary)'
        }}
      >
        {/* Selected Count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          paddingRight: '1rem',
          borderRight: '1px solid var(--admin-border-primary)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--admin-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}>
            {selectedCount}
          </div>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--admin-text-primary)'
          }}>
            {selectedCount} selected
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`btn btn-${action.variant || 'secondary'} btn-sm`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        <button
          onClick={onClear}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--admin-bg-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: 'var(--admin-text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--admin-bg-tertiary)';
            e.currentTarget.style.color = 'var(--admin-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--admin-bg-secondary)';
            e.currentTarget.style.color = 'var(--admin-text-secondary)';
          }}
        >
          <FiX size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActionBar;
