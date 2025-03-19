'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tilt } from '@/components/ui/tilt';

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
  const [book, setBook] = useState<Book | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
                content: `Suggest one book title that reflects the mood: ${mood}`,
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
  }, [mood]);

  return (
    <motion.div
      className="bg-[#212129] text-white min-h-screen flex flex-col items-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8 text-center">Book Recommendation for {mood}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : book ? (
        <div className="flex flex-col items-center">
          <Tilt 
            rotationFactor={8} 
            isRevese 
            className="max-w-[350px]"
            springOptions={{
              stiffness: 26.7,
              damping: 4.1,
              mass: 0.2,
            }}
          >
            <div className="flex flex-col overflow-hidden border border-zinc-50/10 bg-zinc-900 rounded-lg">
              <img
                src={book.imageLinks?.thumbnail}
                alt={book.title}
                className="w-full h-[450px] object-contain bg-zinc-800 p-2"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{book.title}</h2>
                <p className="text-zinc-400">{book.authors?.join(', ')}</p>
              </div>
            </div>
          </Tilt>
          <div className="mt-6 max-w-2xl">
            <p className="text-md mb-4 text-center">{summary}</p>
            <p className="text-sm text-zinc-400 text-center">Why This Book? AI-generated reason why this book matches the user's chosen mood</p>
          </div>
        </div>
      ) : (
        <p className="text-center">{summary}</p>
      )}
    </motion.div>
  );
}
