'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const moods = [
  'REFLECTIVE', 'NOSTALGIC', 'ADVENTUROUS', 'MELANCHOLIC',
  'HOPEFUL', 'MYSTERIOUS', 'ROMANTIC', 'WHIMSICAL',
  'THOUGHTFUL', 'THRILLING', 'COZY', 'DARK',
  'INSPIRATIONAL', 'HUMOROUS', 'SERENE', 'TENSE',
  'PLAYFUL', 'GRITTY', 'DREAMY', 'PHILOSOPHICAL',
];

export default function Home() {
  return (
    <motion.div
      className="bg-[#212129] text-white min-h-screen flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8 text-center">Discover top-rated books based on your mood</h1>
      <h2 className="text-2xl mb-4 text-center">How are you feeling now?</h2>
      <div className="grid grid-cols-4 gap-4 w-full max-w-4xl">
        {moods.map((mood) => (
          <Link href={`/mood/${mood}`} key={mood} className="w-full">
            <motion.button
              className="w-full h-[64px] bg-[#393E46] hover:bg-[#505763] text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">{getEmoji(mood)}</span>
              <span className="ml-2 text-sm whitespace-nowrap">{mood}</span>
            </motion.button>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

function getEmoji(mood: string): string {
  switch (mood) {
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
    default: return '😐';
  }
}
