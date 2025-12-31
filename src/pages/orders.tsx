import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import orderService from '../services/order.service';

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
  totalAmount: number;
  status: string;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // SECURITY FIX: Don't check localStorage for token - it's in httpOnly cookie
      // The API call will automatically send the cookie
      const response = await orderService.getMyOrders();
      setOrders(response.data.orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      // If unauthorized (401), redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'processing': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <SEO title="My Orders" description="View your order history" />
        <Header />
        <div className="orders-container">
          <p>Loading orders...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="My Orders" description="View and track your orders" />
      <Header />
      
      <div className="orders-container">
        <h1>My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>You haven't placed any orders yet</p>
            <button onClick={() => router.push('/products')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNumber}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  <div className="order-status-badge">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.product.image} alt={item.product.name} />
                      <div className="item-details">
                        <p className="item-name">{item.product.name}</p>
                        <p className="item-quantity">Qty: {item.quantity}</p>
                      </div>
                      <p className="item-price">₹{item.price}</p>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-payment">
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    <p><strong>Status:</strong> {order.paymentStatus}</p>
                  </div>
                  
                  <div className="order-total">
                    <p className="total-label">Total Amount</p>
                    <p className="total-amount">₹{order.totalAmount}</p>
                  </div>
                </div>
                
                <div className="order-actions">
                  <button 
                    className="btn-view-details"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                  
                  {order.status.toLowerCase() === 'pending' && (
                    <button className="btn-cancel">Cancel Order</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedOrder && (
          <div className="order-modal" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
              
              <h2>Order Details</h2>
              
              <div className="modal-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.phone}</p>
                <p>{selectedOrder.shippingAddress.address}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                <p>PIN: {selectedOrder.shippingAddress.pincode}</p>
              </div>
              
              <div className="modal-section">
                <h3>Order Items</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="modal-item">
                    <p>{item.product.name}</p>
                    <p>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default Orders;