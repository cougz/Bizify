import React from 'react';

type StatusType = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Status configuration with colors and labels
  const statusConfig: Record<StatusType, { color: string; label: string }> = {
    draft: {
      color: 'bg-gray-100 text-gray-800',
      label: 'Draft',
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Pending',
    },
    paid: {
      color: 'bg-green-100 text-green-800',
      label: 'Paid',
    },
    overdue: {
      color: 'bg-red-100 text-red-800',
      label: 'Overdue',
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800',
      label: 'Cancelled',
    },
    success: {
      color: 'bg-green-100 text-green-800',
      label: 'Success',
    },
    warning: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Warning',
    },
    error: {
      color: 'bg-red-100 text-red-800',
      label: 'Error',
    },
    info: {
      color: 'bg-blue-100 text-blue-800',
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
