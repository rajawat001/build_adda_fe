import { useState, useEffect } from 'react';
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    availability: 'all',
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      
      // Handle different response structures
      let productsList: Product[] = [];
      if (response.products) {
        productsList = response.products;
      } else if (Array.isArray(response)) {
        productsList = response;
      } else if (response.data?.products) {
        productsList = response.data.products;
      }
      
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category._id === filters.category
      );
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => 
        product.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => 
        product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Availability filter
    if (filters.availability === 'inStock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (filters.availability === 'outOfStock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Sort
    switch (filters.sortBy) {
      case 'priceLowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nameAZ':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameZA':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // newest - assuming products come sorted by creation date
        break;
    }

    setFilteredProducts(filtered);
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
      sortBy: 'newest'
    });
    setSearchTerm('');
  };

  const handleAddToCart = (product: Product) => {
    try {
      const cartData = localStorage.getItem('cart');
      const cart = cartData && cartData !== 'undefined' ? JSON.parse(cartData) : [];
      const existing = cart.find((item: any) => item._id === product._id);
      
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Product added to cart!');
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
                {filteredProducts.length} products found
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
            
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>No products found matching your criteria</p>
                <button onClick={resetFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Products;