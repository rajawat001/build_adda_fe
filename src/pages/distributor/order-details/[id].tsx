import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../../components/distributor/Layout';
import api from '../../../services/api';

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
  statusHistory: Array<{
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

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get('/distributor/orders');
      const foundOrder = response.data.orders.find((o: any) => o._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await api.put(`/distributor/orders/${id}`, { orderStatus: newStatus });
      alert('Order status updated successfully');
      fetchOrderDetails();
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

  if (loading) {
    return (
      <DistributorLayout title="Order Details">
        <div className="loading">Loading order details...</div>
      </DistributorLayout>
    );
  }

  if (!order) {
    return (
      <DistributorLayout title="Order Not Found">
        <div className="error-state">
          <h2>Order Not Found</h2>
          <button onClick={() => router.back()}>Go Back</button>
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title={`Order #${order.orderNumber}`}>
      <div className="order-details-page">
        <div className="page-header">
          <div>
            <button className="btn-back" onClick={() => router.back()}>
              ← Back
            </button>
            <h1>Order #{order.orderNumber}</h1>
            <p className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="header-badges">
            <span
              className="approval-badge"
              style={{
                background:
                  order.approvalStatus === 'approved'
                    ? '#10b981'
                    : order.approvalStatus === 'rejected'
                    ? '#ef4444'
                    : '#f59e0b',
              }}
            >
              {order.approvalStatus === 'pending' && '⏳ Pending Approval'}
              {order.approvalStatus === 'approved' && '✓ Approved'}
              {order.approvalStatus === 'rejected' && '✗ Rejected'}
            </span>
            <span
              className="status-badge"
              style={{ background: getStatusColor(order.orderStatus) }}
            >
              {order.orderStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="content-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Order Items */}
            <div className="card">
              <h3>Order Items</h3>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-image">
                      <img
                        src={item.product.image || '/placeholder-product.jpg'}
                        alt={item.product.name}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      <span className="price">₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="total">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="card">
              <h3>Price Breakdown</h3>
              <div className="price-rows">
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
                {order.tax > 0 && (
                  <div className="price-row">
                    <span>Tax:</span>
                    <span>₹{order.tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Delivery Charge:</span>
                  <span>₹{order.deliveryCharge.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row total">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Customer Info */}
            <div className="card">
              <h3>Customer Information</h3>
              <div className="info-group">
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{order.user.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{order.user.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">
                    <a href={`tel:${order.user.phone}`}>{order.user.phone}</a>
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <h3>Shipping Address</h3>
              <div className="address-box">
                <p className="name">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="phone">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card">
              <h3>Payment Information</h3>
              <div className="info-group">
                <div className="info-row">
                  <span className="label">Method:</span>
                  <span className="value">{order.paymentMethod}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span
                    className="value"
                    style={{
                      color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                      fontWeight: 600,
                    }}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            {order.approvalStatus === 'approved' && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
              <div className="card">
                <h3>Update Order Status</h3>
                <div className="status-update-section">
                  <p className="current-status">
                    Current Status: <span style={{ color: getStatusColor(order.orderStatus), fontWeight: 'bold' }}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </p>
                  <select
                    className="status-select"
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                  >
                    {getValidNextStatuses(order.orderStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {order.approvalStatus === 'rejected' && order.rejectionReason && (
              <div className="card rejection">
                <h3>Rejection Reason</h3>
                <p>{order.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-details-page {
          max-width: 1200px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .btn-back {
          background: #edf2f7;
          color: #2d3748;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 8px 0;
        }

        .order-date {
          color: #718096;
          margin: 0;
        }

        .header-badges {
          display: flex;
          gap: 12px;
        }

        .approval-badge,
        .status-badge {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 20px 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: white;
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
          color: #1a202c;
          margin: 0 0 4px 0;
        }

        .item-details p {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }

        .item-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .item-price .price {
          font-size: 14px;
          color: #718096;
        }

        .item-price .total {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
        }

        .price-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          color: #4a5568;
        }

        .price-row.discount {
          color: #10b981;
        }

        .price-row.total {
          padding-top: 12px;
          border-top: 2px solid #e2e8f0;
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
        }

        .info-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .info-row .label {
          color: #718096;
        }

        .info-row .value {
          font-weight: 600;
          color: #1a202c;
        }

        .info-row .value a {
          color: #667eea;
          text-decoration: none;
        }

        .address-box {
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .address-box p {
          margin: 0 0 8px 0;
          color: #2d3748;
          font-size: 14px;
        }

        .address-box .name {
          font-weight: 600;
          font-size: 15px;
        }

        .address-box .phone {
          color: #667eea;
          margin-top: 12px;
        }

        .status-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .status-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .card.rejection {
          border-left: 4px solid #ef4444;
          background: #fef2f2;
        }

        .card.rejection p {
          color: #991b1b;
          margin: 0;
        }

        .loading,
        .error-state {
          text-align: center;
          padding: 60px;
        }

        @media (max-width: 968px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default OrderDetailsPage;
