import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, message, severity = 'error', onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const severityStyles = {
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`border-l-4 p-4 rounded-lg shadow-lg max-w-md w-full mx-4 ${severityStyles[severity]}`}>
        <div className="flex flex-col">
          <p className="text-sm sm:text-base">{message}</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                onClose();
                navigate(-1); // Navigate back to the previous page
              }}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-500 text-white rounded-full text-sm sm:text-base hover:bg-teal-600"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;