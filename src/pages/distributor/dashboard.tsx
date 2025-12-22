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
  orderStatus: string;
  createdAt: string;
}

interface DistributorProfile {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

const DistributorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<DistributorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null as File | null
  });

  const [profileForm, setProfileForm] = useState({
    businessName: '',
    phone: '',
    address: '',
    pincode: ''
  });

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, [activeTab]);

  const checkAuth = () => {
    // SECURITY FIX: Don't check localStorage for token - it's in httpOnly cookie
    // Just check if user role is stored for UI purposes
    const role = localStorage.getItem('role');

    if (role !== 'distributor') {
      router.push('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // SECURITY FIX: Don't manually add Authorization header
      // Browser automatically sends httpOnly cookie

      if (activeTab === 'dashboard') {
        const response = await api.get('/distributor/stats');
        setStats(response.data);
      } else if (activeTab === 'products') {
        const response = await api.get('/distributor/products');
        setProducts(response.data.products);
      } else if (activeTab === 'orders') {
        const response = await api.get('/distributor/orders');
        setOrders(response.data.orders);
      } else if (activeTab === 'profile') {
        const response = await api.get('/distributor/profile');
        setProfile(response.data.distributor);
        // Set profile form with current data
        setProfileForm({
          businessName: response.data.distributor.businessName,
          phone: response.data.distributor.phone,
          address: response.data.distributor.address,
          pincode: response.data.distributor.pincode
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
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
      // SECURITY FIX: Don't manually add Authorization header
      // Browser automatically sends httpOnly cookie
      await api.post('/distributor/products', formData, {
        headers: {
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
      // SECURITY FIX: Don't manually add Authorization header
      // Browser automatically sends httpOnly cookie
      await api.delete(`/distributor/products/${productId}`);
      
      alert('Product deleted successfully');
      fetchDashboardData();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // SECURITY FIX: Don't manually add Authorization header
      // Browser automatically sends httpOnly cookie
      await api.put(`/distributor/orders/${orderId}`, { orderStatus: newStatus });

      alert('Order status updated');
      fetchDashboardData();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.put('/distributor/profile', profileForm);

      alert('Profile updated successfully');
      setEditMode(false);
      fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setProfileForm({
        businessName: profile.businessName,
        phone: profile.phone,
        address: profile.address,
        pincode: profile.pincode
      });
    }
    setEditMode(false);
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
                    <p className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Orders</p>
                    <p className="stat-value">{stats.totalOrders || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Products</p>
                    <p className="stat-value">{stats.totalProducts || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-details">
                    <p className="stat-label">Pending Orders</p>
                    <p className="stat-value">{stats.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="charts-section">
                <div className="chart-card">
                  <h3>Revenue Trend</h3>
                  <div className="simple-chart">
                    {(stats.revenueData || []).map((data, index) => (
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
                    {(stats.orderData || []).map((data, index) => (
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
                    {(stats.stockData || []).filter(s => s.stock < 10).map((data, index) => (
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
              
              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No Products Yet</h3>
                    <p>Start adding products to your inventory</p>
                    <button onClick={() => setShowAddProduct(true)} className="btn-add">
                      + Add Your First Product
                    </button>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="product-card">
                      <div className="product-image-container">
                        <img
                          src={product.image || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="product-image"
                        />
                        <span className="product-category">{product.category}</span>
                        {product.stock < 10 && (
                          <span className={`stock-badge ${product.stock < 5 ? 'critical' : 'warning'}`}>
                            {product.stock < 5 ? '⚠️ Critical' : '⚡ Low Stock'}
                          </span>
                        )}
                      </div>

                      <div className="product-details">
                        <h3 className="product-name">{product.name}</h3>

                        <div className="product-info">
                          <div className="info-item">
                            <span className="info-label">Price</span>
                            <span className="info-value price">₹{product.price.toLocaleString()}</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Stock</span>
                            <span className={`info-value stock ${product.stock < 10 ? 'low' : ''}`}>
                              {product.stock} units
                            </span>
                          </div>
                        </div>

                        <div className="product-actions">
                          <button className="btn-edit" title="Edit Product">
                            <span className="btn-icon">✏️</span>
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteProduct(product._id)}
                            title="Delete Product"
                          >
                            <span className="btn-icon">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
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

          {activeTab === 'profile' && profile && (
            <div className="profile-content">
              <div className="content-header">
                <h1>My Profile</h1>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="btn-edit-profile">
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="profile-grid">
                {/* Account Status Card */}
                <div className="profile-card status-card">
                  <div className="card-header">
                    <h3>Account Status</h3>
                  </div>
                  <div className="card-body">
                    <div className="status-item">
                      <span className="status-label">Approval Status</span>
                      <span className={`status-badge ${profile.isApproved ? 'approved' : 'pending'}`}>
                        {profile.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Account Status</span>
                      <span className={`status-badge ${profile.isActive ? 'active' : 'inactive'}`}>
                        {profile.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Member Since</span>
                      <span className="status-value">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Business Information Card */}
                <div className="profile-card info-card">
                  <div className="card-header">
                    <h3>Business Information</h3>
                  </div>
                  <div className="card-body">
                    {editMode ? (
                      <form onSubmit={handleUpdateProfile} className="profile-form">
                        <div className="form-group">
                          <label>Business Name</label>
                          <input
                            type="text"
                            value={profileForm.businessName}
                            onChange={(e) => setProfileForm({...profileForm, businessName: e.target.value})}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="disabled-input"
                          />
                          <small className="input-note">Email cannot be changed</small>
                        </div>

                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Business Address</label>
                          <textarea
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                            rows={3}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Pincode</label>
                          <input
                            type="text"
                            value={profileForm.pincode}
                            onChange={(e) => setProfileForm({...profileForm, pincode: e.target.value})}
                            required
                          />
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn-save">
                            Save Changes
                          </button>
                          <button type="button" onClick={handleCancelEdit} className="btn-cancel">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="info-display">
                        <div className="info-row">
                          <span className="info-icon">🏢</span>
                          <div className="info-details">
                            <label>Business Name</label>
                            <p>{profile.businessName}</p>
                          </div>
                        </div>

                        <div className="info-row">
                          <span className="info-icon">📧</span>
                          <div className="info-details">
                            <label>Email Address</label>
                            <p>{profile.email}</p>
                          </div>
                        </div>

                        <div className="info-row">
                          <span className="info-icon">📞</span>
                          <div className="info-details">
                            <label>Phone Number</label>
                            <p>{profile.phone}</p>
                          </div>
                        </div>

                        <div className="info-row">
                          <span className="info-icon">📍</span>
                          <div className="info-details">
                            <label>Business Address</label>
                            <p>{profile.address}</p>
                          </div>
                        </div>

                        <div className="info-row">
                          <span className="info-icon">📮</span>
                          <div className="info-details">
                            <label>Pincode</label>
                            <p>{profile.pincode}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!profile.isApproved && (
                <div className="approval-notice">
                  <div className="notice-icon">ℹ️</div>
                  <div className="notice-content">
                    <h4>Approval Pending</h4>
                    <p>Your distributor account is currently under review. You will receive an email once your account is approved by our admin team.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DistributorDashboard;