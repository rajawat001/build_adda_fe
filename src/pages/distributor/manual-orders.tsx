import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Badge } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useIsMobile } from '../../hooks';
import { toast } from 'react-toastify';
import { getManualOrders, getManualOrderStats } from '../../services/manualOrder.service';
import {
  FiFileText, FiPlus, FiTrendingUp, FiUsers, FiDollarSign, FiShoppingCart,
  FiChevronLeft, FiChevronRight, FiClock, FiSearch,
} from 'react-icons/fi';

interface ManualOrder {
  _id: string;
  orderNumber: string;
  offlineCustomer?: { _id: string; name: string; phone: string; email?: string };
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  items: any[];
  createdAt: string;
}

interface Stats {
  totalManualOrders: number;
  offlineRevenue: number;
  onlineRevenue: number;
  totalRevenue: number;
  thisMonthOffline: number;
  customerCount: number;
}

const statusColors: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#2563eb', bg: '#dbeafe' },
  processing: { color: '#d97706', bg: '#fef3c7' },
  shipped: { color: '#7c3aed', bg: '#ede9fe' },
  delivered: { color: '#16a34a', bg: '#dcfce7' },
  cancelled: { color: '#dc2626', bg: '#fee2e2' },
};

const ManualOrdersPage = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, statusFilter, search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      setCurrentPage(1);
    }, 400);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 15 };
      if (statusFilter) params.orderStatus = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await getManualOrders(params);
      setOrders(res.orders || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error loading manual orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getManualOrderStats();
      setStats(res);
    } catch { /* ignore */ }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <DistributorLayout title="Manual Orders">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Manual Orders</h1>
            {!isMobile && <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>Offline billing & walk-in orders</p>}
          </div>
          <Button onClick={() => router.push('/distributor/create-order')} leftIcon={<FiPlus />}>
            {isMobile ? 'New Order' : 'Create Order'}
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <Card className="p-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiShoppingCart size={16} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Orders</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.totalManualOrders}</div>
            </Card>
            <Card className="p-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiDollarSign size={16} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Offline Revenue</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>₹{(stats.offlineRevenue || 0).toLocaleString('en-IN')}</div>
            </Card>
            <Card className="p-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiTrendingUp size={16} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>This Month</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>₹{(stats.thisMonthOffline || 0).toLocaleString('en-IN')}</div>
            </Card>
            <Card className="p-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiUsers size={16} style={{ color: '#7c3aed' }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Customers</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.customerCount}</div>
            </Card>
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, email or order #..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        {loading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : orders.length === 0 ? (
          <Card className="p-6">
            <div style={{ textAlign: 'center' }}>
            <FiFileText size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No manual orders yet</p>
            <Button onClick={() => router.push('/distributor/create-order')} leftIcon={<FiPlus />} className="mt-3">
              Create Your First Order
            </Button>
            </div>
          </Card>
        ) : (
          <Card>
            {orders.map((order, i) => {
              const sc = statusColors[order.orderStatus] || { color: '#6b7280', bg: '#f3f4f6' };
              return (
                <div key={order._id}
                  onClick={() => router.push(`/distributor/order-details/${order._id}`)}
                  style={{
                    padding: isMobile ? '12px 14px' : '14px 20px',
                    borderBottom: i < orders.length - 1 ? '1px solid var(--border-primary)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 8 : 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>#{order.orderNumber}</span>
                      <Badge variant="default" size="sm">
                        {order.orderStatus}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span><FiUsers size={11} style={{ marginRight: 3 }} />{order.offlineCustomer?.name || 'Unknown'}</span>
                      <span><FiClock size={11} style={{ marginRight: 3 }} />{formatDate(order.createdAt)}</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: '6px 12px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-primary)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.5 : 1 }}>
              <FiChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}
              style={{ padding: '6px 12px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-primary)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.5 : 1 }}>
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

export default ManualOrdersPage;
