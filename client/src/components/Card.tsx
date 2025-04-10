import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = false,
  shadow = 'md',
  border = true,
  rounded = true,
}) => {
  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  // Combine all classes
  const cardClasses = `
    bg-white
    ${padding ? 'p-4' : ''}
    ${border ? 'border border-gray-200' : ''}
    ${rounded ? 'rounded-lg' : ''}
    ${shadowClasses[shadow]}
    ${className}
  `;

  return <div className={cardClasses}>{children}</div>;
};

export default Card;
