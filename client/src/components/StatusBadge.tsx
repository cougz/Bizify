import React from 'react';

type StatusType = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Status configuration with colors and labels (with dark mode support)
  const statusConfig: Record<StatusType, { color: string; label: string }> = {
    draft: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      label: 'Draft',
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      label: 'Pending',
    },
    paid: {
      color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      label: 'Paid',
    },
    overdue: {
      color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      label: 'Overdue',
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      label: 'Cancelled',
    },
    success: {
      color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      label: 'Success',
    },
    warning: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      label: 'Warning',
    },
    error: {
      color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      label: 'Error',
    },
    info: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      label: 'Info',
    },
  };

  const { color, label } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
