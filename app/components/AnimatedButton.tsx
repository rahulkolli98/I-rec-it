'use client';

import React from 'react';
import styled from 'styled-components';

interface AnimatedButtonProps {
  emoji: string;
  text: string;
  onClick?: () => void;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  emoji,
  text,
  onClick,
  className = ""
}) => {
  return (
    <StyledWrapper className={className}>
      <button onClick={onClick} className="dual-gradient">
        {emoji} {text}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  
  button {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #fff;
    border-radius: 0.3em;
    transition: all 0.3s;
    font-size: 16px;
    padding: 0.5em 1em;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
    position: relative;
    top: 0;
    border: none;
    box-shadow: 0 0.4em 0.1em 0.019em rgba(0, 70, 140, 0.5), 
                0 0 18px rgba(0, 150, 255, 0.35);
  }

  .dual-gradient {
    background: linear-gradient(to right, #00264D, #004080);
    border: 1px solid rgba(0, 150, 255, 0.25);
  }

  .dual-gradient:hover {
    transform: translateY(0.4em);
    box-shadow: 0 0 0 0 rgba(0, 70, 140, 0.5),
                0 0 25px rgba(0, 150, 255, 0.6);
    background: linear-gradient(to right, #004080, #0066CC);
  }

  /* Alternate orange buttons */
  button:nth-child(2n) {
    background: linear-gradient(to right, #4D1A00, #802D00);
    border: 1px solid rgba(255, 150, 50, 0.25);
    box-shadow: 0 0.4em 0.1em 0.019em rgba(140, 70, 0, 0.5),
                0 0 18px rgba(255, 150, 0, 0.35);
  }

  button:nth-child(2n):hover {
    transform: translateY(0.4em);
    box-shadow: 0 0 0 0 rgba(140, 70, 0, 0.5),
                0 0 25px rgba(255, 150, 0, 0.6);
    background: linear-gradient(to right, #802D00, #B34000);
  }
`;

export default AnimatedButton; 