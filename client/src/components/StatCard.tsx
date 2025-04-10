import React from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
  onClick
}) => {
  // Format trend value as percentage
  const formatTrend = (value: number) => {
    return `${Math.abs(value).toFixed(1)}%`;
  };

  // Get trend color based on whether it's positive or negative
  const getTrendColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  // Get trend icon based on whether it's positive or negative
  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12">
        <path d="M6 0l6 6H9v6H3V6H0z" />
      </svg>
    ) : (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12">
        <path d="M6 12l-6-6h3V0h6v6h3z" />
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`flex items-center ${getTrendColor(trend.isPositive)}`}>
                {getTrendIcon(trend.isPositive)}
                <span className="ml-1 text-xs font-medium">{formatTrend(trend.value)}</span>
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-full bg-gray-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
