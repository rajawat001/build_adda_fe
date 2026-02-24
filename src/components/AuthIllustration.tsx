import React from 'react';

interface AuthIllustrationProps {
  theme: 'user' | 'distributor';
  title: string;
  subtitle: string;
  scene: 'login' | 'bungalow' | 'revenue';
}

/* ============================================================
   Scene 1: LoginScene — Realistic 3D Construction City
   ============================================================ */
function LoginScene() {
  return (
    <svg viewBox="0 0 520 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-buildings">
      <defs>
        {/* Sky gradient — warm sunset/dawn */}
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdb375" stopOpacity="0.35" />
          <stop offset="25%" stopColor="#f9c89b" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#dce8f5" stopOpacity="0.3" />
          <stop offset="75%" stopColor="#c8ddf0" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e4ecf5" stopOpacity="0.15" />
        </linearGradient>

        {/* Concrete material — building front */}
        <linearGradient id="ls-concrete-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a9bae" />
          <stop offset="20%" stopColor="#7d8fa3" />
          <stop offset="50%" stopColor="#6e8197" />
          <stop offset="80%" stopColor="#5f728a" />
          <stop offset="100%" stopColor="#4f6278" />
        </linearGradient>

        {/* Concrete material — building side (darker) */}
        <linearGradient id="ls-concrete-s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b7d91" />
          <stop offset="30%" stopColor="#5c6e83" />
          <stop offset="60%" stopColor="#4d5f74" />
          <stop offset="100%" stopColor="#3e5065" />
        </linearGradient>

        {/* Building top/roof */}
        <linearGradient id="ls-roof" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#a0b0c0" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#b8c8d8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#d0dce8" stopOpacity="0.8" />
        </linearGradient>

        {/* Glass reflection — diagonal white overlay */}
        <linearGradient id="ls-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="30%" stopColor="#dbeaf7" stopOpacity="0.2" />
          <stop offset="70%" stopColor="#b8d4ee" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#a0c4e0" stopOpacity="0.05" />
        </linearGradient>

        {/* Window inner glow — warm lit */}
        <linearGradient id="ls-win-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e1" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffe0a0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffd080" stopOpacity="0.5" />
        </linearGradient>

        {/* Ground road */}
        <linearGradient id="ls-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="50%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>

        {/* Sidewalk */}
        <linearGradient id="ls-sidewalk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8c0b8" />
          <stop offset="100%" stopColor="#b0a898" />
        </linearGradient>

        {/* Brick material */}
        <linearGradient id="ls-brick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c27a58" />
          <stop offset="40%" stopColor="#b06a48" />
          <stop offset="100%" stopColor="#8e5538" />
        </linearGradient>

        {/* Tree foliage */}
        <radialGradient id="ls-tree" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#6abf69" />
          <stop offset="50%" stopColor="#4a9e49" />
          <stop offset="100%" stopColor="#357a34" />
        </radialGradient>

        {/* Sun glow */}
        <radialGradient id="ls-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe5a0" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#ffd070" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffc040" stopOpacity="0" />
        </radialGradient>

        {/* Drop shadow */}
        <filter id="ls-shd" x="-20%" y="-10%" width="140%" height="150%">
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#2a3a4a" floodOpacity="0.25" />
        </filter>
        <filter id="ls-shd-sm" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#2a3a4a" floodOpacity="0.2" />
        </filter>

        {/* Window glow filter */}
        <filter id="ls-wglow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Ambient occlusion — dark line at base */}
        <linearGradient id="ls-ao" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>

        {/* Light rays */}
        <linearGradient id="ls-ray" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fff8e0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width="520" height="280" fill="url(#ls-sky)" />

      {/* Sun glow */}
      <circle cx="460" cy="50" r="60" fill="url(#ls-sun)" />

      {/* Light rays from top-right */}
      <polygon points="520,0 380,0 280,200 440,200" fill="url(#ls-ray)" opacity="0.4" />
      <polygon points="520,20 440,0 360,180 480,180" fill="url(#ls-ray)" opacity="0.25" />

      {/* Distant haze layer */}
      <rect x="0" y="180" width="520" height="60" fill="#c8d8e8" opacity="0.15" />

      {/* Animated clouds */}
      <g className="auth-clouds">
        <ellipse cx="80" cy="45" rx="38" ry="13" fill="#fff" opacity="0.55" />
        <ellipse cx="60" cy="42" rx="22" ry="11" fill="#fff" opacity="0.65" />
        <ellipse cx="100" cy="43" rx="20" ry="10" fill="#fff" opacity="0.6" />
      </g>
      <g className="auth-clouds-2">
        <ellipse cx="360" cy="32" rx="30" ry="11" fill="#fff" opacity="0.4" />
        <ellipse cx="345" cy="30" rx="20" ry="9" fill="#fff" opacity="0.5" />
        <ellipse cx="385" cy="31" rx="16" ry="8" fill="#fff" opacity="0.45" />
      </g>

      {/* ===== Ground plane ===== */}
      {/* Sidewalk */}
      <rect x="0" y="268" width="520" height="12" fill="url(#ls-sidewalk)" />
      {/* Sidewalk pattern */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <line key={`sw-${i}`} x1={i * 42} y1="268" x2={i * 42} y2="280" stroke="#a89888" strokeWidth="0.5" opacity="0.4" />
      ))}
      {/* Road */}
      <rect x="0" y="280" width="520" height="28" fill="url(#ls-road)" />
      {/* Lane markings */}
      <line x1="0" y1="294" x2="520" y2="294" stroke="#e0d8a0" strokeWidth="2" strokeDasharray="16 12" opacity="0.6" />
      {/* Road edge lines */}
      <line x1="0" y1="281" x2="520" y2="281" stroke="#888" strokeWidth="0.5" opacity="0.3" />
      <line x1="0" y1="307" x2="520" y2="307" stroke="#888" strokeWidth="0.5" opacity="0.3" />
      {/* Ground below road */}
      <rect x="0" y="308" width="520" height="72" fill="#8a9a78" opacity="0.3" />

      {/* ===== Building 1 — Tall Glass Office Tower (left) ===== */}
      <g filter="url(#ls-shd)">
        <g transform="translate(20, 55)">
          {/* Front face — concrete */}
          <path d="M0 213 L75 185 L75 0 L0 28 Z" fill="url(#ls-concrete-f)" />
          {/* Side face — darker concrete */}
          <path d="M75 185 L150 213 L150 28 L75 0 Z" fill="url(#ls-concrete-s)" />
          {/* Roof */}
          <path d="M0 28 L75 0 L150 28 L75 56 Z" fill="url(#ls-roof)" />
          {/* Edge highlights — top edges catching light */}
          <line x1="0" y1="28" x2="75" y2="0" stroke="#d0dce8" strokeWidth="1.2" opacity="0.7" />
          <line x1="75" y1="0" x2="150" y2="28" stroke="#b0c0d0" strokeWidth="0.8" opacity="0.5" />

          {/* Glass panel — front face reflection */}
          <path d="M8 38 L67 16 L67 178 L8 200 Z" fill="url(#ls-glass)" opacity="0.5" />
          {/* Diagonal reflection streak */}
          <path d="M15 40 L30 34 L25 120 L10 126 Z" fill="#fff" opacity="0.12" />

          {/* Window grid — front (warm lit) */}
          {[0,1,2,3,4,5,6].map(row =>
            [0,1].map(col => (
              <React.Fragment key={`w1f-${row}-${col}`}>
                <rect
                  x={14 + col * 26}
                  y={42 + row * 22}
                  width="16"
                  height="10"
                  rx="1.5"
                  fill="url(#ls-win-glow)"
                  filter="url(#ls-wglow)"
                  opacity="0.55"
                />
                {/* Window frame */}
                <rect
                  x={14 + col * 26}
                  y={42 + row * 22}
                  width="16"
                  height="10"
                  rx="1.5"
                  fill="none"
                  stroke="#5a6a7a"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </React.Fragment>
            ))
          )}

          {/* Window grid — side (darker, less lit) */}
          {[0,1,2,3,4,5,6].map(row =>
            [0,1].map(col => (
              <rect
                key={`w1s-${row}-${col}`}
                x={85 + col * 24}
                y={44 + row * 22}
                width="14"
                height="9"
                rx="1"
                fill="#a0c0d8"
                opacity="0.18"
              />
            ))
          )}

          {/* Rooftop structures */}
          <rect x="55" y="-8" width="14" height="8" rx="1" fill="#6a7a8a" opacity="0.6" />
          <rect x="60" y="-16" width="4" height="8" fill="#5a6a7a" opacity="0.5" />
          {/* Antenna with blinking light */}
          <line x1="75" y1="0" x2="75" y2="-20" stroke="#5a6a7a" strokeWidth="1.5" opacity="0.6" />
          <circle cx="75" cy="-22" r="3" fill="#ff4444" opacity="0.8" className="auth-blink" />

          {/* Entrance — glass door */}
          <rect x="26" y="186" width="24" height="28" rx="2" fill="#b8d4ee" opacity="0.4" />
          <line x1="38" y1="186" x2="38" y2="214" stroke="#8aa8c0" strokeWidth="1" opacity="0.3" />
          {/* Ambient occlusion at base */}
          <rect x="0" y="208" width="150" height="5" fill="url(#ls-ao)" />
        </g>
      </g>

      {/* ===== Building 2 — Brick Warehouse (center) ===== */}
      <g filter="url(#ls-shd)">
        <g transform="translate(175, 108)">
          {/* Front face — brick */}
          <path d="M0 160 L95 132 L95 0 L0 28 Z" fill="url(#ls-brick)" />
          {/* Side face — darker brick */}
          <path d="M95 132 L175 160 L175 28 L95 0 Z" fill="#8e5538" opacity="0.75" />
          {/* Roof */}
          <path d="M0 28 L95 0 L175 28 L95 56 Z" fill="url(#ls-roof)" />
          {/* Edge highlight */}
          <line x1="0" y1="28" x2="95" y2="0" stroke="#d8b098" strokeWidth="1" opacity="0.5" />

          {/* Brick pattern — front face */}
          {[0,1,2,3,4,5,6,7].map(row => (
            <React.Fragment key={`br-${row}`}>
              <line x1="0" y1={40 + row * 15} x2="95" y2={28 + row * 15} stroke="#9a6040" strokeWidth="0.5" opacity="0.25" />
              {row % 2 === 0 && [0,1,2,3].map(col => (
                <line key={`brv-${row}-${col}`} x1={22 + col * 22} y1={40 + row * 15} x2={22 + col * 22} y2={40 + row * 15 + 15} stroke="#9a6040" strokeWidth="0.4" opacity="0.2" />
              ))}
            </React.Fragment>
          ))}

          {/* Loading dock — large roll-up door */}
          <rect x="18" y="72" width="48" height="60" rx="3" fill="#d4c4b4" opacity="0.4" />
          <rect x="18" y="72" width="48" height="60" rx="3" fill="none" stroke="#8a6a50" strokeWidth="1" opacity="0.3" />
          {/* Door segments */}
          {[0,1,2,3].map(i => (
            <line key={`door-${i}`} x1="20" y1={82 + i * 12} x2="64" y2={82 + i * 12} stroke="#8a6a50" strokeWidth="0.5" opacity="0.2" />
          ))}

          {/* Side windows */}
          <rect x="105" y="55" width="20" height="14" rx="2" fill="#b8d4ee" opacity="0.2" />
          <rect x="135" y="55" width="20" height="14" rx="2" fill="#b8d4ee" opacity="0.18" />
          <rect x="105" y="85" width="20" height="14" rx="2" fill="url(#ls-win-glow)" opacity="0.2" />
          <rect x="135" y="85" width="20" height="14" rx="2" fill="url(#ls-win-glow)" opacity="0.18" />

          {/* Company sign */}
          <rect x="28" y="44" width="36" height="14" rx="2" fill="#e8d8c8" opacity="0.6" />
          <rect x="32" y="48" width="28" height="6" rx="1" fill="#b06a48" opacity="0.3" />

          {/* Ambient occlusion */}
          <rect x="0" y="155" width="175" height="5" fill="url(#ls-ao)" />
        </g>
      </g>

      {/* ===== Building 3 — Modern Glass Tower (right) ===== */}
      <g filter="url(#ls-shd)">
        <g transform="translate(370, 58)">
          {/* Front face */}
          <path d="M0 210 L58 184 L58 0 L0 26 Z" fill="url(#ls-concrete-f)" />
          {/* Side face */}
          <path d="M58 184 L116 210 L116 26 L58 0 Z" fill="url(#ls-concrete-s)" />
          {/* Roof */}
          <path d="M0 26 L58 0 L116 26 L58 52 Z" fill="url(#ls-roof)" />
          {/* Edge highlights */}
          <line x1="0" y1="26" x2="58" y2="0" stroke="#d0dce8" strokeWidth="1" opacity="0.6" />

          {/* Full glass curtain wall — front */}
          <path d="M4 32 L54 12 L54 178 L4 198 Z" fill="url(#ls-glass)" opacity="0.6" />
          {/* Glass reflection streaks */}
          <path d="M8 35 L18 31 L16 100 L6 104 Z" fill="#fff" opacity="0.15" />
          <path d="M35 24 L42 21 L40 85 L33 88 Z" fill="#fff" opacity="0.08" />

          {/* Window grid — front (blue glass panels) */}
          {[0,1,2,3,4,5,6,7].map(row => (
            <React.Fragment key={`w3-${row}`}>
              <rect x="7" y={36 + row * 20} width="18" height="10" rx="1" fill="url(#ls-win-glow)" filter="url(#ls-wglow)" opacity="0.4" />
              <rect x="30" y={36 + row * 20} width="18" height="10" rx="1" fill="url(#ls-win-glow)" opacity="0.3" />
              {/* Window dividers */}
              <line x1="7" y1={36 + row * 20} x2="50" y2={36 + row * 20} stroke="#6a8aa0" strokeWidth="0.4" opacity="0.3" />
            </React.Fragment>
          ))}

          {/* Side windows */}
          {[0,1,2,3,4,5,6,7].map(row => (
            <rect key={`w3s-${row}`} x="68" y={38 + row * 20} width="16" height="9" rx="1" fill="#8ab8d8" opacity="0.15" />
          ))}

          {/* Rooftop structures */}
          <rect x="38" y="-6" width="16" height="7" rx="1.5" fill="#6a7a8a" opacity="0.5" />
          <rect x="20" y="-3" width="10" height="4" rx="1" fill="#7a8a9a" opacity="0.4" />

          {/* Ambient occlusion */}
          <rect x="0" y="206" width="116" height="4" fill="url(#ls-ao)" />
        </g>
      </g>

      {/* ===== Construction Crane ===== */}
      <g className="auth-crane" transform="translate(155, 22)">
        {/* Vertical mast */}
        <rect x="0" y="0" width="6" height="200" fill="#e8a830" opacity="0.85" />
        <rect x="1" y="0" width="4" height="200" fill="#d09020" opacity="0.4" />
        {/* Cross braces (lattice) */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <React.Fragment key={`brace-${i}`}>
            <line x1="0" y1={i * 24} x2="6" y2={i * 24 + 12} stroke="#c08020" strokeWidth="0.8" opacity="0.5" />
            <line x1="6" y1={i * 24} x2="0" y2={i * 24 + 12} stroke="#c08020" strokeWidth="0.8" opacity="0.5" />
            {/* Horizontal rungs */}
            <line x1="0" y1={i * 24} x2="6" y2={i * 24} stroke="#c08020" strokeWidth="0.6" opacity="0.4" />
          </React.Fragment>
        ))}
        {/* Horizontal jib */}
        <rect x="-45" y="0" width="100" height="5" fill="#e8a830" opacity="0.8" />
        <rect x="-45" y="1" width="100" height="3" fill="#d09020" opacity="0.3" />
        {/* Jib lattice */}
        {[0,1,2,3,4].map(i => (
          <React.Fragment key={`jib-${i}`}>
            <line x1={-42 + i * 20} y1="0" x2={-32 + i * 20} y2="5" stroke="#c08020" strokeWidth="0.6" opacity="0.4" />
            <line x1={-32 + i * 20} y1="0" x2={-42 + i * 20} y2="5" stroke="#c08020" strokeWidth="0.6" opacity="0.4" />
          </React.Fragment>
        ))}
        {/* Counter weight */}
        <rect x="-42" y="5" width="14" height="10" rx="1.5" fill="#888" opacity="0.7" />
        <rect x="-42" y="5" width="14" height="10" rx="1.5" fill="none" stroke="#666" strokeWidth="0.5" opacity="0.3" />
        {/* Cable */}
        <line x1="50" y1="5" x2="50" y2="48" stroke="#666" strokeWidth="0.8" opacity="0.5" />
        {/* Hook */}
        <path d="M47 46 L53 46 L53 54 Q50 58 47 54 Z" fill="#888" opacity="0.7" />
        {/* Hanging load — steel beam */}
        <rect x="40" y="58" width="20" height="8" rx="1.5" fill="#7a8a9a" opacity="0.6" className="auth-swing" />
        <rect x="40" y="58" width="20" height="8" rx="1.5" fill="none" stroke="#5a6a7a" strokeWidth="0.5" opacity="0.3" />
        {/* Operator cab */}
        <rect x="-2" y="10" width="10" height="10" rx="1.5" fill="#e8a830" opacity="0.7" />
        <rect x="0" y="12" width="6" height="5" rx="1" fill="#d0e8f8" opacity="0.4" />
      </g>

      {/* ===== Small Shed ===== */}
      <g filter="url(#ls-shd-sm)">
        <g transform="translate(312, 210)">
          <path d="M0 45 L30 32 L30 0 L0 13 Z" fill="#7a8a6a" opacity="0.7" />
          <path d="M30 32 L60 45 L60 13 L30 0 Z" fill="#6a7a5a" opacity="0.55" />
          <path d="M0 13 L30 0 L60 13 L30 26 Z" fill="#9aaa8a" opacity="0.5" />
          <rect x="8" y="20" width="12" height="18" rx="1" fill="url(#ls-win-glow)" opacity="0.25" />
        </g>
      </g>

      {/* ===== Animated Truck ===== */}
      <g className="auth-truck">
        {/* Truck ground shadow */}
        <ellipse cx="35" cy="302" rx="34" ry="5" fill="#2a3a4a" opacity="0.12" />
        {/* Cargo body */}
        <rect x="0" y="272" width="44" height="24" rx="3" fill="#3a6a9a" opacity="0.9" />
        {/* Cargo top highlight */}
        <rect x="1" y="273" width="42" height="3" rx="1" fill="#5a8ab8" opacity="0.3" />
        {/* Cargo lines */}
        <line x1="4" y1="280" x2="40" y2="280" stroke="#fff" strokeWidth="0.6" opacity="0.1" />
        <line x1="4" y1="286" x2="40" y2="286" stroke="#fff" strokeWidth="0.6" opacity="0.1" />
        {/* Cab */}
        <rect x="44" y="266" width="28" height="30" rx="5" fill="#2c5a88" opacity="0.95" />
        {/* Cab highlight */}
        <rect x="45" y="267" width="12" height="28" rx="4" fill="#3a6a9a" opacity="0.3" />
        {/* Windshield */}
        <rect x="48" y="270" width="18" height="13" rx="3" fill="#d0e8f8" opacity="0.6" />
        {/* Windshield glare */}
        <rect x="49" y="271" width="5" height="11" rx="1.5" fill="#fff" opacity="0.25" />
        {/* Headlight */}
        <rect x="70" y="284" width="4" height="6" rx="2" fill="#ffc107" opacity="0.9" />
        {/* Tail light */}
        <rect x="-2" y="288" width="3" height="5" rx="1" fill="#e74c3c" opacity="0.7" />
        {/* Wheels with detail */}
        <circle cx="14" cy="300" r="7.5" fill="#2a2a2a" opacity="0.9" />
        <circle cx="36" cy="300" r="7.5" fill="#2a2a2a" opacity="0.9" />
        <circle cx="58" cy="300" r="7.5" fill="#2a2a2a" opacity="0.9" />
        {/* Tire tread ring */}
        <circle cx="14" cy="300" r="6" fill="none" stroke="#3a3a3a" strokeWidth="1.5" opacity="0.5" />
        <circle cx="36" cy="300" r="6" fill="none" stroke="#3a3a3a" strokeWidth="1.5" opacity="0.5" />
        <circle cx="58" cy="300" r="6" fill="none" stroke="#3a3a3a" strokeWidth="1.5" opacity="0.5" />
        {/* Wheel hubs */}
        <circle cx="14" cy="300" r="3" fill="#888" opacity="0.5" />
        <circle cx="36" cy="300" r="3" fill="#888" opacity="0.5" />
        <circle cx="58" cy="300" r="3" fill="#888" opacity="0.5" />
        {/* Hub bolts */}
        <circle cx="14" cy="300" r="1.2" fill="#555" opacity="0.4" />
        <circle cx="36" cy="300" r="1.2" fill="#555" opacity="0.4" />
        <circle cx="58" cy="300" r="1.2" fill="#555" opacity="0.4" />
        {/* Exhaust smoke */}
        <g className="auth-smoke">
          <circle cx="-8" cy="290" r="3" fill="#c8c8c8" opacity="0.25" />
          <circle cx="-15" cy="287" r="4.5" fill="#d0d0d0" opacity="0.15" />
          <circle cx="-24" cy="284" r="6" fill="#d8d8d8" opacity="0.08" />
        </g>
      </g>

      {/* ===== Stacked pallets / cargo ===== */}
      <g transform="translate(395, 230)">
        {/* Pallet base */}
        <rect x="-2" y="28" width="68" height="5" rx="1" fill="#a08060" opacity="0.5" />
        {/* Bottom row */}
        <rect x="0" y="14" width="20" height="16" rx="2" fill="#d0a060" opacity="0.55" />
        <rect x="22" y="14" width="20" height="16" rx="2" fill="#c09050" opacity="0.5" />
        <rect x="44" y="14" width="20" height="16" rx="2" fill="#b08040" opacity="0.45" />
        {/* Top row */}
        <rect x="10" y="0" width="20" height="16" rx="2" fill="#d8b070" opacity="0.5" />
        <rect x="32" y="0" width="20" height="16" rx="2" fill="#c8a060" opacity="0.45" />
      </g>

      {/* ===== Cement bags ===== */}
      <g transform="translate(270, 252)">
        <rect x="0" y="8" width="18" height="12" rx="2" fill="#a09888" opacity="0.55" />
        <rect x="3" y="0" width="18" height="12" rx="2" fill="#b0a898" opacity="0.6" />
        <line x1="6" y1="3" x2="18" y2="3" stroke="#8a8278" strokeWidth="0.7" opacity="0.3" />
      </g>

      {/* ===== Trees ===== */}
      {/* Right tree */}
      <g transform="translate(490, 230)">
        <rect x="8" y="18" width="5" height="22" rx="1.5" fill="#6a5a40" opacity="0.6" />
        <circle cx="10" cy="14" r="13" fill="url(#ls-tree)" opacity="0.7" />
        <circle cx="6" cy="8" r="8" fill="#6abf69" opacity="0.4" />
        <circle cx="15" cy="10" r="7" fill="#5aaf59" opacity="0.35" />
        {/* Light highlight on foliage */}
        <circle cx="8" cy="6" r="4" fill="#8ad088" opacity="0.25" />
      </g>
      {/* Left tree */}
      <g transform="translate(5, 245)">
        <rect x="6" y="14" width="4" height="16" rx="1" fill="#6a5a40" opacity="0.5" />
        <circle cx="8" cy="10" r="10" fill="url(#ls-tree)" opacity="0.55" />
        <circle cx="5" cy="6" r="6" fill="#6abf69" opacity="0.3" />
      </g>

      {/* ===== Street lamp ===== */}
      <g transform="translate(300, 230)">
        <rect x="0" y="5" width="2.5" height="38" rx="0.5" fill="#5a5a5a" opacity="0.6" />
        <path d="M-4 5 Q1.25 0 6.5 5" stroke="#5a5a5a" strokeWidth="1.5" fill="none" opacity="0.5" />
        <ellipse cx="1.25" cy="3" rx="4" ry="2" fill="#ffe080" opacity="0.4" />
      </g>

      {/* ===== Forklift ===== */}
      <g filter="url(#ls-shd-sm)" transform="translate(115, 248)">
        <rect x="0" y="6" width="24" height="18" rx="3" fill="#e8a830" opacity="0.75" />
        <rect x="24" y="0" width="6" height="24" rx="1" fill="#d09020" opacity="0.6" />
        <rect x="22" y="0" width="12" height="5" rx="1.5" fill="#c08020" opacity="0.5" />
        <rect x="24" y="-6" width="10" height="6" rx="1" fill="#8a9a6a" opacity="0.5" />
        <circle cx="6" cy="26" r="4.5" fill="#2a2a2a" opacity="0.8" />
        <circle cx="18" cy="26" r="4.5" fill="#2a2a2a" opacity="0.8" />
        <circle cx="6" cy="26" r="2" fill="#666" opacity="0.3" />
        <circle cx="18" cy="26" r="2" fill="#666" opacity="0.3" />
      </g>
    </svg>
  );
}

