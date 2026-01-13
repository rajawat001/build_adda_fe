import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  const announcements = [
    "Free Delivery on Orders Above ₹50,000",
    "Get 10% OFF on Your First Order - Use Code: FIRST10",
    "Same Day Delivery Available in Select Cities"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <p>{announcements[currentIndex]}</p>
      </div>
      <button
        className="announcement-close"
        onClick={() => setIsVisible(false)}
        aria-label="Close announcement"
      >
        <FiX />
      </button>
    </div>
  );
}
