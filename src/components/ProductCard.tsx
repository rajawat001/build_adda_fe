import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import productService from '../services/product.service';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  showWishlist?: boolean;
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist, showWishlist = true }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  // Check if product is in wishlist on mount
  useEffect(() => {
    try {
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData && wishlistData !== 'undefined') {
        const wishlist = JSON.parse(wishlistData);
        setIsInWishlist(wishlist.some((item: any) => item._id === product._id));
      }
    } catch {
      // ignore parse errors
    }
  }, [product._id]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleToggleWishlist = async () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') {
      router.push('/login');
      return;
    }

    setWishlistLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        try {
          await productService.removeFromWishlist(product._id);
        } catch (err) {
          console.log('Backend wishlist removal failed, updating locally');
        }

        // Update localStorage
        const wishlistData = localStorage.getItem('wishlist');
        const wishlist = wishlistData && wishlistData !== 'undefined' ? JSON.parse(wishlistData) : [];
        const filtered = wishlist.filter((item: any) => item._id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(filtered));
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        try {
          await productService.addToWishlist(product._id);
        } catch (err) {
          console.log('Backend wishlist add failed, updating locally');
        }

        // Update localStorage
        const wishlistData = localStorage.getItem('wishlist');
        const wishlist = wishlistData && wishlistData !== 'undefined' ? JSON.parse(wishlistData) : [];
        if (!wishlist.find((item: any) => item._id === product._id)) {
          wishlist.push(product);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsInWishlist(true);
      }

      // Trigger storage event to update header wishlist count
      window.dispatchEvent(new Event('storage'));

      // Also call legacy callback if provided
      if (onAddToWishlist) {
        onAddToWishlist(product);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle both category as string and as object
  const categoryName = typeof product.category === 'string'
    ? product.category
    : product.category?.name || 'Unknown';

  // Default placeholder image (simple gray building materials icon)
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik0xNTAgMTAwaDEwMHYyMDBoLTEwMHoiIGZpbGw9IiNkOTc3MDYiLz48cGF0aCBkPSJNMTgwIDEzMGg0MHY0MGgtNDB6TTEwMCAyMDBoMjAwdjIwaC0yMDB6IiBmaWxsPSIjYjQ1MzA5Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnVpbGRpbmcgTWF0ZXJpYWw8L3RleHQ+PC9zdmc+';

  return (
    <div className="product-card">
      <Link href={`/products/${product._id}`} className="product-image-link">
        <div className="product-image">
          <img
            src={product.image || defaultImage}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          {showWishlist && (
            <button
              className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
              disabled={wishlistLoading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleWishlist();
              }}
            >
              <FiHeart size={16} fill={isInWishlist ? '#e74c3c' : 'none'} />
            </button>
          )}
        </div>
      </Link>

      <div className="product-info">
        <Link href={`/products/${product._id}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>
        <p className="category">{categoryName}</p>
        <p className="distributor">
          By: <Link href={`/distributor/${product.distributor._id}`}>
            {product.distributor.businessName}
          </Link>
        </p>
        <div className="product-footer">
          <span className="price">
            {product.realPrice && product.realPrice > product.price ? (
              <>
                <span className="real-price">₹{product.realPrice.toLocaleString('en-IN')}</span>
                <span className="offer-price">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="discount-badge">
                  {Math.round(((product.realPrice - product.price) / product.realPrice) * 100)}% OFF
                </span>
              </>
            ) : (
              <>₹{product.price.toLocaleString('en-IN')}</>
            )}
          </span>
          <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <button
          className="btn-add-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <FiShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
