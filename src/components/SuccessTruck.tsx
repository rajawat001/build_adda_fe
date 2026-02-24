import { useEffect, useState } from 'react';

interface SuccessTruckProps {
  color?: string;
}

export default function SuccessTruck({ color = '#2c3e50' }: SuccessTruckProps) {
  const [driveAway, setDriveAway] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDriveAway(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="success-truck-animation">
      <div className="success-truck-road" />
      <svg
        width="64"
        height="40"
        viewBox="0 0 64 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`success-truck-svg ${driveAway ? 'success-truck-driveaway' : ''}`}
      >
        {/* Truck body */}
        <rect x="0" y="8" width="38" height="20" rx="3" fill={color} opacity="0.8" />
        {/* Cab */}
        <rect x="38" y="4" width="22" height="24" rx="3" fill={color} opacity="0.9" />
        {/* Windshield */}
        <rect x="42" y="8" width="14" height="10" rx="2" fill="#fff" opacity="0.4" />
        {/* Headlight */}
        <rect x="58" y="20" width="4" height="4" rx="1" fill="#ffc107" opacity="0.8" />
        {/* Wheels */}
        <circle cx="12" cy="32" r="6" fill={color} />
        <circle cx="30" cy="32" r="6" fill={color} />
        <circle cx="50" cy="32" r="6" fill={color} />
        <circle cx="12" cy="32" r="3" fill="#fff" opacity="0.3" />
        <circle cx="30" cy="32" r="3" fill="#fff" opacity="0.3" />
        <circle cx="50" cy="32" r="3" fill="#fff" opacity="0.3" />
        {/* Cargo lines */}
        <line x1="5" y1="14" x2="33" y2="14" stroke="#fff" strokeWidth="1" opacity="0.15" />
        <line x1="5" y1="18" x2="33" y2="18" stroke="#fff" strokeWidth="1" opacity="0.15" />
        <line x1="5" y1="22" x2="33" y2="22" stroke="#fff" strokeWidth="1" opacity="0.15" />
      </svg>
    </div>
  );
}
