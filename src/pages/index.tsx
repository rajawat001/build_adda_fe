import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import productService from '../services/product.service';
import api from '../services/api';
import { Product } from '../types';
import { useLocation } from '../context/LocationContext';
import {
  FiTruck,
  FiShield,
  FiAward,
  FiHeadphones,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiStar,
  FiCheckCircle,
  FiBox,
  FiTool,
  FiGrid,
  FiDroplet,
  FiImage,
  FiSquare,
  FiPackage
} from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { location: userLocation, isLoading: locationLoading, clearLocation } = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [noLocalProducts, setNoLocalProducts] = useState(false);
  const [noLocalDistributors, setNoLocalDistributors] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const categoryAutoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const [isHoveringCategories, setIsHoveringCategories] = useState(false);

  // Icon mapping for categories
  const categoryIconMap: Record<string, any> = {
    'Cement': FiBox,
    'Steel': FiTool,
    'Bricks': FiGrid,
    'Sand': FiDroplet,
    'Paint': FiImage,
    'Tiles': FiSquare,
    'Other': FiPackage,
  };

  const getCategoryIcon = (name: string) => {
    const IconComponent = categoryIconMap[name] || FiPackage;
    return <IconComponent size={48} color="white" />;
  };

  /* ✅ HERO BANNER IMAGES */
  const bannerImages = [
    '/Banner/Build_Adda_banner.png',
    '/Banner/Banner_image1.png',
    '/Banner/Banner_image2.png',
    '/Banner/Banner_image3.png'
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  /* ✅ AUTO SCROLL EVERY 3 SECONDS */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load data immediately, then re-fetch when location becomes available
  const locationResolvedRef = useRef(false);

  useEffect(() => {
    // Always load categories (not location-dependent)
    loadCategories();
  }, []);

  useEffect(() => {
    // On first render, load without location if still detecting
    // When location resolves (or changes), re-fetch with location
    if (locationLoading && !locationResolvedRef.current) {
      // First load — show products immediately without location filter
      loadProducts();
      loadDistributors();
      return;
    }

    locationResolvedRef.current = true;
    loadProducts();
    loadDistributors();
  }, [locationLoading, userLocation]);

  // Auto-scroll categories
  useEffect(() => {
    if (isHoveringCategories) return;

    categoryAutoScrollRef.current = setInterval(() => {
      const container = categoryScrollRef.current;
      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 3000);

    return () => {
      if (categoryAutoScrollRef.current) {
        clearInterval(categoryAutoScrollRef.current);
      }
    };
  }, [isHoveringCategories]);

  const loadProducts = async () => {
    try {
      setNoLocalProducts(false);
      const params: any = { limit: 8 };
      if (userLocation) {
        params.pincode = userLocation.pincode;
        params.city = userLocation.city;
      }
      const response = await productService.getProducts(params);

      let productList: Product[] = [];

      if (Array.isArray(response)) {
        productList = response;
      } else if (response?.products && Array.isArray(response.products)) {
        productList = response.products;
      } else if (response?.data?.products && Array.isArray(response.data.products)) {
        productList = response.data.products;
      }

      // If location active but no products — show expanding message + load all
      if (productList.length === 0 && userLocation) {
        setNoLocalProducts(true);
        const allResponse = await productService.getProducts({ limit: 8 });
        let allProducts: Product[] = [];
        if (Array.isArray(allResponse)) {
          allProducts = allResponse;
        } else if (allResponse?.products) {
          allProducts = allResponse.products;
        } else if (allResponse?.data?.products) {
          allProducts = allResponse.data.products;
        }
        setProducts(allProducts);
      } else {
        setProducts(productList);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      setNoLocalDistributors(false);
      let response;
      if (userLocation) {
        response = await api.get(
          `/users/distributors/nearby?pincode=${userLocation.pincode}&city=${encodeURIComponent(userLocation.city)}`
        );
      } else {
        response = await api.get('/users/distributors?limit=6');
      }
      const distributorList = response.data.distributors || [];

      // If location active but no distributors — show expanding message + load all
      if (distributorList.length === 0 && userLocation) {
        setNoLocalDistributors(true);
        const fallback = await api.get('/users/distributors?limit=6');
        setDistributors((fallback.data.distributors || []).slice(0, 6));
      } else {
        setDistributors(distributorList.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
      try {
        const fallback = await api.get('/users/distributors?limit=6');
        setDistributors(fallback.data.distributors || []);
      } catch {
        setDistributors([]);
      }
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      const categoryList = response.data.categories || [];
      setCategories(categoryList);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const scrollCategories = useCallback((direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -250 : 250;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

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

  const features = [
    { icon: FiTruck, title: 'Fast Delivery', description: 'Same day delivery available in select cities' },
    { icon: FiShield, title: 'Quality Assured', description: 'All products are quality checked and certified' },
    { icon: FiAward, title: 'Best Prices', description: 'Competitive prices directly from manufacturers' },
    { icon: FiHeadphones, title: '24/7 Support', description: 'Round the clock customer support available' }
  ];

  // JSON-LD Structured Data for Homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.buildadda.in/#organization",
        "name": "BuildAdda",
        "url": "https://www.buildadda.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.buildadda.in/buildAddaBrandImage.png",
          "width": 250,
          "height": 60
        },
        "description": "India's Premier Building Materials Marketplace connecting buyers with verified distributors",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Jaipur",
          "addressRegion": "Rajasthan",
          "addressCountry": "India"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-6377845721",
          "contactType": "Customer Service",
          "email": "contact@buildadda.in",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        },
        "sameAs": [
          "https://www.facebook.com/share/16z1jBrpVs/",
          "https://x.com/buildadda14",
          "https://www.instagram.com/build_adda?igsh=OTd6aXRoeWszb3hr",
          "https://www.linkedin.com/company/buildadda/",
          "https://www.youtube.com/@BuildAdda"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.buildadda.in/#localbusiness",
        "name": "BuildAdda",
        "image": "https://www.buildadda.in/buildAddaBrandImage.png",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Jaipur",
          "addressRegion": "RJ",
          "postalCode": "302001",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 26.9124,
          "longitude": 75.7873
        },
        "telephone": "+91-6377845721",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.buildadda.in/#website",
        "url": "https://www.buildadda.in",
        "name": "BuildAdda",
        "description": "Buy building materials online from verified distributors",
        "publisher": {
          "@id": "https://www.buildadda.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.buildadda.in/products?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <>
      <SEO
        title="BuildAdda - Buy Building Materials Online | Cement, Steel, Bricks, Sand, Paint, Tiles"
        description="BuildAdda is India's premier building materials marketplace in Jaipur, Rajasthan. Buy cement, steel, bricks, sand, paint, tiles & construction supplies from verified distributors. Best prices, quality assured, free delivery on orders above ₹50,000. Shop now!"
        keywords="buy building materials online India, cement suppliers Jaipur, steel distributors Rajasthan, bricks online India, sand suppliers near me, paint dealers Jaipur, tiles shop online, construction materials marketplace, wholesale building supplies, verified distributors Jaipur, building materials Rajasthan, construction supplies India, cement price Jaipur, steel price India, bricks dealers, building materials e-commerce"
        canonicalUrl="https://www.buildadda.in"
        ogType="website"
        ogImage="https://www.buildadda.in/buildAddaBrandImage.png"
        jsonLd={structuredData}
      />

      <Header />

      <main className="modern-home-page">
        {/* HERO BANNER WITH AUTO SLIDER */}
        <section className="hero-banner">
          <div className="hero-banner-img-wrap">
            {bannerImages.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt={`BuildAdda Banner ${idx + 1}`}
                className={`hero-banner-img${idx === currentBanner ? ' active' : ''}`}
                width={1920}
                height={600}
                priority={idx === 0}
                sizes="100vw"
              />
            ))}
          </div>
          <div className="hero-content">
            <div className="container">
              <div className="hero-text">
                <h1 className="hero-title">
                  Quality <br />
                  Building Materials <br />
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
                    Explore Products <FiArrowRight />
                  </button>
                  <button
                    className="btn-secondary-large"
                    onClick={() => router.push('/distributors')}
                  >
                    <FiMapPin /> Find Distributors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION BANNER */}
        {userLocation && (
          <div className="location-banner">
            <FiMapPin size={16} />
            <span>Showing results near <strong>{userLocation.city || userLocation.pincode}</strong></span>
            <button className="location-banner-clear" onClick={clearLocation}>Show All</button>
          </div>
        )}

        {/* CATEGORIES */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Browse our wide range of building materials</p>
            </div>

            <div className="categories-scroll-wrapper"
              onMouseEnter={() => setIsHoveringCategories(true)}
              onMouseLeave={() => setIsHoveringCategories(false)}
            >
              <button
                className="category-scroll-btn category-scroll-left"
                onClick={() => scrollCategories('left')}
                aria-label="Scroll left"
              >
                <FiChevronLeft size={24} />
              </button>

              <div className="categories-grid" ref={categoryScrollRef}>
                {categories.map((category) => (
                  <div
                    key={category.id || category._id}
                    className="category-card"
                    onClick={() => router.push(`/products?category=${category.id || category.name}`)}
                  >
                    <div className="category-image">
                      {category.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={category.image} alt={category.name} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getCategoryIcon(category.name)}
                        </div>
                      )}
                      <div className="category-overlay">
                        <span className="category-icon">{getCategoryIcon(category.name)}</span>
                      </div>
                    </div>
                    <h3 className="category-name">{category.name}</h3>
                  </div>
                ))}
              </div>

              <button
                className="category-scroll-btn category-scroll-right"
                onClick={() => scrollCategories('right')}
                aria-label="Scroll right"
              >
                <FiChevronRight size={24} />
              </button>
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
            ) : (
              <>
                {noLocalProducts && (
                  <div className="no-local-banner no-local-banner-compact">
                    <div className="no-local-banner-icon">
                      <FiMapPin size={24} />
                    </div>
                    <div>
                      <h3>No products in {userLocation?.city || 'your area'} yet!</h3>
                      <p>We're expanding rapidly and will serve your area soon. Here are products from other areas:</p>
                    </div>
                    <span className="no-local-banner-tag">Coming Soon</span>
                  </div>
                )}

                {products.length === 0 ? (
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

            {noLocalDistributors && (
              <div className="no-local-banner no-local-banner-compact">
                <div className="no-local-banner-icon">
                  <FiMapPin size={24} />
                </div>
                <div>
                  <h3>No distributors in {userLocation?.city || 'your area'} yet!</h3>
                  <p>We're expanding rapidly and will serve your area soon. Here are distributors from other areas:</p>
                </div>
                <span className="no-local-banner-tag">Coming Soon</span>
              </div>
            )}

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
                      <span className="verified-badge-modern"><FiCheckCircle size={12} /> Verified</span>
                    )}
                  </div>

                  <h3 className="distributor-name">{distributor.businessName}</h3>

                  <div className="distributor-info">
                    <div className="info-item">
                      <FiMapPin size={14} />
                      <span>{distributor.city}, {distributor.state}</span>
                    </div>
                    {distributor.distance != null && distributor.distance > 0 && (
                      <div className="info-item">
                        <FiTruck size={14} />
                        <span>{distributor.distance.toFixed(1)} km away</span>
                      </div>
                    )}
                    {distributor.rating > 0 && (
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