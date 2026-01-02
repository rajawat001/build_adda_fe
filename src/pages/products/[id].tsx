import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/product.service';
import { Product } from '../../types';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      checkWishlistStatus();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch product details
      const response = await productService.getProductById(id as string);

      // Handle different response structures
      let productData: Product;
      if (response.product) {
        productData = response.product;
      } else if (response.data?.product) {
        productData = response.data.product;
      } else {
        productData = response;
      }

      setProduct(productData);
      setSelectedImage(productData.image);

      // Fetch related products (same category)
      if (productData.category) {
        const categoryId = typeof productData.category === 'string'
          ? productData.category
          : productData.category._id;
        fetchRelatedProducts(categoryId);
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string) => {
    try {
      const response = await productService.getProductsByCategory(categoryId);

      // Handle different response structures
      let products: Product[] = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response.products) {
        products = response.products;
      } else if (response.data?.products) {
        products = response.data.products;
      }

      // Filter out current product and limit to 4
      const filtered = products
        .filter((p: Product) => p._id !== id)
        .slice(0, 4);

      setRelatedProducts(filtered);
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlist = JSON.parse(wishlistData);
        setIsInWishlist(wishlist.some((item: any) => item._id === id));
      }
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  };

  const handleAddToCart = async () => {
    try {
      const user = localStorage.getItem('user');

      if (!user) {
        router.push('/login');
        return;
      }

      setAddingToCart(true);

      // Try to add to backend cart
      try {
        await productService.addToCart(product!._id, quantity);
      } catch (err) {
        console.log('Backend cart failed, using local cart');
      }

      // Also update local cart for immediate UI feedback
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: any) => item._id === product!._id);

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Trigger storage event to update header
      window.dispatchEvent(new Event('storage'));

      alert(`Added ${quantity} ${product!.name} to cart!`);

    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const user = localStorage.getItem('user');

      if (!user) {
        router.push('/login');
        return;
      }

      setAddingToWishlist(true);

      if (isInWishlist) {
        // Remove from wishlist
        try {
          await productService.removeFromWishlist(product!._id);
        } catch (err) {
          console.log('Backend wishlist removal failed');
        }

        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const filtered = wishlist.filter((item: any) => item._id !== product!._id);
        localStorage.setItem('wishlist', JSON.stringify(filtered));
        setIsInWishlist(false);
        alert('Removed from wishlist');
      } else {
        // Add to wishlist
        try {
          await productService.addToWishlist(product!._id);
        } catch (err) {
          console.log('Backend wishlist failed, using local wishlist');
        }

        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!wishlist.find((item: any) => item._id === product!._id)) {
          wishlist.push(product);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsInWishlist(true);
        alert('Added to wishlist!');
      }

      // Trigger storage event to update header
      window.dispatchEvent(new Event('storage'));

    } catch (err: any) {
      console.error('Error updating wishlist:', err);
      alert(err.response?.data?.message || 'Error updating wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/cart');
    }, 500);
  };

  if (loading) {
    return (
      <>
        <SEO title="Loading..." />
        <Header />
        <div className="product-detail-container">
          <div className="loading-spinner">Loading product details...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO title="Product Not Found" />
        <Header />
        <div className="product-detail-container">
          <div className="error-container">
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const inStock = product.stock > 0;
  const category = typeof product.category === 'object' ? product.category?.name : product.category;
  const distributor = typeof product.distributor === 'object' ? product.distributor : null;

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
      />
      <Header />

      <div className="product-detail-page">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/products">Products</Link>
          {category && (
            <>
              <span className="separator">/</span>
              <span>{category}</span>
            </>
          )}
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>

        {/* Product Detail */}
        <div className="product-detail-container">
          {/* Image Gallery */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={selectedImage || product.image || '/placeholder-product.png'}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                }}
              />
            </div>

            {product.images && product.images.length > 0 && (
              <div className="image-thumbnails">
                <div
                  className={`thumbnail ${selectedImage === product.image ? 'active' : ''}`}
                  onClick={() => setSelectedImage(product.image)}
                >
                  <img src={product.image} alt={product.name} />
                </div>
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>

            {category && (
              <div className="product-category">
                <span className="label">Category:</span>
                <Link href={`/products?category=${category}`} className="category-link">
                  {category}
                </Link>
              </div>
            )}

            <div className="product-price">
              <span className="currency">₹</span>
              <span className="amount">{product.price.toLocaleString('en-IN')}</span>
            </div>

            <div className="product-stock">
              {inStock ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {distributor && (
              <div className="product-distributor">
                <span className="label">Sold by:</span>
                <Link
                  href={`/distributor/${distributor._id}`}
                  className="distributor-link"
                >
                  {distributor.businessName}
                </Link>
              </div>
            )}

            {/* Quantity Selector */}
            {inStock && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(product.stock, Math.max(1, val)));
                    }}
                    min="1"
                    max={product.stock}
                    className="qty-input"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              {inStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="btn-add-to-cart"
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart}
                    className="btn-buy-now"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <button disabled className="btn-out-of-stock">
                  Out of Stock
                </button>
              )}

              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {isInWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="products-grid">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
