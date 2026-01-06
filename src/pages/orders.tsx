import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import orderService from '../services/order.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiX,
} from 'react-icons/fi';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  orderStatus: string;
  approvalStatus?: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#757575';
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#2196f3';
      case 'processing': return '#9c27b0';
      case 'shipped': return '#ff9800';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiCheckCircle />;
      case 'processing': return <FiPackage />;
      case 'shipped': return <FiTruck />;
      case 'delivered': return <FiCheckCircle />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiShoppingBag />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canCancelOrder = (orderDate: string, orderStatus: string) => {
    if (orderStatus && ['delivered', 'cancelled', 'shipped'].includes(orderStatus.toLowerCase())) {
      return false;
    }
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return (currentTime - orderTime) <= twoHoursInMs;
  };

  const handleCancelOrder = async (orderId: string, orderDate: string, orderStatus: string) => {
    if (!canCancelOrder(orderDate, orderStatus)) {
      alert('Orders can only be cancelled within 2 hours of placement and before shipping');
      return;
    }

    const confirmCancel = confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    try {
      await orderService.cancelOrder(orderId);
      alert('Order cancelled successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.orderStatus?.toLowerCase() === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus?.toLowerCase() === 'pending').length,
    delivered: orders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus?.toLowerCase() === 'cancelled').length,
  };

  if (loading) {
    return (
      <>
        <SEO title="My Orders" description="View your order history" />
        <Header />
        <div className="orders-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="My Orders" description="View and track your orders" />
      <Header />

      <div className="orders-page">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1>My Orders</h1>
              <p className="subtitle">Track and manage all your orders</p>
            </div>
          </div>

          {/* Stats Cards */}
          {orders.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">
                  <FiShoppingBag />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Orders</p>
                  <p className="stat-value">{stats.total}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">
                  <FiClock />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Pending</p>
                  <p className="stat-value">{stats.pending}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon delivered">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Delivered</p>
                  <p className="stat-value">{stats.delivered}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon cancelled">
                  <FiXCircle />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Cancelled</p>
                  <p className="stat-value">{stats.cancelled}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {orders.length > 0 && (
            <div className="filter-tabs">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'all' && ` (${orders.length})`}
                  {status !== 'all' && ` (${orders.filter(o => o.orderStatus?.toLowerCase() === status).length})`}
                </button>
              ))}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiShoppingBag />
              </div>
              <h2>No Orders Yet</h2>
              <p>You haven't placed any orders. Start shopping to see your orders here!</p>
              <button className="btn-primary" onClick={() => router.push('/products')}>
                Browse Products
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiShoppingBag />
              </div>
              <h2>No {filterStatus} Orders</h2>
              <p>You don't have any {filterStatus} orders at the moment.</p>
              <button className="btn-secondary" onClick={() => setFilterStatus('all')}>
                View All Orders
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    className="order-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Order Header */}
                    <div className="order-card-header">
                      <div className="order-meta">
                        <h3>#{order.orderNumber}</h3>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="status-badges">
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(order.orderStatus),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {getStatusIcon(order.orderStatus)}
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Approval Status */}
                    {order.approvalStatus && (
                      <div className="approval-status-banner"
                        style={{
                          background:
                            order.approvalStatus === 'approved'
                              ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                              : order.approvalStatus === 'rejected'
                              ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
                              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        }}
                      >
                        <span>
                          {order.approvalStatus === 'approved' && '✓ Approved by Distributor'}
                          {order.approvalStatus === 'pending' && '⏳ Awaiting Distributor Approval'}
                          {order.approvalStatus === 'rejected' && '✗ Rejected by Distributor'}
                        </span>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="order-item-preview">
                          <img
                            src={item.product.image || '/placeholder-product.png'}
                            alt={item.product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.png';
                            }}
                          />
                          <div className="item-info">
                            <p className="item-name">{item.product.name}</p>
                            <p className="item-qty">Qty: {item.quantity}</p>
                          </div>
                          <p className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="more-items">+{order.items.length - 2} more items</p>
                      )}
                    </div>

                    {/* Price Summary */}
                    <div className="order-price-summary">
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
                        <span>Delivery:</span>
                        <span>
                          {order.deliveryCharge > 0
                            ? `₹${order.deliveryCharge.toLocaleString('en-IN')}`
                            : order.approvalStatus === 'pending'
                            ? <span style={{ color: '#ff9800' }}>Pending</span>
                            : 'Free'}
                        </span>
                      </div>
                      <div className="price-row total">
                        <span>Total:</span>
                        <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="order-card-actions">
                      <Link href={`/orders/${order._id}`} className="btn-view">
                        <FiEye /> View Details
                      </Link>
                      {canCancelOrder(order.createdAt, order.orderStatus) && (
                        <button
                          className="btn-cancel-order"
                          onClick={() => handleCancelOrder(order._id, order.createdAt, order.orderStatus)}
                        >
                          <FiX /> Cancel Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .orders-page {
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          margin: 8px 0 0 0;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-icon.delivered {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-icon.cancelled {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #718096;
          margin: 0 0 4px 0;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .filter-tab {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }

        .filter-tab:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .filter-tab.active {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .orders-grid {
          display: grid;
          gap: 24px;
        }

        .order-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .order-card-header {
          padding: 24px 24px 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #f7fafc;
        }

        .order-meta h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 6px 0;
        }

        .order-date {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .status-badges {
          display: flex;
          gap: 8px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .approval-status-banner {
          padding: 12px 24px;
          color: white;
          font-weight: 600;
          text-align: center;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .order-items-preview {
          padding: 20px 24px;
        }

        .order-item-preview {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f7fafc;
        }

        .order-item-preview:last-child {
          border-bottom: none;
        }

        .order-item-preview img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 4px 0;
          font-size: 15px;
        }

        .item-qty {
          color: #718096;
          margin: 0;
          font-size: 13px;
        }

        .item-price {
          font-weight: 700;
          color: #667eea;
          font-size: 16px;
          margin: 0;
        }

        .more-items {
          text-align: center;
          color: #667eea;
          font-weight: 600;
          margin: 12px 0 0 0;
          font-size: 14px;
        }

        .order-price-summary {
          padding: 20px 24px;
          background: #f7fafc;
          border-top: 2px solid #e2e8f0;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 15px;
        }

        .price-row.discount {
          color: #22c55e;
        }

        .price-row.total {
          border-top: 2px solid #e2e8f0;
          margin-top: 8px;
          padding-top: 12px;
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
        }

        .order-card-actions {
          padding: 20px 24px;
          display: flex;
          gap: 12px;
        }

        .btn-view,
        .btn-cancel-order {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          font-size: 15px;
        }

        .btn-view {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-view:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-cancel-order {
          background: #fee;
          color: #dc2626;
          border: 2px solid #fecaca;
        }

        .btn-cancel-order:hover {
          background: #dc2626;
          color: white;
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 80px 40px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          color: white;
        }

        .empty-state h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          color: #718096;
          margin: 0 0 32px 0;
          font-size: 16px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #1a202c;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
        }

        .loading-container {
          text-align: center;
          padding: 100px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container p {
          color: #718096;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .orders-page {
            padding: 20px 12px;
          }

          .page-header h1 {
            font-size: 28px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
          }

          .filter-tab {
            white-space: nowrap;
          }

          .order-card-header {
            flex-direction: column;
            gap: 12px;
          }

          .order-card-actions {
            flex-direction: column;
          }

          .btn-view,
          .btn-cancel-order {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Orders;
