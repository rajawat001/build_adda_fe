export const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

export interface LocationDetails {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

export const getLocationDetails = async (): Promise<LocationDetails> => {
  try {
    // Get current position
    const coords = await getCurrentLocation();

    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BuildAdda E-Commerce App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location details');
    }

    const data = await response.json();

    // Extract address components
    const address = data.address || {};

    return {
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude
      },
      address: data.display_name || '',
      pincode: address.postcode || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      country: address.country || ''
    };
  } catch (error) {
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};