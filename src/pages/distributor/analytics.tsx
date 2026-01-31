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
import api from '../../services/api';
import { toast } from 'react-toastify';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useIsMobile } from '../../hooks';
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
  const isMobile = useIsMobile();
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

      const response = await api.get('/distributor/analytics', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        signal,
      });

      setAnalyticsData(response.data.analytics);
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
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-[var(--text-primary)] mb-1`}>
              {!isMobile && <FiBarChart2 className="inline-block mr-2 mb-1" />}
              {isMobile ? 'Analytics' : 'Analytics & Insights'}
            </h1>
            {!isMobile && (
              <p className="text-[var(--text-secondary)]">
                Comprehensive analytics and performance metrics
              </p>
            )}
          </div>
          <Button
            onClick={exportToExcel}
            variant="primary"
            leftIcon={<FiDownload />}
            className={isMobile ? 'w-full min-h-tap' : ''}
          >
            {isMobile ? 'Export' : 'Export Report'}
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className={isMobile ? 'p-3' : ''}>
          <div className={`${isMobile ? '' : 'flex flex-wrap items-center gap-4'}`}>
            {!isMobile && <FiCalendar className="text-[var(--text-secondary)] text-xl" />}
            {/* Horizontal scroll on mobile */}
            <div className={`${isMobile ? 'overflow-x-auto -mx-1 px-1 pb-2' : ''}`}>
              <div className={`flex gap-2 ${isMobile ? 'min-w-max' : 'flex-wrap'}`}>
                {['7days', '30days', '90days', 'thisMonth', 'thisYear', 'custom'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${isMobile ? 'min-h-tap text-sm' : ''} ${
                      dateRange === range
                        ? 'bg-[var(--primary-color)] text-white shadow-lg'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    {range === '7days' && '7 Days'}
                    {range === '30days' && '30 Days'}
                    {range === '90days' && '90 Days'}
                    {range === 'thisMonth' && 'Month'}
                    {range === 'thisYear' && 'Year'}
                    {range === 'custom' && 'Custom'}
                  </button>
                ))}
              </div>
            </div>
            {dateRange === 'custom' && (
              <div className={`flex gap-2 items-center ${isMobile ? 'mt-3 flex-col' : ''}`}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] ${isMobile ? 'w-full min-h-tap' : ''}`}
                />
                {!isMobile && <span className="text-[var(--text-secondary)]">to</span>}
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] ${isMobile ? 'w-full min-h-tap' : ''}`}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card hoverable className={isMobile ? 'p-3' : ''}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-br from-green-500 to-green-600 rounded-lg`}>
                <FiDollarSign className={`text-white ${isMobile ? 'text-lg' : 'text-2xl'}`} />
              </div>
              {analyticsData.revenue.growth >= 0 ? (
                <Badge variant="success" size={isMobile ? 'sm' : 'md'}>
                  <FiTrendingUp className="inline mr-1" />
                  {analyticsData.revenue.growth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="error" size={isMobile ? 'sm' : 'md'}>
                  <FiTrendingDown className="inline mr-1" />
                  {Math.abs(analyticsData.revenue.growth).toFixed(1)}%
                </Badge>
              )}
            </div>
            <h3 className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1`}>
              {isMobile ? 'Revenue' : 'Total Revenue'}
            </h3>
            <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>
              ₹{isMobile ? (analyticsData.revenue.total / 100000).toFixed(1) + 'L' : analyticsData.revenue.total.toLocaleString()}
            </p>
          </Card>

          <Card hoverable className={isMobile ? 'p-3' : ''}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg`}>
                <FiShoppingCart className={`text-white ${isMobile ? 'text-lg' : 'text-2xl'}`} />
              </div>
              {analyticsData.orders.growth >= 0 ? (
                <Badge variant="success" size={isMobile ? 'sm' : 'md'}>
                  <FiTrendingUp className="inline mr-1" />
                  {analyticsData.orders.growth.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="error" size={isMobile ? 'sm' : 'md'}>
                  <FiTrendingDown className="inline mr-1" />
                  {Math.abs(analyticsData.orders.growth).toFixed(1)}%
                </Badge>
              )}
            </div>
            <h3 className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1`}>
              {isMobile ? 'Orders' : 'Total Orders'}
            </h3>
            <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>
              {analyticsData.orders.total.toLocaleString()}
            </p>
          </Card>

          <Card hoverable className={isMobile ? 'p-3' : ''}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg`}>
                <FiPackage className={`text-white ${isMobile ? 'text-lg' : 'text-2xl'}`} />
              </div>
              <Badge variant="info" size={isMobile ? 'sm' : 'md'}>Active</Badge>
            </div>
            <h3 className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1`}>
              {isMobile ? 'Products' : 'Total Products'}
            </h3>
            <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>
              {analyticsData.products.total}
            </p>
          </Card>

          <Card hoverable className={isMobile ? 'p-3' : ''}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg`}>
                <FiUsers className={`text-white ${isMobile ? 'text-lg' : 'text-2xl'}`} />
              </div>
              <Badge variant="warning" size={isMobile ? 'sm' : 'md'}>
                {analyticsData.customers.new} New
              </Badge>
            </div>
            <h3 className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1`}>
              {isMobile ? 'Customers' : 'Total Customers'}
            </h3>
            <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>
              {analyticsData.customers.total}
            </p>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className={isMobile ? 'p-3' : ''}>
          <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-[var(--text-primary)] ${isMobile ? 'mb-4' : 'mb-6'} flex items-center`}>
            <FiTrendingUp className="mr-2 text-green-500" />
            Revenue Trend
          </h2>
          <div style={{ height: isMobile ? '200px' : '400px' }}>
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Order Status Distribution */}
          <Card className={isMobile ? 'p-3' : ''}>
            <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-[var(--text-primary)] ${isMobile ? 'mb-4' : 'mb-6'} flex items-center`}>
              <FiPieChart className="mr-2 text-blue-500" />
              Order Status
            </h2>
            <div style={{ height: isMobile ? '180px' : '300px' }} className="flex items-center justify-center">
              <Doughnut
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: isMobile ? 12 : 40,
                        padding: isMobile ? 8 : 10,
                        font: {
                          size: isMobile ? 10 : 12,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className={`${isMobile ? 'mt-4' : 'mt-6'} space-y-2`}>
              {analyticsData.orders.byStatus.map((status, index) => (
                <div key={index} className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-[var(--bg-secondary)] rounded-lg`}>
                  <span className={`text-[var(--text-primary)] font-medium ${isMobile ? 'text-sm' : ''}`}>{status.status}</span>
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : ''}`}>{status.count}</span>
                    <span className={`text-[var(--text-primary)] font-semibold ${isMobile ? 'text-sm' : ''}`}>{status.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Revenue */}
          <Card className={isMobile ? 'p-3' : ''}>
            <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-[var(--text-primary)] ${isMobile ? 'mb-4' : 'mb-6'} flex items-center`}>
              <FiBarChart2 className="mr-2 text-purple-500" />
              {isMobile ? 'By Category' : 'Revenue by Category'}
            </h2>
            <div style={{ height: isMobile ? '200px' : '300px' }}>
              <Bar data={categoryRevenueData} options={barChartOptions} />
            </div>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card className={isMobile ? 'p-3' : ''}>
          <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-[var(--text-primary)] ${isMobile ? 'mb-4' : 'mb-6'} flex items-center`}>
            <FiPackage className="mr-2 text-orange-500" />
            Top Selling Products
          </h2>

          {/* Mobile: Card View */}
          {isMobile ? (
            <div className="space-y-3">
              {analyticsData.products.topSelling.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-[var(--bg-secondary)] rounded-lg p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-[var(--text-secondary)]">{product.sales.toLocaleString()} sold</span>
                        <span className="text-[var(--text-primary)] font-semibold">₹{(product.revenue / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: Table View */
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
          )}
        </Card>

        {/* Category Performance */}
        <Card className={isMobile ? 'p-3' : ''}>
          <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-[var(--text-primary)] ${isMobile ? 'mb-4' : 'mb-6'}`}>
            Category Performance
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {analyticsData.products.byCategory.map((category, index) => (
              <div
                key={index}
                className={`${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)] hover:shadow-lg transition-all`}
              >
                <h3 className={`text-[var(--text-primary)] font-semibold ${isMobile ? 'text-sm mb-1' : 'mb-2'}`}>
                  {category.category}
                </h3>
                <div className="space-y-1">
                  <p className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {isMobile ? category.count : `Products: ${category.count}`}
                    {!isMobile && <span className="text-[var(--text-primary)] font-medium"></span>}
                  </p>
                  <p className={`text-[var(--text-primary)] font-semibold ${isMobile ? 'text-sm' : 'text-sm'}`}>
                    ₹{isMobile ? (category.revenue / 1000).toFixed(0) + 'K' : category.revenue.toLocaleString()}
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
