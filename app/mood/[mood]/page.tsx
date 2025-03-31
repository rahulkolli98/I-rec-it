'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tilt } from '@/components/ui/tilt';
import Loader from '@/app/components/Loader';
import DynamicBackground from '@/app/components/DynamicBackground';
import NoiseOverlay from '@/app/components/NoiseOverlay';
import LoadingPage from '@/app/components/LoadingPage';
import Head from 'next/head';
import { useMedia } from '@/app/context/MediaContext';

interface Book {
  title: string;
  authors: string[];
  description: string;
  imageLinks: {
    thumbnail: string;
  };
}

export default function MoodPage() {
  const { mood } = useParams();
  const { mediaType } = useMedia();
  const [book, setBook] = useState<Book | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerationCounter, setRegenerationCounter] = useState(0);
  
  // Function to trigger regeneration
  const regenerateRecommendation = () => {
    setLoading(true);
    setRegenerationCounter(prev => prev + 1);
  };

  useEffect(() => {
    // Redirect if media type is not books
    if (mediaType !== 'books') {
      window.location.href = '/';
      return;
    }
    
    async function fetchBook() {
      setLoading(true);
      try {
        // Fetch book title from DeepSeek API based on the selected mood
        const deepSeekApiKey = process.env.OPENROUTER_API_KEY;
        const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
        const deepSeekResponse = await fetch(openRouterUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepSeekApiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat:free',
            messages: [
              {
                role: 'user',
                // Add regeneration counter to ensure different results
                content: `Suggest one book title that reflects the mood: ${mood}. Recommendation #${regenerationCounter + 1}`,
              },
            ],
          }),
        });
        const deepSeekData = await deepSeekResponse.json();
        const bookTitle = deepSeekData.choices[0].message.content.trim();

        // Fetch book details from Google Books API based on the book title
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const bookData = data.items[0].volumeInfo;
          setBook(bookData);

          // Fetch summary from DeepSeek API
          const description = bookData.description || 'No description available.';
          const summaryResponse = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
          });
          const summaryData = await summaryResponse.json();
          setSummary(summaryData.summary || 'Failed to generate summary.');
        } else {
          setBook(null);
          setSummary('No books found for this mood.');
        }
      } catch (error) {
        console.error(error);
        setBook(null);
        setSummary('Failed to fetch book or summary.');
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [mood, mediaType, regenerationCounter]);

  if (loading) {
    return <LoadingPage customTitle="Finding Your Perfect Book" />;
  }

  const moodString = mood?.toString() || '';
  const capitalizedMood = moodString.charAt(0).toUpperCase() + moodString.slice(1).toLowerCase();

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" />
      </Head>
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
        }
        .modern-heading {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .code-text {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.02em;
        }
        .gradient-border {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(to bottom right, rgba(30, 30, 30, 0.9), rgba(15, 15, 15, 0.9));
          backdrop-filter: blur(12px);
        }
        .gradient-text {
          background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.7));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <DynamicBackground />
      <NoiseOverlay />
      <motion.div
        className="relative z-10 text-white min-h-screen flex flex-col items-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="max-w-4xl w-full flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <span className="code-text text-sm">~/moods/</span>
              <span className="code-text text-zinc-300">{moodString.toLowerCase()}</span>
            </div>
            <h1 className="modern-heading text-5xl mb-2 gradient-text font-medium">
              {capitalizedMood}
            </h1>
            <div className="h-px w-24 bg-zinc-800 mb-6"></div>
            <p className="code-text text-zinc-400 text-lg mb-12">
              We've crafted the perfect literary companion for your current state of mind.
            </p>
          </div>
          
          {/* Regenerate button */}
          <button
            onClick={regenerateRecommendation}
            className="px-4 py-2 bg-zinc-800/70 hover:bg-zinc-700/70 rounded-lg border border-zinc-600/50 transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="code-text text-sm">New Recommendation</span>
          </button>
        </motion.div>
        
        {book ? (
          <motion.div 
            className="flex flex-col md:flex-row items-center md:items-start gap-12 w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full md:w-1/3">
              <Tilt 
                rotationFactor={8} 
                isRevese 
                className="w-full max-w-[280px] mx-auto"
                springOptions={{
                  stiffness: 26.7,
                  damping: 4.1,
                  mass: 0.2,
                }}
              >
                <div className="gradient-border flex flex-col overflow-hidden rounded-lg shadow-xl">
                  <img
                    src={book.imageLinks?.thumbnail}
                    alt={book.title}
                    className="w-full h-[300px] object-contain bg-zinc-900/90 p-2"
                  />
                  <div className="p-4">
                    <h2 className="modern-heading text-xl font-medium gradient-text mb-2">{book.title}</h2>
                    <p className="code-text text-sm text-zinc-400">{book.authors?.join(', ')}</p>
                  </div>
                </div>
              </Tilt>
            </div>
            
            <motion.div 
              className="w-full md:w-2/3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <h3 className="modern-heading text-2xl gradient-text">Literary Essence</h3>
              </div>
              <p className="code-text text-base mb-8 leading-relaxed text-zinc-300">{summary}</p>
              
              <div className="gradient-border p-6 rounded-lg">
                <p className="code-text text-base text-zinc-300 mb-4">
                  This book captures the quintessential elements of a {moodString.toLowerCase()} experience, 
                  weaving together narrative threads that mirror your chosen emotional landscape. 
                  The author's craftsmanship creates a world that speaks directly to your current mindset.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                  <span className="code-text text-sm text-zinc-400">Resonates with</span>
                  <span className="code-text gradient-text">{capitalizedMood}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="gradient-border text-center p-8 rounded-lg max-w-2xl"
          >
            <h2 className="modern-heading text-2xl gradient-text mb-4">No Results Found</h2>
            <p className="code-text text-base mb-4 text-zinc-300">{summary}</p>
            <p className="code-text text-sm text-zinc-500">
              Try exploring a different mood...
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
