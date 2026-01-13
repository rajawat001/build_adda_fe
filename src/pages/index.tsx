import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import productService from '../services/product.service';
import api from '../services/api';
import { Product } from '../types';
import {
  FiTruck,
  FiShield,
  FiAward,
  FiHeadphones,
  FiArrowRight,
  FiMapPin,
  FiStar
} from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadProducts();
    loadDistributors();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 8 });

      let productList: Product[] = [];

      // ✅ Normalize API response
      if (Array.isArray(response)) {
        productList = response;
      } else if (response?.products && Array.isArray(response.products)) {
        productList = response.products;
      } else if (response?.data?.products && Array.isArray(response.data.products)) {
        productList = response.data.products;
      }

      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await api.get('/users/distributors?limit=6');
      const distributorList = response.data.distributors || [];
      setDistributors(distributorList);
    } catch (error) {
      console.error('Error loading distributors:', error);
      setDistributors([]);
    }
  };

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item._id === product._id);

    const minQty = product.minQuantity || 1;
    const maxQty = product.maxQuantity || product.stock;

    if (existing) {
      const newQuantity = existing.quantity + minQty;

      // Check if adding minQty exceeds max
      if (newQuantity > maxQty) {
        alert(`Cannot add more. Maximum quantity for ${product.name} is ${maxQty}`);
        return;
      }

      existing.quantity = newQuantity;
    } else {
      cart.push({ ...product, quantity: minQty });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${minQty} ${product.name} to cart!`);
  };

  const handleAddToWishlist = (product: Product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((item: any) => item._id === product._id);

    if (exists) {
      const updated = wishlist.filter((item: any) => item._id !== product._id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    } else {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  };

  const categories = [
    {
      id: 'Cement',
      name: 'Cement',
      icon: '🏗️',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'
    },
    {
      id: 'Steel',
      name: 'Steel',
      icon: '🔩',
      image: 'https://images.unsplash.com/photo-1565345168949-06f289df4e1f?w=400'
    },
    {
      id: 'Bricks',
      name: 'Bricks',
      icon: '🧱',
      image: 'https://images.unsplash.com/photo-1594074792512-4e5e6c127a6e?w=400'
    },
    {
      id: 'Sand',
      name: 'Sand',
      icon: '⏳',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400'
    },
    {
      id: 'Paint',
      name: 'Paint',
      icon: '🎨',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400'
    },
    {
      id: 'Tiles',
      name: 'Tiles',
      icon: '◽',
      image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400'
    }
  ];

  const features = [
    {
      icon: FiTruck,
      title: 'Fast Delivery',
      description: 'Same day delivery available in select cities'
    },
    {
      icon: FiShield,
      title: 'Secure Payment',
      description: 'Your payment information is safe with us'
    },
    {
      icon: FiAward,
      title: 'Quality Assured',
      description: 'All products from verified distributors only'
    },
    {
      icon: FiHeadphones,
      title: '24/7 Support',
      description: 'We are here to help you anytime'
    }
  ];

  return (
    <>
      <SEO
        title="BuildAdda - Quality Building Materials Online"
        description="Buy quality building materials from trusted distributors near you. Cement, Steel, Bricks, Sand and more at best prices."
      />

      <Header />

      <main className="modern-home-page">
        {/* HERO BANNER */}
        <section className="hero-banner">
          <div className="hero-content">
            <div className="container">
              <div className="hero-text">
                <h1 className="hero-title">
                  Quality Building Materials <br />
                  <span className="highlight">at Your Doorstep</span>
                </h1>
                <p className="hero-subtitle">
                  Find cement, steel, bricks and more from verified distributors near you.
                  Compare prices and get the best deals.
                </p>
                <div className="hero-actions">
                  <button
                    className="btn-primary-large"
                    onClick={() => router.push('/products')}
                  >
                    Explore Products
                    <FiArrowRight />
                  </button>
                  <button
                    className="btn-secondary-large"
                    onClick={() => router.push('/distributors')}
                  >
                    <FiMapPin />
                    Find Distributors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Browse our wide range of building materials</p>
            </div>

            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => router.push(`/products?category=${category.id}`)}
                >
                  <div className="category-image">
                    <img src={category.image} alt={category.name} />
                    <div className="category-overlay">
                      <span className="category-icon">{category.icon}</span>
                    </div>
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked products for your construction needs</p>
            </div>

            {loading ? (
              <div className="loading-state">
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>No products available at the moment.</p>
              </div>
            ) : (
              <>
                <div className="product-grid-modern">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  ))}
                </div>
                <div className="section-footer">
                  <button
                    className="btn-view-all"
                    onClick={() => router.push('/products')}
                  >
                    View All Products
                    <FiArrowRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* BEST DISTRIBUTORS */}
        <section className="distributors-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Top Rated Distributors</h2>
              <p className="section-subtitle">
                Connect with verified distributors in your area
              </p>
            </div>

            <div className="distributors-grid">
              {distributors.slice(0, 6).map((distributor) => (
                <div
                  key={distributor._id}
                  className="distributor-card-modern"
                  onClick={() => router.push(`/distributor/${distributor._id}`)}
                >
                  <div className="distributor-header">
                    <div className="distributor-avatar">
                      {distributor.businessName.charAt(0)}
                    </div>
                    {distributor.isApproved && (
                      <span className="verified-badge-modern">✓ Verified</span>
                    )}
                  </div>

                  <h3 className="distributor-name">{distributor.businessName}</h3>

                  <div className="distributor-info">
                    <div className="info-item">
                      <FiMapPin size={14} />
                      <span>{distributor.city}, {distributor.state}</span>
                    </div>
                    {distributor.rating && (
                      <div className="rating-row">
                        <FiStar size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{distributor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <button className="btn-view-distributor">
                    View Products
                    <FiArrowRight />
                  </button>
                </div>
              ))}
            </div>

            <div className="section-footer">
              <button
                className="btn-view-all"
                onClick={() => router.push('/distributors')}
              >
                View All Distributors
                <FiArrowRight />
              </button>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose BuildAdda?</h2>
              <p className="section-subtitle">
                We make construction material shopping easy and reliable
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <feature.icon size={32} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Start Your Construction Project?</h2>
              <p className="cta-subtitle">
                Join thousands of satisfied customers who trust BuildAdda for their building material needs
              </p>
              <button
                className="btn-cta"
                onClick={() => router.push('/products')}
              >
                Get Started Now
                <FiArrowRight />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}