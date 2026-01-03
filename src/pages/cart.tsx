import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item._id === productId) {
        const minQty = item.minQuantity || 1;
        const maxQty = item.maxQuantity;
        let newQty = item.quantity + delta;

        // Enforce minimum quantity
        newQty = Math.max(minQty, newQty);

        // Enforce maximum quantity if set
        if (maxQty && newQty > maxQty) {
          alert(`Maximum quantity for ${item.name} is ${maxQty}`);
          newQty = maxQty;
        }

        if (newQty < minQty) {
          alert(`Minimum quantity for ${item.name} is ${minQty}`);
          newQty = minQty;
        }

        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter(item => item._id !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
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
          
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button onClick={() => router.push('/')}>Continue Shopping</button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="price">₹{item.price}</p>
                      <p className="distributor">{item.distributor?.businessName}</p>
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
                        onClick={() => updateQuantity(item._id, -1)}
                        disabled={item.quantity <= (item.minQuantity || 1)}
                      >-</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        disabled={item.maxQuantity && item.quantity >= item.maxQuantity}
                      >+</button>
                    </div>
                    <div className="item-total">
                      ₹{item.price * item.quantity}
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{getTotal()}</span>
                </div>
                <button className="btn-checkout" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}