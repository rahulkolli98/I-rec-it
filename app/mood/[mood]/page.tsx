'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tilt } from '@/components/ui/tilt';
import DynamicBackground from '@/app/components/DynamicBackground';
import NoiseOverlay from '@/app/components/NoiseOverlay';
import LoadingPage from '@/app/components/LoadingPage';
import Head from 'next/head';
import Image from 'next/image';
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
  const [previousRecommendations, setPreviousRecommendations] = useState<string[]>([]);
  
  // Function to trigger regeneration
  const regenerateRecommendation = () => {
    setLoading(true);
    // If we have a current book title, add it to previous recommendations
    if (book?.title) {
      setPreviousRecommendations(prev => [...prev, book.title]);
    }
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
        // Fetch book title from OpenRouter API based on the selected mood
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
        
        // Use model from environment variables or fallback to a default
        const recommendationModel = process.env.BOOK_RECOMMENDATION_MODEL || 'google/gemma-3-27b-it';
        
        if (!openRouterApiKey) {
          throw new Error('Missing OPENROUTER_API_KEY in environment variables');
        }
        
        const openRouterResponse = await fetch(openRouterUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterApiKey}`,
          },
          body: JSON.stringify({
            model: recommendationModel,
            messages: [
              {
                role: 'user',
                content: `As a literary expert, recommend a unique book title that perfectly captures the mood: ${mood}. 
This is recommendation attempt #${regenerationCounter + 1}, so I need something different than previous suggestions.

${previousRecommendations.length > 0 ? `Please DO NOT recommend any of these books that were already suggested: ${previousRecommendations.join(', ')}` : ''}

The book should be well-known enough to be found in public book databases.
Return ONLY the exact book title without any additional text, quotes, or commentary.`,
              },
            ],
            temperature: 0.9,
            top_p: 0.9,
            frequency_penalty: 0.8,
            presence_penalty: 0.8,
          }),
        });
        
        if (!openRouterResponse.ok) {
          throw new Error(`OpenRouter API responded with status: ${openRouterResponse.status}`);
        }
        
        const openRouterData = await openRouterResponse.json();
        
        if (!openRouterData || !openRouterData.choices || !openRouterData.choices[0] || !openRouterData.choices[0].message) {
          console.error('Unexpected OpenRouter API response structure:', openRouterData);
          throw new Error('Invalid response from OpenRouter API');
        }
        
        const bookTitle = openRouterData.choices[0].message.content.trim();
        console.log('Recommended book title:', bookTitle);

        // Ensure we're not recommending the same book again
        if (previousRecommendations.includes(bookTitle)) {
          console.log('Already recommended this book before, trying again...');
          setRegenerationCounter(prev => prev + 1);
          return; // Exit this function call and retry via useEffect
        }

        // Fetch book details from Google Books API based on the book title
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        if (!apiKey) {
          throw new Error('Missing GOOGLE_BOOKS_API_KEY in environment variables');
        }
        
        // Add maxResults parameter and sort by relevance or newest
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&maxResults=10&orderBy=${Math.random() > 0.5 ? 'relevance' : 'newest'}&key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Google Books API responded with status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          // Select a random book from the top 3 results (or fewer if less than 3 available)
          const randomIndex = Math.floor(Math.random() * Math.min(3, data.items.length));
          const bookData = data.items[randomIndex].volumeInfo;
          console.log(`Selected book ${randomIndex + 1} of ${data.items.length}: ${bookData.title}`);
          setBook(bookData);

          // Fetch summary from API
          const description = bookData.description || 'No description available.';
          const summaryResponse = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
          });
          
          if (!summaryResponse.ok) {
            throw new Error(`Summary API responded with status: ${summaryResponse.status}`);
          }
          
          const summaryData = await summaryResponse.json();
          setSummary(summaryData.summary || 'Failed to generate summary.');
        } else {
          console.error('No books found for title:', bookTitle);
          setBook(null);
          setSummary('No books found for this mood.');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        setBook(null);
        setSummary('Failed to fetch book or summary.');
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [mood, mediaType, regenerationCounter, previousRecommendations]);

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
              We&apos;ve crafted the perfect literary companion for your current state of mind.
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
                  {book.imageLinks?.thumbnail ? (
                    <div className="relative w-full h-[300px] bg-zinc-900/90">
                      <Image
                        src={book.imageLinks.thumbnail}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 280px"
                        className="object-contain p-2"
                        unoptimized={book.imageLinks.thumbnail.includes('ssl-images-amazon.com')}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[300px] flex items-center justify-center bg-zinc-900/90 p-2">
                      <span className="text-zinc-600">No image available</span>
                    </div>
                  )}
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
                <p className="text-zinc-300 text-sm">
                  This book captures the quintessential elements of a {moodString.toLowerCase()} experience, 
                  weaving together narrative threads that mirror your chosen emotional landscape. 
                  The author&apos;s craftsmanship creates a world that speaks directly to your current mindset.
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
