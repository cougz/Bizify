import React from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  trend,
  className = '',
}) => {
  // Trend colors and icons
  const trendConfig = {
    up: {
      color: 'text-green-500',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      ),
    },
    down: {
      color: 'text-red-500',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      ),
    },
    neutral: {
      color: 'text-gray-500',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14"
          />
        </svg>
      ),
    },
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && trend && (
            <div className="mt-1 flex items-center">
              <span className={`${trendConfig[trend].color} flex items-center text-sm font-medium`}>
                {trendConfig[trend].icon}
                <span className="ml-1">{Math.abs(change)}%</span>
              </span>
              <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
          )}
        </div>
        {icon && <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100">{icon}</div>}
      </div>
    </Card>
  );
};

export default StatCard;
