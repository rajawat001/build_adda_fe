import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

// Fix Leaflet default marker icon paths (webpack breaks them)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export interface MapPickerLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: MapPickerLocation) => void;
  height?: string;
  visible?: boolean;
}

// Reverse geocode using Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<MapPickerLocation> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'BuildAdda E-Commerce App' } }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    const addr = data.address || {};
    return {
      lat,
      lng,
      address: data.display_name || '',
      city: addr.city || addr.town || addr.village || addr.county || '',
      state: addr.state || '',
      pincode: addr.postcode || '',
    };
  } catch {
    return { lat, lng, address: '', city: '', state: '', pincode: '' };
  }
}

// Forward geocode (search) using Nominatim
async function forwardGeocode(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
      { headers: { 'User-Agent': 'BuildAdda E-Commerce App' } }
    );
    if (!response.ok) return null;
    const results = await response.json();
    if (results.length === 0) return null;
    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
      display: results[0].display_name,
    };
  } catch {
    return null;
  }
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialLat,
  initialLng,
  onLocationSelect,
  height = '400px',
  visible = true,
}) => {
  const hasInitial = !!(initialLat && initialLng && (initialLat !== 0 || initialLng !== 0));
  const defaultLat = hasInitial ? initialLat! : 20.5937;
  const defaultLng = hasInitial ? initialLng! : 78.9629;
  const defaultZoom = hasInitial ? 15 : 5;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [locationInfo, setLocationInfo] = useState<MapPickerLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleMoveEnd = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    const result = await reverseGeocode(lat, lng);
    setLocationInfo(result);
    setIsGeocoding(false);
  }, []);

  // Initialize Leaflet map imperatively (NOT react-leaflet) to avoid DOM conflicts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Debounced reverse geocode on map move
    map.on('moveend', () => {
      const center = map.getCenter();
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      geocodeTimeoutRef.current = setTimeout(() => {
        handleMoveEnd(center.lat, center.lng);
      }, 500);
    });

    mapRef.current = map;

    // Initial reverse geocode if coordinates provided
    if (hasInitial) {
      handleMoveEnd(defaultLat, defaultLng);
    }

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalidate map size when becoming visible
  useEffect(() => {
    if (visible && mapRef.current) {
      const timers = [100, 300, 600].map(delay =>
        setTimeout(() => mapRef.current?.invalidateSize(), delay)
      );
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [visible]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;
    setIsSearching(true);
    const result = await forwardGeocode(searchQuery.trim());
    if (result && mapRef.current) {
      mapRef.current.flyTo([result.lat, result.lng], 15, { duration: 1.5 });
      handleMoveEnd(result.lat, result.lng);
    }
    setIsSearching(false);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 16, { duration: 1.5 });
        }
        handleMoveEnd(latitude, longitude);
        setGpsLoading(false);
      },
      () => {
        alert('Unable to get your location. Please enable location services.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (locationInfo) {
      onLocationSelect(locationInfo);
    }
  };

  return (
    <div className="map-picker-container" translate="no">
      {/* Search bar */}
      <form className="map-picker-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="map-picker-search-input"
        />
        <button type="submit" className="map-picker-search-btn" disabled={isSearching}>
          <span>{isSearching ? '...' : 'Search'}</span>
        </button>
      </form>

      {/* Map */}
      <div className="map-picker-map-wrapper" style={{ height }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

        {/* Center pin overlay */}
        <div className="map-picker-center-pin" aria-hidden="true">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 30 20 30s20-16 20-30C40 8.954 31.046 0 20 0z" fill="#FF6B35"/>
            <circle cx="20" cy="18" r="8" fill="white"/>
            <circle cx="20" cy="18" r="4" fill="#FF6B35"/>
          </svg>
        </div>

        {/* GPS button */}
        <button
          type="button"
          className="map-picker-gps-btn"
          onClick={handleGPS}
          disabled={gpsLoading}
          title="Use current location"
        >
          {gpsLoading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" className="map-picker-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          )}
        </button>
      </div>

      {/* Address bar — stable DOM: all states always rendered, toggled with display */}
      <div className="map-picker-address-bar">
        {/* Loading state */}
        <div
          className="map-picker-loading"
          style={{ display: isGeocoding ? 'flex' : 'none' }}
        >
          <span className="map-picker-loading-dot"></span>
          <span>Fetching address...</span>
        </div>

        {/* Address result state */}
        <div
          className="map-picker-address-result"
          style={{
            display: !isGeocoding && locationInfo ? 'flex' : 'none',
            alignItems: 'flex-start',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          <div className="map-picker-address-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="map-picker-address-text">
            <p className="map-picker-address-main">
              <span>{locationInfo?.address || 'Drag the map to select a location'}</span>
            </p>
            <p
              className="map-picker-address-sub"
              style={{
                display: locationInfo && (locationInfo.city || locationInfo.state || locationInfo.pincode)
                  ? 'block'
                  : 'none',
              }}
            >
              <span>
                {locationInfo
                  ? [locationInfo.city, locationInfo.state, locationInfo.pincode].filter(Boolean).join(', ')
                  : ''}
              </span>
            </p>
          </div>
        </div>

        {/* Empty/initial state */}
        <p
          className="map-picker-address-main"
          style={{
            display: !isGeocoding && !locationInfo ? 'block' : 'none',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <span>Move the map to select a location</span>
        </p>
      </div>

      {/* Confirm button */}
      <button
        type="button"
        className="map-picker-confirm-btn"
        onClick={handleConfirm}
        disabled={!locationInfo || isGeocoding}
      >
        <span>Confirm Location</span>
      </button>
    </div>
  );
};

export default MapPicker;
