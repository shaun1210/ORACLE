import React from 'react';
import './RealmBackground.scss';

const RealmBackground = () => {
  return (
    <div className="realm-background" role="presentation" aria-hidden="true">
      {/* Deep base layer */}
      <div className="bg-layer base" />
      
      {/* Atmospheric fog/mist layers */}
      <div className="bg-layer mist mist-1" />
      <div className="bg-layer mist mist-2" />
      <div className="bg-layer mist mist-3" />
      
      {/* Ember/firefly particles */}
      <div className="bg-layer embers" aria-hidden="true">
        {[...Array(30)].map((_, i) => (
          <span key={i} className="ember" style={{ 
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 20}s`
          }} />
        ))}
      </div>
      
      {/* Vignette overlay */}
      <div className="bg-layer vignette" />
      
      {/* Subtle texture overlay */}
      <div className="bg-layer texture" />
      
      {/* Corner heraldic accents */}
      <div className="corner-accents" aria-hidden="true">
        <div className="corner corner-tl">
          <div className="heraldic-knot" />
        </div>
        <div className="corner corner-tr">
          <div className="heraldic-knot" />
        </div>
        <div className="corner corner-bl">
          <div className="heraldic-knot" />
        </div>
        <div className="corner corner-br">
          <div className="heraldic-knot" />
        </div>
      </div>
      
      {/* Subtle radial glow from center (throne room effect) */}
      <div className="bg-layer throne-glow" />
    </div>
  );
};

export default RealmBackground;