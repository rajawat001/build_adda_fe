import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import productService from '../services/product.service';
import { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadProducts();
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

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item._id === product._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
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

  return (
    <>
      <SEO
        title="Building Materials Online | Home"
        description="Buy quality building materials from trusted distributors near you."
      />

      <Header />

      <main className="home-page">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="container">
            <h1>Quality Building Materials at Your Doorstep</h1>
            <p>
              Find cement, steel, bricks and more from verified distributors near you
            </p>
            <button className="btn-primary">Explore Products</button>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="featured-products">
          <div className="container">
            <h2>Featured Products</h2>

            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              <div className="product-grid">
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
        </section>

        {/* CATEGORIES */}
        <section className="categories">
          <div className="container">
            <h2>Shop by Category</h2>
            <div className="category-grid">
              <div className="category-item">Cement</div>
              <div className="category-item">Steel</div>
              <div className="category-item">Bricks</div>
              <div className="category-item">Sand</div>
              <div className="category-item">Paint</div>
              <div className="category-item">Tiles</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}