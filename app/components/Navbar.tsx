'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMedia } from '../context/MediaContext';

const Navbar = () => {
  const { mediaType, setMediaType } = useMedia();
  const router = useRouter();
  const pathname = usePathname();

  // Handle toggle change
  const handleToggleChange = (type: 'books' | 'movies') => {
    setMediaType(type);
    
    // If we're on a mood page, redirect to home
    if (pathname.includes('/mood/') || pathname.includes('/movie/')) {
      router.push('/');
    }
  };

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto bg-zinc-900/50 backdrop-blur-xl rounded-full px-4 py-2 flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="h-8 w-8 rounded-lg bg-emerald-400 flex items-center justify-center shadow-lg">
            <span className="text-zinc-900 font-bold text-base">
              {mediaType === 'books' ? 'B' : 'M'}
            </span>
          </div>
          {/* App Name */}
          <Link href="/" className="text-white font-medium text-base">
            {mediaType === 'books' ? 'Book Rec' : 'Movie Rec'}
          </Link>
        </div>

        {/* Media Toggle */}
        <div className="flex items-center bg-black/30 rounded-full p-0.5">
          <button 
            onClick={() => handleToggleChange('books')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              mediaType === 'books' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Books
          </button>
          <button 
            onClick={() => handleToggleChange('movies')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              mediaType === 'movies' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies
          </button>
        </div>

        {/* Theme Toggle */}
        <button 
          className="h-8 w-8 rounded-full bg-zinc-800/50 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors"
          onClick={() => {
            // Theme toggle functionality will be added later
            console.log('Toggle theme');
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-zinc-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar; 