import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Filter from '../components/Filter';
import productService from '../services/product.service';
import { Product, Category } from '../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    availability: 'all',
    sortBy: 'newest',
    pincode: ''
  });

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

      const response = await productService.getAllProducts();

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

  const handleAddToCart = (product: Product) => {
    try {
      const cartData = localStorage.getItem('cart');
      const cart = cartData && cartData !== 'undefined' ? JSON.parse(cartData) : [];
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
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

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

  return (
    <>
      <SEO 
        title="Products - Building Materials" 
        description="Browse our wide range of quality building materials"
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
        
        <div className="products-main">
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
                      onAddToCart={handleAddToCart}
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
      </div>
      
      <Footer />
    </>
  );
};

export default Products;