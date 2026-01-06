import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import OrderNotifications from '../../components/distributor/OrderNotifications';
import { StatsCard, Card, Loading, Button } from '../../components/ui';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/distributor/stats');
      setStats(response.data.stats || response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DistributorLayout title="Dashboard">
        <Loading fullScreen text="Loading dashboard..." />
      </DistributorLayout>
    );
  }

  if (!stats) {
    return (
      <DistributorLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center py-20">
          <FiAlertCircle className="w-16 h-16 text-[var(--error)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Failed to Load Data</h3>
          <p className="text-[var(--text-secondary)] mb-6">Unable to fetch dashboard statistics</p>
          <Button onClick={fetchStats} leftIcon={<FiRefreshCw />}>
            Retry
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  // Chart configurations
  const revenueChartData = {
    labels: stats.revenueData.map((d) => d.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats.revenueData.map((d) => d.revenue),
        fill: true,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(102, 126, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function (context: any) {
            return `Revenue: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'var(--text-secondary)',
        },
      },
      y: {
        grid: {
          color: 'var(--border-primary)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          callback: function (value: any) {
            return '₹' + value.toLocaleString('en-IN');
          },
        },
      },
    },
  };

  const orderStatusChartData = {
    labels: stats.orderData.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1)),
    datasets: [
      {
        data: stats.orderData.map((d) => d.count),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(102, 126, 234)',
          'rgb(118, 75, 162)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const orderStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'var(--text-primary)',
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
  };

  const stockChartData = {
    labels: stats.stockData.map((d) => d.product),
    datasets: [
      {
        label: 'Stock Units',
        data: stats.stockData.map((d) => d.stock),
        backgroundColor: stats.stockData.map((d) =>
          d.stock < 5
            ? 'rgba(239, 68, 68, 0.8)'
            : d.stock < 10
            ? 'rgba(245, 158, 11, 0.8)'
            : 'rgba(16, 185, 129, 0.8)'
        ),
        borderColor: stats.stockData.map((d) =>
          d.stock < 5 ? 'rgb(239, 68, 68)' : d.stock < 10 ? 'rgb(245, 158, 11)' : 'rgb(16, 185, 129)'
        ),
        borderWidth: 2,
      },
    ],
  };

  const stockChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'var(--border-primary)',
        },
        ticks: {
          color: 'var(--text-secondary)',
        },
      },
    },
  };

  // Calculate trends (mock data for demonstration)
  const revenueTrend = { value: 12.5, isPositive: true };
  const ordersTrend = { value: 8.3, isPositive: true };
  const productsTrend = { value: 3.2, isPositive: false };
  const pendingTrend = { value: 5.1, isPositive: false };

  return (
    <DistributorLayout title="Dashboard">
      <OrderNotifications onNewOrder={fetchStats} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <Button onClick={fetchStats} variant="secondary" leftIcon={<FiRefreshCw />}>
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            icon={<FiDollarSign className="w-6 h-6" />}
            color="green"
            trend={revenueTrend}
            subtitle="Total earnings"
          />
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FiShoppingCart className="w-6 h-6" />}
            color="blue"
            trend={ordersTrend}
            subtitle="All time orders"
          />
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<FiPackage className="w-6 h-6" />}
            color="orange"
            trend={productsTrend}
            subtitle="Active products"
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<FiClock className="w-6 h-6" />}
            color="purple"
            trend={pendingTrend}
            subtitle="Needs approval"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <Card
            title="Revenue Trend"
            subtitle="Monthly revenue over time"
            headerAction={
              <Button variant="ghost" size="sm" leftIcon={<FiTrendingUp />}>
                View Report
              </Button>
            }
          >
            <div style={{ height: '300px' }}>
              <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
          </Card>

          {/* Order Status Distribution */}
          <Card title="Order Status Distribution" subtitle="Breakdown of all orders by status">
            <div style={{ height: '300px' }}>
              <Doughnut data={orderStatusChartData} options={orderStatusChartOptions} />
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Low Stock Alert */}
          <Card
            title="Low Stock Alert"
            subtitle={`${stats.stockData.length} products need attention`}
            className="lg:col-span-2"
          >
            {stats.stockData.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Bar data={stockChartData} options={stockChartOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FiPackage className="w-12 h-12 text-[var(--success)] mb-3" />
                <p className="text-[var(--text-secondary)]">All products are well stocked!</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" subtitle="Manage your store">
            <div className="space-y-3">
              <Button
                fullWidth
                variant="primary"
                onClick={() => router.push('/distributor/products')}
                leftIcon={<FiPackage />}
              >
                Manage Products
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push('/distributor/orders')}
                leftIcon={<FiShoppingCart />}
              >
                View Orders
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push('/distributor/product-form')}
                leftIcon={<FiPackage />}
              >
                Add New Product
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)] mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)]">New order received</p>
                    <p className="text-xs text-[var(--text-tertiary)]">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--info)] mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)]">Product updated</p>
                    <p className="text-xs text-[var(--text-tertiary)]">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--warning)] mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)]">Low stock alert</p>
                    <p className="text-xs text-[var(--text-tertiary)]">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DistributorLayout>
  );
};

export default Dashboard;
