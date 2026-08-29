import React from 'react';

/* ============================================
   House Stark — Direwolf sigil
   Simplified geometric wolf silhouette
   ============================================ */
export const StarkSigil = ({ size = 24, color = '#c9a84c' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wolf head - simplified geometric design */}
    <g fill={color} opacity="0.9">
      {/* Ears */}
      <polygon points="18,8 22,2 26,12" />
      <polygon points="38,8 42,2 46,12" />
      {/* Head */}
      <polygon points="16,14 32,10 48,14 46,28 42,32 38,30 32,34 26,30 22,32 18,28" />
      {/* Snout */}
      <polygon points="26,30 32,38 38,30" />
      {/* Eyes - cutouts */}
      <circle cx="25" cy="20" r="2.5" fill="#1a1108" />
      <circle cx="39" cy="20" r="2.5" fill="#1a1108" />
      {/* Nose */}
      <circle cx="32" cy="33" r="2" fill="#1a1108" />
      {/* Fangs */}
      <polygon points="28,36 30,42 32,36" opacity="0.7" />
      <polygon points="32,36 34,42 36,36" opacity="0.7" />
      {/* Neck/mane lines */}
      <line x1="16" y1="18" x2="12" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="48" y1="18" x2="52" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </g>
  </svg>
);

/* ============================================
   House Targaryen — Three-headed dragon sigil
   Simplified dragon with spread wings
   ============================================ */
export const TargaryenSigil = ({ size = 24, color = '#c9a84c' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill={color} opacity="0.9">
      {/* Left wing */}
      <polygon points="6,18 14,8 22,16 18,24 10,22" />
      <polygon points="6,18 4,28 10,24" />
      {/* Right wing */}
      <polygon points="58,18 50,8 42,16 46,24 54,22" />
      <polygon points="58,18 60,28 54,24" />
      {/* Central body */}
      <polygon points="26,16 32,12 38,16 40,28 36,32 32,30 28,32 24,28" />
      {/* Three heads - left */}
      <circle cx="22" cy="14" r="4" />
      <circle cx="20" cy="13" r="1" fill="#1a1108" />
      {/* Three heads - center */}
      <circle cx="32" cy="10" r="4.5" />
      <circle cx="31" cy="9" r="1" fill="#1a1108" />
      {/* Three heads - right */}
      <circle cx="42" cy="14" r="4" />
      <circle cx="44" cy="13" r="1" fill="#1a1108" />
      {/* Neck connections */}
      <polygon points="24,16 28,18 26,22" opacity="0.7" />
      <polygon points="40,16 36,18 38,22" opacity="0.7" />
      {/* Tail */}
      <polygon points="30,30 32,42 34,30" />
      <polygon points="32,42 28,48 32,44 36,48" />
      {/* Flame accents */}
      <polygon points="30,44 26,52 30,48" opacity="0.5" />
      <polygon points="34,44 38,52 34,48" opacity="0.5" />
    </g>
  </svg>
);

/* ============================================
   House Baratheon — Stag sigil
   Simplified stag with antlers
   ============================================ */
export const BaratheonSigil = ({ size = 24, color = '#c9a84c' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill={color} opacity="0.9">
      {/* Left antler */}
      <polygon points="14,6 16,2 20,8" />
      <polygon points="10,10 14,6 16,12" />
      <polygon points="12,14 14,10 18,14" />
      {/* Right antler */}
      <polygon points="50,6 48,2 44,8" />
      <polygon points="54,10 50,6 48,12" />
      <polygon points="52,14 50,10 46,14" />
      {/* Head */}
      <ellipse cx="32" cy="20" rx="10" ry="8" />
      {/* Eyes */}
      <circle cx="28" cy="18" r="1.5" fill="#1a1108" />
      <circle cx="36" cy="18" r="1.5" fill="#1a1108" />
      {/* Snout */}
      <ellipse cx="32" cy="24" rx="4" ry="3" opacity="0.7" />
      <circle cx="30" cy="23" r="0.8" fill="#1a1108" />
      <circle cx="34" cy="23" r="0.8" fill="#1a1108" />
      {/* Neck */}
      <polygon points="26,26 32,28 38,26 40,34 36,38 32,36 28,38 24,34" />
      {/* Body */}
      <polygon points="24,34 32,32 40,34 42,44 38,48 32,46 26,48 22,44" />
      {/* Front legs */}
      <polygon points="26,44 24,54 28,54 30,46" />
      <polygon points="34,46 36,54 40,54 38,44" />
      {/* Hind legs */}
      <polygon points="24,44 22,52 26,52 26,46" />
      <polygon points="38,46 38,52 42,52 40,44" />
      {/* Hooves */}
      <rect x="22" y="52" width="4" height="2" rx="1" />
      <rect x="38" y="52" width="4" height="2" rx="1" />
    </g>
  </svg>
);

export default { StarkSigil, TargaryenSigil, BaratheonSigil };
