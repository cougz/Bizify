import React from 'react';

type StatusType = 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled' | 'active' | 'inactive' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

/**
 * Status badge component for displaying status indicators
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Determine color based on status
  const getStatusColor = (status: StatusType): string => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'paid':
      case 'active':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800'; // Success
      
      case 'pending':
      case 'in progress':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'; // Warning
      
      case 'overdue':
      case 'late':
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800'; // Danger
      
      case 'draft':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'; // Neutral
      
      case 'cancelled':
        return 'bg-purple-100 text-purple-800'; // Info
      
      default:
        return 'bg-blue-100 text-blue-800'; // Default
    }
  };

  // Format status text
  const formatStatus = (status: StatusType): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <span 
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