/* ============================================================
   Scene 2: BungalowScene — Dream Home Construction Site
   ============================================================ */
function BungalowScene() {
  return (
    <svg viewBox="0 0 520 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-buildings">
      <defs>
        {/* Clear blue sky */}
        <linearGradient id="bs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6db3f2" stopOpacity="0.35" />
          <stop offset="25%" stopColor="#85c1f5" stopOpacity="0.28" />
          <stop offset="50%" stopColor="#a5d4f8" stopOpacity="0.2" />
          <stop offset="75%" stopColor="#c8e4fb" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#e8f2fe" stopOpacity="0.1" />
        </linearGradient>

        {/* House wall — warm cream/white */}
        <linearGradient id="bs-wall-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5efe8" />
          <stop offset="25%" stopColor="#ede5da" />
          <stop offset="50%" stopColor="#e5dcd0" />
          <stop offset="75%" stopColor="#ddd3c5" />
          <stop offset="100%" stopColor="#d5cab8" />
        </linearGradient>
        <linearGradient id="bs-wall-s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ddd3c5" />
          <stop offset="40%" stopColor="#d0c4b5" />
          <stop offset="100%" stopColor="#c0b4a0" />
        </linearGradient>

        {/* Roof tiles — terracotta */}
        <linearGradient id="bs-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c85a3a" />
          <stop offset="30%" stopColor="#b84a2a" />
          <stop offset="60%" stopColor="#a83a1a" />
          <stop offset="100%" stopColor="#982a0a" />
        </linearGradient>
        <linearGradient id="bs-roof-s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a83a1a" />
          <stop offset="100%" stopColor="#882a0a" />
        </linearGradient>

        {/* Brick wall section */}
        <linearGradient id="bs-brick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c87a58" />
          <stop offset="50%" stopColor="#b86a48" />
          <stop offset="100%" stopColor="#a85a38" />
        </linearGradient>

        {/* Glass / window */}
        <linearGradient id="bs-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8daf0" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#90c0e0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#70a8d0" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="bs-glass-refl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Green lawn */}
        <linearGradient id="bs-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ac060" />
          <stop offset="40%" stopColor="#6ab050" />
          <stop offset="100%" stopColor="#5a9a40" />
        </linearGradient>

        {/* Pathway */}
        <linearGradient id="bs-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8b8a0" />
          <stop offset="50%" stopColor="#b8a890" />
          <stop offset="100%" stopColor="#a89880" />
        </linearGradient>

        {/* Wood — for porch pillars, fence */}
        <linearGradient id="bs-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b89070" />
          <stop offset="50%" stopColor="#a07858" />
          <stop offset="100%" stopColor="#886848" />
        </linearGradient>

        {/* Scaffolding metal */}
        <linearGradient id="bs-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a0a8b0" />
          <stop offset="100%" stopColor="#808890" />
        </linearGradient>

        {/* Tree foliage */}
        <radialGradient id="bs-tree" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#70c868" />
          <stop offset="50%" stopColor="#50a848" />
          <stop offset="100%" stopColor="#388830" />
        </radialGradient>

        {/* Shadows */}
        <filter id="bs-shd" x="-15%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="5" floodColor="#3a4a2a" floodOpacity="0.2" />
        </filter>
        <filter id="bs-shd-sm" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#3a4a2a" floodOpacity="0.18" />
        </filter>
        <filter id="bs-wglow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Ambient occlusion */}
        <linearGradient id="bs-ao" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="520" height="250" fill="url(#bs-sky)" />

      {/* Soft clouds */}
      <g className="auth-clouds">
        <ellipse cx="100" cy="40" rx="45" ry="14" fill="#fff" opacity="0.6" />
        <ellipse cx="78" cy="36" rx="25" ry="12" fill="#fff" opacity="0.7" />
        <ellipse cx="125" cy="38" rx="22" ry="10" fill="#fff" opacity="0.65" />
      </g>
      <g className="auth-clouds-2">
        <ellipse cx="400" cy="50" rx="35" ry="12" fill="#fff" opacity="0.45" />
        <ellipse cx="380" cy="47" rx="22" ry="10" fill="#fff" opacity="0.55" />
        <ellipse cx="425" cy="48" rx="18" ry="9" fill="#fff" opacity="0.5" />
      </g>

      {/* ===== Green lawn / ground ===== */}
      <rect x="0" y="250" width="520" height="130" fill="url(#bs-lawn)" opacity="0.5" />
      {/* Grass texture lines */}
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <line key={`grass-${i}`} x1={i * 60 + 10} y1="260" x2={i * 60 + 15} y2="255" stroke="#5a9a40" strokeWidth="0.8" opacity="0.3" />
      ))}

      {/* ===== Garden pathway ===== */}
      <path d="M260 380 Q260 310 280 290 Q300 270 260 260" fill="url(#bs-path)" opacity="0.6" strokeWidth="0" />
      <rect x="248" y="260" width="24" height="120" rx="4" fill="url(#bs-path)" opacity="0.5" />
      {/* Path stones */}
      {[0,1,2,3,4].map(i => (
        <line key={`pstone-${i}`} x1="250" y1={268 + i * 24} x2="270" y2={268 + i * 24} stroke="#a89070" strokeWidth="0.7" opacity="0.4" />
      ))}

      {/* ===== Main Bungalow House ===== */}
      <g filter="url(#bs-shd)" className="auth-bungalow-build">
        <g transform="translate(100, 100)">
          {/* Front wall */}
          <rect x="0" y="70" width="200" height="120" fill="url(#bs-wall-f)" />
          {/* Side wall — right extension */}
          <path d="M200 70 L300 100 L300 220 L200 190 Z" fill="url(#bs-wall-s)" />
          {/* Front wall edge highlight */}
          <line x1="0" y1="70" x2="200" y2="70" stroke="#f8f0e8" strokeWidth="1" opacity="0.6" />

          {/* ===== Pitched Roof ===== */}
          {/* Front slope */}
          <path d="M-15 70 L100 10 L215 70 Z" fill="url(#bs-roof)" />
          {/* Side slope */}
          <path d="M215 70 L100 10 L315 100 Z" fill="url(#bs-roof-s)" />
          {/* Roof edge highlight */}
          <line x1="-15" y1="70" x2="100" y2="10" stroke="#d86a4a" strokeWidth="1.5" opacity="0.5" />
          <line x1="100" y1="10" x2="215" y2="70" stroke="#d86a4a" strokeWidth="1" opacity="0.4" />

          {/* Roof tile pattern — front */}
          {[0,1,2,3].map(row => (
            <line key={`rtile-${row}`}
              x1={-10 + row * 5} y1={65 - row * 14}
              x2={210 - row * 5} y2={65 - row * 14}
              stroke="#982a0a" strokeWidth="0.6" opacity="0.3"
            />
          ))}

          {/* Chimney */}
          <rect x="150" y="20" width="18" height="35" rx="1" fill="#a07060" opacity="0.8" />
          <rect x="148" y="18" width="22" height="5" rx="1" fill="#b08070" opacity="0.7" />
          {/* Chimney brick lines */}
          <line x1="152" y1="28" x2="166" y2="28" stroke="#806050" strokeWidth="0.5" opacity="0.3" />
          <line x1="152" y1="36" x2="166" y2="36" stroke="#806050" strokeWidth="0.5" opacity="0.3" />
          <line x1="152" y1="44" x2="166" y2="44" stroke="#806050" strokeWidth="0.5" opacity="0.3" />

          {/* ===== Front Windows ===== */}
          {/* Left window pair */}
          <rect x="20" y="95" width="36" height="40" rx="2" fill="url(#bs-glass)" />
          <rect x="20" y="95" width="36" height="40" rx="2" fill="url(#bs-glass-refl)" />
          <line x1="38" y1="95" x2="38" y2="135" stroke="#7a9ab0" strokeWidth="1" opacity="0.4" />
          <line x1="20" y1="115" x2="56" y2="115" stroke="#7a9ab0" strokeWidth="1" opacity="0.4" />
          {/* Window frame */}
          <rect x="20" y="95" width="36" height="40" rx="2" fill="none" stroke="#8a7a68" strokeWidth="1.5" opacity="0.5" />
          {/* Window sill */}
          <rect x="18" y="134" width="40" height="3" rx="0.5" fill="#c0b4a0" opacity="0.6" />

          {/* Right window pair */}
          <rect x="145" y="95" width="36" height="40" rx="2" fill="url(#bs-glass)" />
          <rect x="145" y="95" width="36" height="40" rx="2" fill="url(#bs-glass-refl)" />
          <line x1="163" y1="95" x2="163" y2="135" stroke="#7a9ab0" strokeWidth="1" opacity="0.4" />
          <line x1="145" y1="115" x2="181" y2="115" stroke="#7a9ab0" strokeWidth="1" opacity="0.4" />
          <rect x="145" y="95" width="36" height="40" rx="2" fill="none" stroke="#8a7a68" strokeWidth="1.5" opacity="0.5" />
          <rect x="143" y="134" width="40" height="3" rx="0.5" fill="#c0b4a0" opacity="0.6" />

          {/* ===== Front Door ===== */}
          <rect x="80" y="120" width="40" height="70" rx="3" fill="#6a4830" opacity="0.85" />
          {/* Door panels */}
          <rect x="84" y="126" width="14" height="24" rx="1.5" fill="#7a5840" opacity="0.7" />
          <rect x="102" y="126" width="14" height="24" rx="1.5" fill="#7a5840" opacity="0.7" />
          <rect x="84" y="156" width="14" height="24" rx="1.5" fill="#7a5840" opacity="0.6" />
          <rect x="102" y="156" width="14" height="24" rx="1.5" fill="#7a5840" opacity="0.6" />
          {/* Door handle */}
          <circle cx="115" cy="158" r="2.5" fill="#c8a830" opacity="0.8" />
          {/* Door arch top */}
          <path d="M80 120 Q100 108 120 120" fill="#6a4830" opacity="0.85" />
          {/* Door glass fanlight */}
          <path d="M85 120 Q100 112 115 120" fill="#a0c8e0" opacity="0.4" />

          {/* ===== Side Windows (right wall) ===== */}
          <rect x="220" y="120" width="30" height="35" rx="2" fill="url(#bs-glass)" opacity="0.5" transform="skewY(8)" />
          <rect x="260" y="130" width="25" height="30" rx="2" fill="url(#bs-glass)" opacity="0.4" transform="skewY(8)" />

          {/* ===== Front Porch ===== */}
          {/* Porch floor */}
          <rect x="65" y="190" width="70" height="8" rx="1" fill="#c0b4a0" opacity="0.6" />
          {/* Porch step */}
          <rect x="70" y="198" width="60" height="5" rx="1" fill="#b0a490" opacity="0.5" />
          {/* Porch pillars */}
          <rect x="68" y="145" width="6" height="45" rx="1" fill="url(#bs-wood)" opacity="0.7" />
          <rect x="126" y="145" width="6" height="45" rx="1" fill="url(#bs-wood)" opacity="0.7" />
          {/* Porch roof overhang */}
          <rect x="60" y="142" width="80" height="5" rx="1" fill="#d0c4b0" opacity="0.6" />

          {/* ===== Brick base / foundation ===== */}
          <rect x="0" y="180" width="200" height="12" fill="url(#bs-brick)" opacity="0.6" />
          {/* Brick lines */}
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <line key={`fbrick-${i}`} x1={i * 24} y1="186" x2={i * 24 + 12} y2="186" stroke="#a06040" strokeWidth="0.5" opacity="0.3" />
          ))}

          {/* Ambient occlusion at base */}
          <rect x="0" y="190" width="200" height="4" fill="url(#bs-ao)" />
          <rect x="200" y="216" width="100" height="4" fill="url(#bs-ao)" />
        </g>
      </g>

      {/* ===== Scaffolding (right side of house) ===== */}
      <g filter="url(#bs-shd-sm)" className="auth-bungalow-build" style={{ animationDelay: '0.2s' }}>
        <g transform="translate(380, 140)">
          {/* Vertical poles */}
          <rect x="0" y="0" width="3" height="110" fill="url(#bs-steel)" opacity="0.7" />
          <rect x="40" y="0" width="3" height="110" fill="url(#bs-steel)" opacity="0.7" />
          <rect x="80" y="10" width="3" height="100" fill="url(#bs-steel)" opacity="0.6" />
          {/* Horizontal platforms */}
          <rect x="-3" y="35" width="89" height="3" rx="0.5" fill="url(#bs-wood)" opacity="0.6" />
          <rect x="-3" y="70" width="89" height="3" rx="0.5" fill="url(#bs-wood)" opacity="0.6" />
          {/* Cross braces */}
          <line x1="0" y1="0" x2="40" y2="35" stroke="#808890" strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="0" x2="0" y2="35" stroke="#808890" strokeWidth="1" opacity="0.4" />
          <line x1="0" y1="35" x2="40" y2="70" stroke="#808890" strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="35" x2="0" y2="70" stroke="#808890" strokeWidth="1" opacity="0.4" />
          {/* Safety rail */}
          <rect x="-5" y="25" width="92" height="2" rx="0.5" fill="#e8a020" opacity="0.6" />
          <rect x="-5" y="60" width="92" height="2" rx="0.5" fill="#e8a020" opacity="0.6" />
        </g>
      </g>

      {/* ===== Construction Materials ===== */}
      {/* Brick stack */}
      <g className="auth-bungalow-build" style={{ animationDelay: '0.4s' }}>
        <g transform="translate(440, 280)">
          {[0,1,2].map(row =>
            [0,1,2].map(col => (
              <rect key={`bstack-${row}-${col}`}
                x={col * 14} y={row * -10}
                width="12" height="8" rx="0.5"
                fill="#c07848" opacity={0.7 - row * 0.1}
              />
            ))
          )}
        </g>
      </g>

      {/* Sand pile */}
      <g className="auth-bungalow-build" style={{ animationDelay: '0.5s' }}>
        <g transform="translate(20, 280)">
          <ellipse cx="25" cy="15" rx="25" ry="15" fill="#d8c8a0" opacity="0.6" />
          <ellipse cx="25" cy="12" rx="20" ry="10" fill="#e0d0a8" opacity="0.4" />
        </g>
      </g>

      {/* Cement mixer */}
      <g filter="url(#bs-shd-sm)" className="auth-bungalow-build" style={{ animationDelay: '0.3s' }}>
        <g transform="translate(60, 260)">
          {/* Frame */}
          <rect x="5" y="15" width="28" height="3" rx="1" fill="#808890" opacity="0.6" />
          {/* Drum */}
          <ellipse cx="20" cy="10" rx="16" ry="12" fill="#e8a020" opacity="0.75" transform="rotate(-15, 20, 10)" />
          <ellipse cx="20" cy="10" rx="12" ry="9" fill="#d09018" opacity="0.4" transform="rotate(-15, 20, 10)" />
          {/* Opening */}
          <ellipse cx="30" cy="5" rx="5" ry="7" fill="#888" opacity="0.3" />
          {/* Wheels */}
          <circle cx="10" cy="22" r="4" fill="#3a3a3a" opacity="0.7" />
          <circle cx="28" cy="22" r="4" fill="#3a3a3a" opacity="0.7" />
          <circle cx="10" cy="22" r="2" fill="#666" opacity="0.3" />
          <circle cx="28" cy="22" r="2" fill="#666" opacity="0.3" />
          {/* Handle */}
          <line x1="35" y1="4" x2="42" y2="10" stroke="#808890" strokeWidth="2" opacity="0.5" />
        </g>
      </g>

      {/* Wheelbarrow */}
      <g className="auth-bungalow-build" style={{ animationDelay: '0.6s' }}>
        <g transform="translate(475, 270)">
          <path d="M0 0 L20 -8 L30 0 L25 8 L5 8 Z" fill="#4a8a40" opacity="0.6" />
          <circle cx="28" cy="12" r="4" fill="#3a3a3a" opacity="0.6" />
          <line x1="0" y1="0" x2="-10" y2="10" stroke="#808890" strokeWidth="1.5" opacity="0.4" />
          <line x1="5" y1="8" x2="-8" y2="14" stroke="#808890" strokeWidth="1.5" opacity="0.4" />
        </g>
      </g>

      {/* ===== Fence ===== */}
      <g transform="translate(0, 295)">
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i => (
          <React.Fragment key={`fence-${i}`}>
            <rect x={i * 36 + 2} y="-22" width="3" height="28" rx="0.5" fill="url(#bs-wood)" opacity="0.45" />
            {i < 14 && (
              <rect x={i * 36 + 2} y="-15" width="36" height="2" rx="0.5" fill="url(#bs-wood)" opacity="0.35" />
            )}
            {i < 14 && (
              <rect x={i * 36 + 2} y="-5" width="36" height="2" rx="0.5" fill="url(#bs-wood)" opacity="0.35" />
            )}
          </React.Fragment>
        ))}
      </g>

      {/* ===== Trees ===== */}
      {/* Left tree */}
      <g transform="translate(15, 205)">
        <rect x="12" y="25" width="6" height="28" rx="2" fill="#6a5a40" opacity="0.6" />
        <circle cx="15" cy="18" r="18" fill="url(#bs-tree)" opacity="0.7" />
        <circle cx="10" cy="10" r="11" fill="#70c868" opacity="0.4" />
        <circle cx="22" cy="13" r="10" fill="#60b858" opacity="0.35" />
        <circle cx="12" cy="5" r="6" fill="#88d880" opacity="0.25" />
      </g>
      {/* Right tree */}
      <g transform="translate(490, 215)">
        <rect x="8" y="20" width="5" height="24" rx="1.5" fill="#6a5a40" opacity="0.55" />
        <circle cx="10" cy="14" r="15" fill="url(#bs-tree)" opacity="0.65" />
        <circle cx="6" cy="7" r="9" fill="#70c868" opacity="0.35" />
        <circle cx="16" cy="10" r="8" fill="#60b858" opacity="0.3" />
      </g>

      {/* Small garden flowers */}
      <g transform="translate(200, 302)">
        {[0,1,2,3,4].map(i => (
          <React.Fragment key={`flower-${i}`}>
            <line x1={i * 14} y1="0" x2={i * 14} y2="-8" stroke="#5a8a40" strokeWidth="1" opacity="0.4" />
            <circle cx={i * 14} cy={-10} r="3" fill={i % 2 === 0 ? '#e85080' : '#e8a020'} opacity="0.5" />
          </React.Fragment>
        ))}
      </g>
    </svg>
  );
}

