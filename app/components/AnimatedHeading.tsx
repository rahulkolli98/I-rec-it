'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

interface AnimatedHeadingProps {
  words: string[];
  baseText: string;
  interval?: number;
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({ 
  words, 
  baseText,
  interval = 2000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 300); // Transition time for word swap
    }, interval);

    return () => clearInterval(intervalId);
  }, [words.length, interval]);

  // Split the base text at the placeholder position
  const splitText = baseText.split('[word]');
  const beforeText = splitText[0];
  const afterText = splitText[1] || '';

  return (
    <StyledHeadingWrapper>
      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
        {beforeText}
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.span
              key={words[currentIndex]}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut"
              }}
              className="highlighted-word inline-block mx-1"
            >
              {words[currentIndex]}
            </motion.span>
          )}
        </AnimatePresence>
        {afterText}
      </h1>
    </StyledHeadingWrapper>
  );
};

const StyledHeadingWrapper = styled.div`
  .highlighted-word {
    color: #0099FF;
    background: linear-gradient(135deg, #00A3FF 0%, #0066FF 50%, #FF8A00 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #0099FF, #FF6B00);
      opacity: 0.7;
    }
  }
`;

export default AnimatedHeading; 