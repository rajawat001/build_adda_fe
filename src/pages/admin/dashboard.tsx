import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiTruck,
  FiPackage,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalDistributors: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  pendingApprovals: number;
  trends: {
    revenue: number;
    orders: number;
    users: number;
    distributors: number;
  };
  revenueData?: {
    labels: string[];
    data: number[];
  };
  orderStatusData?: {
    labels: string[];
    data: number[];
  };
  categoryData?: {
    labels: string[];
    data: number[];
  };
}

interface ActivityLog {
  _id: string;
  adminName: string;
  action: string;
  entity: string;
  description: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsResponse, analyticsResponse, activityResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/analytics/dashboard').catch((err) => {
          console.error('Analytics API error:', err);
          return { data: { success: false } };
        }),
        api.get('/admin/activity-logs?limit=10').catch(() => ({ data: { success: false, logs: [] } }))
      ]);

      console.log('Dashboard API Responses:', {
        stats: statsResponse.data,
        analytics: analyticsResponse.data,
        activity: activityResponse.data
      });

      // Extract real stats from response
      const realStats = statsResponse.data.stats || statsResponse.data;

      // Use analytics data if available, otherwise use defaults
      // Handle both response structures: analytics.analytics or analytics.stats
      const analytics = analyticsResponse?.data?.success
        ? (analyticsResponse.data.analytics || analyticsResponse.data.stats || {})
        : {};

      setStats({
        ...realStats,
        pendingOrders: analytics?.pendingOrders || 0,
        lowStockProducts: analytics?.lowStockProducts || 0,
        pendingApprovals: analytics?.pendingApprovals || 0,
        trends: analytics?.trends || {
          revenue: 0,
          orders: 0,
          users: 0,
          distributors: 0
        },
        revenueData: analytics?.revenueData || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [0, 0, 0, 0, 0, 0]
        },
        orderStatusData: analytics?.orderStatusData || {
          labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
          data: [0, 0, 0, 0, 0]
        },
        categoryData: analytics?.categoryData || {
          labels: ['Cement', 'Steel', 'Bricks', 'Sand', 'Paint'],
          data: [0, 0, 0, 0, 0]
        }
      });

      // Set real activity logs
      if (activityResponse.data.success && activityResponse.data.logs) {
        const formattedLogs = activityResponse.data.logs.map((log: any) => ({
          _id: log._id,
          adminName: log.admin?.name || 'Admin',
          action: log.action,
          entity: log.entity,
          description: `${log.action} ${log.entity} ${log.entityId || ''}`.trim(),
          createdAt: log.timestamp || log.createdAt
        }));
        setActivityLogs(formattedLogs);
      } else {
        setActivityLogs([]);
      }

      // Fallback mock logs if API is not ready (temporary)
      const fallbackMockActivityLogs: ActivityLog[] = [
        {
          _id: '1',
          adminName: 'Admin User',
          action: 'approve',
          entity: 'distributor',
          description: 'Approved distributor "ABC Materials"',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          adminName: 'Admin User',
          action: 'update',
          entity: 'user',
          description: 'Updated user "John Doe"',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '3',
          adminName: 'Admin User',
          action: 'create',
          entity: 'coupon',
          description: 'Created coupon "SAVE20"',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      // Only use fallback if no real logs were fetched
      if (activityLogs.length === 0) {
        setActivityLogs(fallbackMockActivityLogs);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartData = {
    labels: stats?.revenueData?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.revenueData?.data || [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const orderStatusChartData = {
    labels: stats?.orderStatusData?.labels || [],
    datasets: [
      {
        data: stats?.orderStatusData?.data || [],
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#667eea',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 0
      }
    ]
  };

  const categoryChartData = {
    labels: stats?.categoryData?.labels || [],
    datasets: [
      {
        label: 'Sales by Category',
        data: stats?.categoryData?.data || [],
        backgroundColor: '#667eea',
        borderRadius: 6
      }
    ]
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          icon={FiDollarSign}
          trend={{ value: stats?.trends.revenue || 0, isPositive: true }}
          subtitle="vs last month"
          variant="revenue"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={FiShoppingCart}
          trend={{ value: stats?.trends.orders || 0, isPositive: true }}
          subtitle="vs last month"
          variant="orders"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={FiUsers}
          trend={{ value: stats?.trends.users || 0, isPositive: true }}
          subtitle="vs last month"
          variant="users"
        />
        <StatCard
          title="Active Distributors"
          value={stats?.totalDistributors || 0}
          icon={FiTruck}
          trend={{ value: stats?.trends.distributors || 0, isPositive: true }}
          subtitle={`${stats?.pendingApprovals || 0} pending approval`}
          variant="distributors"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="admin-stat-grid">
        <div className="stat-card products">
          <div className="stat-card-header">
            <div className="stat-card-icon products">
              <FiPackage />
            </div>
          </div>
          <div className="stat-card-title">Total Products</div>
          <div className="stat-card-value">{stats?.totalProducts || 0}</div>
          <div className="stat-card-footer">
            <span className="stat-subtitle">{stats?.lowStockProducts || 0} low stock items</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-card-header">
            <div className="stat-card-icon orders">
              <FiClock />
            </div>
          </div>
          <div className="stat-card-title">Pending Orders</div>
          <div className="stat-card-value">{stats?.pendingOrders || 0}</div>
          <div className="stat-card-footer">
            <span className="stat-subtitle">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue Trend</h3>
              <p className="chart-subtitle">Last 6 months performance</p>
            </div>
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Order Status</h3>
              <p className="chart-subtitle">Current order distribution</p>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={orderStatusChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Category Performance</h3>
            <p className="chart-subtitle">Sales by product category</p>
          </div>
        </div>
        <div className="chart-container">
          <Bar data={categoryChartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="data-table-wrapper">
        <div className="table-header">
          <h3 className="table-title">Recent Activity</h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {activityLogs.map((log) => (
            <div key={log._id} className="admin-activity-item">
              <div className="admin-activity-avatar">
                {log.action === 'approve' && <FiCheckCircle />}
                {log.action === 'update' && <FiTrendingUp />}
                {log.action === 'create' && <FiPackage />}
                {!['approve', 'update', 'create'].includes(log.action) && <FiAlertCircle />}
              </div>
              <div className="admin-activity-content">
                <p>{log.description}</p>
                <p>by {log.adminName} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
