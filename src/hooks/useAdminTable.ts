import { useState, useCallback } from 'react';

/**
 * Reusable confirm dialog state hook for admin pages.
 * Extracts the repeated confirm dialog pattern found across all admin management pages.
 */
export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', variant: 'danger', onConfirm: () => {} });

  const showConfirm = useCallback((opts: { title: string; message: string; variant?: 'danger' | 'warning' | 'info'; onConfirm: () => void }) => {
    setConfirmDialog({ isOpen: true, ...opts, variant: opts.variant || 'danger' });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { confirmDialog, showConfirm, hideConfirm };
}

/**
 * Reusable table state hook for admin pages.
 * Extracts the repeated pagination/filter/search/selection state pattern.
 */
export function useTableState(defaultItemsPerPage = 10) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const resetPage = useCallback(() => setCurrentPage(1), []);
  const clearSelection = useCallback(() => setSelectedItems([]), []);
  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  return {
    searchTerm, setSearchTerm,
    filters, setFilters,
    currentPage, setCurrentPage,
    totalPages, setTotalPages,
    totalItems, setTotalItems,
    itemsPerPage, setItemsPerPage,
    selectedItems, setSelectedItems,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    resetPage, clearSelection, toggleItem
  };
}
