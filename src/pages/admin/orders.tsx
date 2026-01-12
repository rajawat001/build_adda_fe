import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiPackage, FiDollarSign, FiUser, FiMapPin, FiCalendar, FiEye } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  distributor: {
    _id: string;
    businessName: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  statusHistory?: {
    status: string;
    note: string;
    updatedAt: string;
    updatedBy: string;
  }[];
  createdAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    onConfirm: () => {}
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, filters, searchTerm, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(activeTab !== 'all' && { orderStatus: activeTab }),
        ...filters
      });

      const response = await api.get(`/admin/orders?${queryParams}`);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/orders/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        search: searchTerm,
        ...(activeTab !== 'all' && { orderStatus: activeTab }),
        ...filters
      });

      const response = await api.get(`/admin/orders/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Update Order Status',
      message: `Are you sure you want to update this order to "${newStatus}"?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/orders/${orderId}`, {
            orderStatus: newStatus,
            note: 'Updated by admin'
          });

          await fetchOrders();
          await fetchStats();
          setShowDetailsModal(false);
        } catch (error) {
          console.error('Update status failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; icon: any }> = {
      pending: { className: 'orange', icon: <FiClock size={14} /> },
      confirmed: { className: 'blue', icon: <FiCheckCircle size={14} /> },
      processing: { className: 'purple', icon: <FiPackage size={14} /> },
      shipped: { className: 'blue', icon: <FiTruck size={14} /> },
      delivered: { className: 'green', icon: <FiCheckCircle size={14} /> },
      cancelled: { className: 'red', icon: <FiXCircle size={14} /> }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`badge ${config.className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      pending: 'orange',
      paid: 'green',
      failed: 'red',
      refunded: 'purple'
    };

    return (
      <span className={`badge ${statusConfig[status] || 'orange'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns: Column[] = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      render: (value, row: Order) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--admin-primary)', marginBottom: '0.25rem' }}>
            #{value}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
            {new Date(row.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
            {value.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
            {value.email}
          </div>
        </div>
      )
    },
    {
      key: 'distributor',
      label: 'Distributor',
      render: (value) => (
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
          {value.businessName}
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (value: OrderItem[]) => (
        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {value.length} item{value.length !== 1 ? 's' : ''}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <div style={{ fontWeight: 600, color: 'var(--admin-success)', fontSize: '0.9375rem' }}>
          ₹{value.toLocaleString('en-IN')}
        </div>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (value, row: Order) => (
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            {value}
          </div>
          {getPaymentBadge(row.paymentStatus)}
        </div>
      )
    },
    {
      key: 'orderStatus',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Order) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="View Details"
            onClick={() => {
              setSelectedOrder(row);
              setShowDetailsModal(true);
            }}
          >
            <FiEye size={16} />
          </button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      options: [
        { value: 'razorpay', label: 'Razorpay' },
        { value: 'cod', label: 'Cash on Delivery' }
      ]
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      type: 'daterange'
    },
    {
      key: 'amountRange',
      label: 'Amount Range',
      type: 'text',
      placeholder: 'e.g., 1000-5000'
    }
  ];

  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <AnimatePresence>
        {showDetailsModal && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}
            >
              {/* Header */}
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Order #{selectedOrder.orderNumber}</h2>
                  <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                  <FiXCircle size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                {/* Status and Payment Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--admin-bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>Order Status</div>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--admin-bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>Payment Status</div>
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiUser size={18} />
                    Customer Information
                  </h3>
                  <div style={{ background: 'var(--admin-bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> {selectedOrder.user.name}</div>
                    <div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {selectedOrder.user.email}</div>
                    {selectedOrder.user.phone && (
                      <div><strong>Phone:</strong> {selectedOrder.user.phone}</div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiMapPin size={18} />
                    Shipping Address
                  </h3>
                  <div style={{ background: 'var(--admin-bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                    PIN: {selectedOrder.shippingAddress.pincode}
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiShoppingCart size={18} />
                    Order Items
                  </h3>
                  <div style={{ border: '1px solid var(--admin-border-primary)', borderRadius: '8px', overflow: 'hidden' }}>
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          borderBottom: index < selectedOrder.items.length - 1 ? '1px solid var(--admin-border-primary)' : 'none'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{item.product.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                            Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--admin-success)' }}>
                          ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: '1rem', background: 'var(--admin-bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Total Amount</div>
                      <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--admin-success)' }}>
                        ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiCalendar size={18} />
                      Status Timeline
                    </h3>
                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                      {selectedOrder.statusHistory.map((history, index) => (
                        <div key={index} style={{ marginBottom: '1rem', position: 'relative' }}>
                          <div style={{
                            position: 'absolute',
                            left: '-2rem',
                            top: '0.25rem',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'var(--admin-primary)',
                            border: '2px solid white',
                            boxShadow: '0 0 0 2px var(--admin-primary)'
                          }} />
                          {index < selectedOrder.statusHistory!.length - 1 && (
                            <div style={{
                              position: 'absolute',
                              left: '-1.625rem',
                              top: '1rem',
                              width: '2px',
                              height: 'calc(100% + 0.5rem)',
                              background: 'var(--admin-border-primary)'
                            }} />
                          )}
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>
                            {history.note}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)' }}>
                            {new Date(history.updatedAt).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Status Actions */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Update Status</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <button
                        key={status}
                        className={`btn btn-sm ${selectedOrder.orderStatus === status ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, status)}
                        disabled={selectedOrder.orderStatus === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Orders Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Track and manage all customer orders
              </p>
            </div>
            <ExportButton onExport={handleExport} label="Export Orders" />
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Orders"
              value={stats.total.toLocaleString()}
              icon={FiShoppingCart}
              variant="orders"
              subtitle="All time"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              icon={FiDollarSign}
              variant="revenue"
              subtitle="Paid orders"
            />
            <StatCard
              title="Pending"
              value={stats.pending.toLocaleString()}
              icon={FiClock}
              variant="distributors"
              subtitle="Awaiting confirmation"
            />
            <StatCard
              title="Delivered"
              value={stats.delivered.toLocaleString()}
              icon={FiCheckCircle}
              variant="products"
              subtitle="Successfully completed"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--admin-border-primary)' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: activeTab === tab ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--admin-primary)' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
                {tab !== 'all' && stats[tab as keyof OrderStats] && (
                  <span className="badge purple" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {stats[tab as keyof OrderStats]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filterOptions}
          onApply={setFilters}
          onClear={() => setFilters({})}
          activeFilters={filters}
        />

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
          />
        </motion.div>

        {/* Order Details Modal */}
        <OrderDetailsModal />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default OrdersManagement;