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
    <div className="export-btn-wrapper">
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
          <div className="export-backdrop" onClick={() => setShowMenu(false)} />

          <div className="export-dropdown animate-scale-in">
            <button
              onClick={() => handleExport('excel')}
              className="export-dropdown-item"
            >
              <FiTable size={16} style={{ color: '#10b981' }} />
              Export as Excel
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="export-dropdown-item"
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
