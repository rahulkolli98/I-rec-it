'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DynamicBackground from './DynamicBackground';
import NoiseOverlay from './NoiseOverlay';
import Loader from './Loader';
import FloatingBooks from './FloatingBooks';
import FloatingMovies from './FloatingMovies';
import { useMedia } from '../context/MediaContext';

interface LoadingPageProps {
  customTitle?: string;
  customMessage?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  customTitle,
  customMessage
}) => {
  const { mediaType } = useMedia();
  const isBooks = mediaType === 'books';
  
  return (
    <>
      <DynamicBackground />
      {isBooks ? <FloatingBooks count={6} /> : <FloatingMovies count={6} />}
      <NoiseOverlay />
      <motion.div
        className="relative z-10 text-white min-h-screen flex flex-col items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {customTitle || (isBooks ? "Finding Your Perfect Book" : "Finding Your Perfect Movie")}
        </motion.h1>
        
        <div className="flex-1 flex justify-center items-center h-[50vh]">
          <Loader 
            type={mediaType}
            customMessage={customMessage}
          />
        </div>
      </motion.div>
    </>
  );
}

export default LoadingPage; 