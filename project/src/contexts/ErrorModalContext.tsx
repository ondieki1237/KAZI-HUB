import React, { createContext, useContext, useEffect, useState } from 'react';
import ErrorModal from '../components/ErrorModal';
import { setErrorModalHandler } from '../services/api';

interface ErrorModalContextType {
  showError: (message: string, severity: 'error' | 'warning' | 'info') => void;
}

const ErrorModalContext = createContext<ErrorModalContextType | null>(null);

export const useErrorModal = () => {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error('useErrorModal must be used within an ErrorModalProvider');
  }
  return context;
};

export const ErrorModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'error' | 'warning' | 'info'>('error');

  const showError = (message: string, severity: 'error' | 'warning' | 'info' = 'error') => {
    setMessage(message);
    setSeverity(severity);
    setIsOpen(true);
  };

  useEffect(() => {
    // Register the error modal handler with the API service
    setErrorModalHandler(showError);
    return () => setErrorModalHandler(null);
  }, []);

  return (
    <ErrorModalContext.Provider value={{ showError }}>
      {children}
      <ErrorModal
        isOpen={isOpen}
        message={message}
        severity={severity}
        onClose={() => setIsOpen(false)}
      />
    </ErrorModalContext.Provider>
  );
}; 