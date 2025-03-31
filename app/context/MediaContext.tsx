'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

type MediaType = 'books' | 'movies';

interface MediaContextType {
  mediaType: MediaType;
  setMediaType: (type: MediaType) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mediaType, setMediaType] = useState<MediaType>('books');

  return (
    <MediaContext.Provider value={{ mediaType, setMediaType }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}; 