import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import DistributorLayout from '../../../components/distributor/Layout';
import { Button } from '../../../components/ui';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiEdit2,
  FiCheck,
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiTruck,
  FiClock,
  FiFileText,
  FiNavigation,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle,
} from 'react-icons/fi';

const LocationPreview = dynamic(() => import('../../../components/LocationPreview'), { ssr: false });

interface OrderDetails {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string; phone: string } | null;
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
    latitude?: number;
    longitude?: number;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  approvalStatus: string;
  approvedAt?: string;
  rejectionReason?: string;
  isGuestOrder?: boolean;
  guestEmail?: string;
  guestPhone?: string;
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

  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [editedShipping, setEditedShipping] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [approvalShipping, setApprovalShipping] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/distributor/orders');
      const foundOrder = response.data.orders.find((o: any) => o._id === id);
      if (foundOrder) {
        if (!foundOrder.statusHistory || foundOrder.statusHistory.length === 0) {
          foundOrder.statusHistory = generateTimeline(foundOrder);
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

  const generateTimeline = (order: any) => {
    const timeline = [];
    const baseDate = new Date(order.createdAt);
    timeline.push({ status: 'Order Placed', timestamp: baseDate.toISOString(), note: 'Order has been placed successfully' });
    if (order.approvalStatus === 'approved') {
      timeline.push({ status: 'Order Approved', timestamp: order.approvedAt || new Date(baseDate.getTime() + 2 * 3600000).toISOString(), note: 'Order approved by distributor' });
    }
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus)) {
      timeline.push({ status: 'Order Confirmed', timestamp: new Date(baseDate.getTime() + 3 * 3600000).toISOString(), note: 'Order has been confirmed' });
    }
    if (['processing', 'shipped', 'delivered'].includes(order.orderStatus)) {
      timeline.push({ status: 'Processing', timestamp: new Date(baseDate.getTime() + 24 * 3600000).toISOString(), note: 'Order is being processed' });
    }
    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      timeline.push({ status: 'Shipped', timestamp: new Date(baseDate.getTime() + 48 * 3600000).toISOString(), note: 'Order has been shipped' });
    }
    if (order.orderStatus === 'delivered') {
      timeline.push({ status: 'Delivered', timestamp: new Date(baseDate.getTime() + 72 * 3600000).toISOString(), note: 'Order delivered successfully' });
    }
    if (order.approvalStatus === 'rejected') {
      timeline.push({ status: 'Order Rejected', timestamp: new Date(baseDate.getTime() + 2 * 3600000).toISOString(), note: order.rejectionReason || 'Order rejected by distributor' });
    }
    if (order.orderStatus === 'cancelled') {
      timeline.push({ status: 'Order Cancelled', timestamp: new Date().toISOString(), note: 'Order has been cancelled' });
    }
    return timeline;
  };

  const handleSaveShipping = async () => {
    const chargeValue = parseFloat(editedShipping);
    if (isNaN(chargeValue) || chargeValue < 0) { toast.error('Please enter a valid shipping price'); return; }
    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}`, { deliveryCharge: chargeValue });
      toast.success('Shipping price updated successfully');
      setIsEditingShipping(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update shipping price');
    } finally { setSaving(false); }
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
    } finally { setSaving(false); }
  };

  const handleApproveOrder = async () => {
    if (!approvalShipping || approvalShipping.trim() === '') { toast.error('Shipping charge is required to approve order'); return; }
    const chargeValue = parseFloat(approvalShipping);
    if (isNaN(chargeValue) || chargeValue < 0) { toast.error('Please enter a valid shipping charge (must be 0 or greater)'); return; }
    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}/approve`, { deliveryCharge: chargeValue });
      toast.success('Order approved successfully!');
      setApprovalShipping('');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve order');
    } finally { setSaving(false); }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason || rejectionReason.trim() === '') { toast.error('Rejection reason is required'); return; }
    try {
      setSaving(true);
      await api.put(`/distributor/orders/${id}/reject`, { reason: rejectionReason });
      toast.success('Order rejected');
      setRejectionReason('');
      setShowRejectForm(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    } finally { setSaving(false); }
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
    pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '⏳' },
    confirmed: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: '✓' },
    processing: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: '⚙️' },
    shipped: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: '🚚' },
    delivered: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: '✅' },
    cancelled: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '✗' },
  };

  const getStatusStyle = (status: string) => statusConfig[status] || { color: '#6b7280', bg: '#f3f4f6', icon: '?' };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getValidStatuses = () => ['confirmed', 'processing', 'shipped', 'delivered'];

  const getCustomerName = () => order?.user?.name || (order?.isGuestOrder ? 'Guest Customer' : order?.shippingAddress?.fullName || 'Customer');
  const getCustomerPhone = () => order?.user?.phone || order?.guestPhone || order?.shippingAddress?.phone || null;
  const getCustomerEmail = () => order?.user?.email || order?.guestEmail || null;
  const isGuest = () => !order?.user?.name && (order?.isGuestOrder || !order?.user);

  // Loading skeleton
  if (loading) {
    return (
      <DistributorLayout title="Order Details">
        <div className="odp">
          <div className="odp-back-row">
            <div className="skeleton skeleton-btn" />
          </div>
          <div className="skeleton skeleton-header-card" />
          <div className="skeleton skeleton-card-tall" />
          <div className="odp-grid">
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
        </div>
        <style jsx>{`
          .odp { max-width: 960px; margin: 0 auto; padding: 0 4px; }
          .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
          .skeleton-btn { width: 140px; height: 38px; margin-bottom: 20px; }
          .skeleton-header-card { height: 100px; margin-bottom: 16px; }
          .skeleton-card-tall { height: 240px; margin-bottom: 16px; }
          .skeleton-card { height: 180px; }
          .odp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          @media (max-width: 768px) { .odp-grid { grid-template-columns: 1fr; } }
        `}</style>
      </DistributorLayout>
    );
  }

  if (!order) {
    return (
      <DistributorLayout title="Order Details">
        <div className="odp-empty">
          <div className="odp-empty-icon"><FiPackage /></div>
          <h2>Order Not Found</h2>
          <p>The order you are looking for does not exist.</p>
          <Button onClick={() => router.back()} leftIcon={<FiArrowLeft />}>Go Back</Button>
        </div>
        <style jsx>{`
          .odp-empty { text-align: center; padding: 80px 20px; }
          .odp-empty-icon { font-size: 64px; color: #d1d5db; margin-bottom: 20px; display: flex; justify-content: center; }
          .odp-empty h2 { font-size: 22px; color: var(--text-primary); margin: 0 0 8px; }
          .odp-empty p { color: var(--text-secondary); margin: 0 0 24px; }
        `}</style>
      </DistributorLayout>
    );
  }

  const canEditShipping = order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';
  const canEditStatus = order.approvalStatus === 'approved' && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';
  const statusStyle = getStatusStyle(order.orderStatus);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DistributorLayout title={`Order #${order.orderNumber}`}>
      <div className="odp">
        {/* Back Button */}
        <button className="odp-back" onClick={() => router.back()}>
          <FiArrowLeft /> Back to Orders
        </button>

        {/* Order Header Card */}
        <div className="odp-header-card">
          <div className="odp-header-top">
            <div className="odp-header-info">
              <div className="odp-order-id">
                <FiShoppingBag className="odp-order-icon" />
                <span>#{order.orderNumber}</span>
              </div>
              <div className="odp-order-date">
                <FiClock size={13} />
                {formatDate(order.createdAt)}
              </div>
            </div>
            <div className="odp-status-chip" style={{ color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.color }}>
              <span className="odp-status-dot" style={{ background: statusStyle.color }} />
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </div>
          </div>
          <div className="odp-header-stats">
            <div className="odp-stat">
              <span className="odp-stat-label">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
              <span className="odp-stat-value">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="odp-stat">
              <span className="odp-stat-label">Payment</span>
              <span className={`odp-stat-value ${order.paymentStatus === 'paid' ? 'text-green' : 'text-orange'}`}>
                {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.toUpperCase()} - {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Section */}
        {order.approvalStatus === 'pending' && (
          <div className="odp-approval-card">
            <div className="odp-approval-top">
              <div className="odp-approval-badge">
                <FiAlertCircle size={20} />
              </div>
              <div className="odp-approval-text">
                <h3>Action Required</h3>
                <p>Review and approve or reject this order</p>
              </div>
            </div>

            {!showRejectForm ? (
              <div className="odp-approval-body">
                <div className="odp-approval-input-wrap">
                  <label className="odp-approval-label">Shipping Charge (₹) <span className="odp-req">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={approvalShipping}
                    onChange={(e) => setApprovalShipping(e.target.value)}
                    placeholder="e.g., 50.00"
                    className="odp-approval-input"
                  />
                  <p className="odp-approval-hint">
                    {approvalShipping && parseFloat(approvalShipping) >= 0
                      ? `Updated Total: ₹${(order.subtotal - order.discount + order.tax + parseFloat(approvalShipping || '0')).toLocaleString('en-IN')}`
                      : 'Enter 0 for free shipping'}
                  </p>
                </div>
                <div className="odp-approval-btns">
                  <button onClick={handleApproveOrder} disabled={saving || !approvalShipping} className="odp-btn-approve">
                    <FiCheck size={18} />
                    {saving ? 'Approving...' : 'Approve'}
                  </button>
                  <button onClick={() => setShowRejectForm(true)} disabled={saving} className="odp-btn-reject">
                    <FiX size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="odp-reject-body">
                <label className="odp-approval-label">Rejection Reason <span className="odp-req">*</span></label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Why is this order being rejected?"
                  className="odp-reject-textarea"
                />
                <div className="odp-approval-btns">
                  <button onClick={handleRejectOrder} disabled={saving || !rejectionReason} className="odp-btn-reject-confirm">
                    {saving ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                  <button onClick={() => { setShowRejectForm(false); setRejectionReason(''); }} disabled={saving} className="odp-btn-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approved / Rejected Status */}
        {order.approvalStatus === 'approved' && (
          <div className="odp-approved-banner">
            <FiCheck size={18} />
            <span>Order Approved</span>
            {order.approvedAt && <span className="odp-approved-date">{formatDate(order.approvedAt)}</span>}
          </div>
        )}
        {order.approvalStatus === 'rejected' && (
          <div className="odp-rejected-banner">
            <FiX size={18} />
            <div>
              <span>Order Rejected</span>
              {order.rejectionReason && <p className="odp-reject-reason">{order.rejectionReason}</p>}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="odp-grid">
          {/* Left Column */}
          <div className="odp-main">
            {/* Order Items */}
            <div className="odp-card">
              <div className="odp-card-header">
                <FiPackage size={18} />
                <h3>Order Items ({order.items.length})</h3>
              </div>
              <div className="odp-items">
                {order.items.map((item, index) => (
                  <div key={index} className="odp-item">
                    <div className="odp-item-img">
                      <img src={item.product.image || '/placeholder-product.png'} alt={item.product.name} />
                    </div>
                    <div className="odp-item-info">
                      <h4>{item.product.name}</h4>
                      <div className="odp-item-meta">
                        <span className="odp-item-price">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="odp-item-qty">x{item.quantity}</span>
                      </div>
                    </div>
                    <div className="odp-item-total">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="odp-price-section">
                <div className="odp-price-row">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="odp-price-row odp-discount">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="odp-price-row">
                    <span>Tax</span>
                    <span>₹{order.tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="odp-price-row odp-shipping-row">
                  <div className="odp-shipping-label">
                    <span>Shipping</span>
                    {canEditShipping && !isEditingShipping && (
                      <button className="odp-edit-icon" onClick={() => setIsEditingShipping(true)}>
                        <FiEdit2 size={13} />
                      </button>
                    )}
                  </div>
                  {isEditingShipping ? (
                    <div className="odp-inline-edit">
                      <input
                        type="number" step="0.01" min="0"
                        value={editedShipping}
                        onChange={(e) => setEditedShipping(e.target.value)}
                        className="odp-shipping-input"
                      />
                      <button className="odp-inline-save" onClick={handleSaveShipping} disabled={saving}><FiCheck size={14} /></button>
                      <button className="odp-inline-cancel" onClick={() => { setIsEditingShipping(false); setEditedShipping(order.deliveryCharge.toString()); }} disabled={saving}><FiX size={14} /></button>
                    </div>
                  ) : (
                    <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge.toLocaleString('en-IN')}`}</span>
                  )}
                </div>
                <div className="odp-price-row odp-total">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Order Status Editor */}
            {canEditStatus && (
              <div className="odp-card">
                <div className="odp-card-header">
                  <FiTruck size={18} />
                  <h3>Update Status</h3>
                  {!isEditingStatus ? (
                    <button className="odp-header-action" onClick={() => setIsEditingStatus(true)}>
                      <FiEdit2 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="odp-header-actions">
                      <button className="odp-save-btn" onClick={handleSaveStatus} disabled={saving}>
                        <FiCheck size={14} /> {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button className="odp-cancel-btn" onClick={() => { setIsEditingStatus(false); setEditedStatus(order.orderStatus); }} disabled={saving}>
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {isEditingStatus ? (
                  <select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)} className="odp-status-select">
                    {getValidStatuses().map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <div className="odp-current-status" style={{ color: statusStyle.color, background: statusStyle.bg }}>
                    {statusStyle.icon} {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="odp-card">
                <div className="odp-card-header">
                  <FiClock size={18} />
                  <h3>Order Timeline</h3>
                </div>
                <div className="odp-timeline">
                  {order.statusHistory.map((entry, i) => (
                    <div key={i} className={`odp-tl-item ${i === order.statusHistory!.length - 1 ? 'odp-tl-last' : ''}`}>
                      <div className="odp-tl-dot" style={{ background: i === order.statusHistory!.length - 1 ? '#667eea' : '#d1d5db' }} />
                      <div className="odp-tl-content">
                        <div className="odp-tl-title">{entry.status}</div>
                        <div className="odp-tl-date">{formatDate(entry.timestamp)}</div>
                        {entry.note && <div className="odp-tl-note">{entry.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column / Sidebar */}
          <div className="odp-sidebar">
            {/* Customer Info */}
            <div className="odp-card">
              <div className="odp-card-header">
                <FiUser size={18} />
                <h3>Customer</h3>
                {isGuest() && <span className="odp-guest-tag">Guest</span>}
              </div>
              <div className="odp-customer">
                <div className="odp-customer-avatar">
                  {getCustomerName().charAt(0).toUpperCase()}
                </div>
                <div className="odp-customer-details">
                  <h4>{getCustomerName()}</h4>
                  <div className="odp-contact-row">
                    <FiPhone size={14} />
                    {getCustomerPhone() ? (
                      <a href={`tel:${getCustomerPhone()}`}>{getCustomerPhone()}</a>
                    ) : (
                      <span className="odp-na">Not provided</span>
                    )}
                  </div>
                  <div className="odp-contact-row">
                    <FiMail size={14} />
                    {getCustomerEmail() ? (
                      <a href={`mailto:${getCustomerEmail()}`}>{getCustomerEmail()}</a>
                    ) : (
                      <span className="odp-na">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="odp-card">
              <div className="odp-card-header">
                <FiCreditCard size={18} />
                <h3>Payment</h3>
              </div>
              <div className="odp-info-rows">
                <div className="odp-info-row">
                  <span>Method</span>
                  <span className="odp-info-val">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="odp-info-row">
                  <span>Status</span>
                  <span className={`odp-payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div className="odp-info-row">
                  <span>Amount</span>
                  <span className="odp-info-val odp-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="odp-card">
              <div className="odp-card-header">
                <FiMapPin size={18} />
                <h3>Delivery Address</h3>
              </div>
              <div className="odp-address">
                <p className="odp-address-name">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="odp-address-phone"><FiPhone size={13} /> {order.shippingAddress.phone}</p>
              </div>
              {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                <div className="odp-map-section">
                  <LocationPreview
                    latitude={order.shippingAddress.latitude}
                    longitude={order.shippingAddress.longitude}
                    height="160px"
                  />
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="odp-navigate-btn"
                  >
                    <FiNavigation size={15} />
                    Navigate
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="odp-footer">
          <button onClick={() => window.print()} className="odp-footer-btn">
            <FiFileText size={16} />
            Download Invoice
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ===== BASE ===== */
        .odp {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 4px 40px;
        }

        .odp-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          margin-bottom: 16px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .odp-back:hover { color: var(--text-primary); }

        /* ===== HEADER CARD ===== */
        .odp-header-card {
          background: var(--bg-card);
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 16px;
          border: 1px solid var(--border-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .odp-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .odp-order-id {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        :global(.odp-order-icon) {
          color: #667eea;
        }

        .odp-order-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 6px;
        }

        .odp-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid;
          white-space: nowrap;
        }

        .odp-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .odp-header-stats {
          display: flex;
          gap: 32px;
          padding-top: 16px;
          border-top: 1px solid var(--border-primary);
        }

        .odp-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .odp-stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .odp-stat-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .text-green { color: #10b981 !important; }
        .text-orange { color: #f59e0b !important; }

        /* ===== APPROVAL CARD ===== */
        .odp-approval-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 16px;
          color: white;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
        }

        :global([data-theme='dark']) .odp-approval-card {
          background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
        }

        .odp-approval-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .odp-approval-badge {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: pulse-glow 2s infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
        }

        .odp-approval-text h3 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
        }

        .odp-approval-text p {
          margin: 0;
          font-size: 13px;
          opacity: 0.85;
        }

        .odp-approval-body,
        .odp-reject-body {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .odp-approval-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: rgba(255,255,255,0.95);
        }

        .odp-req { color: #ffd700; }

        .odp-approval-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          background: rgba(255,255,255,0.95);
          color: #333;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .odp-approval-input:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 3px rgba(255,215,0,0.25);
          background: white;
        }

        .odp-approval-input::placeholder { color: #aaa; font-weight: 400; }

        .odp-approval-hint {
          margin: 8px 0 0;
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .odp-approval-input-wrap {
          margin-bottom: 16px;
        }

        .odp-approval-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .odp-btn-approve {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        }
        .odp-btn-approve:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45); }
        .odp-btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

        .odp-btn-reject {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .odp-btn-reject:hover:not(:disabled) { background: rgba(239, 68, 68, 0.3); border-color: #ef4444; }

        .odp-reject-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          background: rgba(255,255,255,0.95);
          color: #333;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .odp-reject-textarea:focus { outline: none; border-color: #ef4444; background: white; }

        .odp-btn-reject-confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .odp-btn-reject-confirm:hover:not(:disabled) { background: #dc2626; }
        .odp-btn-reject-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        .odp-btn-cancel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .odp-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.25); }

        /* ===== APPROVED/REJECTED BANNERS ===== */
        .odp-approved-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 12px;
          color: #059669;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .odp-approved-date {
          margin-left: auto;
          font-size: 12px;
          font-weight: 400;
          color: #6b7280;
        }

        .odp-rejected-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 20px;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #dc2626;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .odp-reject-reason {
          margin: 4px 0 0;
          font-weight: 400;
          font-size: 13px;
          color: #6b7280;
        }

        /* ===== GRID LAYOUT ===== */
        .odp-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 16px;
          align-items: start;
        }

        /* ===== CARDS ===== */
        .odp-card {
          background: var(--bg-card);
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 16px;
          border: 1px solid var(--border-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .odp-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          color: var(--text-primary);
        }

        .odp-card-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }

        .odp-guest-tag {
          padding: 2px 10px;
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .odp-header-action {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .odp-header-action:hover { border-color: #667eea; color: #667eea; }

        .odp-header-actions { display: flex; gap: 6px; }

        .odp-save-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 14px; background: #10b981; color: white;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .odp-save-btn:hover:not(:disabled) { background: #059669; }
        .odp-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .odp-cancel-btn {
          display: flex; align-items: center;
          padding: 6px 10px; background: var(--bg-secondary);
          border: 1px solid var(--border-primary); border-radius: 8px;
          color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
        }
        .odp-cancel-btn:hover { border-color: #ef4444; color: #ef4444; }

        /* ===== ORDER ITEMS ===== */
        .odp-items { display: flex; flex-direction: column; gap: 0; }

        .odp-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border-primary);
        }
        .odp-item:last-child { border-bottom: none; }

        .odp-item-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f9fafb;
          border: 1px solid var(--border-primary);
        }

        .odp-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .odp-item-info { flex: 1; min-width: 0; }

        .odp-item-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .odp-item-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .odp-item-price {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .odp-item-qty {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .odp-item-total {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
        }

        /* ===== PRICE BREAKDOWN ===== */
        .odp-price-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-primary);
        }

        .odp-price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .odp-discount { color: #10b981; }

        .odp-shipping-row {
          background: rgba(245, 158, 11, 0.05);
          margin: 4px -24px;
          padding: 8px 24px;
          border-radius: 0;
        }

        :global([data-theme='dark']) .odp-shipping-row { background: rgba(245, 158, 11, 0.08); }

        .odp-shipping-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .odp-edit-icon {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .odp-inline-edit { display: flex; align-items: center; gap: 4px; }

        .odp-shipping-input {
          width: 80px;
          padding: 4px 8px;
          border: 1.5px solid #667eea;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .odp-inline-save, .odp-inline-cancel {
          width: 26px; height: 26px;
          border: none; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
        }
        .odp-inline-save { background: #10b981; color: white; }
        .odp-inline-save:hover { background: #059669; }
        .odp-inline-cancel { background: #ef4444; color: white; }
        .odp-inline-cancel:hover { background: #dc2626; }

        .odp-total {
          border-top: 2px solid var(--border-primary);
          margin-top: 8px;
          padding-top: 12px;
          font-size: 17px !important;
          font-weight: 700 !important;
          color: var(--text-primary) !important;
        }

        /* ===== STATUS SELECT ===== */
        .odp-status-select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border-primary);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-secondary);
          cursor: pointer;
        }
        .odp-status-select:focus { outline: none; border-color: #667eea; }

        .odp-current-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        /* ===== TIMELINE ===== */
        .odp-timeline {
          position: relative;
          padding-left: 24px;
        }

        .odp-tl-item {
          position: relative;
          padding-bottom: 20px;
          padding-left: 16px;
        }

        .odp-tl-item:not(.odp-tl-last)::before {
          content: '';
          position: absolute;
          left: -1px;
          top: 14px;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }

        :global([data-theme='dark']) .odp-tl-item:not(.odp-tl-last)::before { background: #374151; }

        .odp-tl-dot {
          position: absolute;
          left: -6px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2.5px solid var(--bg-card);
          box-shadow: 0 0 0 2px #e5e7eb;
        }

        .odp-tl-content {
          padding: 0;
        }

        .odp-tl-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .odp-tl-date {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .odp-tl-note {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
          font-style: italic;
        }

        /* ===== CUSTOMER CARD ===== */
        .odp-customer {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .odp-customer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .odp-customer-details { flex: 1; min-width: 0; }

        .odp-customer-details h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 10px;
        }

        .odp-contact-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .odp-contact-row a {
          color: #667eea;
          text-decoration: none;
          word-break: break-all;
        }
        .odp-contact-row a:hover { text-decoration: underline; }

        .odp-na { color: #9ca3af; font-style: italic; }

        /* ===== PAYMENT INFO ===== */
        .odp-info-rows { display: flex; flex-direction: column; gap: 0; }

        .odp-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 13px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-primary);
        }
        .odp-info-row:last-child { border-bottom: none; }

        .odp-info-val {
          font-weight: 600;
          color: var(--text-primary);
        }

        .odp-bold { font-weight: 700; font-size: 15px; }

        .odp-payment-badge {
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .odp-payment-badge.paid { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .odp-payment-badge.pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }

        /* ===== ADDRESS ===== */
        .odp-address {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .odp-address p { margin: 0; }
        .odp-address-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px !important;
        }
        .odp-address-phone {
          margin-top: 8px !important;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .odp-map-section {
          margin-top: 14px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border-primary);
        }

        .odp-navigate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: #10b981;
          color: white;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .odp-navigate-btn:hover { background: #059669; }

        /* ===== FOOTER ===== */
        .odp-footer {
          margin-top: 8px;
          display: flex;
          justify-content: flex-end;
        }

        .odp-footer-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--bg-card);
          border: 1.5px solid var(--border-primary);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .odp-footer-btn:hover { border-color: #667eea; color: #667eea; }

        /* ===== RESPONSIVE: TABLET ===== */
        @media (max-width: 960px) {
          .odp-grid {
            grid-template-columns: 1fr;
          }
          .odp-sidebar { order: -1; }
        }

        /* ===== RESPONSIVE: MOBILE ===== */
        @media (max-width: 640px) {
          .odp { padding: 0 2px 30px; }

          .odp-header-card { padding: 16px; border-radius: 12px; }

          .odp-header-top { flex-direction: column; gap: 12px; align-items: flex-start; }

          .odp-order-id { font-size: 18px; }

          .odp-header-stats { gap: 20px; }

          .odp-approval-card { padding: 18px; border-radius: 12px; }

          .odp-approval-top { gap: 12px; }

          .odp-approval-badge { width: 38px; height: 38px; }

          .odp-approval-text h3 { font-size: 16px; }

          .odp-approval-body,
          .odp-reject-body {
            padding: 16px;
          }

          .odp-approval-input { padding: 11px 14px; font-size: 15px; }

          .odp-approval-btns {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .odp-btn-approve,
          .odp-btn-reject,
          .odp-btn-reject-confirm,
          .odp-btn-cancel {
            padding: 12px 14px;
            font-size: 14px;
          }

          .odp-card {
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 12px;
          }

          .odp-card-header { margin-bottom: 14px; }

          .odp-item { gap: 10px; padding: 10px 0; }

          .odp-item-img { width: 50px; height: 50px; border-radius: 8px; }

          .odp-item-info h4 { font-size: 13px; }
          .odp-item-price { font-size: 12px; }
          .odp-item-total { font-size: 14px; }

          .odp-shipping-row {
            margin: 4px -16px;
            padding: 8px 16px;
          }

          .odp-customer { flex-direction: column; align-items: stretch; gap: 10px; }

          .odp-customer-avatar {
            width: 40px;
            height: 40px;
            font-size: 16px;
            border-radius: 12px;
          }

          .odp-approved-banner,
          .odp-rejected-banner {
            font-size: 13px;
            padding: 12px 16px;
          }

          .odp-footer { justify-content: stretch; }
          .odp-footer-btn { width: 100%; justify-content: center; }

          .odp-grid { gap: 0; }
          .odp-sidebar { order: -1; }
        }

        /* ===== PRINT ===== */
        @media print {
          .odp-back,
          .odp-footer,
          .odp-approval-card,
          .odp-header-action,
          .odp-edit-icon,
          .odp-navigate-btn { display: none !important; }

          .odp-card,
          .odp-header-card {
            box-shadow: none;
            border: 1px solid #e5e7eb;
            break-inside: avoid;
          }

          .odp-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default OrderDetailsPage;
