import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../components/SEO';

export default function OrderFailure() {
  const router = useRouter();
  const { reason } = router.query;

  return (
    <>
      <SEO title="Order Failed" description="There was an issue with your order" />
      
      <div className="order-status-page">
        <div className="status-container failure">
          <div className="status-icon">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#F44336" />
              <path d="M35 35 L65 65 M65 35 L35 65" stroke="white" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          
          <h1>Order Failed</h1>
          
          <div className="error-details">
            <p className="error-message">
              We couldn't process your order. Please try again.
            </p>
            
            {reason && (
              <p className="error-reason">
                Reason: {reason}
              </p>
            )}
          </div>
          
          <div className="status-info">
            <div className="info-item">
              <span className="icon">💳</span>
              <p>No charges have been made to your account</p>
            </div>
            
            <div className="info-item">
              <span className="icon">🛒</span>
              <p>Your cart items are still saved</p>
            </div>
            
            <div className="info-item">
              <span className="icon">📞</span>
              <p>Contact support if you need assistance: support@buildmat.com</p>
            </div>
          </div>
          
          <div className="action-buttons">
            <Link href="/checkout">
              <button className="btn-primary">Try Again</button>
            </Link>
            
            <Link href="/cart">
              <button className="btn-secondary">View Cart</button>
            </Link>
            
            <Link href="/">
              <button className="btn-tertiary">Go Home</button>
            </Link>
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
          animation: shake 0.5s ease-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        h1 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }

        .error-details {
          background: #ffebee;
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          border-left: 4px solid #F44336;
        }

        .error-message {
          color: #c62828;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .error-reason {
          color: #d32f2f;
          font-size: 0.9rem;
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
        .btn-secondary,
        .btn-tertiary {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
          border: none;
        }

        .btn-primary {
          background: #F44336;
          color: white;
        }

        .btn-secondary {
          background: #3498db;
          color: white;
        }

        .btn-tertiary {
          background: #95a5a6;
          color: white;
        }

        .btn-primary:hover,
        .btn-secondary:hover,
        .btn-tertiary:hover {
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