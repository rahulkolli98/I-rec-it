'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedButton from './components/AnimatedButton';
import DynamicBackground from './components/DynamicBackground';
import NoiseOverlay from './components/NoiseOverlay';
import AnimatedHeading from './components/AnimatedHeading';
import FloatingBooks from './components/FloatingBooks';
import FloatingMovies from './components/FloatingMovies';
import Navbar from './components/Navbar';
import { useMedia } from './context/MediaContext';

const bookMoods = [
  'REFLECTIVE', 'NOSTALGIC', 'ADVENTUROUS', 'MELANCHOLIC',
  'HOPEFUL', 'MYSTERIOUS', 'ROMANTIC', 'WHIMSICAL',
  'THOUGHTFUL', 'THRILLING', 'COZY', 'DARK',
  'INSPIRATIONAL', 'HUMOROUS', 'SERENE', 'TENSE',
  'PLAYFUL', 'GRITTY', 'DREAMY', 'PHILOSOPHICAL',
];

const movieMoods = [
  'ACTION', 'COMEDY', 'DRAMA', 'HORROR',
  'ADVENTURE', 'THRILLER', 'ROMANCE', 'ANIMATION',
  'FANTASY', 'SCIFI', 'HISTORICAL', 'MYSTERY',
  'MUSICAL', 'DOCUMENTARY', 'CRIME', 'WESTERN',
  'SUPERHERO', 'WAR', 'FOREIGN', 'INDIE',
];

// Words to cycle through in the animated heading
const bookHeadingWords = ['mood', 'feeling', 'vibe', 'emotion'];
const movieHeadingWords = ['genre', 'style', 'category', 'mood'];

export default function Home() {
  const { mediaType } = useMedia();
  const isBooks = mediaType === 'books';
  
  // Select the appropriate moods and heading words based on media type
  const moods = isBooks ? bookMoods : movieMoods;
  const headingWords = isBooks ? bookHeadingWords : movieHeadingWords;

  return (
    <>
      <DynamicBackground />
      {isBooks ? <FloatingBooks count={12} /> : <FloatingMovies count={12} />}
      <NoiseOverlay />
      
      {/* Navbar */}
      <Navbar />

      <motion.div
        className="relative z-10 text-white min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-heading mb-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
            <span className="text-[#FF6B00]">Discover</span> top-rated
          </h1>
          <AnimatedHeading 
            baseText={isBooks ? "books based on your [word]" : "movies based on your [word]"}
            words={headingWords}
            interval={2000}
          />
        </div>
        
        <motion.h2 
          className="text-2xl mb-12 text-center text-[#0099FF]"
          initial={{ y: -15 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isBooks ? "How are you feeling now?" : "What are you in the mood for?"}
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {moods.map((mood, i) => (
            <motion.div 
              key={mood} 
              className="h-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * (i % 8) }}
            >
              <Link 
                href={isBooks ? `/mood/${mood}` : `/movie/${mood}`} 
                className="h-full block" 
                passHref
              >
                <AnimatedButton 
                  emoji={getEmoji(mood)} 
                  text={mood} 
                  className="h-full"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}

function getEmoji(mood: string): string {
  // Book moods
  switch (mood) {
    // Book moods
    case 'REFLECTIVE': return '🧐';
    case 'NOSTALGIC': return '🥺';
    case 'ADVENTUROUS': return '🤩';
    case 'MELANCHOLIC': return '😔';
    case 'HOPEFUL': return '😄';
    case 'MYSTERIOUS': return '🤫';
    case 'ROMANTIC': return '🥰';
    case 'WHIMSICAL': return '🤪';
    case 'THOUGHTFUL': return '🤔';
    case 'THRILLING': return '😨';
    case 'COZY': return '😌';
    case 'DARK': return '👿';
    case 'INSPIRATIONAL': return '🌟';
    case 'HUMOROUS': return '😂';
    case 'SERENE': return '🧘';
    case 'TENSE': return '😬';
    case 'PLAYFUL': return '😜';
    case 'GRITTY': return '🪨';
    case 'DREAMY': return '😴';
    case 'PHILOSOPHICAL': return '🤯';
    
    // Movie moods/genres
    case 'ACTION': return '💥';
    case 'COMEDY': return '😂';
    case 'DRAMA': return '🎭';
    case 'HORROR': return '👻';
    case 'ADVENTURE': return '🗺️';
    case 'THRILLER': return '😱';
    case 'ROMANCE': return '❤️';
    case 'ANIMATION': return '🧸';
    case 'FANTASY': return '🧙‍♂️';
    case 'SCIFI': return '🚀';
    case 'HISTORICAL': return '📜';
    case 'MYSTERY': return '🔍';
    case 'MUSICAL': return '🎵';
    case 'DOCUMENTARY': return '📹';
    case 'CRIME': return '🕵️';
    case 'WESTERN': return '🤠';
    case 'SUPERHERO': return '🦸';
    case 'WAR': return '🪖';
    case 'FOREIGN': return '🌍';
    case 'INDIE': return '🎬';
    
    default: return '😐';
  }
}
