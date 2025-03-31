'use client';

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Create gradient objects
    let gradientOrbs: GradientOrb[] = [];
    const orbCount = 3;
    
    for (let i = 0; i < orbCount; i++) {
      gradientOrbs.push(new GradientOrb(canvas));
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fill background with dark blue color
      ctx.fillStyle = '#070B15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient orbs
      gradientOrbs.forEach(orb => {
        orb.update();
        orb.draw(ctx);
      });
      
      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <StyledWrapper>
      <canvas ref={canvasRef} className="dynamic-bg"></canvas>
    </StyledWrapper>
  );
};

// Gradient orb class for creating moving gradient elements
class GradientOrb {
  x: number;
  y: number;
  radius: number;
  xSpeed: number;
  ySpeed: number;
  colors: string[];
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.radius = Math.random() * (canvas.width / 2) + (canvas.width / 4);
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
    this.xSpeed = (Math.random() - 0.5) * 0.3;
    this.ySpeed = (Math.random() - 0.5) * 0.3;
    
    // Blue and orange color palettes from the image
    const palettes = [
      ['#001A33', '#003366', '#0066CC', '#0099FF'],  // Blue tones
      ['#330A00', '#661400', '#992D00', '#FF5400'],  // Orange tones
      ['#00264D', '#004080', '#0066CC', '#00A3FF'],  // Bright blue tones
    ];
    
    this.colors = palettes[Math.floor(Math.random() * palettes.length)];
  }

  update() {
    // Move the orb
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Bounce off edges
    if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
      this.xSpeed *= -1;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
      this.ySpeed *= -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Create radial gradient
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    
    // Add color stops
    this.colors.forEach((color, index) => {
      gradient.addColorStop(index / (this.colors.length - 1), color);
    });
    
    // Apply gradient with low opacity
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const StyledWrapper = styled.div`
  .dynamic-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-color: #070B15;
  }
`;

export default DynamicBackground; 