import React from 'react';
import './RealmBackground.scss';

const RealmBackground = () => {
  return (
    <div className="realm-bg" role="presentation" aria-hidden="true">
      {/* Base warm leather gradient */}
      <div className="rb-layer rb-base" />
      
      {/* Radial light source — warm glow from bottom-center (throne room) */}
      <div className="rb-layer rb-throne-glow" />
      
      {/* Atmospheric fog layers — slow drift */}
      <div className="rb-layer rb-fog rb-fog-1" />
      <div className="rb-layer rb-fog rb-fog-2" />
      <div className="rb-layer rb-fog rb-fog-3" />
      
      {/* Light rays — diagonal golden beams */}
      <div className="rb-layer rb-rays" />
      
      {/* Floating ember particles */}
      <div className="rb-layer rb-particles">
        {[...Array(24)].map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${8 + Math.random() * 84}%`,
            animationDelay: `${Math.random() * 18}s`,
            animationDuration: `${12 + Math.random() * 16}s`,
            width: `${1.5 + Math.random() * 2}px`,
            height: `${1.5 + Math.random() * 2}px`,
          }} />
        ))}
      </div>
      
      {/* Dust motes — tiny floating specs */}
      <div className="rb-layer rb-dust">
        {[...Array(40)].map((_, i) => (
          <span key={i} className="dust" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 25}s`,
            animationDuration: `${20 + Math.random() * 30}s`,
          }} />
        ))}
      </div>
      
      {/* Deep vignette — darkened edges for focus */}
      <div className="rb-layer rb-vignette" />
      
      {/* Subtle leather grain overlay */}
      <div className="rb-layer rb-grain" />
      
      {/* Corner ornamental knots */}
      <div className="rb-corners" aria-hidden="true">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>
    </div>
  );
};

export default RealmBackground;
