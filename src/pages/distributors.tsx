import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { getCurrentLocation } from '../utils/location';
import { FiFilter, FiX, FiMapPin, FiSearch, FiMail, FiPhone, FiNavigation, FiStar, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

interface Distributor {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  businessLicense: string;
  isApproved: boolean;
  rating?: number;
  distance?: number;
}

const Distributors = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchPincode, setSearchPincode] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeSearch, setActiveSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const searchParam = router.query.search as string | undefined;
    if (searchParam && searchParam.trim()) {
      setActiveSearch(searchParam.trim());
      fetchAllDistributors(1, true, searchParam.trim());
    } else {
      setActiveSearch('');
      fetchAllDistributors(1, true);
    }
    detectUserLocation();
  }, [router.query.search]);

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


  const detectUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation({
        lat: location.latitude,
        lng: location.longitude
      });
    } catch (error) {
      // Location access denied or timed out - this is expected, user can search by pincode instead
      console.log('Location not available - user can search by pincode');
    }
  };

  const fetchAllDistributors = async (pageNum: number = 1, reset: boolean = false, search?: string) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let url = `/users/distributors?page=${pageNum}&limit=20`;
      const searchTerm = search ?? activeSearch;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await api.get(url);
      const newDistributors = response.data.distributors || [];

      if (reset) {
        setDistributors(newDistributors);
      } else {
        setDistributors(prev => [...prev, ...newDistributors]);
      }

      setHasMore(newDistributors.length === 20);
    } catch (error) {
      console.error('Error fetching distributors:', error);
      if (reset) {
        setDistributors([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreDistributors = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAllDistributors(nextPage, false);
  }, [page]);

  const searchByPincode = async () => {
    if (!searchPincode) {
      alert('Please enter a pincode');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/users/distributors/nearby?pincode=${searchPincode}&distance=${maxDistance}`);
      setDistributors(response.data.distributors || []);
    } catch (error) {
      console.error('Error searching distributors:', error);
      alert('No distributors found in this area');
    } finally {
      setLoading(false);
    }
  };

  const searchByCurrentLocation = async () => {
    if (!userLocation) {
      alert('Location access denied. Please enter pincode manually.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/users/distributors/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&distance=${maxDistance}`
      );
      setDistributors(response.data.distributors || []);
    } catch (error) {
      console.error('Error searching distributors:', error);
      alert('No distributors found nearby');
    } finally {
      setLoading(false);
    }
  };

  const viewDistributor = (distributorId: string) => {
    router.push(`/distributor/${distributorId}`);
  };

  const renderRating = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star"><FiStar size={14} fill="#f59e0b" color="#f59e0b" /></span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star"><FiStar size={14} fill="#f59e0b" color="#f59e0b" /></span>);
      } else {
        stars.push(<span key={i} className="star empty"><FiStar size={14} color="#d1d5db" /></span>);
      }
    }

    return (
      <div className="rating-stars">
        {stars}
        <span className="rating-count">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <SEO title="Distributors" description="Find distributors near you" />
        <Header />
        <div className="distributors-container">
          <p>Loading distributors...</p>
        </div>
        <Footer />
      </>
    );
  }

  // JSON-LD Structured Data for Distributors Page
  const distributorsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Verified Building Materials Distributors",
    "description": "Find verified and trusted building materials distributors in Gangapur City and across Rajasthan",
    "url": "https://www.buildadda.in/distributors",
    "numberOfItems": distributors.length,
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
          "name": "Distributors",
          "item": "https://www.buildadda.in/distributors"
        }
      ]
    },
    "itemListElement": distributors.slice(0, 10).map((distributor, index) => ({
      "@type": "LocalBusiness",
      "position": index + 1,
      "name": distributor.businessName,
      "description": `Verified building materials distributor in ${distributor.city || 'Gangapur City'}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": distributor.city || "Gangapur City",
        "addressRegion": distributor.state || "Rajasthan",
        "postalCode": distributor.pincode || "",
        "addressCountry": "IN"
      },
      "telephone": distributor.phone,
      "aggregateRating": distributor.rating ? {
        "@type": "AggregateRating",
        "ratingValue": distributor.rating,
        "bestRating": "5",
        "worstRating": "1"
      } : undefined
    }))
  };

  return (
    <>
      <SEO
        title="Find Verified Building Materials Distributors Near You in Gangapur City, Rajasthan"
        description="Connect with 500+ verified building materials distributors in Gangapur City, Rajasthan. Find trusted cement suppliers, steel distributors, bricks dealers, sand suppliers, paint sellers, and tiles shops near you. Compare prices, check ratings, and get best deals on construction materials. Search by location and pincode."
        keywords="building materials distributors Gangapur City, cement suppliers near me, steel distributors Rajasthan, verified distributors India, bricks dealers Gangapur City, sand suppliers Rajasthan, paint distributors, tiles dealers, construction materials suppliers, wholesale distributors Gangapur City, building supplies near me, distributors by pincode, local building materials sellers"
        canonicalUrl="https://www.buildadda.in/distributors"
        ogImage="https://www.buildadda.in/buildAddaBrandImage.png"
        jsonLd={distributorsStructuredData}
      />
      <Header />
      
      <div className="distributors-page">
        {/* Mobile Filter Button */}
        <div className="mobile-filter-bar">
          <button
            className="mobile-filter-btn"
            onClick={() => setShowMobileFilters(true)}
          >
            <FiMapPin size={20} />
            <span>Search Location</span>
          </button>

          <p className="mobile-results-count">
            {distributors.length} distributors
          </p>
        </div>

        <div className="search-section">
          <h1>Find Distributors Near You</h1>

          <div className="search-options">
            <div className="search-by-pincode">
              <h3>Search by Pincode</h3>
              <div className="search-inputs">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={searchPincode}
                  onChange={(e) => setSearchPincode(e.target.value)}
                  maxLength={6}
                />

                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                >
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>

                <button onClick={searchByPincode} className="btn-search">
                  Search
                </button>
              </div>
            </div>

            <div className="divider">OR</div>

            <div className="search-by-location">
              <h3>Use Current Location</h3>
              <button onClick={searchByCurrentLocation} className="btn-location">
                <FiMapPin size={18} /> Detect My Location
              </button>
            </div>
          </div>
        </div>
        
        <div className="distributors-section">
          {activeSearch && (
            <div className="search-active-banner">
              <FiSearch size={16} />
              <span>Showing results for "<strong>{activeSearch}</strong>"</span>
              <button
                className="clear-search-btn"
                onClick={() => {
                  setActiveSearch('');
                  router.push('/distributors', undefined, { shallow: true });
                }}
              >
                <FiX size={16} />
                Clear
              </button>
            </div>
          )}
          <div className="section-header">
            <h2>{activeSearch ? 'Search Results' : 'Available Distributors'}</h2>
            <p>{distributors.length} distributors found</p>
          </div>
          
          {distributors.length === 0 ? (
            <div className="no-distributors">
              <p>No distributors found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="distributors-grid">
              {distributors.map((distributor) => (
                <div key={distributor._id} className="distributor-card">
                  <div className="card-header">
                    <span className="distributor-avatar">
                      {distributor.businessName ? distributor.businessName.charAt(0).toUpperCase() : 'D'}
                    </span>
                    <div className="card-header-info">
                      <h3>{distributor.businessName}</h3>
                      <div className="card-header-meta">
                        {distributor.isApproved && (
                          <span className="verified-badge"><FiCheckCircle size={12} /> Verified</span>
                        )}
                        {distributor.rating !== undefined && distributor.rating > 0 && (
                          renderRating(distributor.rating)
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="icon"><FiMail size={16} /></span>
                      <span>{distributor.email}</span>
                    </div>

                    <div className="info-row">
                      <span className="icon"><FiPhone size={16} /></span>
                      <span>{distributor.phone}</span>
                    </div>

                    <div className="info-row">
                      <span className="icon"><FiMapPin size={16} /></span>
                      <span>{distributor.address}, {distributor.city}</span>
                    </div>

                    <div className="info-row">
                      <span className="icon"><FiNavigation size={16} /></span>
                      <span>{distributor.state} - {distributor.pincode}</span>
                    </div>

                    {distributor.distance && (
                      <div className="distance-badge">
                        <FiMapPin size={14} /> {distributor.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <button
                      className="btn-view-profile"
                      onClick={() => viewDistributor(distributor._id)}
                    >
                      View Profile & Products <FiArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <button
                onClick={loadMoreDistributors}
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
                {loadingMore ? 'Loading...' : 'Load More Distributors'}
              </button>
            </div>
          )}

          {!hasMore && distributors.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              <p>No more distributors to load</p>
            </div>
          )}
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
                <h3>Search by Location</h3>
                <button
                  className="close-filters-btn"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="mobile-filter-content">
                <div className="mobile-search-options">
                  <div className="search-by-pincode">
                    <h4>Search by Pincode</h4>
                    <div className="search-inputs-mobile">
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={searchPincode}
                        onChange={(e) => setSearchPincode(e.target.value)}
                        maxLength={6}
                      />

                      <select
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                      >
                        <option value={10}>Within 10 km</option>
                        <option value={25}>Within 25 km</option>
                        <option value={50}>Within 50 km</option>
                        <option value={100}>Within 100 km</option>
                      </select>
                    </div>
                  </div>

                  <div className="divider-mobile">OR</div>

                  <div className="search-by-location-mobile">
                    <h4>Use Current Location</h4>
                    <button
                      onClick={() => {
                        searchByCurrentLocation();
                        setShowMobileFilters(false);
                      }}
                      className="btn-location-mobile"
                    >
                      <FiMapPin size={20} />
                      Detect My Location
                    </button>
                  </div>
                </div>
              </div>

              <div className="mobile-filter-footer">
                <button
                  className="btn-apply-filters"
                  onClick={() => {
                    searchByPincode();
                    setShowMobileFilters(false);
                  }}
                >
                  Search Distributors
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

export default Distributors;