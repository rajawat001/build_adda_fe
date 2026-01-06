import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../../components/distributor/Layout';
import { Button, Badge } from '../../../components/ui';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  FiArrowLeft,
  FiEdit2,
  FiCheck,
  FiX,
  FiSave,
} from 'react-icons/fi';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string; phone: string };
  items: Array<{
    product: { _id: string; name: string; image: string };
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  approvalStatus: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

const OrderDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable states
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [editedShipping, setEditedShipping] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Approval states
  const [approvalShipping, setApprovalShipping] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/distributor/orders');
      const foundOrder = response.data.orders.find((o: any) => o._id === id);

      if (foundOrder) {
        if (!foundOrder.statusHistory || foundOrder.statusHistory.length === 0) {
          foundOrder.statusHistory = generateMockTimeline(foundOrder);
        }
        setOrder(foundOrder);
        setEditedShipping(foundOrder.deliveryCharge.toString());
        setEditedStatus(foundOrder.orderStatus);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTimeline = (order: any) => {
    const timeline = [];
    const baseDate = new Date(order.createdAt);

    timeline.push({
      status: 'Order Placed',
      timestamp: baseDate.toISOString(),
      note: 'Order has been placed successfully',
    });

    if (order.approvalStatus === 'approved') {
      const approvedDate = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000);
      timeline.push({
        status: 'Order Approved',
        timestamp: order.approvedAt || approvedDate.toISOString(),
        note: 'Order approved by distributor',
      });
    }

    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus)) {
      const confirmedDate = new Date(baseDate.getTime() + 3 * 60 * 60 * 1000);
      timeline.push({
        status: 'Order Confirmed',
        timestamp: confirmedDate.toISOString(),
        note: 'Order has been confirmed',
      });
    }

    if (['processing', 'shipped', 'delivered'].includes(order.orderStatus)) {
      const processingDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
      timeline.push({
        status: 'Processing',
        timestamp: processingDate.toISOString(),
        note: 'Order is being processed',
      });
    }

    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      const shippedDate = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
      timeline.push({
        status: 'Shipped',
        timestamp: shippedDate.toISOString(),
        note: 'Order has been shipped',
      });
    }

    if (order.orderStatus === 'delivered') {
      const deliveredDate = new Date(baseDate.getTime() + 72 * 60 * 60 * 1000);
      timeline.push({
        status: 'Delivered',
        timestamp: deliveredDate.toISOString(),
        note: 'Order delivered successfully',
      });
    }

    if (order.approvalStatus === 'rejected') {
      const rejectedDate = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000);
      timeline.push({
        status: 'Order Rejected',
        timestamp: rejectedDate.toISOString(),
        note: order.rejectionReason || 'Order rejected by distributor',
      });
    }

    if (order.orderStatus === 'cancelled') {
      timeline.push({
        status: 'Order Cancelled',
        timestamp: new Date().toISOString(),
        note: 'Order has been cancelled',
      });
    }

    return timeline;
  };

  const handleSaveShipping = async () => {
    const chargeValue = parseFloat(editedShipping);
    if (isNaN(chargeValue) || chargeValue < 0) {
      toast.error('Please enter a valid shipping price');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}`, { deliveryCharge: chargeValue });
      toast.success('Shipping price updated successfully');
      setIsEditingShipping(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update shipping price');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStatus = async () => {
    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}`, { orderStatus: editedStatus });
      toast.success('Order status updated successfully');
      setIsEditingStatus(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveOrder = async () => {
    // Validate shipping charge
    if (!approvalShipping || approvalShipping.trim() === '') {
      toast.error('Shipping charge is required to approve order');
      return;
    }

    const chargeValue = parseFloat(approvalShipping);
    if (isNaN(chargeValue) || chargeValue < 0) {
      toast.error('Please enter a valid shipping charge (must be 0 or greater)');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}/approve`, {
        deliveryCharge: chargeValue,
      });
      toast.success('Order approved successfully!');
      setApprovalShipping('');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve order');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason || rejectionReason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}/reject`, { reason: rejectionReason });
      toast.success('Order rejected');
      setRejectionReason('');
      setShowRejectForm(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#ffc107',
      confirmed: '#2196f3',
      processing: '#9c27b0',
      shipped: '#ff9800',
      delivered: '#4caf50',
      cancelled: '#f44336',
    };
    return colors[status] || '#757575';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getValidStatuses = () => {
    // Backend only accepts these statuses
    return ['confirmed', 'processing', 'shipped', 'delivered'];
  };

  if (loading) {
    return (
      <DistributorLayout title="Order Details">
        <div className="loading-container">Loading order details...</div>
      </DistributorLayout>
    );
  }

  if (!order) {
    return (
      <DistributorLayout title="Order Details">
        <div className="error-container">
          <h2>Order Not Found</h2>
          <p>The order you are looking for does not exist.</p>
          <Button onClick={() => router.back()} leftIcon={<FiArrowLeft />}>
            Go Back
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  // Shipping can be edited for any non-completed order
  const canEditShipping = order.orderStatus !== 'delivered' &&
                          order.orderStatus !== 'cancelled';

  // Status can be edited for approved orders only
  const canEditStatus = order.approvalStatus === 'approved' &&
                        order.orderStatus !== 'delivered' &&
                        order.orderStatus !== 'cancelled';

  return (
    <DistributorLayout title={`Order #${order.orderNumber}`}>
      <div className="order-detail-page">
        <div className="page-header">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<FiArrowLeft />}
          >
            Back to Orders
          </Button>
          <h1>Order Details</h1>
        </div>

        <div className="order-detail-container">
          <div className="order-summary-card">
            {/* Order Header */}
            <div className="order-header">
              <div className="order-meta">
                <h2>Order #{order.orderNumber}</h2>
                <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div
                className="order-status-badge"
                style={{ background: getStatusColor(order.orderStatus) }}
              >
                {order.orderStatus.toUpperCase()}
              </div>
            </div>

            {/* Order Approval - Modern UI */}
            {order.approvalStatus === 'pending' ? (
              <div className="approval-action-section">
                <div className="approval-header">
                  <div className="approval-icon pending">⏳</div>
                  <div>
                    <h2>Order Awaiting Approval</h2>
                    <p>Review the order details and set shipping charge before approval</p>
                  </div>
                </div>

                {!showRejectForm ? (
                  <div className="approval-form">
                    <div className="shipping-input-group">
                      <label>
                        <span className="required">*</span> Shipping Charge (₹)
                      </label>
                      <div className="input-with-hint">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={approvalShipping}
                          onChange={(e) => setApprovalShipping(e.target.value)}
                          placeholder="Enter shipping charge (e.g., 50.00)"
                          className="shipping-charge-input"
                          required
                        />
                        <p className="input-hint">
                          {approvalShipping && parseFloat(approvalShipping) >= 0
                            ? `New Total: ₹${(
                                order.subtotal -
                                order.discount +
                                order.tax +
                                parseFloat(approvalShipping || '0')
                              ).toLocaleString('en-IN')}`
                            : 'Required field - Enter 0 for free shipping'}
                        </p>
                      </div>
                    </div>

                    <div className="approval-actions">
                      <button
                        onClick={handleApproveOrder}
                        disabled={saving || !approvalShipping}
                        className="btn-approve"
                      >
                        <FiCheck className="btn-icon" />
                        {saving ? 'Approving...' : 'Approve Order'}
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={saving}
                        className="btn-reject-toggle"
                      >
                        <FiX className="btn-icon" />
                        Reject Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rejection-form">
                    <h3>Reject Order</h3>
                    <div className="form-group">
                      <label>
                        <span className="required">*</span> Rejection Reason
                      </label>
                      <textarea
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please explain why this order is being rejected..."
                        className="rejection-textarea"
                        required
                      />
                    </div>
                    <div className="rejection-actions">
                      <button
                        onClick={handleRejectOrder}
                        disabled={saving || !rejectionReason}
                        className="btn-confirm-reject"
                      >
                        {saving ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason('');
                        }}
                        disabled={saving}
                        className="btn-cancel-reject"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="info-section">
                <h3>Order Approval</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Approval Status:</span>
                    <span
                      className="value approval-badge"
                      style={{
                        color: order.approvalStatus === 'approved' ? '#4caf50' : '#f44336',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.approvalStatus === 'approved' && '✓ APPROVED'}
                      {order.approvalStatus === 'rejected' && '✗ REJECTED'}
                    </span>
                  </div>
                  {order.approvedAt && (
                    <div className="info-item">
                      <span className="label">Approved On:</span>
                      <span className="value">{formatDate(order.approvedAt)}</span>
                    </div>
                  )}
                </div>
                {order.approvalStatus === 'rejected' && order.rejectionReason && (
                  <div className="rejection-reason">
                    <p>
                      <strong>Rejection Reason:</strong> {order.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Information */}
            <div className="info-section">
              <h3>Customer Information</h3>
              <div className="distributor-card">
                <h4>{order.user.name}</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="icon">📞</span>
                    <a href={`tel:${order.user.phone}`}>{order.user.phone}</a>
                  </div>
                  <div className="contact-item">
                    <span className="icon">📧</span>
                    <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="info-section">
              <h3>Payment Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Payment Method:</span>
                  <span className="value">{order.paymentMethod}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment Status:</span>
                  <span
                    className="value"
                    style={{ color: order.paymentStatus === 'paid' ? '#4caf50' : '#ff9800' }}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Status - Editable */}
            {canEditStatus && (
              <div className="info-section editable-section">
                <div className="section-header">
                  <h3>Order Status</h3>
                  {!isEditingStatus ? (
                    <button
                      className="edit-btn"
                      onClick={() => setIsEditingStatus(true)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button
                        className="save-btn"
                        onClick={handleSaveStatus}
                        disabled={saving}
                      >
                        <FiCheck /> {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setIsEditingStatus(false);
                          setEditedStatus(order.orderStatus);
                        }}
                        disabled={saving}
                      >
                        <FiX /> Cancel
                      </button>
                    </div>
                  )}
                </div>
                {isEditingStatus ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="status-select"
                  >
                    {getValidStatuses().map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="status-display">
                    <div
                      className="status-badge-display"
                      style={{ background: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Address */}
            <div className="info-section">
              <h3>Delivery Address</h3>
              <div className="address-box">
                <p className="address-name">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="address-phone">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="info-section">
              <h3>Order Items</h3>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img
                        src={item.product.image || '/placeholder-product.png'}
                        alt={item.product.name}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p className="item-price">₹{item.price.toLocaleString('en-IN')}</p>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown with Editable Shipping */}
            <div className="info-section">
              <h3>Price Details</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount:</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-row shipping-row">
                  <div className="shipping-label">
                    <span>Shipping Charge:</span>
                    {canEditShipping && !isEditingShipping && (
                      <button
                        className="edit-btn-small"
                        onClick={() => setIsEditingShipping(true)}
                      >
                        <FiEdit2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="shipping-value">
                    {isEditingShipping ? (
                      <div className="inline-edit">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editedShipping}
                          onChange={(e) => setEditedShipping(e.target.value)}
                          className="shipping-input"
                        />
                        <button
                          className="save-btn-small"
                          onClick={handleSaveShipping}
                          disabled={saving}
                        >
                          <FiCheck />
                        </button>
                        <button
                          className="cancel-btn-small"
                          onClick={() => {
                            setIsEditingShipping(false);
                            setEditedShipping(order.deliveryCharge.toString());
                          }}
                          disabled={saving}
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <span>₹{order.deliveryCharge.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <div className="price-row total">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="info-section">
                <h3>Order Timeline</h3>
                <div className="status-timeline">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="timeline-item">
                      <div
                        className="timeline-dot"
                        style={{ background: getStatusColor(history.status) }}
                      ></div>
                      <div className="timeline-content">
                        <p className="timeline-status">{history.status.toUpperCase()}</p>
                        <p className="timeline-date">{formatDate(history.timestamp)}</p>
                        {history.note && <p className="timeline-note">{history.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="order-actions">
              <button onClick={() => window.print()} className="btn-secondary">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-detail-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 16px;
        }

        .order-detail-container {
          background: var(--bg-card);
          border-radius: 12px;
          overflow: hidden;
        }

        .order-summary-card {
          padding: 32px;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--border-primary);
        }

        .order-meta h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .order-date {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .order-status-badge {
          padding: 8px 16px;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        /* Modern Approval Section */
        .approval-action-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
          color: white;
        }

        :global([data-theme='dark']) .approval-action-section {
          background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
        }

        .approval-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }

        .approval-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          backdrop-filter: blur(10px);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .approval-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: white;
        }

        .approval-header p {
          font-size: 15px;
          margin: 0;
          opacity: 0.9;
        }

        .approval-form {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .shipping-input-group {
          margin-bottom: 24px;
        }

        .shipping-input-group label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 12px;
          color: white;
        }

        .required {
          color: #ffd700;
          margin-right: 4px;
        }

        .input-with-hint {
          position: relative;
        }

        .shipping-charge-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 18px;
          font-weight: 600;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.95);
          color: #333;
          transition: all 0.3s;
        }

        .shipping-charge-input:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.2);
          background: white;
        }

        .shipping-charge-input::placeholder {
          color: #999;
        }

        .input-hint {
          margin: 8px 0 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .approval-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .btn-approve,
        .btn-reject-toggle {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .btn-approve {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
        }

        .btn-approve:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(56, 239, 125, 0.6);
        }

        .btn-approve:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-reject-toggle {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-reject-toggle:hover:not(:disabled) {
          background: rgba(255, 67, 54, 0.3);
          border-color: #ff4336;
        }

        .btn-icon {
          font-size: 20px;
        }

        .rejection-form {
          background: rgba(255, 67, 54, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 24px;
          border: 2px solid rgba(255, 67, 54, 0.3);
        }

        .rejection-form h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 8px;
          color: white;
        }

        .rejection-textarea {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.95);
          color: #333;
          font-family: inherit;
          resize: vertical;
        }

        .rejection-textarea:focus {
          outline: none;
          border-color: #ff4336;
          box-shadow: 0 0 0 4px rgba(255, 67, 54, 0.2);
          background: white;
        }

        .rejection-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn-confirm-reject,
        .btn-cancel-reject {
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-confirm-reject {
          background: #ff4336;
          color: white;
        }

        .btn-confirm-reject:hover:not(:disabled) {
          background: #e53935;
          transform: translateY(-2px);
        }

        .btn-confirm-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel-reject {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-cancel-reject:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .info-section {
          margin-bottom: 32px;
        }

        .info-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 16px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .value {
          font-size: 15px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .approval-badge {
          font-size: 16px;
        }

        .rejection-reason {
          margin-top: 12px;
          padding: 12px;
          background: #fee;
          border-left: 4px solid #f44336;
          border-radius: 4px;
        }

        .rejection-reason p {
          margin: 0;
          color: #d32f2f;
          font-size: 14px;
        }

        .distributor-card,
        .address-box {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .distributor-card h4 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 12px 0;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .contact-item .icon {
          font-size: 18px;
        }

        .contact-item a {
          color: var(--primary-color);
          text-decoration: none;
        }

        .contact-item a:hover {
          text-decoration: underline;
        }

        .address-name {
          font-weight: 600;
          font-size: 16px;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .address-box p {
          margin: 4px 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .address-phone {
          margin-top: 8px;
          font-weight: 500;
          color: var(--text-primary) !important;
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .order-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .item-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
          background: white;
          border: 1px solid var(--border-primary);
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .item-price,
        .item-quantity {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 4px 0;
        }

        .item-total {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          text-align: right;
        }

        .price-breakdown {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 15px;
          color: var(--text-primary);
        }

        .price-row.discount {
          color: #4caf50;
        }

        .price-row.total {
          border-top: 2px solid var(--border-primary);
          margin-top: 8px;
          padding-top: 16px;
          font-size: 18px;
          font-weight: 700;
        }

        .shipping-row {
          background: #fff9e6;
          margin: 4px -20px;
          padding: 10px 20px;
          border-radius: 4px;
        }

        :global([data-theme='dark']) .shipping-row {
          background: rgba(255, 193, 7, 0.1);
        }

        .shipping-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edit-btn-small {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: opacity 0.2s;
        }

        .edit-btn-small:hover {
          opacity: 0.7;
        }

        .shipping-value {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inline-edit {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .shipping-input {
          width: 100px;
          padding: 4px 8px;
          border: 2px solid var(--primary-color);
          border-radius: 4px;
          font-size: 15px;
          font-weight: 600;
          text-align: right;
        }

        .save-btn-small,
        .cancel-btn-small {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn-small {
          background: #4caf50;
          color: white;
        }

        .save-btn-small:hover {
          background: #45a049;
        }

        .cancel-btn-small {
          background: #f44336;
          color: white;
        }

        .cancel-btn-small:hover {
          background: #da190b;
        }

        .editable-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 2px dashed var(--border-primary);
        }

        :global([data-theme='dark']) .editable-section {
          background: rgba(255, 255, 255, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin: 0;
        }

        .edit-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }

        .edit-btn:hover {
          opacity: 0.9;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .save-btn,
        .cancel-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }

        .save-btn {
          background: #4caf50;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .cancel-btn {
          background: #f44336;
          color: white;
        }

        .cancel-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .save-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-select {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--primary-color);
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-primary);
        }

        .status-display {
          display: flex;
        }

        .status-badge-display {
          padding: 8px 16px;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          display: inline-block;
        }

        .status-timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline-item {
          position: relative;
          padding-bottom: 24px;
        }

        .timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: -28px;
          top: 16px;
          bottom: -8px;
          width: 2px;
          background: var(--border-primary);
        }

        .timeline-dot {
          position: absolute;
          left: -35px;
          top: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid var(--bg-card);
        }

        .timeline-content {
          background: var(--bg-secondary);
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid var(--border-primary);
        }

        .timeline-status {
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          font-size: 14px;
        }

        .timeline-date {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0 0 4px 0;
        }

        .timeline-note {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }

        .order-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid var(--border-primary);
        }

        .btn-secondary {
          padding: 12px 24px;
          border: 2px solid var(--border-primary);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--bg-secondary);
          border-color: var(--primary-color);
        }

        .loading-container,
        .error-container {
          text-align: center;
          padding: 60px 20px;
        }

        .error-container h2 {
          font-size: 24px;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .error-container p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .order-summary-card {
            padding: 20px;
          }

          .order-header {
            flex-direction: column;
            gap: 12px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .order-item {
            flex-direction: column;
          }

          .item-total {
            text-align: left;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .order-actions {
            flex-direction: column;
          }

          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default OrderDetailsPage;
