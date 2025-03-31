'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';

// Curated selection of high-quality movie posters
const moviePosters = [
  'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', // LOTR
  'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', // Inception
  'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // Shawshank Redemption
  'https://image.tmdb.org/t/p/w500/tpoVEYvm6qcXueZrQYJNRLXL88s.jpg', // Edge of Tomorrow
  'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', // Spider-Verse
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/4GFkMTIGHhMn9uQ3wJA5RrKoHZG.jpg', // Hereditary
  'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqevNlw8wkmuz.jpg', // Superbad
  'https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg', // The Notebook
  'https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg', // Raiders of the Lost Ark
];

interface FloatingMoviesProps {
  count?: number;
}

const FloatingMovies: React.FC<FloatingMoviesProps> = ({ count = 10 }) => {
  const [movies, setMovies] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...moviePosters].sort(() => 0.5 - Math.random());
    const selectedMovies = shuffled.slice(0, count);
    
    // If we need more movies than we have posters, repeat some posters
    const finalMovies = [...selectedMovies];
    while (finalMovies.length < count) {
      finalMovies.push(selectedMovies[Math.floor(Math.random() * selectedMovies.length)]);
    }
    
    setMovies(finalMovies);
  }, [count]);

  return (
    <MovieContainer>
      {movies.map((src, i) => (
        <FloatingMovie key={`movie-${i}`} src={src} />
      ))}
    </MovieContainer>
  );
};

interface FloatingMovieProps {
  src: string;
}

interface Position {
  x: number;
  y: number;
}

const FloatingMovie: React.FC<FloatingMovieProps> = ({ src }) => {
  // Determine starting and ending edges for the movie
  const getRandomEdges = () => {
    const edges = ['top', 'right', 'bottom', 'left'];
    const startEdge = edges[Math.floor(Math.random() * edges.length)];
    
    // Ensure end edge is opposite or adjacent to start edge
    let endEdge;
    if (Math.random() > 0.7) {
      // Opposite edge (more direct path)
      endEdge = startEdge === 'top' ? 'bottom' : 
                startEdge === 'bottom' ? 'top' : 
                startEdge === 'left' ? 'right' : 'left';
    } else {
      // Adjacent edge (more wandering path)
      const adjacentEdges = edges.filter(edge => 
        edge !== startEdge && 
        edge !== (startEdge === 'top' ? 'bottom' : 
                  startEdge === 'bottom' ? 'top' : 
                  startEdge === 'left' ? 'right' : 'left')
      );
      endEdge = adjacentEdges[Math.floor(Math.random() * adjacentEdges.length)];
    }
    
    return { startEdge, endEdge };
  };

  // Generate start and end positions
  const generatePositions = () => {
    const { startEdge, endEdge } = getRandomEdges();
    const startPos: Position = { x: 0, y: 0 };
    const endPos: Position = { x: 0, y: 0 };
    
    // Set start position
    if (startEdge === 'top') {
      startPos.x = Math.random() * 100;
      startPos.y = -15;
    } else if (startEdge === 'right') {
      startPos.x = 110;
      startPos.y = Math.random() * 100;
    } else if (startEdge === 'bottom') {
      startPos.x = Math.random() * 100;
      startPos.y = 110;
    } else { // left
      startPos.x = -15;
      startPos.y = Math.random() * 100;
    }
    
    // Set end position
    if (endEdge === 'top') {
      endPos.x = Math.random() * 100;
      endPos.y = -15;
    } else if (endEdge === 'right') {
      endPos.x = 110;
      endPos.y = Math.random() * 100;
    } else if (endEdge === 'bottom') {
      endPos.x = Math.random() * 100;
      endPos.y = 110;
    } else { // left
      endPos.x = -15;
      endPos.y = Math.random() * 100;
    }
    
    return { startPos, endPos };
  };

  // Generate control points for curved path
  const generateControlPoints = (startPos: Position, endPos: Position) => {
    const controlPoint1 = {
      x: Math.random() * 100,
      y: Math.random() * 100
    };
    
    const controlPoint2 = {
      x: Math.random() * 100,
      y: Math.random() * 100
    };
    
    return { controlPoint1, controlPoint2 };
  };

  const { startPos, endPos } = generatePositions();
  const { controlPoint1, controlPoint2 } = generateControlPoints(startPos, endPos);
  
  // Random depth value
  const depth = Math.random();
  
  // Animation properties
  const duration = 60 + Math.random() * 60; // Between 60-120 seconds
  const delay = Math.random() * 5; // Random start delay
  const rotateStart = Math.random() * 20 - 10;
  const rotateEnd = Math.random() * 20 - 10;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: `${7 + depth * 5}%`, // Size based on depth
        maxWidth: '180px',
        zIndex: Math.floor(depth * 10),
        opacity: 0.1 + depth * 0.7, // Opacity based on depth
        filter: `blur(${depth > 0.8 ? 0 : 3 - depth * 4}px)`,
      }}
      initial={{
        x: `${startPos.x}vw`,
        y: `${startPos.y}vh`,
        rotate: rotateStart,
      }}
      animate={{
        x: [
          `${startPos.x}vw`,
          `${controlPoint1.x}vw`,
          `${controlPoint2.x}vw`,
          `${endPos.x}vw`
        ],
        y: [
          `${startPos.y}vh`,
          `${controlPoint1.y}vh`,
          `${controlPoint2.y}vh`,
          `${endPos.y}vh`
        ],
        rotate: [rotateStart, rotateStart + 5, rotateEnd - 5, rotateEnd],
      }}
      transition={{
        duration,
        times: [0, 0.3, 0.7, 1],
        ease: "linear",
        delay,
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
        <Image 
          src={src} 
          alt="Movie poster" 
          fill
          sizes="(max-width: 768px) 100px, 180px"
          className="rounded-lg shadow-lg object-cover hover:scale-105 transition-transform"
        />
      </div>
    </motion.div>
  );
};

const MovieContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
`;

export default FloatingMovies; 