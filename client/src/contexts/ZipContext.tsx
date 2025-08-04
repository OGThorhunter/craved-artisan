import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ZipContextType {
  zip: string;
  updateZip: (newZip: string) => void;
  isValidZip: (zip: string) => boolean;
  isUsingLocation: boolean;
  setUsingLocation: (using: boolean) => void;
}

const ZipContext = createContext<ZipContextType | undefined>(undefined);

interface ZipProviderProps {
  children: ReactNode;
}

export const ZipProvider: React.FC<ZipProviderProps> = ({ children }) => {
  const [zip, setZip] = useState<string>('12345'); // Default ZIP
  const [isUsingLocation, setIsUsingLocation] = useState<boolean>(false);

  // Load ZIP from localStorage on mount
  useEffect(() => {
    const savedZip = localStorage.getItem('userZip');
    if (savedZip) {
      setZip(savedZip);
    } else {
      // Try to get ZIP from browser geolocation or IP
      // For now, we'll use a default
      setZip('12345');
    }
  }, []);

  // Save ZIP to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userZip', zip);
  }, [zip]);

  const isValidZip = (zipCode: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  };

  const updateZip = (newZip: string) => {
    if (isValidZip(newZip)) {
      setZip(newZip);
    } else {
      console.warn('Invalid ZIP code format:', newZip);
    }
  };

  const value: ZipContextType = {
    zip,
    updateZip,
    isValidZip,
    isUsingLocation,
    setUsingLocation: setIsUsingLocation,
  };

  return (
    <ZipContext.Provider value={value}>
      {children}
    </ZipContext.Provider>
  );
};

export const useZip = (): ZipContextType => {
  const context = useContext(ZipContext);
  if (context === undefined) {
    throw new Error('useZip must be used within a ZipProvider');
  }
  return context;
}; 