import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Error message component
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = '',
  onDismiss
}) => {
  if (!message) return null;

  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative ${className}`} role="alert">
      <div className="flex items-center">
        <FiAlertTriangle className="mr-2" size={18} />
        <span>{message}</span>
      </div>
      
      {onDismiss && (
        <button
          className="absolute top-0 right-0 mt-2 mr-2 text-red-700 hover:text-red-900"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <span className="text-xl">&times;</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
