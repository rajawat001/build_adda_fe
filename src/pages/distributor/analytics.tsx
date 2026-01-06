import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Loading, Badge } from '../../components/ui';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
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
import { toast } from 'react-toastify';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
} from 'react-icons/fi';

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

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    trend: number[];
    labels: string[];
  };
  orders: {
    total: number;
    growth: number;
    byStatus: { status: string; count: number; percentage: number }[];
  };
  products: {
    total: number;
    topSelling: { id: number; name: string; sales: number; revenue: number }[];
    byCategory: { category: string; count: number; revenue: number }[];
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
}

const Analytics = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    fetchAnalytics(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [dateRange, customStartDate, customEndDate]);

  const fetchAnalytics = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      // Calculate date range
      let startDate, endDate;
      const now = new Date();

      switch (dateRange) {
        case '7days':
          startDate = subDays(now, 7);
          endDate = now;
          break;
        case '30days':
          startDate = subDays(now, 30);
          endDate = now;
          break;
        case '90days':
          startDate = subDays(now, 90);
          endDate = now;
          break;
        case 'thisMonth':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'thisYear':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        case 'custom':
          startDate = customStartDate ? new Date(customStartDate) : subDays(now, 30);
          endDate = customEndDate ? new Date(customEndDate) : now;
          break;
        default:
          startDate = subDays(now, 30);
          endDate = now;
      }

      // For demo purposes, generate mock data
      // In production, replace with actual API call
      const mockData: AnalyticsData = generateMockAnalytics(startDate, endDate);

      setAnalyticsData(mockData);
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        return;
      }
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = (startDate: Date, endDate: Date): AnalyticsData => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const labels = [];
    const revenue = [];

    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      labels.push(format(date, 'MMM dd'));
      revenue.push(Math.floor(Math.random() * 50000) + 20000);
    }

    return {
      revenue: {
        total: 2847650,
        growth: 12.5,
        trend: revenue,
        labels: labels,
      },
      orders: {
        total: 1543,
        growth: 8.3,
        byStatus: [
          { status: 'Completed', count: 892, percentage: 57.8 },
          { status: 'Processing', count: 324, percentage: 21.0 },
          { status: 'Pending', count: 231, percentage: 15.0 },
          { status: 'Cancelled', count: 96, percentage: 6.2 },
        ],
      },
      products: {
        total: 156,
        topSelling: [
          { id: 1, name: 'Premium Cement 50kg', sales: 1250, revenue: 625000 },
          { id: 2, name: 'Steel TMT Bars 12mm', sales: 980, revenue: 490000 },
          { id: 3, name: 'White Cement 50kg', sales: 856, revenue: 428000 },
          { id: 4, name: 'Construction Sand (per ton)', sales: 745, revenue: 372500 },
          { id: 5, name: 'Granite Tiles 60x60', sales: 623, revenue: 311500 },
        ],
        byCategory: [
          { category: 'Cement', count: 45, revenue: 1250000 },
          { category: 'Steel', count: 32, revenue: 980000 },
          { category: 'Tiles', count: 28, revenue: 856000 },
          { category: 'Sand & Aggregates', count: 21, revenue: 745000 },
          { category: 'Paint', count: 18, revenue: 623000 },
          { category: 'Others', count: 12, revenue: 392650 },
        ],
      },
      customers: {
        total: 428,
        new: 87,
        returning: 341,
      },
    };
  };

  const exportToExcel = () => {
    if (!analyticsData) return;

    const wb = XLSX.utils.book_new();

    // Revenue data
    const revenueData = [
      ['Date', 'Revenue'],
      ...analyticsData.revenue.labels.map((label, index) => [
        label,
        analyticsData.revenue.trend[index],
      ]),
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Revenue Trend');

    // Top products
    const productsData = [
      ['Product Name', 'Sales', 'Revenue'],
      ...analyticsData.products.topSelling.map(p => [p.name, p.sales, p.revenue]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Top Products');

    // Category performance
    const categoryData = [
      ['Category', 'Products', 'Revenue'],
      ...analyticsData.products.byCategory.map(c => [c.category, c.count, c.revenue]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Categories');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Analytics exported successfully!');
  };

  if (loading) {
    return (
      <DistributorLayout>
        <Loading fullScreen text="Loading analytics..." />
      </DistributorLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DistributorLayout>
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Failed to load analytics data</p>
        </div>
      </DistributorLayout>
    );
  }

  // Chart configurations
  const revenueChartData = {
    labels: analyticsData.revenue.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: analyticsData.revenue.trend,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
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
        callbacks: {
          label: (context: any) => `Revenue: ₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `₹${value.toLocaleString()}`,
        },
      },
    },
  };

  const orderStatusData = {
    labels: analyticsData.orders.byStatus.map(s => s.status),
    datasets: [
      {
        data: analyticsData.orders.byStatus.map(s => s.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const categoryRevenueData = {
    labels: analyticsData.products.byCategory.map(c => c.category),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: analyticsData.products.byCategory.map(c => c.revenue),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(237, 100, 166, 0.8)',
          'rgba(255, 154, 158, 0.8)',
          'rgba(250, 208, 196, 0.8)',
          'rgba(189, 224, 254, 0.8)',
        ],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Revenue: ₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `₹${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <DistributorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              <FiBarChart2 className="inline-block mr-2 mb-1" />
              Analytics & Insights
            </h1>
            <p className="text-[var(--text-secondary)]">
              Comprehensive analytics and performance metrics
            </p>
          </div>
          <Button onClick={exportToExcel} variant="primary" leftIcon={<FiDownload />}>
            Export Report
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <FiCalendar className="text-[var(--text-secondary)] text-xl" />
            <div className="flex flex-wrap gap-2">
              {['7days', '30days', '90days', 'thisMonth', 'thisYear', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dateRange === range
                      ? 'bg-[var(--primary-color)] text-white shadow-lg'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {range === '7days' && 'Last 7 Days'}
                  {range === '30days' && 'Last 30 Days'}
                  {range === '90days' && 'Last 90 Days'}
                  {range === 'thisMonth' && 'This Month'}
                  {range === 'thisYear' && 'This Year'}
                  {range === 'custom' && 'Custom Range'}
                </button>
              ))}
            </div>
            {dateRange === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
                <span className="text-[var(--text-secondary)]">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverable>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <FiDollarSign className="text-white text-2xl" />
              </div>
              {analyticsData.revenue.growth >= 0 ? (
                <Badge variant="success">
                  <FiTrendingUp className="inline mr-1" />
                  {analyticsData.revenue.growth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="error">
                  <FiTrendingDown className="inline mr-1" />
                  {Math.abs(analyticsData.revenue.growth).toFixed(1)}%
                </Badge>
              )}
            </div>
            <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              ₹{analyticsData.revenue.total.toLocaleString()}
            </p>
          </Card>

          <Card hoverable>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <FiShoppingCart className="text-white text-2xl" />
              </div>
              {analyticsData.orders.growth >= 0 ? (
                <Badge variant="success">
                  <FiTrendingUp className="inline mr-1" />
                  {analyticsData.orders.growth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="error">
                  <FiTrendingDown className="inline mr-1" />
                  {Math.abs(analyticsData.orders.growth).toFixed(1)}%
                </Badge>
              )}
            </div>
            <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {analyticsData.orders.total.toLocaleString()}
            </p>
          </Card>

          <Card hoverable>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <FiPackage className="text-white text-2xl" />
              </div>
              <Badge variant="info">Active</Badge>
            </div>
            <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Products</h3>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {analyticsData.products.total}
            </p>
          </Card>

          <Card hoverable>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <FiUsers className="text-white text-2xl" />
              </div>
              <Badge variant="warning">
                {analyticsData.customers.new} New
              </Badge>
            </div>
            <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Customers</h3>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {analyticsData.customers.total}
            </p>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
            <FiTrendingUp className="mr-2 text-green-500" />
            Revenue Trend
          </h2>
          <div style={{ height: '400px' }}>
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
              <FiPieChart className="mr-2 text-blue-500" />
              Order Status Distribution
            </h2>
            <div style={{ height: '300px' }} className="flex items-center justify-center">
              <Doughnut
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
            <div className="mt-6 space-y-2">
              {analyticsData.orders.byStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <span className="text-[var(--text-primary)] font-medium">{status.status}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--text-secondary)]">{status.count} orders</span>
                    <span className="text-[var(--text-primary)] font-semibold">{status.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Revenue */}
          <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
              <FiBarChart2 className="mr-2 text-purple-500" />
              Revenue by Category
            </h2>
            <div style={{ height: '300px' }}>
              <Bar data={categoryRevenueData} options={barChartOptions} />
            </div>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
            <FiPackage className="mr-2 text-orange-500" />
            Top Selling Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-semibold">Rank</th>
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-semibold">Product Name</th>
                  <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-semibold">Units Sold</th>
                  <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.products.topSelling.map((product, index) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[var(--text-primary)] font-medium">{product.name}</td>
                    <td className="py-4 px-4 text-right text-[var(--text-primary)]">{product.sales.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-[var(--text-primary)] font-semibold">
                      ₹{product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Category Performance */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Category Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.products.byCategory.map((category, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)] hover:shadow-lg transition-all"
              >
                <h3 className="text-[var(--text-primary)] font-semibold mb-2">{category.category}</h3>
                <div className="space-y-1">
                  <p className="text-[var(--text-secondary)] text-sm">
                    Products: <span className="text-[var(--text-primary)] font-medium">{category.count}</span>
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Revenue: <span className="text-[var(--text-primary)] font-semibold">₹{category.revenue.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DistributorLayout>
  );
};

export default Analytics;
