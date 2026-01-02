import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { getCurrentLocation } from '../utils/location';

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
  const [searchPincode, setSearchPincode] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAllDistributors();
    detectUserLocation();
  }, []);

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

  const fetchAllDistributors = async () => {
    try {
      const response = await api.get('/users/distributors');
      setDistributors(response.data.distributors || []);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  };

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
        stars.push(<span key={i} className="star">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
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

  return (
    <>
      <SEO 
        title="Find Distributors" 
        description="Find verified building material distributors near you"
      />
      <Header />
      
      <div className="distributors-page">
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
                📍 Detect My Location
              </button>
            </div>
          </div>
        </div>
        
        <div className="distributors-section">
          <div className="section-header">
            <h2>Available Distributors</h2>
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
                    <h3>{distributor.businessName}</h3>
                    {distributor.isApproved && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                    {distributor.rating !== undefined && distributor.rating > 0 && (
                      renderRating(distributor.rating)
                    )}
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <span className="icon">📧</span>
                      <span>{distributor.email}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="icon">📞</span>
                      <span>{distributor.phone}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="icon">📍</span>
                      <span>{distributor.address}, {distributor.city}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="icon">📮</span>
                      <span>{distributor.state} - {distributor.pincode}</span>
                    </div>
                    
                    {distributor.distance && (
                      <div className="distance-badge">
                        {distributor.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <button 
                      className="btn-view-profile"
                      onClick={() => viewDistributor(distributor._id)}
                    >
                      View Profile & Products
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Distributors;