/* ============================================================
   Scene 3: RevenueScene — Business Growth Dashboard
   ============================================================ */
function RevenueScene() {
  return (
    <svg viewBox="0 0 520 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-buildings">
      <defs>
        {/* Background — warm business amber */}
        <linearGradient id="rs-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8f0" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#fff0e0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffe8d0" stopOpacity="0.15" />
        </linearGradient>

        {/* Laptop body */}
        <linearGradient id="rs-laptop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="30%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>

        {/* Screen */}
        <linearGradient id="rs-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a3a" />
          <stop offset="100%" stopColor="#0a1a2a" />
        </linearGradient>

        {/* Green bar chart gradient */}
        <linearGradient id="rs-bar-green" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#2ea043" />
          <stop offset="50%" stopColor="#3cb553" />
          <stop offset="100%" stopColor="#56d068" />
        </linearGradient>

        {/* Orange accent bar */}
        <linearGradient id="rs-bar-orange" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#e86a20" />
          <stop offset="50%" stopColor="#f07a30" />
          <stop offset="100%" stopColor="#f89040" />
        </linearGradient>

        {/* Revenue line gradient */}
        <linearGradient id="rs-line-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#ff8855" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>

        {/* Gold coin */}
        <radialGradient id="rs-coin" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#ffd860" />
          <stop offset="50%" stopColor="#f0c030" />
          <stop offset="100%" stopColor="#d8a020" />
        </radialGradient>

        {/* Package box */}
        <linearGradient id="rs-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8a060" />
          <stop offset="100%" stopColor="#b88040" />
        </linearGradient>

        {/* Truck body */}
        <linearGradient id="rs-truck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#e05520" />
        </linearGradient>

        {/* Shadows */}
        <filter id="rs-shd" x="-15%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="5" floodColor="#4a3a20" floodOpacity="0.2" />
        </filter>
        <filter id="rs-shd-sm" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#4a3a20" floodOpacity="0.15" />
        </filter>

        {/* Screen glow */}
        <filter id="rs-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="520" height="380" fill="url(#rs-bg)" />

      {/* Decorative grid pattern */}
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <line key={`hgrid-${i}`} x1="0" y1={i * 45 + 20} x2="520" y2={i * 45 + 20} stroke="#e0d0c0" strokeWidth="0.3" opacity="0.3" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
        <line key={`vgrid-${i}`} x1={i * 52 + 10} y1="0" x2={i * 52 + 10} y2="380" stroke="#e0d0c0" strokeWidth="0.3" opacity="0.3" />
      ))}

      {/* ===== Isometric Laptop/Dashboard ===== */}
      <g filter="url(#rs-shd)">
        <g transform="translate(80, 40)">
          {/* Laptop base (keyboard) — isometric */}
          <path d="M20 220 L180 250 L360 220 L200 190 Z" fill="url(#rs-laptop)" opacity="0.8" />
          {/* Trackpad */}
          <rect x="165" y="215" width="30" height="18" rx="2" fill="#555" opacity="0.3" transform="skewX(-10)" />

          {/* Screen panel — slightly angled back */}
          <path d="M30 220 L30 50 L330 50 L330 220 Z" fill="url(#rs-screen)" />
          {/* Screen border */}
          <path d="M30 220 L30 50 L330 50 L330 220 Z" fill="none" stroke="#555" strokeWidth="2" opacity="0.4" />
          {/* Screen inner bezel */}
          <rect x="40" y="58" width="280" height="152" rx="2" fill="#0d1b2a" opacity="0.9" />

          {/* ===== Dashboard Content ===== */}

          {/* Dashboard header bar */}
          <rect x="42" y="60" width="276" height="20" rx="1" fill="#1a2d40" opacity="0.8" />
          <circle cx="55" cy="70" r="3" fill="#e74c3c" opacity="0.6" />
          <circle cx="65" cy="70" r="3" fill="#f1c40f" opacity="0.6" />
          <circle cx="75" cy="70" r="3" fill="#2ecc71" opacity="0.6" />
          <rect x="250" y="66" width="55" height="8" rx="2" fill="#FF6B35" opacity="0.5" />

          {/* Revenue title text line */}
          <rect x="50" y="86" width="60" height="5" rx="1" fill="#5a8aaa" opacity="0.5" />
          {/* Revenue number */}
          <rect x="50" y="95" width="80" height="8" rx="1" fill="#fff" opacity="0.7" />

          {/* Small stat cards */}
          <rect x="160" y="84" width="50" height="22" rx="3" fill="#1e3348" opacity="0.8" />
          <rect x="165" y="88" width="20" height="4" rx="1" fill="#5a8aaa" opacity="0.5" />
          <rect x="165" y="96" width="35" height="5" rx="1" fill="#2ecc71" opacity="0.6" />

          <rect x="218" y="84" width="50" height="22" rx="3" fill="#1e3348" opacity="0.8" />
          <rect x="223" y="88" width="20" height="4" rx="1" fill="#5a8aaa" opacity="0.5" />
          <rect x="223" y="96" width="35" height="5" rx="1" fill="#FF6B35" opacity="0.6" />

          <rect x="276" y="84" width="36" height="22" rx="3" fill="#1e3348" opacity="0.8" />
          <rect x="281" y="88" width="20" height="4" rx="1" fill="#5a8aaa" opacity="0.5" />
          <rect x="281" y="96" width="25" height="5" rx="1" fill="#f1c40f" opacity="0.6" />

          {/* ===== Bar Chart ===== */}
          <g transform="translate(50, 115)">
            {/* Chart background */}
            <rect x="0" y="0" width="170" height="88" rx="3" fill="#0f1f30" opacity="0.5" />
            {/* Grid lines */}
            {[0,1,2,3].map(i => (
              <line key={`cgl-${i}`} x1="5" y1={10 + i * 20} x2="165" y2={10 + i * 20} stroke="#2a3a4a" strokeWidth="0.5" opacity="0.5" />
            ))}

            {/* Chart bars — growing animation */}
            {[
              { x: 15, h: 30, delay: '0s' },
              { x: 35, h: 40, delay: '0.1s' },
              { x: 55, h: 25, delay: '0.2s' },
              { x: 75, h: 50, delay: '0.3s' },
              { x: 95, h: 55, delay: '0.4s' },
              { x: 115, h: 45, delay: '0.5s' },
              { x: 135, h: 68, delay: '0.6s' },
            ].map((bar, i) => (
              <rect
                key={`bar-${i}`}
                x={bar.x}
                y={80 - bar.h}
                width="14"
                height={bar.h}
                rx="2"
                fill={i === 6 ? 'url(#rs-bar-orange)' : 'url(#rs-bar-green)'}
                opacity="0.85"
                className="auth-revenue-bar"
                style={{ animationDelay: bar.delay }}
              />
            ))}

            {/* Bar highlight — top edge */}
            {[
              { x: 15, h: 30 },
              { x: 35, h: 40 },
              { x: 55, h: 25 },
              { x: 75, h: 50 },
              { x: 95, h: 55 },
              { x: 115, h: 45 },
              { x: 135, h: 68 },
            ].map((bar, i) => (
              <rect key={`barhi-${i}`} x={bar.x} y={80 - bar.h} width="14" height="2" rx="1" fill="#fff" opacity="0.2" />
            ))}
          </g>

          {/* ===== Revenue Trend Line (right side) ===== */}
          <g transform="translate(235, 115)">
            <rect x="0" y="0" width="80" height="88" rx="3" fill="#0f1f30" opacity="0.5" />
            {/* Line chart */}
            <polyline
              points="8,70 20,58 32,62 44,45 56,38 68,22 76,15"
              fill="none"
              stroke="url(#rs-line-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="auth-revenue-line"
            />
            {/* Data points */}
            {[
              [8,70],[20,58],[32,62],[44,45],[56,38],[68,22],[76,15]
            ].map(([cx, cy], i) => (
              <circle key={`dp-${i}`} cx={cx} cy={cy} r="2.5" fill="#FF6B35" opacity="0.7" className="auth-revenue-line" style={{ animationDelay: `${0.5 + i * 0.15}s` }} />
            ))}
            {/* Area fill under line */}
            <polygon
              points="8,70 20,58 32,62 44,45 56,38 68,22 76,15 76,80 8,80"
              fill="#FF6B35"
              opacity="0.08"
            />
          </g>

          {/* Screen reflection glare */}
          <path d="M30 50 L150 50 L80 130 L30 130 Z" fill="#fff" opacity="0.03" />
        </g>
      </g>

      {/* ===== Notification badges on screen ===== */}
      <g transform="translate(80, 40)">
        {/* Order notification */}
        <g transform="translate(285, 45)">
          <rect x="0" y="0" width="52" height="18" rx="9" fill="#2ecc71" opacity="0.85" />
          <rect x="6" y="5" width="8" height="8" rx="4" fill="#fff" opacity="0.4" />
          <rect x="18" y="6" width="28" height="3" rx="1" fill="#fff" opacity="0.6" />
          <rect x="18" y="11" width="18" height="2" rx="0.5" fill="#fff" opacity="0.3" />
        </g>
      </g>

      {/* ===== Growth Arrow ===== */}
      <g transform="translate(410, 60)">
        <path d="M0 60 L25 20 L50 60" fill="none" stroke="#2ecc71" strokeWidth="3" opacity="0.6" />
        <polygon points="25,10 15,28 35,28" fill="#2ecc71" opacity="0.6" />
        {/* Percentage badge */}
        <rect x="8" y="0" width="34" height="16" rx="8" fill="#2ecc71" opacity="0.75" />
        <rect x="14" y="5" width="22" height="5" rx="1" fill="#fff" opacity="0.7" />
      </g>

      {/* ===== Delivery Truck Fleet ===== */}
      {/* Truck 1 */}
      <g filter="url(#rs-shd-sm)" transform="translate(20, 290)">
        <rect x="0" y="0" width="32" height="18" rx="2" fill="url(#rs-truck)" opacity="0.85" />
        <rect x="0" y="1" width="32" height="2" rx="1" fill="#ff8855" opacity="0.3" />
        <rect x="32" y="-4" width="20" height="22" rx="3" fill="#e05520" opacity="0.9" />
        <rect x="35" y="-1" width="12" height="10" rx="2" fill="#f0d8c8" opacity="0.5" />
        <circle cx="8" cy="21" r="5" fill="#2a2a2a" opacity="0.8" />
        <circle cx="25" cy="21" r="5" fill="#2a2a2a" opacity="0.8" />
        <circle cx="44" cy="21" r="5" fill="#2a2a2a" opacity="0.8" />
        <circle cx="8" cy="21" r="2.5" fill="#666" opacity="0.3" />
        <circle cx="25" cy="21" r="2.5" fill="#666" opacity="0.3" />
        <circle cx="44" cy="21" r="2.5" fill="#666" opacity="0.3" />
      </g>

      {/* Truck 2 */}
      <g filter="url(#rs-shd-sm)" transform="translate(85, 300)">
        <rect x="0" y="0" width="28" height="16" rx="2" fill="url(#rs-truck)" opacity="0.7" />
        <rect x="28" y="-3" width="16" height="19" rx="3" fill="#e05520" opacity="0.75" />
        <rect x="30" y="-1" width="10" height="8" rx="1.5" fill="#f0d8c8" opacity="0.4" />
        <circle cx="7" cy="18" r="4.5" fill="#2a2a2a" opacity="0.7" />
        <circle cx="22" cy="18" r="4.5" fill="#2a2a2a" opacity="0.7" />
        <circle cx="38" cy="18" r="4.5" fill="#2a2a2a" opacity="0.7" />
      </g>

      {/* Truck 3 (smaller, distant) */}
      <g transform="translate(150, 310)">
        <rect x="0" y="0" width="22" height="12" rx="1.5" fill="url(#rs-truck)" opacity="0.5" />
        <rect x="22" y="-2" width="13" height="14" rx="2" fill="#e05520" opacity="0.55" />
        <circle cx="5" cy="14" r="3.5" fill="#2a2a2a" opacity="0.5" />
        <circle cx="17" cy="14" r="3.5" fill="#2a2a2a" opacity="0.5" />
        <circle cx="30" cy="14" r="3.5" fill="#2a2a2a" opacity="0.5" />
      </g>

      {/* ===== Product Boxes / Packages ===== */}
      <g transform="translate(400, 150)">
        {/* Box stack */}
        <rect x="0" y="20" width="24" height="20" rx="2" fill="url(#rs-box)" opacity="0.7" />
        <line x1="12" y1="20" x2="12" y2="40" stroke="#a07030" strokeWidth="0.6" opacity="0.3" />
        <line x1="0" y1="30" x2="24" y2="30" stroke="#a07030" strokeWidth="0.6" opacity="0.3" />

        <rect x="26" y="22" width="22" height="18" rx="2" fill="url(#rs-box)" opacity="0.6" />
        <line x1="37" y1="22" x2="37" y2="40" stroke="#a07030" strokeWidth="0.6" opacity="0.3" />

        <rect x="8" y="2" width="22" height="18" rx="2" fill="#e0b870" opacity="0.6" />
        <line x1="19" y1="2" x2="19" y2="20" stroke="#a07030" strokeWidth="0.6" opacity="0.3" />
        <line x1="8" y1="11" x2="30" y2="11" stroke="#a07030" strokeWidth="0.6" opacity="0.3" />
      </g>

      {/* Floating packages (delivery flow) */}
      <g transform="translate(370, 200)">
        <rect x="0" y="0" width="16" height="14" rx="1.5" fill="url(#rs-box)" opacity="0.5" className="auth-coin-float" />
        <line x1="8" y1="0" x2="8" y2="14" stroke="#a07030" strokeWidth="0.5" opacity="0.3" />
      </g>
      <g transform="translate(395, 220)">
        <rect x="0" y="0" width="14" height="12" rx="1.5" fill="url(#rs-box)" opacity="0.4" className="auth-coin-float" style={{ animationDelay: '0.5s' }} />
      </g>

      {/* ===== Money / Coin Stacks ===== */}
      <g transform="translate(440, 250)">
        {/* Coin stack 1 */}
        {[0,1,2,3,4].map(i => (
          <React.Fragment key={`coin1-${i}`}>
            <ellipse cx="15" cy={40 - i * 6} rx="15" ry="5" fill="url(#rs-coin)" opacity={0.8 - i * 0.05} />
            <ellipse cx="15" cy={40 - i * 6} rx="15" ry="5" fill="none" stroke="#c8a020" strokeWidth="0.5" opacity="0.3" />
            <ellipse cx="15" cy={40 - i * 6 - 1} rx="10" ry="3" fill="#ffe060" opacity="0.15" />
          </React.Fragment>
        ))}
        {/* Coin stack 2 (shorter) */}
        {[0,1,2].map(i => (
          <React.Fragment key={`coin2-${i}`}>
            <ellipse cx="42" cy={40 - i * 6} rx="13" ry="4.5" fill="url(#rs-coin)" opacity={0.7 - i * 0.05} />
            <ellipse cx="42" cy={40 - i * 6} rx="13" ry="4.5" fill="none" stroke="#c8a020" strokeWidth="0.5" opacity="0.3" />
          </React.Fragment>
        ))}
      </g>

      {/* Floating coin */}
      <g className="auth-coin-float" transform="translate(470, 225)">
        <circle cx="10" cy="10" r="10" fill="url(#rs-coin)" opacity="0.7" />
        <circle cx="10" cy="10" r="7" fill="none" stroke="#c8a020" strokeWidth="0.8" opacity="0.4" />
        <text x="10" y="14" textAnchor="middle" fill="#a08020" fontSize="9" fontWeight="bold" opacity="0.6">$</text>
      </g>

      {/* Another floating coin */}
      <g className="auth-coin-float" style={{ animationDelay: '1s' }} transform="translate(425, 215)">
        <circle cx="8" cy="8" r="8" fill="url(#rs-coin)" opacity="0.6" />
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="#c8a020" strokeWidth="0.7" opacity="0.35" />
        <text x="8" y="11.5" textAnchor="middle" fill="#a08020" fontSize="7" fontWeight="bold" opacity="0.5">$</text>
      </g>

      {/* ===== Customer icons ===== */}
      <g transform="translate(20, 200)">
        {[0,1,2].map(i => (
          <g key={`cust-${i}`} transform={`translate(${i * 22}, 0)`} opacity={0.5 - i * 0.1}>
            <circle cx="8" cy="6" r="6" fill="#e8d0b0" />
            <path d="M0 22 Q0 14 8 12 Q16 14 16 22" fill="#5a8ab8" opacity="0.6" />
          </g>
        ))}
        <rect x="66" y="8" width="16" height="10" rx="5" fill="#FF6B35" opacity="0.6" />
        <rect x="70" y="11" width="8" height="3" rx="1" fill="#fff" opacity="0.5" />
      </g>

      {/* ===== Upward arrow indicator (large) ===== */}
      <g transform="translate(10, 100)">
        <path d="M20 80 L20 20" stroke="#2ecc71" strokeWidth="3" opacity="0.4" strokeDasharray="4 3" />
        <polygon points="20,8 12,24 28,24" fill="#2ecc71" opacity="0.4" />
      </g>

      {/* ===== Decorative circles ===== */}
      <circle cx="480" cy="330" r="25" fill="#FF6B35" opacity="0.06" />
      <circle cx="490" cy="340" r="15" fill="#FF6B35" opacity="0.08" />
      <circle cx="30" cy="340" r="20" fill="#2ecc71" opacity="0.06" />
    </svg>
  );
}

/* ============================================================
   Main AuthIllustration Component
   ============================================================ */
export default function AuthIllustration({ theme, title, subtitle, scene }: AuthIllustrationProps) {
  const isDistributor = theme === 'distributor';

  return (
    <div className={`auth-illustration theme-${theme}`}>
      {/* Animated floating shapes */}
      <div className="auth-floating-shapes">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
        <div className="floating-shape shape-4" />
        <div className="floating-shape shape-5" />
        <div className="floating-shape shape-6" />
      </div>

      <div className="auth-scene">
        <h2 className="auth-scene-title">{title}</h2>
        <p className="auth-scene-subtitle">{subtitle}</p>

        {/* Render the appropriate scene */}
        {scene === 'login' && <LoginScene />}
        {scene === 'bungalow' && <BungalowScene />}
        {scene === 'revenue' && <RevenueScene />}

        {/* Feature highlights */}
        <div className="auth-features">
          {scene === 'revenue' ? (
            <>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <span>Revenue Growth</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <span>Order Management</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span>Growing Buyers</span>
              </div>
            </>
          ) : (
            <>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <span>Verified Suppliers</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <span>Fast Delivery</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span>Secure Payments</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
