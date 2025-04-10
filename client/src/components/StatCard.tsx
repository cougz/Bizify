import React, { ReactNode } from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  change?: number;
  changeLabel?: string;
  changeTimeframe?: string;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * StatCard component for displaying statistics in a card format
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-primary-color',
  change,
  changeLabel,
  changeTimeframe,
  footer,
  className = '',
  onClick
}) => {
  // Determine if change is positive, negative, or neutral
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  // Change indicator classes
  const changeColorClass = isPositive 
    ? 'text-success-color' 
    : isNegative 
      ? 'text-danger-color' 
      : 'text-gray-500';
  
  return (
    <Card className={`${className}`} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center mt-2">
              {change !== undefined && (
                <span className={`flex items-center text-sm font-medium ${changeColorClass}`}>
                  {isPositive && '+'}{change}%
                  {isPositive ? (
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : isNegative ? (
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : null}
                </span>
              )}
              
              {changeLabel && (
                <span className="text-sm text-gray-500 ml-1">
                  {changeLabel}
                  {changeTimeframe && ` (${changeTimeframe})`}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <div className={`${iconColor}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
