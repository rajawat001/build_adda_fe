import React from 'react';
import { useCart } from '../context/CartContext';

const CartConflictModal: React.FC = () => {
  const {
    isCartConflictOpen,
    pendingItem,
    currentDistributor,
    confirmReplaceCart,
    cancelReplaceCart
  } = useCart();

  if (!isCartConflictOpen || !pendingItem) return null;

  const newDistributorName = pendingItem.product.distributor?.businessName
    || pendingItem.product.distributorName
    || 'another distributor';

  return (
    <div className="cart-conflict-overlay" onClick={cancelReplaceCart}>
      <div className="cart-conflict-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-conflict-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="cart-conflict-title">Replace cart items?</h3>

        <p className="cart-conflict-message">
          Your cart contains items from <strong>{currentDistributor?.businessName || 'another distributor'}</strong>.
          Do you want to clear your cart and add items from <strong>{newDistributorName}</strong>?
        </p>

        <div className="cart-conflict-info">
          <div className="cart-conflict-info-item">
            <span className="info-label">Adding:</span>
            <span className="info-value">{pendingItem.product.name}</span>
          </div>
          <div className="cart-conflict-info-item">
            <span className="info-label">From:</span>
            <span className="info-value">{newDistributorName}</span>
          </div>
        </div>

        <div className="cart-conflict-actions">
          <button
            className="btn-cancel"
            onClick={cancelReplaceCart}
          >
            No, keep current cart
          </button>
          <button
            className="btn-confirm"
            onClick={confirmReplaceCart}
          >
            Yes, start fresh
          </button>
        </div>
      </div>

      <style jsx>{`
        .cart-conflict-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cart-conflict-modal {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cart-conflict-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: #fff3cd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #856404;
        }

        .cart-conflict-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 12px;
        }

        .cart-conflict-message {
          font-size: 0.95rem;
          color: #666;
          line-height: 1.5;
          margin: 0 0 20px;
        }

        .cart-conflict-message strong {
          color: #FF6B35;
          font-weight: 600;
        }

        .cart-conflict-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .cart-conflict-info-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.875rem;
        }

        .cart-conflict-info-item:not(:last-child) {
          border-bottom: 1px solid #e9ecef;
        }

        .info-label {
          color: #6c757d;
        }

        .info-value {
          color: #1a1a2e;
          font-weight: 500;
          text-align: right;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cart-conflict-actions {
          display: flex;
          gap: 12px;
        }

        .cart-conflict-actions button {
          flex: 1;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: #f1f3f4;
          border: none;
          color: #5f6368;
        }

        .btn-cancel:hover {
          background: #e8eaed;
        }

        .btn-confirm {
          background: #FF6B35;
          border: none;
          color: white;
        }

        .btn-confirm:hover {
          background: #e55a2b;
        }

        @media (max-width: 480px) {
          .cart-conflict-modal {
            padding: 20px;
          }

          .cart-conflict-actions {
            flex-direction: column-reverse;
          }

          .cart-conflict-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CartConflictModal;
