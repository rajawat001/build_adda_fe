import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import OrderNotifications from '../../components/distributor/OrderNotifications';
import { StatsCard, Card, Loading, Button } from '../../components/ui';
import { useIsMobile } from '../../hooks';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
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
  const router = useRouter();
  const isMobile = useIsMobile();
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
          <FiAlertCircle className="w-12 h-12 md:w-16 md:h-16 text-[var(--error)] mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-2">Failed to Load Data</h3>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 text-center px-4">Unable to fetch dashboard statistics</p>
          <Button onClick={fetchStats} leftIcon={<FiRefreshCw />}>
            Retry
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  // Chart configurations - responsive
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
        pointRadius: isMobile ? 3 : 4,
        pointHoverRadius: isMobile ? 5 : 6,
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
        titleFont: { size: isMobile ? 12 : 14 },
        bodyFont: { size: isMobile ? 11 : 13 },
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
          font: { size: isMobile ? 10 : 12 },
          maxRotation: isMobile ? 45 : 0,
          maxTicksLimit: isMobile ? 5 : 12,
        },
      },
      y: {
        grid: {
          color: 'var(--border-primary)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: isMobile ? 10 : 12 },
          callback: function (value: any) {
            if (isMobile) {
              return '₹' + (value / 1000).toFixed(0) + 'K';
            }
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
        position: isMobile ? ('bottom' as const) : ('right' as const),
        labels: {
          color: 'var(--text-primary)',
          padding: isMobile ? 10 : 15,
          font: { size: isMobile ? 10 : 12 },
          boxWidth: isMobile ? 12 : 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: isMobile ? 12 : 14 },
        bodyFont: { size: isMobile ? 11 : 13 },
      },
    },
  };

  const stockChartData = {
    labels: stats.stockData.map((d) => isMobile && d.product.length > 10 ? d.product.slice(0, 10) + '...' : d.product),
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
        titleFont: { size: isMobile ? 12 : 14 },
        bodyFont: { size: isMobile ? 11 : 13 },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: isMobile ? 9 : 11 },
          maxRotation: isMobile ? 45 : 0,
        },
      },
      y: {
        grid: {
          color: 'var(--border-primary)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: isMobile ? 10 : 12 },
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
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <Button
            onClick={fetchStats}
            variant="secondary"
            leftIcon={<FiRefreshCw />}
            size={isMobile ? 'sm' : 'md'}
          >
            Refresh
          </Button>
        </div>

        {/* Stats Cards - 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatsCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            icon={<FiDollarSign className="w-5 h-5 md:w-6 md:h-6" />}
            color="green"
            trend={revenueTrend}
            subtitle="Total earnings"
          />
          <StatsCard
            title="Orders"
            value={stats.totalOrders}
            icon={<FiShoppingCart className="w-5 h-5 md:w-6 md:h-6" />}
            color="blue"
            trend={ordersTrend}
            subtitle="All time"
          />
          <StatsCard
            title="Products"
            value={stats.totalProducts}
            icon={<FiPackage className="w-5 h-5 md:w-6 md:h-6" />}
            color="orange"
            trend={productsTrend}
            subtitle="Active"
          />
          <StatsCard
            title="Pending"
            value={stats.pendingOrders}
            icon={<FiClock className="w-5 h-5 md:w-6 md:h-6" />}
            color="purple"
            trend={pendingTrend}
            subtitle="Needs approval"
          />
        </div>

        {/* Quick Actions - Mobile Only at Top */}
        {isMobile && (
          <Card className="!p-3">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
              <button
                onClick={() => router.push('/distributor/products')}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                <FiPackage className="w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => router.push('/distributor/orders')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                <FiShoppingCart className="w-4 h-4" />
                Orders
              </button>
              <button
                onClick={() => router.push('/distributor/product-form')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                <FiPackage className="w-4 h-4" />
                Add Product
              </button>
              <button
                onClick={() => router.push('/distributor/analytics')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                <FiTrendingUp className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </Card>
        )}

        {/* Charts Row 1 - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Revenue Trend Chart */}
          <Card
            title="Revenue Trend"
            subtitle="Monthly revenue over time"
            headerAction={
              !isMobile && (
                <Button variant="ghost" size="sm" leftIcon={<FiTrendingUp />}>
                  View Report
                </Button>
              )
            }
          >
            <div style={{ height: isMobile ? '200px' : '300px' }}>
              <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
            {isMobile && (
              <button
                onClick={() => router.push('/distributor/analytics')}
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 text-sm text-primary font-medium"
              >
                View Full Report
                <FiChevronRight className="w-4 h-4" />
              </button>
            )}
          </Card>

          {/* Order Status Distribution */}
          <Card title="Order Status" subtitle="Breakdown by status">
            <div style={{ height: isMobile ? '220px' : '300px' }}>
              <Doughnut data={orderStatusChartData} options={orderStatusChartOptions} />
            </div>
          </Card>
        </div>

        {/* Charts Row 2 - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Low Stock Alert */}
          <Card
            title="Low Stock Alert"
            subtitle={`${stats.stockData.length} products need attention`}
            className="lg:col-span-2"
          >
            {stats.stockData.length > 0 ? (
              <div style={{ height: isMobile ? '200px' : '300px' }}>
                <Bar data={stockChartData} options={stockChartOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <FiPackage className="w-10 h-10 md:w-12 md:h-12 text-[var(--success)] mb-3" />
                <p className="text-sm md:text-base text-[var(--text-secondary)]">All products are well stocked!</p>
              </div>
            )}
          </Card>

          {/* Quick Actions - Desktop Only */}
          {!isMobile && (
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
          )}
        </div>

        {/* Recent Activity - Mobile Only */}
        {isMobile && (
          <Card title="Recent Activity" className="!p-3">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="w-2 h-2 rounded-full bg-[var(--success)] mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">New order received</p>
                  <p className="text-xs text-[var(--text-tertiary)]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="w-2 h-2 rounded-full bg-[var(--info)] mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">Product updated</p>
                  <p className="text-xs text-[var(--text-tertiary)]">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="w-2 h-2 rounded-full bg-[var(--warning)] mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">Low stock alert</p>
                  <p className="text-xs text-[var(--text-tertiary)]">1 day ago</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </DistributorLayout>
  );
};

export default Dashboard;
