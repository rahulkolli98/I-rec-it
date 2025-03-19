import { NextResponse } from 'next/server';
import { connectToDatabase, Book } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GOOGLE_BOOKS_API_KEY environment variable' }, { status: 500 });
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;

  try {
    await connectToDatabase();

    const response = await fetch(url);
    const data = await response.json();

    // Save books to database
    if (data.items) {
      for (const item of data.items) {
        const bookData = {
          title: item.volumeInfo.title,
          description: item.volumeInfo.description,
          image: item.volumeInfo.imageLinks?.thumbnail,
          categories: item.volumeInfo.categories,
          rating: item.volumeInfo.averageRating,
          reviews: [], // You might want to fetch reviews from another API
        };

        const book = new Book(bookData);
        await book.save();
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
