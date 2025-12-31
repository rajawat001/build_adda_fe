import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import api from '../../services/api';
import { Product } from '../../types';

interface Distributor {
  _id: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    type: string;
    coordinates: number[];
  };
  isVerified: boolean;
}

export default function DistributorProfile() {
  const router = useRouter();
  const { id } = router.query;
  
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  useEffect(() => {
    if (id) {
      fetchDistributorData();
    }
  }, [id]);

  const fetchDistributorData = async () => {
    try {
      // Fetch distributor details
      const distResponse = await api.get(`/distributors/${id}`);
      setDistributor(distResponse.data.distributor);

      // Fetch distributor's products
      const productsResponse = await api.get(`/products/distributor/${id}`);
      setProducts(productsResponse.data.products);
    } catch (error) {
      console.error('Error fetching distributor data:', error);
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
      alert('Removed from wishlist');
    } else {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      alert('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <>
        <SEO title="Distributor Profile" />
        <Header />
        <div className="distributor-profile-page">
          <div className="container">
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!distributor) {
    return (
      <>
        <SEO title="Distributor Not Found" />
        <Header />
        <div className="distributor-profile-page">
          <div className="container">
            <h1>Distributor Not Found</h1>
            <button onClick={() => router.push('/distributors')}>
              View All Distributors
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${distributor.businessName} - Distributor Profile`}
        description={`View products from ${distributor.businessName}`}
      />
      <Header />
      
      <div className="distributor-profile-page">
        <div className="container">
          {/* Distributor Header */}
          <div className="distributor-header">
            <div className="distributor-info">
              <div className="business-icon">
                {distributor.businessName.charAt(0).toUpperCase()}
              </div>
              
              <div className="business-details">
                <h1>
                  {distributor.businessName}
                  {distributor.isVerified && (
                    <span className="verified-badge">✓ Verified</span>
                  )}
                </h1>
                <p className="owner-name">By {distributor.name}</p>
                
                <div className="contact-info">
                  <span>📞 {distributor.phone}</span>
                  <span>📧 {distributor.email}</span>
                  <span>📍 {distributor.city}, {distributor.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => setActiveTab('products')}
            >
              Products ({products.length})
            </button>
            <button 
              className={activeTab === 'about' ? 'active' : ''}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'products' ? (
            <div className="products-section">
              {products.length === 0 ? (
                <div className="no-products">
                  <p>No products available from this distributor</p>
                </div>
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
          ) : (
            <div className="about-section">
              <div className="info-card">
                <h3>Business Information</h3>
                <div className="info-row">
                  <span className="label">Business Name:</span>
                  <span className="value">{distributor.businessName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Owner:</span>
                  <span className="value">{distributor.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{distributor.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{distributor.phone}</span>
                </div>
              </div>

              <div className="info-card">
                <h3>Location</h3>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{distributor.address}</span>
                </div>
                <div className="info-row">
                  <span className="label">City:</span>
                  <span className="value">{distributor.city}</span>
                </div>
                <div className="info-row">
                  <span className="label">State:</span>
                  <span className="value">{distributor.state}</span>
                </div>
                <div className="info-row">
                  <span className="label">Pincode:</span>
                  <span className="value">{distributor.pincode}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />

      <style jsx>{`
        .distributor-profile-page {
          padding: 3rem 0;
          min-height: calc(100vh - 200px);
        }

        .distributor-header {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .distributor-info {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .business-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          font-weight: bold;
        }

        .business-details h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .verified-badge {
          background: #4CAF50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .owner-name {
          color: #7f8c8d;
          margin-bottom: 1rem;
        }

        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          color: #555;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #ecf0f1;
        }

        .tabs button {
          background: none;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          cursor: pointer;
          color: #7f8c8d;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tabs button.active {
          color: #3498db;
          border-bottom-color: #3498db;
        }

        .no-products {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 10px;
        }

        .about-section {
          display: grid;
          gap: 2rem;
        }

        .info-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .info-card h3 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #ecf0f1;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row .label {
          font-weight: 600;
          color: #7f8c8d;
        }

        .info-row .value {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .distributor-info {
            flex-direction: column;
            text-align: center;
          }

          .business-icon {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
          }

          .contact-info {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}