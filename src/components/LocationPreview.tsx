import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  height?: string;
}

const LocationPreview: React.FC<LocationPreviewProps> = ({ latitude, longitude, height = '250px' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map);

    mapRef.current = map;

    // Ensure tiles render correctly
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height,
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #ddd',
        marginTop: '12px',
      }}
    />
  );
};

export default LocationPreview;
