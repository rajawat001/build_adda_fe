import { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleToggleWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product);
      setIsInWishlist(!isInWishlist);
    }
  };

  // Handle both category as string and as object
  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category?.name || 'Unknown';

  return (
    <div className="product-card">
      <Link href={`/products/${product._id}`} className="product-image-link">
        <div className="product-image">
          <img
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />
          {onAddToWishlist && (
            <button
              className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleToggleWishlist();
              }}
            >
              ♥
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
          <span className="price">₹{product.price}</span>
          <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        {onAddToCart && (
          <button 
            className="btn-add-cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}