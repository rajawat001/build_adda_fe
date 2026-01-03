import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
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
  const [filter, setFilter] = useState({
    category: '',
    search: '',
    isActive: 'all'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/distributor/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/distributor/products/${productId}`);
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(filter.search.toLowerCase());
    const matchesCategory = !filter.category || product.category === filter.category;
    const matchesActive =
      filter.isActive === 'all' ||
      (filter.isActive === 'active' && product.isActive) ||
      (filter.isActive === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesActive;
  });

  return (
    <DistributorLayout title="Products">
      <div className="products-page">
        <div className="page-header">
          <h1>Products Management</h1>
          <button
            className="btn-primary"
            onClick={() => router.push('/distributor/product-form')}
          >
            + Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />

          <select
            className="filter-select"
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
            className="filter-select"
            value={filter.isActive}
            onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>Start by adding your first product</p>
            <button
              className="btn-primary"
              onClick={() => router.push('/distributor/product-form')}
            >
              + Add Product
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.image || '/placeholder-product.jpg'} alt={product.name} />
                  {!product.isActive && <div className="inactive-overlay">Inactive</div>}
                  {product.stock < 10 && (
                    <span className={`stock-badge ${product.stock < 5 ? 'critical' : 'warning'}`}>
                      {product.stock < 5 ? '⚠️ Critical' : '⚡ Low Stock'}
                    </span>
                  )}
                </div>

                <div className="product-content">
                  <span className="category-tag">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>

                  <div className="product-info">
                    <div className="info-row">
                      <span className="label">Price:</span>
                      <span className="value">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Stock:</span>
                      <span className={`value ${product.stock < 10 ? 'low-stock' : ''}`}>
                        {product.stock} {product.unit || 'units'}
                      </span>
                    </div>
                    {product.minQuantity && (
                      <div className="info-row">
                        <span className="label">Min Qty:</span>
                        <span className="value">{product.minQuantity}</span>
                      </div>
                    )}
                    {product.maxQuantity && (
                      <div className="info-row">
                        <span className="label">Max Qty:</span>
                        <span className="value">{product.maxQuantity}</span>
                      </div>
                    )}
                  </div>

                  {product.acceptedPaymentMethods && (
                    <div className="payment-methods">
                      {product.acceptedPaymentMethods.map((method) => (
                        <span key={method} className="payment-badge">
                          {method === 'COD' ? '💵 COD' : '💳 Online'}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="product-actions">
                    <button
                      className="btn-edit"
                      onClick={() =>
                        router.push(`/distributor/product-form?id=${product._id}`)
                      }
                    >
                      ✏️ Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .products-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-input,
        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
        }

        .filter-select {
          min-width: 150px;
        }

        .search-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: #f7fafc;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .inactive-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .stock-badge.warning {
          background: rgba(237, 137, 54, 0.9);
          color: white;
        }

        .stock-badge.critical {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .product-content {
          padding: 20px;
        }

        .category-tag {
          display: inline-block;
          background: #edf2f7;
          color: #4a5568;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .product-content h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 8px 0;
        }

        .description {
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .info-row .label {
          color: #718096;
        }

        .info-row .value {
          font-weight: 600;
          color: #1a202c;
        }

        .info-row .value.low-stock {
          color: #dc2626;
        }

        .payment-methods {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .payment-badge {
          padding: 4px 10px;
          background: #e6fffa;
          color: #065f46;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-actions {
          display: flex;
          gap: 10px;
        }

        .btn-edit,
        .btn-delete {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit {
          background: #edf2f7;
          color: #2d3748;
        }

        .btn-edit:hover {
          background: #e2e8f0;
        }

        .btn-delete {
          background: #fff5f5;
          color: #c53030;
        }

        .btn-delete:hover {
          background: #fed7d7;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 24px;
          color: #1a202c;
          margin: 0 0 10px 0;
        }

        .empty-state p {
          color: #718096;
          margin: 0 0 24px 0;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #718096;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .filters {
            flex-direction: column;
          }

          .search-input,
          .filter-select {
            width: 100%;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default Products;
