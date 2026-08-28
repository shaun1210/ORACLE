import React from 'react';
import './UiverseButton.scss';

const UiverseButton = ({ 
  onClick, 
  children, 
  className = '', 
  type = 'button',
  disabled = false,
  title = '',
  scale = 1
}) => {
  return (
    <div className={`uiverse-button-wrapper ${className}`} style={{ transform: `scale(${scale})`, display: 'inline-flex' }}>
      <button 
        className="uiverse-button" 
        onClick={onClick}
        type={type}
        disabled={disabled}
        title={title}
      >
        <div className="button-inner">
          {children}
        </div>
      </button>
    </div>
  );
};

export default UiverseButton;
