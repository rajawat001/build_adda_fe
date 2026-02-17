import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Badge, Modal, EmptyState, Loading, StatsCard } from '../../components/ui';
import { MobileDataCard, MobileDataCardList } from '../../components/ui/MobileDataCard';
import { FilterDrawer, FilterButton, FilterSection } from '../../components/ui/FilterDrawer';
import { useIsMobile } from '../../hooks';
import {
  FiShoppingCart,
  FiCheck,
  FiX,
  FiDownload,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string; phone?: string } | null;
  totalAmount: number;
  orderStatus: string;
  approvalStatus: string;
  deliveryCharge: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

const Orders = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modals & Drawers
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [orderToProcess, setOrderToProcess] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [filter, setFilter] = useState({
    status: '',
    approval: '',
    search: '',
    paymentStatus: '',
  });

  // Count active filters
  const activeFiltersCount = [filter.status, filter.approval, filter.paymentStatus].filter(Boolean).length;

  useEffect(() => {
    const abortController = new AbortController();
    fetchOrders(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  const fetchOrders = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = await api.get('/distributor/orders', { signal });
      setOrders(response.data.orders || []);
      toast.success('Orders loaded successfully');
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        return;
      }
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!orderToProcess) return;

    try {
      await api.put(`/distributor/orders/${orderToProcess}/approve`, {
        deliveryCharge: parseFloat(deliveryCharge) || 0,
      });
      toast.success('Order approved successfully');
      fetchOrders();
      setShowApproveModal(false);
      setOrderToProcess(null);
      setDeliveryCharge('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve order');
    }
  };

  const handleReject = async () => {
    if (!orderToProcess || !rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await api.put(`/distributor/orders/${orderToProcess}/reject`, { reason: rejectionReason });
      toast.success('Order rejected successfully');
      fetchOrders();
      setShowRejectModal(false);
      setOrderToProcess(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.size === 0) return;

    try {
      const pendingOrders = Array.from(selectedOrders).filter((id) => {
        const order = orders.find((o) => o._id === id);
        return order?.approvalStatus === 'pending';
      });

      if (pendingOrders.length === 0) {
        toast.error('No pending orders selected');
        return;
      }

      await Promise.all(
        pendingOrders.map((id) =>
          api.put(`/distributor/orders/${id}/approve`, {
            deliveryCharge: parseFloat(deliveryCharge) || 0,
          })
        )
      );

      toast.success(`${pendingOrders.length} orders approved successfully`);
      setSelectedOrders(new Set());
      fetchOrders();
      setShowBulkApproveModal(false);
      setDeliveryCharge('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve orders');
    }
  };

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const exportData = filteredOrders.map((o) => ({
      'Order Number': o.orderNumber,
      Customer: o.user?.name || 'Unknown User',
      Contact: o.user?.phone || o.user?.email || 'N/A',
      Amount: o.totalAmount,
      'Delivery Charge': o.deliveryCharge || 0,
      'Approval Status': o.approvalStatus,
      'Order Status': o.orderStatus,
      'Payment Method': o.paymentMethod,
      'Payment Status': o.paymentStatus,
      Date: format(new Date(o.createdAt), 'dd/MM/yyyy'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Orders exported successfully');
  };

  const toggleSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === paginatedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map((o) => o._id)));
    }
  };

  const clearFilters = () => {
    setFilter({
      status: '',
      approval: '',
      search: '',
      paymentStatus: '',
    });
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' => {
    const colors: any = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'purple',
      shipped: 'pink',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getApprovalColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    const colors: any = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const filteredOrders = orders.filter((order) => {
    const userName = order.user?.name || '';
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(filter.search.toLowerCase()) ||
      userName.toLowerCase().includes(filter.search.toLowerCase());
    const matchesStatus = !filter.status || order.orderStatus === filter.status;
    const matchesApproval = !filter.approval || order.approvalStatus === filter.approval;
    const matchesPayment = !filter.paymentStatus || order.paymentStatus === filter.paymentStatus;

    return matchesSearch && matchesStatus && matchesApproval && matchesPayment;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.approvalStatus === 'pending').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    totalRevenue: orders
      .filter((o) => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  // Open approve modal for a specific order
  const openApproveModal = (orderId: string) => {
    setOrderToProcess(orderId);
    setShowApproveModal(true);
  };

  // Open reject modal for a specific order
  const openRejectModal = (orderId: string) => {
    setOrderToProcess(orderId);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <DistributorLayout title="Orders">
        <Loading fullScreen text="Loading orders..." />
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Orders">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Orders Management</h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)]">Track and manage all your orders</p>
        </div>

        {/* Stats Grid - 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatsCard
            title="Total Orders"
            value={stats.total}
            icon={<FiShoppingCart className="w-5 h-5 md:w-6 md:h-6" />}
            color="blue"
            subtitle="All time"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<FiClock className="w-5 h-5 md:w-6 md:h-6" />}
            color="orange"
            subtitle="Needs action"
          />
          <StatsCard
            title="Delivered"
            value={stats.delivered}
            icon={<FiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />}
            color="green"
            subtitle="Completed"
          />
          <StatsCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            icon={<FiDollarSign className="w-5 h-5 md:w-6 md:h-6" />}
            color="purple"
            subtitle="From delivered"
          />
        </div>

        {/* Search & Filters */}
        <Card className="!p-3 md:!p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>

              {/* Mobile Filter Button */}
              {isMobile ? (
                <FilterButton
                  onClick={() => setShowFilterDrawer(true)}
                  activeFiltersCount={activeFiltersCount}
                />
              ) : (
                <Button variant="secondary" size="sm" leftIcon={<FiDownload />} onClick={handleExport}>
                  Export
                </Button>
              )}
            </div>

            {/* Desktop Filters */}
            {!isMobile && (
              <div className="grid grid-cols-3 gap-3">
                <select
                  className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
                  value={filter.approval}
                  onChange={(e) => setFilter({ ...filter, approval: e.target.value })}
                >
                  <option value="">All Approval</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
                  value={filter.paymentStatus}
                  onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
                >
                  <option value="">All Payment</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            )}

            {/* Selection & Actions Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                />
                <span className="text-xs md:text-sm text-[var(--text-secondary)]">
                  {selectedOrders.size > 0
                    ? `${selectedOrders.size} selected`
                    : `${filteredOrders.length} orders`}
                </span>
              </div>

              {!isMobile && selectedOrders.size > 0 && (
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<FiCheck />}
                  onClick={() => setShowBulkApproveModal(true)}
                >
                  Bulk Approve
                </Button>
              )}

              {isMobile && (
                <Button variant="ghost" size="sm" leftIcon={<FiDownload />} onClick={handleExport}>
                  Export
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<FiShoppingCart className="w-16 h-16 md:w-20 md:h-20" />}
            title="No Orders Found"
            description="No orders match your filters or you haven't received any orders yet"
          />
        ) : isMobile ? (
          /* Mobile Card View */
          <MobileDataCardList data={paginatedOrders} isLoading={loading}>
            {(order, index) => (
              <MobileDataCard
                key={order._id}
                data={order}
                primaryField="orderNumber"
                secondaryField="user"
                statusField="approvalStatus"
                animationDelay={index * 0.05}
                selectable
                selected={selectedOrders.has(order._id)}
                onSelect={() => toggleSelection(order._id)}
                onClick={() => router.push(`/distributor/order-details/${order._id}`)}
                renderPrimary={(value) => (
                  <span className="text-[var(--primary-color)] font-semibold">{value}</span>
                )}
                renderStatus={(status) => (
                  <Badge variant={getApprovalColor(status)} size="sm" dot>
                    {status}
                  </Badge>
                )}
                fields={[
                  {
                    key: 'user',
                    label: 'Customer',
                    render: (user) => user?.name || 'Unknown',
                  },
                  {
                    key: 'totalAmount',
                    label: 'Amount',
                    render: (val) => `₹${val.toLocaleString('en-IN')}`,
                  },
                  {
                    key: 'deliveryCharge',
                    label: 'Delivery',
                    render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`,
                  },
                  {
                    key: 'paymentStatus',
                    label: 'Payment',
                    render: (val) => <Badge variant={val === 'paid' ? 'success' : 'warning'} size="sm">{val}</Badge>,
                  },
                  {
                    key: 'createdAt',
                    label: 'Date',
                    render: (val) => formatDistanceToNow(new Date(val), { addSuffix: true }),
                  },
                ]}
                actions={
                  order.approvalStatus === 'pending'
                    ? [
                        {
                          icon: <FiCheck className="w-4 h-4" />,
                          label: 'Approve',
                          onClick: () => openApproveModal(order._id),
                          variant: 'success',
                        },
                        {
                          icon: <FiX className="w-4 h-4" />,
                          label: 'Reject',
                          onClick: () => openRejectModal(order._id),
                          variant: 'danger',
                        },
                        {
                          icon: <FiEye className="w-4 h-4" />,
                          label: 'View',
                          onClick: () => router.push(`/distributor/order-details/${order._id}`),
                        },
                      ]
                    : [
                        {
                          icon: <FiEye className="w-4 h-4" />,
                          label: 'View Details',
                          onClick: () => router.push(`/distributor/order-details/${order._id}`),
                        },
                      ]
                }
              />
            )}
          </MobileDataCardList>
        ) : (
          /* Desktop Table View */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Order #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Delivery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Approval</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-primary)]">
                  {paginatedOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors hover:bg-[var(--bg-hover)] ${
                        selectedOrders.has(order._id) ? 'bg-[var(--info-bg)]' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order._id)}
                          onChange={() => toggleSelection(order._id)}
                          className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-semibold text-[var(--primary-color)] cursor-pointer hover:underline"
                          onClick={() => router.push(`/distributor/order-details/${order._id}`)}
                        >
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--text-primary)]">
                            {order.user?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {order.user?.phone || order.user?.email || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[var(--text-primary)]">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[var(--text-secondary)]">
                          ₹{(order.deliveryCharge || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getApprovalColor(order.approvalStatus)} dot>
                          {order.approvalStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {format(new Date(order.createdAt), 'dd MMM yyyy')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {order.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => openApproveModal(order._id)}
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                title="Approve"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openRejectModal(order._id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="Reject"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => router.push(`/distributor/order-details/${order._id}`)}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-primary)]">
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Mobile Pagination */}
        {isMobile && totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-sm disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-sm disabled:opacity-50"
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile Bulk Action Bar */}
        <AnimatePresence>
          {isMobile && selectedOrders.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-primary)] p-4 z-30"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedOrders.size} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrders(new Set())}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<FiCheck />}
                    onClick={() => setShowBulkApproveModal(true)}
                  >
                    Approve All
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Drawer - Mobile */}
        <FilterDrawer
          isOpen={showFilterDrawer}
          onClose={() => setShowFilterDrawer(false)}
          onApply={() => setShowFilterDrawer(false)}
          onReset={clearFilters}
          activeFiltersCount={activeFiltersCount}
        >
          <FilterSection title="Order Status">
            <div className="space-y-2">
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <label key={status} className="flex items-center gap-3 py-2">
                  <input
                    type="radio"
                    name="status"
                    checked={filter.status === status}
                    onChange={() => setFilter({ ...filter, status })}
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 py-2">
                <input
                  type="radio"
                  name="status"
                  checked={filter.status === ''}
                  onChange={() => setFilter({ ...filter, status: '' })}
                  className="w-4 h-4"
                />
                <span>All Status</span>
              </label>
            </div>
          </FilterSection>

          <FilterSection title="Approval Status">
            <div className="space-y-2">
              {['pending', 'approved', 'rejected'].map((status) => (
                <label key={status} className="flex items-center gap-3 py-2">
                  <input
                    type="radio"
                    name="approval"
                    checked={filter.approval === status}
                    onChange={() => setFilter({ ...filter, approval: status })}
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 py-2">
                <input
                  type="radio"
                  name="approval"
                  checked={filter.approval === ''}
                  onChange={() => setFilter({ ...filter, approval: '' })}
                  className="w-4 h-4"
                />
                <span>All Approval</span>
              </label>
            </div>
          </FilterSection>

          <FilterSection title="Payment Status">
            <div className="space-y-2">
              {['pending', 'paid', 'failed'].map((status) => (
                <label key={status} className="flex items-center gap-3 py-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={filter.paymentStatus === status}
                    onChange={() => setFilter({ ...filter, paymentStatus: status })}
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 py-2">
                <input
                  type="radio"
                  name="payment"
                  checked={filter.paymentStatus === ''}
                  onChange={() => setFilter({ ...filter, paymentStatus: '' })}
                  className="w-4 h-4"
                />
                <span>All Payment</span>
              </label>
            </div>
          </FilterSection>
        </FilterDrawer>

        {/* Approve Modal */}
        <Modal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setOrderToProcess(null);
            setDeliveryCharge('');
          }}
          title="Approve Order"
          footer={
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setOrderToProcess(null);
                  setDeliveryCharge('');
                }}
              >
                Cancel
              </Button>
              <Button variant="success" onClick={handleApprove} leftIcon={<FiCheck />}>
                Approve Order
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">Set the delivery charge for this order:</p>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter delivery charge"
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-base"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
              />
            </div>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setOrderToProcess(null);
            setRejectionReason('');
          }}
          title="Reject Order"
          footer={
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setOrderToProcess(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject} leftIcon={<FiX />}>
                Reject Order
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">Please provide a reason for rejecting this order:</p>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Rejection Reason *
              </label>
              <textarea
                rows={4}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-base resize-none"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
        </Modal>

        {/* Bulk Approve Modal */}
        <Modal
          isOpen={showBulkApproveModal}
          onClose={() => {
            setShowBulkApproveModal(false);
            setDeliveryCharge('');
          }}
          title="Bulk Approve Orders"
          footer={
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowBulkApproveModal(false);
                  setDeliveryCharge('');
                }}
              >
                Cancel
              </Button>
              <Button variant="success" onClick={handleBulkApprove} leftIcon={<FiCheck />}>
                Approve All
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Set the delivery charge for all selected orders (pending orders only):
            </p>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter delivery charge"
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-base"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
              />
            </div>
            <div className="bg-[var(--info-bg)] border border-[var(--info)] rounded-xl p-3">
              <p className="text-sm text-[var(--text-primary)]">
                {selectedOrders.size} order(s) selected. Only pending orders will be approved.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </DistributorLayout>
  );
};

export default Orders;
