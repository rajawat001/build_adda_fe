import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import api  from '../../services/api';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  revenueData: { month: string; revenue: number }[];
  orderData: { status: string; count: number }[];
  stockData: { product: string; stock: number }[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

const DistributorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null as File | null
  });

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, [activeTab]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'distributor') {
      router.push('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'dashboard') {
        const response = await api.get('/distributor/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } else if (activeTab === 'products') {
        const response = await api.get('/distributor/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data.products);
      } else if (activeTab === 'orders') {
        const response = await api.get('/distributor/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('stock', productForm.stock);
    if (productForm.image) {
      formData.append('image', productForm.image);
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/distributor/products', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Product added successfully');
      setShowAddProduct(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null
      });
      fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/distributor/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Product deleted successfully');
      fetchDashboardData();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/distributor/orders/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Order status updated');
      fetchDashboardData();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <>
      <SEO title="Distributor Dashboard" description="Manage your products and orders" />
      
      <div className="distributor-dashboard">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Distributor Panel</h2>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            
            <button 
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Orders
            </button>
            
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            
            <button onClick={handleLogout} className="btn-logout">
              🚪 Logout
            </button>
          </nav>
        </aside>
        
        <main className="dashboard-main">
          {activeTab === 'dashboard' && stats && (
            <div className="dashboard-content">
              <h1>Dashboard Overview</h1>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Revenue</p>
                    <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Orders</p>
                    <p className="stat-value">{stats.totalOrders}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Products</p>
                    <p className="stat-value">{stats.totalProducts}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-details">
                    <p className="stat-label">Pending Orders</p>
                    <p className="stat-value">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="charts-section">
                <div className="chart-card">
                  <h3>Revenue Trend</h3>
                  <div className="simple-chart">
                    {stats.revenueData.map((data, index) => (
                      <div key={index} className="chart-bar">
                        <div className="bar-label">{data.month}</div>
                        <div 
                          className="bar-fill"
                          style={{ 
                            height: `${(data.revenue / Math.max(...stats.revenueData.map(d => d.revenue))) * 100}%` 
                          }}
                        />
                        <div className="bar-value">₹{data.revenue}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Order Status Distribution</h3>
                  <div className="status-list">
                    {stats.orderData.map((data, index) => (
                      <div key={index} className="status-item">
                        <span className="status-label">{data.status}</span>
                        <span className="status-count">{data.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Low Stock Alert</h3>
                  <div className="stock-list">
                    {stats.stockData.filter(s => s.stock < 10).map((data, index) => (
                      <div key={index} className="stock-item">
                        <span className="stock-product">{data.product}</span>
                        <span className={`stock-value ${data.stock < 5 ? 'critical' : 'warning'}`}>
                          {data.stock} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'products' && (
            <div className="products-content">
              <div className="content-header">
                <h1>Manage Products</h1>
                <button onClick={() => setShowAddProduct(!showAddProduct)} className="btn-add">
                  {showAddProduct ? 'Cancel' : '+ Add Product'}
                </button>
              </div>
              
              {showAddProduct && (
                <form onSubmit={handleAddProduct} className="add-product-form">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="cement">Cement</option>
                        <option value="bricks">Bricks</option>
                        <option value="steel">Steel</option>
                        <option value="sand">Sand</option>
                        <option value="paint">Paint</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProductForm({...productForm, image: e.target.files?.[0] || null})}
                    />
                  </div>
                  
                  <button type="submit" className="btn-submit">Add Product</button>
                </form>
              )}
              
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td><img src={product.image} alt={product.name} className="product-thumb" /></td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>₹{product.price}</td>
                        <td className={product.stock < 10 ? 'low-stock' : ''}>{product.stock}</td>
                        <td>
                          <button className="btn-edit">Edit</button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="orders-content">
              <h1>Manage Orders</h1>
              
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.user.name}</td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-view">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DistributorDashboard;