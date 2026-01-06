import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Badge, Modal, EmptyState, Loading, StatsCard } from '../../components/ui';
import {
  FiShoppingCart,
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiFilter,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import api from '../../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string; phone?: string };
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [orderToProcess, setOrderToProcess] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [filter, setFilter] = useState({
    status: '',
    approval: '',
    search: '',
    paymentStatus: '',
  });

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
      // Ignore abort errors
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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/distributor/orders/${orderId}`, { orderStatus: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleExport = () => {
    const exportData = filteredOrders.map((o) => ({
      'Order Number': o.orderNumber,
      Customer: o.user.name,
      Contact: o.user.phone || o.user.email,
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

  const getValidNextStatuses = (currentStatus: string) => {
    const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex === -1 || currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return [currentStatus];
    }

    return statusOrder.slice(currentIndex);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.user.name.toLowerCase().includes(filter.search.toLowerCase());
    const matchesStatus = !filter.status || order.orderStatus === filter.status;
    const matchesApproval = !filter.approval || order.approvalStatus === filter.approval;
    const matchesPayment = !filter.paymentStatus || order.paymentStatus === filter.paymentStatus;

    return matchesSearch && matchesStatus && matchesApproval && matchesPayment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats calculations
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.approvalStatus === 'pending').length,
    approved: orders.filter((o) => o.approvalStatus === 'approved').length,
    totalRevenue: orders
      .filter((o) => o.approvalStatus === 'approved')
      .reduce((sum, o) => sum + o.totalAmount, 0),
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Orders Management</h1>
            <p className="text-[var(--text-secondary)] mt-1">Track and manage all your orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Orders"
            value={stats.total}
            icon={<FiShoppingCart className="w-6 h-6" />}
            color="blue"
            subtitle="All time"
          />
          <StatsCard
            title="Pending Approval"
            value={stats.pending}
            icon={<FiClock className="w-6 h-6" />}
            color="orange"
            subtitle="Needs action"
          />
          <StatsCard
            title="Approved Orders"
            value={stats.approved}
            icon={<FiCheckCircle className="w-6 h-6" />}
            color="green"
            subtitle="Confirmed"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            icon={<FiDollarSign className="w-6 h-6" />}
            color="purple"
            subtitle="From approved orders"
          />
        </div>

        {/* Filters & Actions */}
        <Card>
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>

              <select
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={filter.approval}
                onChange={(e) => setFilter({ ...filter, approval: e.target.value })}
              >
                <option value="">All Approval</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={filter.paymentStatus}
                onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
              >
                <option value="">All Payment Status</option>
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  {selectedOrders.size > 0
                    ? `${selectedOrders.size} selected`
                    : `${filteredOrders.length} orders`}
                </span>
                {selectedOrders.size > 0 && (
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<FiCheck />}
                    onClick={() => setShowBulkApproveModal(true)}
                  >
                    Bulk Approve
                  </Button>
                )}
              </div>

              <Button variant="secondary" size="sm" leftIcon={<FiDownload />} onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<FiShoppingCart className="w-20 h-20" />}
            title="No Orders Found"
            description="No orders match your filters or you haven't received any orders yet"
          />
        ) : (
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
                  </tr>
                </thead>
                <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-primary)]">
                  {paginatedOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={(e) => {
                        // Don't navigate if clicking on interactive elements
                        const target = e.target as HTMLElement;
                        if (
                          target.tagName === 'INPUT' ||
                          target.tagName === 'BUTTON' ||
                          target.tagName === 'SELECT' ||
                          target.closest('button') ||
                          target.closest('select')
                        ) {
                          return;
                        }
                        router.push(`/distributor/order-details/${order._id}`);
                      }}
                      className={`transition-colors hover:bg-[var(--bg-hover)] cursor-pointer ${
                        selectedOrders.has(order._id) ? 'bg-[var(--info-bg)]' : ''
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order._id)}
                          onChange={() => toggleSelection(order._id)}
                          className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[var(--primary-color)]">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--text-primary)]">{order.user.name}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {order.user.phone || order.user.email}
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
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                Approve All Selected
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
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
              />
            </div>
            <div className="bg-[var(--info-bg)] border border-[var(--info)] rounded-lg p-3">
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
