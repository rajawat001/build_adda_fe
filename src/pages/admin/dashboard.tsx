import { useState, useEffect } from 'react';
import '../../utils/chartSetup';
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
  FiCheckCircle,
  FiDelete,
  FiLogIn,
  FiLogOut,
  FiSend,
  FiUpload,
  FiDownload
} from 'react-icons/fi';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface DashboardStats {
  totalRevenue: number;
  commissionRevenue: number;
  subscriptionRevenue: number;
  totalCombinedRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalDistributors: number;
  totalProducts: number;
  totalSales: number;
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

const actionIconMap: Record<string, React.ReactElement> = {
  create: <FiPackage />,
  update: <FiTrendingUp />,
  delete: <FiDelete />,
  approve: <FiCheckCircle />,
  reject: <FiAlertCircle />,
  activate: <FiCheckCircle />,
  deactivate: <FiAlertCircle />,
  login: <FiLogIn />,
  logout: <FiLogOut />,
  send_email: <FiSend />,
  export: <FiDownload />,
  import: <FiUpload />,
  bulk_action: <FiPackage />
};

const getActionIcon = (action: string) => {
  return actionIconMap[action] || <FiAlertCircle />;
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    approve: 'Approved',
    reject: 'Rejected',
    activate: 'Activated',
    deactivate: 'Deactivated',
    login: 'Logged in',
    logout: 'Logged out',
    send_email: 'Sent email',
    export: 'Exported',
    import: 'Imported',
    bulk_action: 'Bulk action'
  };
  return labels[action] || action;
};

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
          return { data: null };
        }),
        api.get('/admin/activity-logs?limit=10').catch(() => ({ data: null }))
      ]);

      // Interceptor unwraps standardized format; fallback for non-standard responses
      const realStats = statsResponse.data?.stats || statsResponse.data || {};

      // Use analytics data if available, otherwise use defaults
      const analyticsData = analyticsResponse?.data;
      const analytics = analyticsData?.analytics || analyticsData?.stats || analyticsData || {};

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

      // Set real activity logs from API
      // Interceptor unwraps: data = { logs: [...] } or fallback
      const logsData = activityResponse.data;
      const rawLogs = logsData?.logs || [];
      if (rawLogs.length > 0) {
        const formattedLogs = rawLogs.map((log: any) => ({
          _id: log._id,
          adminName: log.admin?.name || log.adminName || 'Admin',
          action: log.action,
          entity: log.entity,
          description: log.description || `${getActionLabel(log.action)} ${log.entity}${log.entityId ? ` #${log.entityId}` : ''}`,
          createdAt: log.timestamp || log.createdAt
        }));
        setActivityLogs(formattedLogs);
      } else {
        setActivityLogs([]);
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
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Stat Cards */}
      <div className="stat-cards-grid">
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

      {/* Revenue & Sales Cards Row */}
      <div className="admin-stat-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '2rem' }}>
        {/* Revenue Breakdown Card */}
        <div className="chart-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}>
              <FiDollarSign />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>Revenue Overview</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>Commission + Subscription</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Commission Revenue */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              background: '#f0fdf4',
              borderRadius: '10px',
              borderLeft: '4px solid #10b981'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Commission Revenue</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
                ₹{(stats?.commissionRevenue || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Subscription Revenue */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              background: '#eff6ff',
              borderRadius: '10px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Subscription Revenue</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>
                ₹{(stats?.subscriptionRevenue || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Total Combined Revenue */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              color: 'white'
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Total Revenue</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                ₹{(stats?.totalCombinedRevenue || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Total Sales Card */}
        <div className="chart-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}>
              <FiCheckCircle />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>Total Sales</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>Delivered orders by distributors</p>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1e40af', lineHeight: 1 }}>
              {(stats?.totalSales || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: 500 }}>
              Orders Delivered
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>{stats?.pendingOrders || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Pending</div>
            </div>
            <div style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.75rem',
              background: '#fce7f3',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9d174d' }}>{stats?.lowStockProducts || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#9d174d' }}>Low Stock</div>
            </div>
            <div style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.75rem',
              background: '#dbeafe',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e40af' }}>{stats?.totalProducts || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>Products</div>
            </div>
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

      {/* Recent Activity - Real Data */}
      <div className="data-table-wrapper">
        <div className="table-header">
          <h3 className="table-title">Recent Activity</h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log._id} className="admin-activity-item">
                <div className="admin-activity-avatar">
                  {getActionIcon(log.action)}
                </div>
                <div className="admin-activity-content">
                  <p>{log.description}</p>
                  <p>by {log.adminName} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <FiClock style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No recent activity</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Activity logs will appear here as actions are performed</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
