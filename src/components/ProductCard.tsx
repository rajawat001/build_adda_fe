import { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Use Cart Context for single-distributor cart logic
    addToCart(product);
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
        <button
          className="btn-add-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}