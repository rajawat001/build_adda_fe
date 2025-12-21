import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createOrder, verifyPayment } from '../services/order.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    shippingAddress: '',
    phone: '',
    pincode: '',
    couponCode: '',
    paymentMethod: 'razorpay'
  });
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }
    setCartItems(cart);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal - discount;
  };

  const applyCoupon = async () => {
    // Call API to validate coupon
    // For now, mock implementation
    if (formData.couponCode === 'SAVE10') {
      setDiscount(getTotal() * 0.1);
      alert('Coupon applied! 10% discount');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleRazorpayPayment = async (orderId: string, amount: number) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'BuildAdda',
      description: 'Building Materials Purchase',
      order_id: orderId,
      handler: async (response: any) => {
        try {
          await verifyPayment({
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          
          localStorage.removeItem('cart');
          router.push('/order-success');
        } catch (error) {
          router.push('/order-failure');
        }
      },
      prefill: {
        email: localStorage.getItem('userEmail'),
        contact: formData.phone
      },
      theme: {
        color: '#3399cc'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: formData.shippingAddress,
        phone: formData.phone,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotal(),
        couponCode: formData.couponCode
      };

      const response = await createOrder(orderData);

      if (formData.paymentMethod === 'razorpay') {
        await handleRazorpayPayment(response.orderId, response.amount);
      } else {
        localStorage.removeItem('cart');
        router.push('/order-success');
      }
    } catch (error) {
      alert('Order creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" />
      <Header />
      
      <main className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          
          <div className="checkout-content">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <h2>Shipping Details</h2>
              
              <div className="form-group">
                <label>Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <h2>Payment Method</h2>
              
              <div className="form-group">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>

            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="summary-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="coupon-section">
                <input
                  type="text"
                  name="couponCode"
                  placeholder="Enter coupon code"
                  value={formData.couponCode}
                  onChange={handleChange}
                />
                <button type="button" onClick={applyCoupon}>Apply</button>
              </div>

              {discount > 0 && (
                <div className="summary-row">
                  <span>Discount:</span>
                  <span className="discount">-₹{discount}</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{getTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}