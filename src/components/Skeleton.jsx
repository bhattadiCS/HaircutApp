import React, { useState } from 'react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />
);

export const ImageWithSkeleton = ({ src, className, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};
