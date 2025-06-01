import React from 'react';

const Logo = () => {
  return (
    <div className="absolute flex items-center gap-2 top-4 left-4">
      <img src="/small_logo.png" alt="ALLY Logo" className="w-12 h-12" />
      <h1 className="text-4xl font-bold text-blue-600">ALLY</h1>
    </div>
  );
};

export default Logo;
