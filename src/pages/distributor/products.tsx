import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Badge, Modal, EmptyState, Loading } from '../../components/ui';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiGrid,
  FiList,
  FiDownload,
  FiPackage,
  FiFilter,
  FiSearch,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  unit?: string;
  minQuantity?: number;
  maxQuantity?: number;
  acceptedPaymentMethods?: string[];
  isActive: boolean;
}

const Products = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    category: '',
    search: '',
    isActive: 'all',
    stockLevel: 'all',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/distributor/products');
      setProducts(response.data.products || []);
      toast.success('Products loaded successfully');
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/distributor/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedProducts).map((id) => api.delete(`/distributor/products/${id}`))
      );
      toast.success(`${selectedProducts.size} products deleted successfully`);
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete products');
    }
  };

  const handleExport = () => {
    const exportData = filteredProducts.map((p) => ({
      Name: p.name,
      Category: p.category,
      Price: p.price,
      Stock: p.stock,
      Unit: p.unit || '-',
      'Min Quantity': p.minQuantity || '-',
      'Max Quantity': p.maxQuantity || '-',
      Status: p.isActive ? 'Active' : 'Inactive',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Products exported successfully');
  };

  const toggleSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p._id)));
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(filter.search.toLowerCase());
    const matchesCategory = !filter.category || product.category === filter.category;
    const matchesActive =
      filter.isActive === 'all' ||
      (filter.isActive === 'active' && product.isActive) ||
      (filter.isActive === 'inactive' && !product.isActive);
    const matchesStock =
      filter.stockLevel === 'all' ||
      (filter.stockLevel === 'low' && product.stock < 10) ||
      (filter.stockLevel === 'out' && product.stock === 0);

    return matchesSearch && matchesCategory && matchesActive && matchesStock;
  });

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative"
    >
      <Card hoverable className="h-full">
        {/* Selection Checkbox */}
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={selectedProducts.has(product._id)}
            onChange={() => toggleSelection(product._id)}
            className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
        </div>

        {/* Product Image */}
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <img
            src={product.image || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {!product.isActive && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-semibold">Inactive</span>
            </div>
          )}
          {product.stock < 10 && (
            <div className="absolute top-3 right-3">
              <Badge variant={product.stock < 5 ? 'error' : 'warning'} dot>
                {product.stock < 5 ? 'Critical' : 'Low Stock'}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Content */}
        <div className="p-4 space-y-3">
          <div>
            <Badge variant="default" size="sm" className="mb-2">
              {product.category}
            </Badge>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{product.name}</h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{product.description}</p>
          </div>

          <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Price:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Stock:</span>
              <span className={`font-semibold ${product.stock < 10 ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
                {product.stock} {product.unit || 'units'}
              </span>
            </div>
            {product.minQuantity && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Min/Max:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {product.minQuantity} - {product.maxQuantity || '∞'}
                </span>
              </div>
            )}
          </div>

          {product.acceptedPaymentMethods && product.acceptedPaymentMethods.length > 0 && (
            <div className="flex gap-2">
              {product.acceptedPaymentMethods.map((method) => (
                <Badge key={method} variant="info" size="sm">
                  {method}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leftIcon={<FiEdit />}
              onClick={() => router.push(`/distributor/product-form?id=${product._id}`)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              leftIcon={<FiTrash2 />}
              onClick={() => {
                setProductToDelete(product._id);
                setShowDeleteModal(true);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <DistributorLayout title="Products">
        <Loading fullScreen text="Loading products..." />
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Products Management</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your product catalog</p>
          </div>
          <Button onClick={() => router.push('/distributor/product-form')} leftIcon={<FiPlus />}>
            Add New Product
          </Button>
        </div>

        {/* Filters & Actions Bar */}
        <Card>
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>

              <select
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Cement">Cement</option>
                <option value="Steel">Steel</option>
                <option value="Bricks">Bricks</option>
                <option value="Sand">Sand</option>
                <option value="Paint">Paint</option>
                <option value="Tiles">Tiles</option>
                <option value="Other">Other</option>
              </select>

              <select
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={filter.isActive}
                onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={filter.stockLevel}
                onChange={(e) => setFilter({ ...filter, stockLevel: e.target.value })}
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  {selectedProducts.size > 0
                    ? `${selectedProducts.size} selected`
                    : `${filteredProducts.length} products`}
                </span>
                {selectedProducts.size > 0 && (
                  <Button variant="danger" size="sm" leftIcon={<FiTrash2 />} onClick={handleBulkDelete}>
                    Delete Selected
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" leftIcon={<FiDownload />} onClick={handleExport}>
                  Export
                </Button>
                <div className="flex gap-1 border border-[var(--border-primary)] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)]'}`}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)]'}`}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<FiPackage className="w-20 h-20" />}
            title="No Products Found"
            description="Start by adding your first product or adjust your filters"
            action={{
              label: 'Add Product',
              onClick: () => router.push('/distributor/product-form'),
            }}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
          title="Confirm Delete"
          footer={
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => productToDelete && handleDelete(productToDelete)}
                leftIcon={<FiTrash2 />}
              >
                Delete
              </Button>
            </div>
          }
        >
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
        </Modal>
      </div>
    </DistributorLayout>
  );
};

export default Products;
