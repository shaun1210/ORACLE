import React from 'react';
import './PushableButton.scss';

const PushableButton = ({ 
  onClick, 
  children, 
  className = '', 
  type = 'button',
  disabled = false,
  title = '',
  style = {}
}) => {
  return (
    <button 
      className={`pushable-btn ${className}`} 
      onClick={onClick}
      type={type}
      disabled={disabled}
      title={title}
      style={style}
    >
      <span className="shadow"></span>
      <span className="edge"></span>
      <span className="front">
        {children}
      </span>
    </button>
  );
};

export default PushableButton;
