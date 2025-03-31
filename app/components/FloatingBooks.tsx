'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';

// Curated selection of high-quality book covers
const bookCovers = [
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579036753i/51791252.jpg', // The Midnight Library
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722975i/2767052.jpg', // The Hunger Games
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg', // Harry Potter
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg', // The Great Gatsby
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1608313642i/51171656.jpg', // Where the Crawdads Sing
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1631172135i/48570454.jpg', // Atomic Habits
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1559142847i/44778083.jpg', // The Invisible Life of Addie LaRue
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1666308386i/62792178.jpg', // Fourth Wing
  'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1628625883i/58744977.jpg', // The Love Hypothesis
];

interface FloatingBooksProps {
  count?: number;
}

const FloatingBooks: React.FC<FloatingBooksProps> = ({ count = 10 }) => {
  const [books, setBooks] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...bookCovers].sort(() => 0.5 - Math.random());
    const selectedBooks = shuffled.slice(0, count);
    
    // If we need more books than we have covers, repeat some covers
    const finalBooks = [...selectedBooks];
    while (finalBooks.length < count) {
      finalBooks.push(selectedBooks[Math.floor(Math.random() * selectedBooks.length)]);
    }
    
    setBooks(finalBooks);
  }, [count]);

  return (
    <BookContainer>
      {books.map((src, i) => (
        <FloatingBook key={`book-${i}`} src={src} />
      ))}
    </BookContainer>
  );
};

interface BookProps {
  src: string;
}

const FloatingBook: React.FC<BookProps> = ({ src }) => {
  const randomSize = 140 + Math.random() * 60; // 140px-200px
  const randomDuration = 70 + Math.random() * 50; // 70-120s
  const randomRotation = Math.random() * 20 - 10; // -10 to 10 degrees
  const randomDelay = Math.random() * -30;
  const randomDepth = Math.floor(Math.random() * 3) + 1; // 1-3
  
  const edges = ['top', 'right', 'bottom', 'left'];
  const startEdge = edges[Math.floor(Math.random() * edges.length)];
  const endEdge = edges[(edges.indexOf(startEdge) + 2) % 4];
  
  let startX, startY, endX, endY;
  
  if (startEdge === 'top') {
    startX = Math.random() * 100;
    startY = -15;
  } else if (startEdge === 'right') {
    startX = 110;
    startY = Math.random() * 100;
  } else if (startEdge === 'bottom') {
    startX = Math.random() * 100;
    startY = 110;
  } else {
    startX = -10;
    startY = Math.random() * 100;
  }
  
  if (endEdge === 'top') {
    endX = Math.random() * 100;
    endY = -15;
  } else if (endEdge === 'right') {
    endX = 110;
    endY = Math.random() * 100;
  } else if (endEdge === 'bottom') {
    endX = Math.random() * 100;
    endY = 110;
  } else {
    endX = -10;
    endY = Math.random() * 100;
  }
  
  const mid1X = startX + (endX - startX) * 0.33 + (Math.random() * 30 - 15);
  const mid1Y = startY + (endY - startY) * 0.33 + (Math.random() * 30 - 15);
  const mid2X = startX + (endX - startX) * 0.66 + (Math.random() * 30 - 15);
  const mid2Y = startY + (endY - startY) * 0.66 + (Math.random() * 30 - 15);
  
  const bookVariants = {
    animate: {
      x: [`${startX}vw`, `${mid1X}vw`, `${mid2X}vw`, `${endX}vw`],
      y: [`${startY}vh`, `${mid1Y}vh`, `${mid2Y}vh`, `${endY}vh`],
      rotate: [
        randomRotation, 
        randomRotation + (Math.random() * 15 - 7.5),
        randomRotation - (Math.random() * 15 - 7.5),
        randomRotation + (Math.random() * 15 - 7.5)
      ],
      transition: {
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "linear",
        times: [0, 0.33, 0.66, 1]
      }
    }
  };

  const opacity = 0.15 + (randomDepth * 0.05); // Reduced opacity range: 0.15 to 0.3
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      variants={bookVariants}
      animate="animate"
      style={{
        zIndex: randomDepth,
        opacity,
        filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))`,
      }}
    >
      <div 
        className="rounded-md overflow-hidden"
        style={{ 
          width: `${randomSize}px`,
          height: `${randomSize * 1.5}px`,
          position: 'relative'
        }}
      >
        <Image 
          src={src} 
          alt="Floating book cover" 
          fill
          sizes={`${randomSize}px`}
          className="object-cover" 
        />
      </div>
    </motion.div>
  );
};

const BookContainer = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, transparent 0%, #0a0a12 85%);
    z-index: 10;
  }
`;

export default FloatingBooks; 