import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import orderService from '../../services/order.service';

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
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
  approvalStatus?: string;
  approvedAt?: string;
  rejectionReason?: string;
  distributor?: {
    _id: string;
    businessName: string;
    phone: string;
    email: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id as string);

      // Handle different response structures
      let orderData: Order;
      if (response.order) {
        orderData = response.order;
      } else if (response.data?.order) {
        orderData = response.data.order;
      } else {
        orderData = response;
      }

      setOrder(orderData);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Order not found');
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      await orderService.cancelOrder(id as string);
      alert('Order cancelled successfully');
      fetchOrderDetails(); // Refresh
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: '#ffc107',
      confirmed: '#2196f3',
      processing: '#9c27b0',
      shipped: '#ff9800',
      delivered: '#4caf50',
      cancelled: '#f44336',
      failed: '#f44336'
    };
    return statusColors[status] || '#757575';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <SEO title="Loading Order..." />
        <Header />
        <div className="order-detail-container">
          <div className="loading">Loading order details...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <SEO title="Order Not Found" />
        <Header />
        <div className="order-detail-container">
          <div className="error-state">
            <h2>Order Not Found</h2>
            <p>{error || 'The order you are looking for does not exist.'}</p>
            <Link href="/orders" className="btn-primary">
              View All Orders
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  return (
    <>
      <SEO title={`Order #${order.orderNumber}`} />
      <Header />

      <div className="order-detail-page">
        <div className="page-header">
          <Link href="/orders" className="back-link">
            ← Back to Orders
          </Link>
          <h1>Order Details</h1>
        </div>

        <div className="order-detail-container">
          {/* Order Summary Card */}
          <div className="order-summary-card">
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

            {/* Approval Status */}
            {order.approvalStatus && (
              <div className="info-section">
                <h3>Order Approval</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Approval Status:</span>
                    <span
                      className="value approval-badge"
                      style={{
                        color:
                          order.approvalStatus === 'approved'
                            ? '#4caf50'
                            : order.approvalStatus === 'rejected'
                            ? '#f44336'
                            : '#ff9800',
                        fontWeight: 'bold'
                      }}
                    >
                      {order.approvalStatus === 'approved' && '✓ APPROVED'}
                      {order.approvalStatus === 'pending' && '⏳ PENDING APPROVAL'}
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
                {order.approvalStatus === 'pending' && (
                  <div className="approval-note">
                    <p>Your order is awaiting distributor approval. The distributor will review and confirm the delivery charge.</p>
                  </div>
                )}
                {order.approvalStatus === 'rejected' && order.rejectionReason && (
                  <div className="rejection-reason">
                    <p><strong>Rejection Reason:</strong> {order.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Distributor Contact */}
            {order.distributor && (
              <div className="info-section">
                <h3>Distributor Information</h3>
                <div className="distributor-card">
                  <h4>{order.distributor.businessName}</h4>
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="icon">📞</span>
                      <a href={`tel:${order.distributor.phone}`}>{order.distributor.phone}</a>
                    </div>
                    <div className="contact-item">
                      <span className="icon">📧</span>
                      <a href={`mailto:${order.distributor.email}`}>{order.distributor.email}</a>
                    </div>
                  </div>
                  {order.approvalStatus === 'approved' && (
                    <p className="contact-note">
                      You can contact the distributor for any queries regarding your order.
                    </p>
                  )}
                </div>
              </div>
            )}

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

            {/* Tracking Info */}
            {(order.trackingNumber || order.estimatedDelivery) && (
              <div className="info-section">
                <h3>Tracking Information</h3>
                <div className="info-grid">
                  {order.trackingNumber && (
                    <div className="info-item">
                      <span className="label">Tracking Number:</span>
                      <span className="value">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="info-item">
                      <span className="label">Estimated Delivery:</span>
                      <span className="value">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>
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
                      <img src={item.image || '/placeholder-product.png'} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
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

            {/* Price Breakdown */}
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
                <div className="price-row">
                  <span>Delivery Charge:</span>
                  <span>
                    {order.deliveryCharge > 0
                      ? `₹${order.deliveryCharge.toLocaleString('en-IN')}`
                      : order.approvalStatus === 'pending'
                      ? 'Pending approval'
                      : 'Free'}
                  </span>
                </div>
                <div className="price-row total">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Order Status History */}
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
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="btn-cancel"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              <button onClick={() => window.print()} className="btn-secondary">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
