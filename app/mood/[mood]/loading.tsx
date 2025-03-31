import React from 'react';
import DynamicBackground from '@/app/components/DynamicBackground';
import NoiseOverlay from '@/app/components/NoiseOverlay';
import Loader from '@/app/components/Loader';
import FloatingBooks from '@/app/components/FloatingBooks';

export default function Loading() {
  return (
    <>
      <DynamicBackground />
      <FloatingBooks count={6} />
      <NoiseOverlay />
      <div className="relative z-10 text-white min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
          Finding Your Perfect Book
        </h1>
        
        <div className="flex-1 flex justify-center items-center h-[50vh]">
          <Loader />
        </div>
      </div>
    </>
  );
} 