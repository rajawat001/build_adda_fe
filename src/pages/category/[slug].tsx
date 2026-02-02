import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/product.service';
import { Product, Category } from '../../types';

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  useEffect(() => {
    if (products.length > 0) {
      applySorting();
    }
  }, [sortBy]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all categories to find the one matching the slug
      const categoriesResponse = await productService.getCategories();
      let categoriesList: Category[] = [];

      if (categoriesResponse.categories) {
        categoriesList = categoriesResponse.categories;
      } else if (Array.isArray(categoriesResponse)) {
        categoriesList = categoriesResponse;
      } else if (categoriesResponse.data?.categories) {
        categoriesList = categoriesResponse.data.categories;
      }

      // Find category by slug or ID
      const foundCategory = categoriesList.find(
        (cat: Category) => cat.slug === slug || cat._id === slug
      );

      if (!foundCategory) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // Fetch all products and filter by category
      const productsResponse = await productService.getAllProducts();
      let productsList: Product[] = [];

      if (productsResponse.products) {
        productsList = productsResponse.products;
      } else if (Array.isArray(productsResponse)) {
        productsList = productsResponse;
      } else if (productsResponse.data?.products) {
        productsList = productsResponse.data.products;
      }

      // Filter products by category ID
      const categoryProducts = productsList.filter((product: Product) => {
        const categoryId = typeof product.category === 'string'
          ? product.category
          : product.category._id;
        return categoryId === foundCategory._id;
      });

      setProducts(categoryProducts);
    } catch (err: any) {
      console.error('Error fetching category:', err);
      setError(err.response?.data?.error || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const applySorting = () => {
    let sorted = [...products];

    switch (sortBy) {
      case 'priceLowToHigh':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'nameAZ':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameZA':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // newest - keep original order
        break;
    }

    setProducts(sorted);
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

  const categoryJsonLd = useMemo(() => {
    if (!category) return undefined;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: `${category.name} - Building Materials`,
          description: category.description || `Browse ${category.name} products at BuildAdda`,
          url: `https://www.buildadda.in/category/${slug}`,
          isPartOf: { '@type': 'WebSite', name: 'BuildAdda', url: 'https://www.buildadda.in' },
          numberOfItems: products.length,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.buildadda.in' },
            { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.buildadda.in/products' },
            { '@type': 'ListItem', position: 3, name: category.name, item: `https://www.buildadda.in/category/${slug}` },
          ],
        },
      ],
    };
  }, [category, slug, products.length]);

  if (loading) {
    return (
      <>
        <SEO title="Loading Category..." noindex />
        <Header />
        <div className="category-page">
          <div className="category-container">
            <p className="loading-text">Loading category...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <SEO title="Category Not Found" noindex />
        <Header />
        <div className="category-page">
          <div className="category-container">
            <div className="error-state">
              <h2>Category Not Found</h2>
              <p>{error || 'The category you are looking for does not exist.'}</p>
              <button onClick={() => router.push('/products')} className="btn-primary">
                Browse All Products
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${category.name} - Buy ${category.name} Online at Best Prices | BuildAdda`}
        description={category.description || `Buy ${category.name} online at best prices from verified distributors in Jaipur, Rajasthan. Quality assured ${category.name.toLowerCase()} with fast delivery. ${products.length} products available at BuildAdda.`}
        keywords={`${category.name.toLowerCase()}, buy ${category.name.toLowerCase()} online, ${category.name.toLowerCase()} price, ${category.name.toLowerCase()} suppliers Jaipur, building materials ${category.name.toLowerCase()}`}
        canonicalUrl={`https://www.buildadda.in/category/${slug}`}
        jsonLd={categoryJsonLd}
      />

      <Header />

      <div className="category-page">
        <div className="category-hero">
          <div className="category-hero-content">
            <nav className="breadcrumb">
              <a href="/">Home</a>
              <span className="separator">/</span>
              <a href="/products">Products</a>
              <span className="separator">/</span>
              <span className="current">{category.name}</span>
            </nav>

            <h1>{category.name}</h1>
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
            <div className="category-stats">
              <span className="stat">
                {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
              </span>
            </div>
          </div>
        </div>

        <div className="category-container">
          <div className="category-toolbar">
            <div className="toolbar-left">
              <button onClick={() => router.push('/products')} className="back-btn">
                ← Back to All Products
              </button>
            </div>

            <div className="toolbar-right">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="nameAZ">Name: A-Z</option>
                <option value="nameZA">Name: Z-A</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="no-products">
              <div className="empty-icon">📦</div>
              <h3>No Products Available</h3>
              <p>There are currently no products in this category.</p>
              <button onClick={() => router.push('/products')} className="btn-primary">
                Browse Other Categories
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CategoryPage;
