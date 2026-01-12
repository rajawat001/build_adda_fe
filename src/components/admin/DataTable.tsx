import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  selectable?: boolean;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  selectable = false,
  onSelect,
  selectedIds = [],
  pagination,
  onSort,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort?.(columnKey, newDirection);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      onSelect?.([]);
    } else {
      onSelect?.(data.map(row => row._id || row.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect?.(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelect?.([...selectedIds, id]);
    }
  };

  const renderPaginationButtons = () => {
    if (!pagination) return null;

    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);
    const pages: number[] = [];

    // Show max 5 page buttons
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, 5);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages.map(pageNum => (
      <button
        key={pageNum}
        onClick={() => pagination.onPageChange(pageNum)}
        className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
      >
        {pageNum}
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="data-table-wrapper">
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  style={{ width: column.width, cursor: column.sortable ? 'pointer' : 'default' }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span>
                        {sortDirection === 'asc' ? (
                          <FiChevronUp size={14} />
                        ) : (
                          <FiChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '3rem' }}
                >
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-title">{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row._id || row.id)}
                        onChange={() => handleSelectRow(row._id || row.id)}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && data.length > 0 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <FiChevronLeft size={16} />
            </button>

            {renderPaginationButtons()}

            <button
              className="pagination-btn"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
