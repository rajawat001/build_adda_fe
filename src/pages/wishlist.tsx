import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import productService from '../services/product.service';
import { Product } from '../types';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      // SECURITY FIX: Don't check localStorage for token - it's in httpOnly cookie
      // The API call will automatically send the cookie
      const response = await productService.getWishlist();
      const wishlist = response.wishlist || [];
      setWishlistItems(wishlist);

      // Sync localStorage with backend data (backend is source of truth)
      localStorage.setItem('wishlist', JSON.stringify(wishlist));

      // Trigger storage event to update header count
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      // If unauthorized (401), redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      // Remove from backend
      await productService.removeFromWishlist(productId);

      // Update state
      const updatedWishlist = wishlistItems.filter(item => item._id !== productId);
      setWishlistItems(updatedWishlist);

      // Update localStorage
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

      // Trigger storage event to update header
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error removing from wishlist:', error);

      // Even if backend fails, try to remove from localStorage
      const updatedWishlist = wishlistItems.filter(item => item._id !== productId);
      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      // Find the product in wishlist
      const product = wishlistItems.find(item => item._id === productId);
      if (!product) return;

      // Add to cart (localStorage)
      const cartData = localStorage.getItem('cart');
      const cart = cartData && cartData !== 'undefined' ? JSON.parse(cartData) : [];

      const existingIndex = cart.findIndex((item: any) => item._id === productId);
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Remove from wishlist
      await removeFromWishlist(productId);

      // Trigger storage event to update header
      window.dispatchEvent(new Event('storage'));

      alert('Product moved to cart!');
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Failed to move product to cart');
    }
  };

  if (loading) {
    return (
      <>
        <SEO title="Wishlist" description="Your wishlist items" />
        <Header />
        <div className="wishlist-container">
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="My Wishlist" description="View and manage your wishlist" />
      <Header />
      
      <div className="wishlist-container">
        <h1>My Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <p>Your wishlist is empty</p>
            <button onClick={() => router.push('/products')}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <p className="wishlist-count">{wishlistItems.length} items</p>
            
            <div className="wishlist-grid">
              {wishlistItems.map((product) => (
                <div key={product._id} className="wishlist-item">
                  <ProductCard product={product} />
                  
                  <div className="wishlist-actions">
                    <button 
                      className="btn-move-to-cart"
                      onClick={() => moveToCart(product._id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                    </button>
                    
                    <button 
                      className="btn-remove"
                      onClick={() => removeFromWishlist(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default Wishlist;