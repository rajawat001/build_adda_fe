import React, { useState } from 'react';
import { FiDownload, FiFileText, FiTable } from 'react-icons/fi';

interface ExportButtonProps {
  onExport: (format: 'csv' | 'excel') => Promise<void>;
  label?: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  label = 'Export',
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isExporting}
      >
        {isExporting ? (
          <>
            <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
            Exporting...
          </>
        ) : (
          <>
            <FiDownload size={16} />
            {label}
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10
            }}
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown Menu */}
          <div
            className="animate-scale-in"
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--admin-border-primary)',
              minWidth: '180px',
              zIndex: 20,
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => handleExport('excel')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--admin-text-primary)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiTable size={16} style={{ color: '#10b981' }} />
              Export as Excel
            </button>

            <button
              onClick={() => handleExport('csv')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--admin-text-primary)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiFileText size={16} style={{ color: '#3b82f6' }} />
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
