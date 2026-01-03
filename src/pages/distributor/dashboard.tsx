import { useState, useEffect } from 'react';
import DistributorLayout from '../../components/distributor/Layout';
import api from '../../services/api';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueData: { month: string; revenue: number }[];
  orderData: { status: string; count: number }[];
  stockData: { product: string; stock: number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/distributor/stats');
      setStats(response.data.stats || response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DistributorLayout title="Dashboard">
        <div className="loading">Loading dashboard...</div>
      </DistributorLayout>
    );
  }

  if (!stats) {
    return (
      <DistributorLayout title="Dashboard">
        <div className="error">Failed to load dashboard data</div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Dashboard">
      <div className="dashboard">
        <h1>Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="stat-card orders">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card products">
            <div className="stat-icon">🏷️</div>
            <div className="stat-content">
              <h3>Total Products</h3>
              <p className="stat-value">{stats.totalProducts}</p>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Orders</h3>
              <p className="stat-value">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Order Status Breakdown */}
          <div className="chart-card">
            <h3>Order Status</h3>
            <div className="order-status-list">
              {stats.orderData.map((item, index) => (
                <div key={index} className="status-item">
                  <span className="status-label">{item.status}</span>
                  <div className="status-bar">
                    <div
                      className="status-fill"
                      style={{
                        width: `${(item.count / stats.totalOrders) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="status-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="chart-card">
            <h3>Low Stock Alert</h3>
            {stats.stockData.length > 0 ? (
              <div className="stock-list">
                {stats.stockData.map((item, index) => (
                  <div key={index} className="stock-item">
                    <span className="product-name">{item.product}</span>
                    <span className={`stock-badge ${item.stock < 5 ? 'critical' : 'warning'}`}>
                      {item.stock} units
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">All products are well stocked!</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          font-size: 48px;
          margin-right: 20px;
        }

        .stat-content h3 {
          font-size: 14px;
          color: #718096;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .stat-card.revenue {
          border-left: 4px solid #48bb78;
        }

        .stat-card.orders {
          border-left: 4px solid #4299e1;
        }

        .stat-card.products {
          border-left: 4px solid #ed8936;
        }

        .stat-card.pending {
          border-left: 4px solid #ecc94b;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .chart-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 20px 0;
        }

        .order-status-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .status-item {
          display: grid;
          grid-template-columns: 120px 1fr 60px;
          align-items: center;
          gap: 12px;
        }

        .status-label {
          font-size: 14px;
          color: #4a5568;
          text-transform: capitalize;
        }

        .status-bar {
          background: #e2e8f0;
          height: 24px;
          border-radius: 12px;
          overflow: hidden;
        }

        .status-fill {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          height: 100%;
          transition: width 0.3s ease;
        }

        .status-count {
          font-weight: 600;
          color: #1a202c;
          text-align: right;
        }

        .stock-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stock-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .product-name {
          font-size: 14px;
          color: #2d3748;
          font-weight: 500;
        }

        .stock-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .stock-badge.warning {
          background: #fef5e7;
          color: #d97706;
        }

        .stock-badge.critical {
          background: #fee;
          color: #dc2626;
        }

        .no-data {
          text-align: center;
          color: #718096;
          padding: 40px;
        }

        .loading,
        .error {
          text-align: center;
          padding: 60px;
          font-size: 18px;
          color: #718096;
        }

        @media (max-width: 768px) {
          .dashboard h1 {
            font-size: 24px;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default Dashboard;
