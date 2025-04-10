import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  text?: string;
}

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--primary-color)',
  className = '',
  text
}) => {
  // Determine size in pixels
  const sizeInPx = {
    small: 16,
    medium: 32,
    large: 48
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="spinner"
        style={{
          width: `${sizeInPx}px`,
          height: `${sizeInPx}px`,
          borderWidth: `${sizeInPx / 8}px`,
          borderColor: `${color} transparent transparent transparent`
        }}
      />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
