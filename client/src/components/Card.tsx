import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerContent?: ReactNode;
  footerClassName?: string;
  onClick?: () => void;
}

/**
 * Card component for displaying content in a card layout
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerContent,
  footerClassName = '',
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b ${headerClassName}`}>
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className={`px-6 py-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {footerContent && (
        <div className={`px-6 py-3 bg-gray-50 border-t ${footerClassName}`}>
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;
