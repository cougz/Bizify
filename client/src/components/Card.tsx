import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {title && <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
