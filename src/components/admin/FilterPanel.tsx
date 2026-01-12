import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'daterange' | 'text' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onApply: (filters: Record<string, any>) => void;
  onClear?: () => void;
  activeFilters?: Record<string, any>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onApply,
  onClear,
  activeFilters = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear?.();
    setIsExpanded(false);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] !== '' && activeFilters[key] !== null && activeFilters[key] !== undefined
  ).length;

  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            className="form-select"
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            <option value="">All</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            className="form-input"
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );

      case 'daterange':
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="date"
              className="form-input"
              placeholder="From"
              value={localFilters[`${filter.key}_from`] || ''}
              onChange={(e) => handleFilterChange(`${filter.key}_from`, e.target.value)}
            />
            <input
              type="date"
              className="form-input"
              placeholder="To"
              value={localFilters[`${filter.key}_to`] || ''}
              onChange={(e) => handleFilterChange(`${filter.key}_to`, e.target.value)}
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-input"
            placeholder={filter.placeholder}
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            className="form-input"
            placeholder={filter.placeholder}
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiFilter />
          <h3 className="filter-title">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="badge purple">{activeFilterCount} active</span>
          )}
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="animate-fade-in-up">
          <div className="filter-grid">
            {filters.map(filter => (
              <div key={filter.key} className="form-group">
                <label className="form-label">{filter.label}</label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>
              Clear All
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleApply}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="filter-chips">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === '') return null;

            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            return (
              <div key={key} className="filter-chip">
                <span>{filter.label}: {value}</span>
                <div
                  className="filter-chip-remove"
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters[key];
                    onApply(newFilters);
                  }}
                >
                  <FiX size={12} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
