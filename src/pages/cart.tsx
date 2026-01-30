import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function Cart() {
  const router = useRouter();
  const { cart, cartTotal, currentDistributor, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  return (
    <>
      <SEO title="Shopping Cart" />
      <Header />

      <main className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p>Your cart is empty</p>
              <button onClick={() => router.push('/products')}>Continue Shopping</button>
            </div>
          ) : (
            <>
              {/* Current Distributor Info */}
              {currentDistributor && (
                <div className="cart-distributor-info">
                  <span className="distributor-label">Shopping from:</span>
                  <Link href={`/distributor/${currentDistributor._id}`}>
                    <span className="distributor-name">{currentDistributor.businessName}</span>
                  </Link>
                  <button
                    className="btn-clear-cart"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) {
                        clearCart();
                      }
                    }}
                  >
                    Clear Cart
                  </button>
                </div>
              )}

              <div className="cart-content">
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item._id} className="cart-item">
                      <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                      <div className="item-details">
                        <Link href={`/products/${item._id}`}>
                          <h3>{item.name}</h3>
                        </Link>
                        <p className="price">
                          {item.realPrice && item.realPrice > item.price ? (
                            <>
                              <span className="cart-real-price">₹{item.realPrice.toLocaleString('en-IN')}</span>
                              <span className="cart-offer-price">₹{item.price.toLocaleString('en-IN')}</span>
                              <span className="cart-discount-badge">
                                {Math.round(((item.realPrice - item.price) / item.realPrice) * 100)}% OFF
                              </span>
                            </>
                          ) : (
                            <>₹{item.price.toLocaleString('en-IN')}</>
                          )}
                          {item.unit && <span className="cart-unit"> / {item.unit}</span>}
                        </p>
                        {(item.minQuantity > 1 || item.maxQuantity) && (
                          <p className="quantity-limits">
                            <small>
                              Min: {item.minQuantity || 1}
                              {item.maxQuantity && ` | Max: ${item.maxQuantity}`}
                            </small>
                          </p>
                        )}
                      </div>
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= (item.minQuantity || 1)}
                        >-</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : item.quantity >= item.stock}
                        >+</button>
                      </div>
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {(() => {
                    const totalSavings = cart.reduce((sum, item) => {
                      if (item.realPrice && item.realPrice > item.price) {
                        return sum + ((item.realPrice - item.price) * item.quantity);
                      }
                      return sum;
                    }, 0);
                    return totalSavings > 0 ? (
                      <div className="summary-row savings-row">
                        <span>You Save:</span>
                        <span className="savings-amount">-₹{totalSavings.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null;
                  })()}
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span className="free-shipping">
                      Added after approval</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="single-distributor-note">
                    All items must be from the same distributor
                  </p>
                  <button className="btn-checkout" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .cart-distributor-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #fed7aa;
        }

        .distributor-label {
          color: #9a3412;
          font-size: 0.875rem;
        }

        .distributor-name {
          font-weight: 600;
          color: #c2410c;
          font-size: 1rem;
          cursor: pointer;
        }

        .distributor-name:hover {
          text-decoration: underline;
        }

        .btn-clear-cart {
          margin-left: auto;
          padding: 8px 16px;
          background: white;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          color: #dc2626;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-clear-cart:hover {
          background: #fef2f2;
          border-color: #f87171;
        }

        .empty-cart-icon {
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .single-distributor-note {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
          margin: 12px 0;
          padding: 8px;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .free-shipping {
          color: #059669;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .cart-distributor-info {
            flex-wrap: wrap;
          }

          .btn-clear-cart {
            margin-left: 0;
            margin-top: 8px;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
