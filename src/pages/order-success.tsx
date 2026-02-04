import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../components/SEO';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId, orderNumber, guest, email } = router.query;
  const isGuest = guest === 'true';

  useEffect(() => {
    // Clear cart after successful order
    localStorage.removeItem('cart');
  }, []);

  return (
    <>
      <SEO title="Order Successful" description="Your order has been placed successfully" />
      
      <div className="order-status-page">
        <div className="status-container success">
          <div className="status-icon">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#4CAF50" />
              <path d="M30 50 L45 65 L70 35" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h1>Order Placed Successfully!</h1>
          
          {orderNumber && (
            <div className="order-details">
              <p className="order-number">Order Number: <strong>#{orderNumber}</strong></p>
              <p className="order-message">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
            </div>
          )}
          
          <div className="status-info">
            <div className="info-item">
              <span className="icon">📧</span>
              <p>
                {isGuest && email
                  ? `Order confirmation sent to ${email}`
                  : 'Confirmation email sent to your registered email address'}
              </p>
            </div>

            <div className="info-item">
              <span className="icon">📦</span>
              <p>Your order will be processed and shipped soon</p>
            </div>

            <div className="info-item">
              <span className="icon">🔔</span>
              <p>You will receive updates about your order status</p>
            </div>

            {isGuest && (
              <div className="info-item" style={{ background: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                <span className="icon">👤</span>
                <p>
                  <Link href={`/register?email=${encodeURIComponent(email as string || '')}`}>
                    <strong style={{ color: '#2e7d32', cursor: 'pointer' }}>Create an account</strong>
                  </Link>
                  {' '}to track all your orders and get faster checkout next time.
                </p>
              </div>
            )}
          </div>

          <div className="action-buttons">
            {!isGuest && (
              <Link href={`/orders`}>
                <button className="btn-primary">View My Orders</button>
              </Link>
            )}

            <Link href="/">
              <button className="btn-secondary">Continue Shopping</button>
            </Link>

            {isGuest && (
              <Link href={`/register?email=${encodeURIComponent(email as string || '')}`}>
                <button className="btn-primary">Create Account</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-status-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .status-container {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .status-icon {
          margin-bottom: 2rem;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        h1 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }

        .order-details {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 2rem;
        }

        .order-number {
          font-size: 1.2rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .order-message {
          color: #7f8c8d;
        }

        .status-info {
          margin: 2rem 0;
          text-align: left;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-item .icon {
          font-size: 2rem;
        }

        .info-item p {
          color: #555;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
          border: none;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
        }

        .btn-secondary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover,
        .btn-secondary:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .status-container {
            padding: 2rem 1.5rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}