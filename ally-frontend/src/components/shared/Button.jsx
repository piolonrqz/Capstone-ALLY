import React, { useState } from 'react';
import { Edit, Upload, Download, Trash2 } from 'lucide-react';

// Shared Button Component
const Button = ({ children, variant = 'primary', size = 'sm', onClick, className = '' }) => {
  const baseStyles = 'font-medium rounded transition-colors duration-200';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;