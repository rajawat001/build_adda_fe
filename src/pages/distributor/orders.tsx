import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
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
  const [filter, setFilter] = useState({
    status: '',
    approval: '',
    search: '',
  });
  const [deliveryCharges, setDeliveryCharges] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/distributor/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    const deliveryCharge = deliveryCharges[orderId] || '0';

    try {
      await api.put(`/distributor/orders/${orderId}/approve`, {
        deliveryCharge: parseFloat(deliveryCharge) || 0,
      });
      alert('Order approved successfully');
      fetchOrders();
      // Clear the delivery charge input after approval
      setDeliveryCharges((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error approving order');
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    try {
      await api.put(`/distributor/orders/${orderId}/reject`, { reason });
      alert('Order rejected successfully');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error rejecting order');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/distributor/orders/${orderId}`, { orderStatus: newStatus });
      alert('Order status updated successfully');
      fetchOrders();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error updating status';
      alert(errorMessage);
      console.error('Status update error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#ec4899',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getApprovalColor = (status: string) => {
    const colors: any = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  // Get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus: string) => {
    const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex === -1 || currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return [currentStatus];
    }

    // Return current status and all future statuses
    return statusOrder.slice(currentIndex);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.user.name.toLowerCase().includes(filter.search.toLowerCase());
    const matchesStatus = !filter.status || order.orderStatus === filter.status;
    const matchesApproval = !filter.approval || order.approvalStatus === filter.approval;

    return matchesSearch && matchesStatus && matchesApproval;
  });

  return (
    <DistributorLayout title="Orders">
      <div className="orders-page">
        <div className="page-header">
          <h1>Orders Management</h1>
          <div className="stats-summary">
            <div className="stat">
              <span className="label">Total</span>
              <span className="value">{orders.length}</span>
            </div>
            <div className="stat">
              <span className="label">Pending Approval</span>
              <span className="value warning">
                {orders.filter((o) => o.approvalStatus === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by order number or customer..."
            className="search-input"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />

          <select
            className="filter-select"
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
            className="filter-select"
            value={filter.approval}
            onChange={(e) => setFilter({ ...filter, approval: e.target.value })}
          >
            <option value="">All Approval</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Orders Found</h3>
            <p>No orders match your filters</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Delivery</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-number">{order.orderNumber}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="name">{order.user.name}</span>
                        <span className="contact">{order.user.phone || order.user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      {order.approvalStatus === 'pending' ? (
                        <input
                          type="number"
                          className="delivery-input"
                          placeholder="₹0"
                          min="0"
                          step="0.01"
                          value={deliveryCharges[order._id] || ''}
                          onChange={(e) =>
                            setDeliveryCharges({ ...deliveryCharges, [order._id]: e.target.value })
                          }
                        />
                      ) : (
                        <span className="delivery">₹{order.deliveryCharge || 0}</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: getApprovalColor(order.approvalStatus) }}
                      >
                        {order.approvalStatus === 'pending' && '⏳ Pending'}
                        {order.approvalStatus === 'approved' && '✓ Approved'}
                        {order.approvalStatus === 'rejected' && '✗ Rejected'}
                      </span>
                    </td>
                    <td>
                      {order.approvalStatus === 'approved' && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' ? (
                        <select
                          className="status-select"
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        >
                          {getValidNextStatuses(order.orderStatus).map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="status-badge"
                          style={{ background: getStatusColor(order.orderStatus) }}
                        >
                          {order.orderStatus}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        {order.approvalStatus === 'pending' ? (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(order._id)}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReject(order._id)}
                            >
                              ✗ Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-view"
                            onClick={() => router.push(`/distributor/order-details/${order._id}`)}
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .orders-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .stats-summary {
          display: flex;
          gap: 24px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .stat .label {
          font-size: 12px;
          color: #718096;
          margin-bottom: 4px;
        }

        .stat .value {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
        }

        .stat .value.warning {
          color: #f59e0b;
        }

        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-input,
        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-input {
          flex: 1;
          min-width: 300px;
        }

        .filter-select {
          min-width: 150px;
        }

        .search-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .orders-table-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .orders-table th {
          padding: 16px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .orders-table td {
          padding: 16px;
          border-bottom: 1px solid #f7fafc;
        }

        .orders-table tbody tr:hover {
          background: #f7fafc;
        }

        .order-number {
          font-weight: 600;
          color: #667eea;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-info .name {
          font-weight: 600;
          color: #1a202c;
        }

        .customer-info .contact {
          font-size: 13px;
          color: #718096;
        }

        .amount,
        .delivery {
          font-weight: 600;
          color: #1a202c;
        }

        .delivery-input {
          width: 100px;
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          transition: border-color 0.3s ease;
        }

        .delivery-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .delivery-input::placeholder {
          color: #cbd5e0;
          font-weight: 400;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .status-select {
          padding: 6px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .status-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .date {
          font-size: 14px;
          color: #4a5568;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .btn-approve,
        .btn-reject,
        .btn-view {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-approve {
          background: #d1fae5;
          color: #065f46;
        }

        .btn-approve:hover {
          background: #a7f3d0;
        }

        .btn-reject {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-reject:hover {
          background: #fecaca;
        }

        .btn-view {
          background: #e0e7ff;
          color: #3730a3;
        }

        .btn-view:hover {
          background: #c7d2fe;
        }

        .empty-state,
        .loading {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 24px;
          color: #1a202c;
          margin: 0 0 10px 0;
        }

        .empty-state p {
          color: #718096;
        }

        @media (max-width: 1024px) {
          .orders-table-wrapper {
            overflow-x: auto;
          }

          .orders-table {
            min-width: 1000px;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .filters {
            flex-direction: column;
          }

          .search-input,
          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default Orders;
