import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import api from '../../services/api';
import { Product } from '../../types';
import { FiShare2 } from 'react-icons/fi';
import ShareSheet from '../../components/ShareSheet';
import styles from '../../styles/distributor-profile.module.css';

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
  gstNumber?: string;
  description?: string;
  profileImage?: string;
  rating: number;
  reviewCount: number;
  serviceRadius: number;
  isApproved: boolean;
}

interface SSRDistributorMeta {
  businessName: string;
  description: string;
  city: string;
  state: string;
  profileImage: string;
  id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await axios.get(`${API_URL}/users/distributors/${id}`, { timeout: 5000 });
    const dist = res.data.distributor || res.data;

    return {
      props: {
        ssrMeta: {
          businessName: dist.businessName || dist.name || '',
          description: (dist.description || '').substring(0, 200),
          city: dist.city || '',
          state: dist.state || '',
          profileImage: dist.profileImage || '',
          id: dist._id || id || '',
        } as SSRDistributorMeta,
      },
    };
  } catch {
    return { props: { ssrMeta: null } };
  }
};

const DistributorProfile = ({ ssrMeta }: { ssrMeta: SSRDistributorMeta | null }) => {
  const router = useRouter();
  const { id } = router.query;

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  useEffect(() => {
    if (id) {
      fetchDistributorData();
    }
  }, [id]);

  const fetchDistributorData = async () => {
    setLoading(true);
    try {
      // Fetch distributor profile
      const distributorResponse = await api.get(`/users/distributors/${id}`);
      setDistributor(distributorResponse.data.distributor);

      // Fetch distributor's products
      const productsResponse = await api.get(`/products/distributor/${id}`);
      setProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error('Error fetching distributor data:', error);
      alert('Failed to load distributor information');
    } finally {
      setLoading(false);
    }
  };

  const renderRating = (rating: number = 0, reviewCount: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className={`${styles.star} ${styles.filled}`}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className={`${styles.star} ${styles.filled}`}>★</span>);
      } else {
        stars.push(<span key={i} className={`${styles.star} ${styles.empty}`}>☆</span>);
      }
    }

    return (
      <div className={styles.ratingDisplay}>
        <div className={styles.stars}>{stars}</div>
        <span className={styles.ratingText}>
          {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    );
  };

  const handleContactClick = (type: 'call' | 'email') => {
    if (!distributor) return;

    if (type === 'call') {
      window.location.href = `tel:${distributor.phone}`;
    } else {
      window.location.href = `mailto:${distributor.email}`;
    }
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  // LocalBusiness JSON-LD Schema for Google Search
  const distributorJsonLd = useMemo(() => {
    if (!distributor) return null;

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `https://www.buildadda.in/distributor/${distributor._id}`,
      name: distributor.businessName,
      description: distributor.description || `${distributor.businessName} - Building Materials Distributor in ${distributor.city}, ${distributor.state}`,
      url: `https://www.buildadda.in/distributor/${distributor._id}`,
      telephone: distributor.phone,
      email: distributor.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: distributor.address,
        addressLocality: distributor.city,
        addressRegion: distributor.state,
        postalCode: distributor.pincode,
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 26.9124,  // Default Jaipur coordinates
        longitude: 75.7873
      },
      image: distributor.profileImage || 'https://www.buildadda.in/buildAddaBrandImage.png',
      priceRange: '₹₹',
      currenciesAccepted: 'INR',
      paymentAccepted: 'Cash, UPI, Credit Card, Debit Card',
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 26.9124,
          longitude: 75.7873
        },
        geoRadius: `${distributor.serviceRadius || 10} km`
      },
      sameAs: [
        'https://www.buildadda.in'
      ]
    };

    // Add aggregate rating if distributor has reviews
    if (distributor.rating && distributor.reviewCount && distributor.reviewCount > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: distributor.rating,
        reviewCount: distributor.reviewCount,
        bestRating: 5,
        worstRating: 1
      };
    }

    // Add products offered
    if (products.length > 0) {
      schema.makesOffer = products.slice(0, 10).map(product => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: product.name,
          url: `https://www.buildadda.in/products/${product._id}`
        }
      }));
    }

    return schema;
  }, [distributor, products]);

  if (loading) {
    return (
      <>
        <SEO
          title={ssrMeta ? `${ssrMeta.businessName} - Building Materials Distributor in ${ssrMeta.city}` : 'Loading...'}
          description={ssrMeta ? `Shop building materials from ${ssrMeta.businessName} in ${ssrMeta.city}, ${ssrMeta.state}. Verified distributor on BuildAdda.` : 'Loading distributor profile'}
          ogImage={ssrMeta?.profileImage || undefined}
          canonicalUrl={ssrMeta ? `https://www.buildadda.in/distributor/${ssrMeta.id}` : undefined}
        />
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading distributor information...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!distributor) {
    return (
      <>
        <SEO
          title={ssrMeta ? `${ssrMeta.businessName} | BuildAdda` : 'Not Found'}
          description={ssrMeta ? `${ssrMeta.businessName} - Building Materials Distributor in ${ssrMeta.city}` : 'Distributor not found'}
          ogImage={ssrMeta?.profileImage || undefined}
          canonicalUrl={ssrMeta ? `https://www.buildadda.in/distributor/${ssrMeta.id}` : undefined}
        />
        <Header />
        <div className={styles.errorContainer}>
          <h1>Distributor Not Found</h1>
          <p>The distributor you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.push('/distributors')} className={styles.btnBack}>
            Back to Distributors
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${distributor.businessName} - Building Materials Distributor in ${distributor.city}`}
        description={distributor.description || `Shop building materials from ${distributor.businessName} in ${distributor.city}, ${distributor.state}. ${products.length} products available. Verified distributor on BuildAdda.`}
        ogImage={distributor.profileImage || undefined}
        canonicalUrl={`https://www.buildadda.in/distributor/${distributor._id}`}
        jsonLd={distributorJsonLd || undefined}
      />
      <Header />

      <div className={styles.distributorProfilePage}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.profileMain}>
              <div className={styles.profileImage}>
                {distributor.profileImage ? (
                  <img src={distributor.profileImage} alt={distributor.businessName} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>{distributor.businessName.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className={styles.profileInfo}>
                <div className={styles.nameBadge}>
                  <h1>{distributor.businessName}</h1>
                  {distributor.isApproved && (
                    <span className={styles.verifiedBadge}>✓ Verified</span>
                  )}
                </div>

                {renderRating(distributor.rating, distributor.reviewCount)}

                <div className={styles.locationInfo}>
                  <span className="icon">📍</span>
                  <span>{distributor.city}, {distributor.state}</span>
                </div>

                {distributor.serviceRadius && (
                  <div className={styles.serviceRadius}>
                    <span className="icon">🚚</span>
                    <span>Delivers within {distributor.serviceRadius} km</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.contactActions}>
              <button
                className={`${styles.btnContact} ${styles.btnCall}`}
                onClick={() => handleContactClick('call')}
              >
                <span className="icon">📞</span>
                Call Now
              </button>
              <button
                className={`${styles.btnContact} ${styles.btnEmail}`}
                onClick={() => handleContactClick('email')}
              >
                <span className="icon">📧</span>
                Email
              </button>
              <button
                className={`${styles.btnContact} ${styles.btnShare}`}
                onClick={handleShare}
              >
                <FiShare2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.profileTabs}>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products ({products.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'about' ? styles.active : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About Distributor
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'products' ? (
            <div className={styles.productsSection}>
              <div className={styles.sectionHeader}>
                <h2>Available Products</h2>
                <p>{products.length} products available</p>
              </div>

              {products.length === 0 ? (
                <div className={styles.noProducts}>
                  <div className={styles.noProductsIcon}>📦</div>
                  <h3>No Products Available</h3>
                  <p>This distributor hasn't listed any products yet.</p>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.aboutSection}>
              <div className={styles.aboutContent}>
                <div className={styles.infoCard}>
                  <h3>Business Information</h3>

                  {distributor.description && (
                    <div className={styles.infoBlock}>
                      <h4>About</h4>
                      <p>{distributor.description}</p>
                    </div>
                  )}

                  <div className={styles.infoBlock}>
                    <h4>Contact Person</h4>
                    <p>{distributor.name}</p>
                  </div>

                  <div className={styles.infoBlock}>
                    <h4>Email</h4>
                    <p>{distributor.email}</p>
                  </div>

                  <div className={styles.infoBlock}>
                    <h4>Phone</h4>
                    <p>{distributor.phone}</p>
                  </div>

                  <div className={styles.infoBlock}>
                    <h4>Address</h4>
                    <p>{distributor.address}</p>
                    <p>{distributor.city}, {distributor.state} - {distributor.pincode}</p>
                  </div>

                  {distributor.gstNumber && (
                    <div className={styles.infoBlock}>
                      <h4>GST Number</h4>
                      <p>{distributor.gstNumber}</p>
                    </div>
                  )}
                </div>

                <div className={styles.statsCard}>
                  <h3>Distributor Stats</h3>

                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>⭐</div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{distributor.rating.toFixed(1)}</span>
                      <span className={styles.statLabel}>Average Rating</span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>📝</div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{distributor.reviewCount}</span>
                      <span className={styles.statLabel}>Total Reviews</span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>📦</div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{products.length}</span>
                      <span className={styles.statLabel}>Products Listed</span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>🚚</div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{distributor.serviceRadius} km</span>
                      <span className={styles.statLabel}>Service Radius</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        title={distributor.businessName}
        text={`Check out ${distributor.businessName} - Building Materials Distributor in ${distributor.city} on BuildAdda`}
        url={typeof window !== 'undefined' ? window.location.href : `https://www.buildadda.in/distributor/${distributor._id}`}
        image={distributor.profileImage}
      />

      <Footer />
    </>
  );
};

export default DistributorProfile;
