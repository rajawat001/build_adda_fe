import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import api  from '../../services/api';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalDistributors: number;
  totalProducts: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Distributor {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate: string;
  isActive: boolean;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const router = useRouter();

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    expiryDate: ''
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [activeTab]);

  const checkAuth = () => {
    // SECURITY FIX: Don't check localStorage for token - it's in httpOnly cookie
    // Just check if user role is stored for UI purposes
    const role = localStorage.getItem('role');

    if (role !== 'admin') {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      // SECURITY FIX: Don't manually add Authorization header
      // Browser automatically sends httpOnly cookie

      if (activeTab === 'dashboard') {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUsers(response.data.users);
      } else if (activeTab === 'distributors') {
        const response = await api.get('/admin/distributors');
        setDistributors(response.data.distributors);
      } else if (activeTab === 'coupons') {
        const response = await api.get('/admin/coupons');
        setCoupons(response.data.coupons);
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

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${userId}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('User status updated');
      fetchData();
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const handleVerifyDistributor = async (distributorId: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/distributors/${distributorId}/verify`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Distributor verified successfully');
      fetchData();
    } catch (error) {
      alert('Error verifying distributor');
    }
  };

  const handleToggleDistributorStatus = async (distributorId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/distributors/${distributorId}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Distributor status updated');
      fetchData();
    } catch (error) {
      alert('Error updating distributor status');
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/coupons', couponForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Coupon created successfully');
      setShowAddCoupon(false);
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        expiryDate: ''
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleToggleCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/coupons/${couponId}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Coupon status updated');
      fetchData();
    } catch (error) {
      alert('Error updating coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Coupon deleted successfully');
      fetchData();
    } catch (error) {
      alert('Error deleting coupon');
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
      <SEO title="Admin Dashboard" description="Manage platform" />
      
      <div className="admin-dashboard">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            
            <button 
              className={activeTab === 'distributors' ? 'active' : ''}
              onClick={() => setActiveTab('distributors')}
            >
              🏢 Distributors
            </button>
            
            <button 
              className={activeTab === 'coupons' ? 'active' : ''}
              onClick={() => setActiveTab('coupons')}
            >
              🎟️ Coupons
            </button>
            
            <button 
              className={activeTab === 'reports' ? 'active' : ''}
              onClick={() => setActiveTab('reports')}
            >
              📈 Reports
            </button>
            
            <button onClick={handleLogout} className="btn-logout">
              🚪 Logout
            </button>
          </nav>
        </aside>
        
        <main className="dashboard-main">
          {activeTab === 'dashboard' && stats && (
            <div className="dashboard-content">
              <h1>Platform Overview</h1>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Revenue</p>
                    <p className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orders">📦</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Orders</p>
                    <p className="stat-value">{stats.totalOrders || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon users">👥</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Users</p>
                    <p className="stat-value">{stats.totalUsers || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon distributors">🏢</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Distributors</p>
                    <p className="stat-value">{stats.totalDistributors || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon products">🏷️</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Products</p>
                    <p className="stat-value">{stats.totalProducts || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button onClick={() => setActiveTab('users')} className="action-btn">
                    Manage Users
                  </button>
                  <button onClick={() => setActiveTab('distributors')} className="action-btn">
                    Verify Distributors
                  </button>
                  <button onClick={() => setActiveTab('coupons')} className="action-btn">
                    Create Coupons
                  </button>
                  <button onClick={() => setActiveTab('reports')} className="action-btn">
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="users-content">
              <h1>Manage Users</h1>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className="role-badge">{user.role}</span></td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className={`btn-toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'distributors' && (
            <div className="distributors-content">
              <h1>Manage Distributors</h1>
              
              <div className="distributors-table">
                <table>
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Verified</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributors.map((distributor) => (
                      <tr key={distributor._id}>
                        <td>{distributor.businessName}</td>
                        <td>{distributor.email}</td>
                        <td>{distributor.phone}</td>
                        <td>
                          <span className={`verified-badge ${distributor.isVerified ? 'verified' : 'pending'}`}>
                            {distributor.isVerified ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${distributor.isActive ? 'active' : 'inactive'}`}>
                            {distributor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {!distributor.isVerified && (
                            <button 
                              className="btn-verify"
                              onClick={() => handleVerifyDistributor(distributor._id)}
                            >
                              Verify
                            </button>
                          )}
                          <button 
                            className={`btn-toggle ${distributor.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleDistributorStatus(distributor._id, distributor.isActive)}
                          >
                            {distributor.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'coupons' && (
            <div className="coupons-content">
              <div className="content-header">
                <h1>Manage Coupons</h1>
                <button onClick={() => setShowAddCoupon(!showAddCoupon)} className="btn-add">
                  {showAddCoupon ? 'Cancel' : '+ Create Coupon'}
                </button>
              </div>
              
              {showAddCoupon && (
                <form onSubmit={handleAddCoupon} className="add-coupon-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Coupon Code</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                        placeholder="e.g., SAVE20"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Discount Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Discount Value</label>
                      <input
                        type="number"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})}
                        placeholder={couponForm.discountType === 'percentage' ? '20' : '500'}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Minimum Purchase (₹)</label>
                      <input
                        type="number"
                        value={couponForm.minPurchase}
                        onChange={(e) => setCouponForm({...couponForm, minPurchase: e.target.value})}
                        placeholder="1000"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Max Discount (₹)</label>
                      <input
                        type="number"
                        value={couponForm.maxDiscount}
                        onChange={(e) => setCouponForm({...couponForm, maxDiscount: e.target.value})}
                        placeholder="500"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn-submit">Create Coupon</button>
                </form>
              )}
              
              <div className="coupons-table">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Min Purchase</th>
                      <th>Max Discount</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td><code>{coupon.code}</code></td>
                        <td>{coupon.discountType}</td>
                        <td>
                          {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}%` 
                            : `₹${coupon.discountValue}`}
                        </td>
                        <td>₹{coupon.minPurchase}</td>
                        <td>₹{coupon.maxDiscount}</td>
                        <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-toggle"
                            onClick={() => handleToggleCoupon(coupon._id, coupon.isActive)}
                          >
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteCoupon(coupon._id)}
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
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;