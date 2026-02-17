import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocationDetails, LocationDetails } from '../utils/location';

interface UserLocation {
  lat: number;
  lng: number;
  pincode: string;
  city: string;
  state: string;
  timestamp: number;
}

interface LocationContextType {
  location: UserLocation | null;
  isLoading: boolean;
  setManualLocation: (loc: { pincode?: string; city?: string; state?: string; lat?: number; lng?: number }) => void;
  clearLocation: () => void;
  retryDetection: () => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  isLoading: true,
  setManualLocation: () => {},
  clearLocation: () => {},
  retryDetection: () => {},
});

const STORAGE_KEY = 'userLocation';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToStorage = (loc: UserLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // localStorage full or blocked — ignore
    }
  };

  const detectLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const details: LocationDetails = await getLocationDetails();
      const loc: UserLocation = {
        lat: details.coordinates.latitude,
        lng: details.coordinates.longitude,
        pincode: details.pincode,
        city: details.city,
        state: details.state,
        timestamp: Date.now(),
      };
      setLocation(loc);
      saveToStorage(loc);
    } catch {
      // User denied or browser doesn't support — location stays null
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: check cache, else detect
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserLocation = JSON.parse(stored);
        if (parsed.lat && parsed.lng && Date.now() - parsed.timestamp < MAX_AGE_MS) {
          setLocation(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // parse error — ignore
    }
    detectLocation();
  }, [detectLocation]);

  const setManualLocation = useCallback((loc: { pincode?: string; city?: string; state?: string; lat?: number; lng?: number }) => {
    const manual: UserLocation = {
      lat: loc.lat || 0,
      lng: loc.lng || 0,
      pincode: loc.pincode || '',
      city: loc.city || '',
      state: loc.state || '',
      timestamp: Date.now(),
    };
    setLocation(manual);
    saveToStorage(manual);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const retryDetection = useCallback(() => {
    detectLocation();
  }, [detectLocation]);

  return (
    <LocationContext.Provider value={{ location, isLoading, setManualLocation, clearLocation, retryDetection }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

export default LocationContext;
