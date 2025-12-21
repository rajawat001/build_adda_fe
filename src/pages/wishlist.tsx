import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/product.service';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  distributor: {
    _id: string;
    businessName: string;
  };
  stock: number;
}

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
      setWishlistItems(response.data.wishlist);
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
      await productService.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      await productService.addToCart(productId, 1);
      await removeFromWishlist(productId);
      alert('Product moved to cart!');
    } catch (error) {
      console.error('Error moving to cart:', error);
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