import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPackage, FiGrid, FiList, FiTrash2, FiEdit, FiEye, FiAlertCircle, FiTrendingUp, FiDollarSign, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import BulkActionBar, { BulkAction } from '../../components/admin/BulkActionBar';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  realPrice: number;
  stockQuantity: number;
  stock: number;
  category?: {
    _id: string;
    name: string;
  };
  distributor: {
    _id: string;
    businessName: string;
  };
  images: string[];
  isActive: boolean;
  sales?: number;
  createdAt: string;
}

interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  trend: number;
}

const ProductsManagement: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    trend: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {}
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: 0,
    mrp: 0,
    stockQuantity: 0,
    isActive: true
  });

  useEffect(() => {
    if (router.isReady && router.query.search) {
      setSearchTerm(router.query.search as string);
    }
  }, [router.isReady, router.query.search]);

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [currentPage, filters, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...filters
      });

      const response = await api.get(`/admin/products?${queryParams}`);
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalItems(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/products/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        search: searchTerm,
        ...filters
      });

      const response = await api.get(`/admin/products/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Products',
      message: `Are you sure you want to permanently delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete('/admin/products/bulk-delete', {
            data: { productIds: selectedProducts }
          });

          await fetchProducts();
          await fetchStats();
          setSelectedProducts([]);
        } catch (error) {
          console.error('Bulk delete failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="badge red">Out of Stock</span>;
    } else if (stock < 10) {
      return <span className="badge orange">Low Stock ({stock})</span>;
    }
    return <span className="badge green">In Stock ({stock})</span>;
  };

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, row: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            background: row.images && row.images.length > 0 ? `url(${row.images[0]})` : 'var(--admin-bg-secondary)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid var(--admin-border-primary)'
          }} />
          <div>
            <div style={{ fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
              {row.distributor.businessName}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => value ? (
        <span className="badge purple">{typeof value === 'string' ? value : value.name}</span>
      ) : (
        <span style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.875rem' }}>Uncategorized</span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value, row: Product) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--admin-success)' }}>
            ₹{value.toLocaleString('en-IN')}
          </div>
          {row.mrp > value && (
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', textDecoration: 'line-through' }}>
              ₹{row.mrp.toLocaleString('en-IN')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'stockQuantity',
      label: 'Stock',
      sortable: true,
      render: (value) => getStockBadge(value)
    },
    {
      key: 'sales',
      label: 'Sales',
      sortable: true,
      render: (value) => (
        <span style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>
          {value?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`badge ${value ? 'green' : 'red'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
          {new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Product) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="View Product"
            onClick={() => handleViewProduct(row._id)}
          >
            <FiEye size={16} />
          </button>
          <button
            className="btn-icon"
            title="Edit Product"
            onClick={() => handleEditProduct(row._id)}
          >
            <FiEdit size={16} />
          </button>
          <button
            className="btn-icon danger"
            title="Delete Product"
            onClick={() => handleDeleteProduct(row._id)}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: 'Product Name',
      type: 'text',
      placeholder: 'Search by product name...'
    },
    {
      key: 'distributor',
      label: 'Distributor Name',
      type: 'text',
      placeholder: 'Search by distributor name...'
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'Cement', label: 'Cement' },
        { value: 'Steel', label: 'Steel' },
        { value: 'Bricks', label: 'Bricks' },
        { value: 'Sand', label: 'Sand' },
        { value: 'Paint', label: 'Paint' },
        { value: 'Tiles', label: 'Tiles' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'stock',
      label: 'Stock Level',
      type: 'select',
      options: [
        { value: 'instock', label: 'In Stock' },
        { value: 'lowstock', label: 'Low Stock' },
        { value: 'outofstock', label: 'Out of Stock' }
      ]
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      type: 'text',
      placeholder: 'e.g., 100-1000'
    }
  ];

  const bulkActions: BulkAction[] = [
    {
      label: 'Delete',
      icon: <FiTrash2 size={16} />,
      variant: 'danger',
      onClick: handleBulkDelete
    }
  ];

  const handleViewProduct = (productId: string) => {
    window.open(`/product/${productId}`, '_blank');
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setEditFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        mrp: product.realPrice || product.mrp || 0,
        stockQuantity: product.stock || product.stockQuantity || 0,
        isActive: product.isActive ?? true
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/products/${selectedProduct._id}`, editFormData);
      await fetchProducts();
      await fetchStats();
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Update product failed:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/products/${productId}`);

          await fetchProducts();
          await fetchStats();
        } catch (error) {
          console.error('Delete failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const GridView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem'
    }}>
      {products.map((product) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="product-card"
          style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--admin-border-primary)',
            transition: 'all 0.3s'
          }}
        >
          {/* Product Image */}
          <div style={{
            height: '200px',
            background: product.images && product.images.length > 0 ? `url(${product.images[0]})` : 'var(--admin-bg-secondary)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            {getStockBadge(product.stockQuantity)}
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                checked={selectedProducts.includes(product._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts([...selectedProducts, product._id]);
                  } else {
                    setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                  }
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
              {product.name}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.75rem' }}>
              {product.distributor.businessName}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--admin-success)' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                {product.mrp > product.price && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', textDecoration: 'line-through' }}>
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
              {product.category && (
                <span className="badge purple">{typeof product.category === 'string' ? product.category : product.category.name}</span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleViewProduct(product._id)}
              >
                <FiEye size={14} />
                View
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleEditProduct(product._id)}
              >
                <FiEdit size={14} />
                Edit
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Products Management" requiredPermission="products.view">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Products Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage all products, inventory, and categories
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowImportModal(true)}
              >
                <FiUpload size={16} />
                Import Products
              </button>
              <ExportButton onExport={handleExport} label="Export Products" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Products"
              value={stats.total.toLocaleString()}
              icon={FiPackage}
              variant="products"
              trend={{ value: stats.trend, isPositive: stats.trend > 0 }}
              subtitle="All listed products"
            />
            <StatCard
              title="Active Products"
              value={stats.active.toLocaleString()}
              icon={FiTrendingUp}
              variant="orders"
              subtitle="Currently available"
            />
            <StatCard
              title="Low Stock"
              value={stats.lowStock.toLocaleString()}
              icon={FiAlertCircle}
              variant="distributors"
              subtitle="Needs restocking"
            />
            <StatCard
              title="Out of Stock"
              value={stats.outOfStock.toLocaleString()}
              icon={FiAlertCircle}
              variant="users"
              subtitle="Not available"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--admin-bg-secondary)', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('list')}
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <FiList size={16} />
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <FiGrid size={16} />
              Grid
            </button>
          </div>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filterOptions}
          onApply={setFilters}
          onClear={() => setFilters({})}
          activeFilters={filters}
        />

        {/* Data Display */}
        {viewMode === 'list' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DataTable
              columns={columns}
              data={products}
              loading={loading}
              selectable
              selectedIds={selectedProducts}
              onSelect={setSelectedProducts}
              pagination={{
                page: currentPage,
                limit: 20,
                total: totalItems,
                onPageChange: setCurrentPage,
              }}
            />
          </motion.div>
        ) : (
          <GridView />
        )}

        {/* Bulk Actions Bar */}
        <BulkActionBar
          selectedCount={selectedProducts.length}
          actions={bulkActions}
          onClear={() => setSelectedProducts([])}
        />

        {/* Edit Product Modal */}
        <AnimatePresence>
          {showEditModal && selectedProduct && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Edit Product</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateProduct}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    {/* Product Image Preview */}
                    {selectedProduct.images && selectedProduct.images.length > 0 && (
                      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid var(--admin-border-primary)'
                          }}
                        />
                      </div>
                    )}

                    {/* Distributor Info */}
                    <div style={{
                      background: 'var(--admin-bg-secondary)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--admin-text-secondary)' }}>Distributor: </span>
                      <span style={{ color: 'var(--admin-text-primary)', fontWeight: 500 }}>
                        {selectedProduct.distributor.businessName}
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Enter product description"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Selling Price (₹) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={editFormData.price}
                          onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">MRP (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={editFormData.mrp}
                          onChange={(e) => setEditFormData({ ...editFormData, mrp: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={editFormData.stockQuantity}
                        onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: parseInt(e.target.value) || 0 })}
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editFormData.isActive}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Active (visible to customers)</span>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;