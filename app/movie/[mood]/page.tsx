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

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
  backdrop_path: string;
  genres: { id: number; name: string }[];
  trailer_key?: string;
  director?: string;
  cast?: string[];
  mood_keywords?: string[];
  ai_reasons?: string[];
}

export default function MoviePage() {
  const { mood } = useParams();
  const { mediaType } = useMedia();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [randomSeed, setRandomSeed] = useState<number>(Date.now());
  
  // Function to trigger regeneration
  const regenerateRecommendation = () => {
    setLoading(true);
    setRandomSeed(Date.now());
  };

  useEffect(() => {
    // Redirect if media type is not movies
    if (mediaType !== 'movies') {
      window.location.href = '/';
      return;
    }
    
    async function fetchMovie() {
      setLoading(true);
      try {
        // Moodstring from params - can be in any case
        const moodParam = mood?.toString() || '';
        
        // Fetch a movie recommendation from our API based on the mood
        const response = await fetch(`/api/movies/recommend?mood=${moodParam}&seed=${randomSeed}`);
        const data = await response.json();
        
        if (data.error || !data.movie) {
          throw new Error(data.error || 'Failed to fetch movie recommendation');
        }
        
        setMovie(data.movie);
        
        // Generate a summary using our API
        const summaryResponse = await fetch('/api/movies/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.movie.title,
            overview: data.movie.overview,
            mood: moodParam,
            genres: data.movie.genres,
            mood_keywords: data.movie.mood_keywords || [],
            ai_reasons: data.movie.ai_reasons || []
          }),
        });
        
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.summary || 'Failed to generate summary.');
      } catch (error) {
        console.error(error);
        setMovie(null);
        setSummary('Failed to fetch movie data.');
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [mood, mediaType, randomSeed]);

  if (loading) {
    return <LoadingPage customTitle="Finding Your Perfect Movie" />;
  }

  // Format mood string for display
  const moodString = mood?.toString() || '';
  
  // Display different mood formats
  const displayMood = moodString.toUpperCase(); // Match the UI buttons that are uppercase
  const moodForPath = moodString.toLowerCase(); // Used in URL path display

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <style jsx global>{`
        html {
          font-family: 'Space Grotesk', sans-serif;
        }
        .modern-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
        }
        .gradient-text {
          background: linear-gradient(90deg, #FF6B00 0%, #FF9E00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .code-text {
          font-family: 'Space Grotesk', monospace;
          font-weight: 400;
        }
        .gradient-border {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(to bottom right, rgba(30, 30, 30, 0.9), rgba(15, 15, 15, 0.9));
          backdrop-filter: blur(12px);
        }
        .mood-tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          margin-right: 0.25rem;
          margin-bottom: 0.25rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          background: linear-gradient(90deg, rgba(255, 107, 0, 0.2), rgba(255, 158, 0, 0.2));
          border: 1px solid rgba(255, 107, 0, 0.3);
          color: #FF9E00;
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
              <span className="code-text text-zinc-300">{moodForPath}</span>
            </div>
            <h1 className="modern-heading text-5xl mb-2 gradient-text font-medium">
              {displayMood}
            </h1>
            <div className="h-px w-24 bg-zinc-800 mb-6"></div>
            <p className="code-text text-zinc-400 text-lg mb-12">
              We&apos;ve found the perfect film that matches your current state of mind.
            </p>
          </div>
          
          {/* Regenerate button */}
          <button
            onClick={regenerateRecommendation}
            className="px-4 py-2 bg-zinc-800/70 hover:bg-zinc-700/70 rounded-lg border border-zinc-600/50 transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="code-text text-sm">New Recommendation</span>
          </button>
        </motion.div>
        
        {movie ? (
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
                  {movie.poster_path ? (
                    <div className="relative w-full h-[400px] bg-zinc-900/90">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 280px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[400px] flex items-center justify-center bg-zinc-900/90">
                      <span className="text-zinc-600">No poster available</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="modern-heading text-xl font-medium gradient-text mb-2">{movie.title}</h2>
                    <div className="flex items-center justify-between">
                      <p className="code-text text-sm text-zinc-400">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="code-text text-sm text-zinc-300">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {movie.director && (
                      <p className="code-text text-sm text-zinc-400 mt-2">
                        Director: {movie.director}
                      </p>
                    )}
                  </div>
                </div>
              </Tilt>
              
              {/* Mood Keywords */}
              {movie.mood_keywords && movie.mood_keywords.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="code-text text-xs text-zinc-500 mb-2">Mood Characteristics:</p>
                  <div>
                    {movie.mood_keywords.map((keyword, index) => (
                      <span key={index} className="mood-tag code-text">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <motion.div 
              className="w-full md:w-2/3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {movie.trailer_key && (
                <div className="mb-8 overflow-hidden rounded-lg gradient-border">
                  <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${movie.trailer_key}`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="bg-black"
                  ></iframe>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <h3 className="modern-heading text-2xl gradient-text">Cinematic Essence</h3>
              </div>
              <div className="text-zinc-300 mt-4">
                <p className="mb-4 leading-relaxed">
                  {summary}
                </p>
                <p className="text-zinc-400 text-sm">
                  Experience the perfect harmony between this cinematic masterpiece and your chosen mood. Stream or watch this film to align 
                  with your selected mood. The director&apos;s artistic vision creates an immersive world that 
                  resonates with how you&apos;re feeling right now.
                </p>
              </div>
              
              <div className="gradient-border p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-px flex-grow bg-zinc-800 mr-3"></div>
                  <h4 className="code-text text-sm font-semibold text-orange-400">MOOD MATCH</h4>
                  <div className="h-px flex-grow bg-zinc-800 ml-3"></div>
                </div>
                
                <p className="code-text text-base text-zinc-300 mb-4">
                  <span className="text-orange-400">{displayMood}:</span> This film exemplifies the essence of {moodForPath}, 
                  bringing together visual storytelling and emotional depth that resonates perfectly 
                  with your selected mood. The director's artistic vision creates an immersive world that 
                  mirrors and enhances your current state of mind.
                </p>
                
                {/* Always show the "Why This Film Matches Your Mood" section, with AI reasons if available */}
                <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-orange-800/30">
                  <h4 className="code-text text-sm font-semibold text-orange-400 mb-3">Why This Film Perfectly Matches Your {displayMood} Mood:</h4>
                  {movie.ai_reasons && movie.ai_reasons.length > 0 ? (
                    <ul className="space-y-3">
                      {movie.ai_reasons.map((reason, index) => (
                        <li key={index} className="code-text text-sm text-zinc-300 flex items-start">
                          <span className="text-orange-400 mr-2 text-lg">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="code-text text-sm text-zinc-300">
                      This {moodForPath} film captures the essence of the genre with its distinctive visual style, 
                      compelling narrative, and emotional resonance. The director's approach perfectly embodies 
                      what makes {moodForPath} films so engaging and impactful.
                    </p>
                  )}
                </div>
                
                {movie.cast && movie.cast.length > 0 && (
                  <div className="mb-4">
                    <h4 className="code-text text-zinc-400 mb-2">Starring:</h4>
                    <div className="flex flex-wrap gap-1">
                      {movie.cast.map((actor, index) => (
                        <span key={index} className="code-text text-xs bg-zinc-800 rounded-full px-2 py-1 text-zinc-300">
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                  <span className="code-text text-sm text-zinc-400">Genres:</span>
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.map(genre => (
                      <span key={genre.id} className="code-text text-xs bg-zinc-800 rounded-full px-2 py-1 text-zinc-300">
                        {genre.name}
                      </span>
                    ))}
                  </div>
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