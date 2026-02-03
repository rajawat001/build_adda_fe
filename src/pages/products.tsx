import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Filter from '../components/Filter';
import productService from '../services/product.service';
import { Product, Category } from '../types';
import { FiFilter, FiX } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const router = useRouter();

  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    availability: 'all',
    sortBy: 'newest',
    pincode: ''
  });

  // Read URL query params (from header search or category links)
  useEffect(() => {
    if (!router.isReady) return;
    const { search, category } = router.query;
    if (search && typeof search === 'string') {
      setSearchTerm(search);
    }
    if (category && typeof category === 'string') {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [router.isReady, router.query.search, router.query.category]);

  // Fetch categories once
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [filters, searchTerm]);


  const fetchProducts = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Build query parameters
      const params: any = {
        page: pageNum,
        limit: 24,
        sortBy: filters.sortBy
      };

      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (searchTerm) params.search = searchTerm;

      const response = await productService.getAllProducts(params);

      // Handle different response structures
      let productsList: Product[] = [];
      let totalCount = 0;

      if (response.products) {
        productsList = response.products;
        totalCount = response.total || response.products.length;
      } else if (Array.isArray(response)) {
        productsList = response;
        totalCount = response.length;
      } else if (response.data?.products) {
        productsList = response.data.products;
        totalCount = response.data.total || response.data.products.length;
      }

      // Filter by availability and pincode on client side
      let filtered = productsList;
      if (filters.availability === 'inStock') {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (filters.availability === 'outOfStock') {
        filtered = filtered.filter(p => p.stock === 0);
      }

      if (filters.pincode && filters.pincode.trim()) {
        filtered = filtered.filter(product => {
          const distributor = typeof product.distributor === 'object' ? product.distributor : null;
          if (distributor && (distributor as any).pincode) {
            return (distributor as any).pincode.includes(filters.pincode.trim());
          }
          return false;
        });
      }

      if (reset) {
        setProducts(filtered);
      } else {
        setProducts(prev => [...prev, ...filtered]);
      }

      // Check if there are more products to load
      setHasMore(filtered.length === 24);

    } catch (error) {
      console.error('Error fetching products:', error);
      if (reset) {
        setProducts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, false);
  }, [page, filters, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      
      // Handle different response structures
      let categoriesList: Category[] = [];
      if (response.categories) {
        categoriesList = response.categories;
      } else if (Array.isArray(response)) {
        categoriesList = response;
      } else if (response.data?.categories) {
        categoriesList = response.data.categories;
      }
      
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };


  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      availability: 'all',
      sortBy: 'newest',
      pincode: ''
    });
    setSearchTerm('');
  };

  // Lock body scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  // Count active filters
  const activeFiltersCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.pincode,
    filters.availability !== 'all' ? filters.availability : ''
  ].filter(Boolean).length;

  const handleAddToWishlist = (product: Product) => {
    try {
      const wishlistData = localStorage.getItem('wishlist');
      const wishlist = wishlistData && wishlistData !== 'undefined' ? JSON.parse(wishlistData) : [];
      const exists = wishlist.find((item: any) => item._id === product._id);
      
      if (exists) {
        const updated = wishlist.filter((item: any) => item._id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(updated));
      } else {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  if (loading) {
    return (
      <>
        <SEO title="Products" description="Browse building materials" />
        <Header />
        <div className="products-container">
          <p>Loading products...</p>
        </div>
        <Footer />
      </>
    );
  }

  // JSON-LD Structured Data for Products Page
  const productsStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Building Materials Products",
    "description": "Browse our comprehensive collection of building materials including cement, steel, bricks, sand, paint, and tiles",
    "url": "https://www.buildadda.in/products",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.buildadda.in"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://www.buildadda.in/products"
        }
      ]
    },
    "mainEntity": {
      "@type": "OfferCatalog",
      "name": "Building Materials Catalog",
      "itemListElement": products.slice(0, 12).map((product, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Product",
          "name": product.name,
          "description": product.description || `High quality ${product.name} available for purchase`,
          "image": product.images && product.images.length > 0 ? product.images[0] : '/buildAddaBrandImage.png',
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "INR",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            ...(product.realPrice && product.realPrice > product.price ? {
              "priceSpecification": {
                "@type": "PriceSpecification",
                "price": product.price,
                "priceCurrency": "INR",
                "referencePrice": {
                  "@type": "PriceSpecification",
                  "price": product.realPrice,
                  "priceCurrency": "INR"
                }
              }
            } : {})
          }
        }
      }))
    }
  };

  return (
    <>
      <SEO
        title="Building Materials Products - Buy Cement, Steel, Bricks, Sand, Paint, Tiles Online"
        description="Browse 1000+ building materials products from verified distributors in Gangapur City. Shop cement, steel, bricks, sand, paint, tiles, and construction supplies at wholesale prices. Free delivery on orders above ₹50,000. Quality assured, best deals guaranteed."
        keywords="building materials products, buy cement online, steel products, bricks for sale, sand suppliers, paint online India, tiles shop, construction materials catalog, wholesale building supplies, cement price list, steel rate, building materials Gangapur City, construction products India"
        canonicalUrl="https://www.buildadda.in/products"
        ogImage="https://www.buildadda.in/buildAddaBrandImage.png"
        jsonLd={productsStructuredData}
      />
      <Header />
      
      <div className="products-page">
        <div className="products-header">
          <h1>All Products</h1>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        
        {/* Mobile Filter Button */}
        <div className="mobile-filter-bar">
          <button
            className="mobile-filter-btn"
            onClick={() => setShowMobileFilters(true)}
          >
            <FiFilter size={20} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
          </button>

          <div className="mobile-sort">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="nameAZ">Name: A-Z</option>
              <option value="nameZA">Name: Z-A</option>
            </select>
          </div>

          <p className="mobile-results-count">
            {products.length} products
          </p>
        </div>

        <div className="products-main">
          {/* Desktop Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              <button onClick={resetFilters} className="reset-btn">Reset All</button>
            </div>

            <Filter
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <div className="products-content">
            <div className="products-toolbar">
              <p className="results-count">
                {products.length} products {loadingMore ? '(loading more...)' : ''}
              </p>

              <div className="sort-dropdown">
                <label>Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                  <option value="nameAZ">Name: A-Z</option>
                  <option value="nameZA">Name: Z-A</option>
                </select>
              </div>
            </div>

            {products.length === 0 && !loading ? (
              <div className="no-products">
                <p>No products found matching your criteria</p>
                <button onClick={resetFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && !loading && (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <button
                      onClick={loadMoreProducts}
                      disabled={loadingMore}
                      className="btn-primary"
                      style={{
                        padding: '12px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '8px',
                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                        opacity: loadingMore ? 0.7 : 1
                      }}
                    >
                      {loadingMore ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    <p>No more products to load</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div
            className="mobile-filter-overlay"
            onClick={() => setShowMobileFilters(false)}
          >
            <div
              className="mobile-filter-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-filter-header">
                <h3>Filters</h3>
                <button
                  className="close-filters-btn"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="mobile-filter-content">
                <Filter
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>

              <div className="mobile-filter-footer">
                <button
                  className="btn-reset-filters"
                  onClick={() => {
                    resetFilters();
                    setShowMobileFilters(false);
                  }}
                >
                  Reset All
                </button>
                <button
                  className="btn-apply-filters"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Show {products.length} Products
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Products;