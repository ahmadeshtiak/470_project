import React from "react";

export default function CarImage({ images, alt = "Car image", className = "" }) {
  // Get first image or fallback
  const imageArray = images && images.length > 0 ? images : [];
  const firstImage = imageArray[0];

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === "") return "";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    // If it starts with /uploads, it's already a server path
    if (imagePath.startsWith("/uploads")) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // If it starts with /, it's a server path
    if (imagePath.startsWith("/")) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // Otherwise, assume it's a filename and add the full path
    return `http://localhost:5000/uploads/cars/${imagePath}`;
  };

  if (!firstImage) {
    return (
      <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(firstImage)}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      loading="eager"
      decoding="async"
      onError={(e) => {
        e.target.style.display = 'none';
        if (e.target.nextElementSibling) {
          e.target.nextElementSibling.style.display = 'flex';
        }
      }}
    />
  );
}

