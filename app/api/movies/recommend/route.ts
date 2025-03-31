import { NextResponse } from 'next/server';

// This interface is used in the code, so renaming to make it clear
interface TMDBMovieResult {
  id: number;
  title: string;
  overview: string;
  genre_ids: number[];
  release_date: string;
  vote_average: number;
  poster_path: string;
  backdrop_path: string;
}

interface MovieSuggestion {
  title: string;
  year?: string | number;
  director?: string;
  reasons?: string[];
}

// Types for videos and crew members
interface VideoResult {
  type: string;
  site: string;
  key: string;
}

interface CrewMember {
  job: string;
  name: string;
}

interface CastMember {
  name: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood');
  const randomSeed = searchParams.get('seed') || Date.now().toString();

  if (!mood) {
    return NextResponse.json({ error: 'Missing mood parameter' }, { status: 400 });
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;
  const tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  
  if (!tmdbApiKey || !tmdbAccessToken) {
    return NextResponse.json({ error: 'Missing TMDB API credentials in environment variables' }, { status: 500 });
  }

  if (!openRouterApiKey) {
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY environment variable' }, { status: 500 });
  }

  try {
    // Enhanced mood descriptions for AI-based recommendations
    const moodDescriptions: Record<string, string> = {
      happy: "joyful, uplifting, and light-hearted movies that leave viewers feeling good",
      sad: "emotionally moving, melancholic films that may evoke tears or deep emotions",
      excited: "thrilling, high-energy, and adrenaline-pumping films with intense action",
      relaxed: "calm, peaceful films with beautiful scenery or gentle storytelling",
      romantic: "heartfelt love stories with emotional relationships at their center",
      scared: "frightening, tense horror or thriller films designed to create fear",
      thoughtful: "philosophical, intellectually stimulating films that make viewers think",
      mysterious: "enigmatic films with puzzles, secrets, or detective elements",
      adventurous: "journey-filled movies with exploration, discovery, and action",
      nostalgic: "films that evoke memories of the past or have a timeless quality",
      inspired: "motivational stories often based on real achievements or overcoming obstacles",
      tense: "suspenseful films that keep viewers on the edge of their seats",
      funny: "comedies focused on humor and laughter with jokes and amusing situations",
      epic: "grand, sweeping tales with large-scale stories, often in fantasy or historical settings",
      heartwarming: "emotionally satisfying films with positive messages about humanity"
    };

    // Genre mapping for the AI to reference
    const genreExamples: Record<string, string> = {
      happy: "Comedy, Family, Animation, Musical",
      sad: "Drama, Romance (with tragic elements), War",
      excited: "Action, Adventure, Sci-Fi, Superhero",
      relaxed: "Documentary, Nature, Gentle Comedy, Slice-of-Life",
      romantic: "Romance, Romantic Comedy, Drama with love stories",
      scared: "Horror, Supernatural, Psychological Thriller",
      thoughtful: "Drama, Sci-Fi with philosophical themes, Arthouse",
      mysterious: "Mystery, Thriller, Crime, Detective",
      adventurous: "Adventure, Action, Fantasy, Expedition films",
      nostalgic: "Period Dramas, Coming-of-Age, Classic films",
      inspired: "Biographical, Sports, Underdog stories",
      tense: "Thriller, Crime, Psychological Suspense",
      funny: "Comedy, Slapstick, Satire, Rom-Com",
      epic: "Fantasy, Historical Epic, War, Mythology-based",
      heartwarming: "Family, Inspirational Drama, Feel-good films"
    };

    // Examples of movies that exemplify each mood
    const exampleMovies: Record<string, string> = {
      happy: "The Lego Movie, Singin' in the Rain, Toy Story, School of Rock",
      sad: "The Shawshank Redemption, Schindler's List, Life is Beautiful",
      excited: "Mad Max: Fury Road, Die Hard, Mission Impossible series",
      relaxed: "The Secret Life of Walter Mitty, Chef, Lost in Translation",
      romantic: "The Notebook, Before Sunrise, When Harry Met Sally",
      scared: "The Shining, Get Out, A Quiet Place, Hereditary",
      thoughtful: "Inception, Arrival, The Matrix, Eternal Sunshine of the Spotless Mind",
      mysterious: "Knives Out, Gone Girl, Memento, The Prestige",
      adventurous: "Indiana Jones series, The Lord of the Rings, Pirates of the Caribbean",
      nostalgic: "The Sandlot, Stand By Me, Back to the Future",
      inspired: "The Pursuit of Happyness, Rocky, Hidden Figures",
      tense: "No Country for Old Men, Sicario, Prisoners",
      funny: "Superbad, Bridesmaids, The Hangover, Shaun of the Dead",
      epic: "Gladiator, Braveheart, The Lord of the Rings",
      heartwarming: "Forrest Gump, The Intouchables, CODA"
    };

    // Prepare a prompt for OpenRouter to generate movie recommendations
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const moodDescription = moodDescriptions[mood.toLowerCase()] || `movies that would make someone feel ${mood}`;
    const genreExample = genreExamples[mood.toLowerCase()] || "various genres";
    const exampleMovieList = exampleMovies[mood.toLowerCase()] || "various movies";
    
    // Use random seed to ensure variety in recommendations
    const seedInt = parseInt(randomSeed);
    const promptVariation = seedInt % 3; // Create 3 different prompt variations
    
    let promptVariationText = "";
    if (promptVariation === 0) {
      promptVariationText = "Include some well-known classics as well as a few less obvious choices.";
    } else if (promptVariation === 1) {
      promptVariationText = "Include a mix of recent releases and timeless favorites.";
    } else {
      promptVariationText = "Include both mainstream and some critically-acclaimed but less known films.";
    }

    // Create the prompt for OpenRouter
    const prompt = `
      As a film expert, suggest 5 specific movies that would be perfect for someone in a "${mood}" mood.
      
      A "${mood}" mood typically calls for ${moodDescription}.
      Genres that often work well for this mood include: ${genreExample}.
      Examples of films that fit this mood well: ${exampleMovieList}.
      
      ${promptVariationText}
      
      For each movie, provide:
      1. Full title (exactly as it would appear in a database)
      2. Year of release
      3. Director (if notable)
      4. 1-2 sentences on why it's perfect for a "${mood}" mood
      
      Format your response as a JSON array with properties: title, year, director, reasons (array of strings).
      Don't include any other text in your response except the valid JSON.
    `;

    // Get movie recommendations from OpenRouter
    const openRouterResponse = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const openRouterData = await openRouterResponse.json();
    
    if (openRouterData.error) {
      console.error('OpenRouter API Error:', openRouterData.error);
      return fallbackToGenreMapping(tmdbApiKey, mood, seedInt);
    }

    const aiResponse = openRouterData.choices[0].message.content;
    
    // Extract the JSON from the AI response
    let movieSuggestions: MovieSuggestion[] = [];
    try {
      // Handle possible markdown code blocks in the response
      const jsonMatch = aiResponse.match(/```(?:json)?([\s\S]*)```/) || 
                       aiResponse.match(/\[([\s\S]*)\]/) || 
                       [null, aiResponse];
      
      const jsonContent = jsonMatch[1] ? jsonMatch[1].trim() : aiResponse.trim();
      const parsedContent = jsonContent.startsWith('[') ? jsonContent : `[${jsonContent}]`;
      movieSuggestions = JSON.parse(parsedContent);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('AI response was:', aiResponse);
      // Fall back to default genre mapping if parsing fails
      return fallbackToGenreMapping(tmdbApiKey, mood, seedInt);
    }

    if (!movieSuggestions || movieSuggestions.length === 0) {
      console.error('No movie suggestions generated');
      return fallbackToGenreMapping(tmdbApiKey, mood, seedInt);
    }

    // Select one movie randomly from the suggestions
    const selectedIndex = seedInt % movieSuggestions.length;
    const selectedSuggestion = movieSuggestions[selectedIndex];

    // Search for the movie on TMDB to get full details
    let searchQuery = selectedSuggestion.title;
    if (selectedSuggestion.year) {
      searchQuery += ` ${selectedSuggestion.year}`;
    }
    
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      // If no results, try searching without the year
      const titleOnlyUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(selectedSuggestion.title)}&include_adult=false`;
      const titleOnlyResponse = await fetch(titleOnlyUrl);
      const titleOnlyData = await titleOnlyResponse.json();
      
      if (!titleOnlyData.results || titleOnlyData.results.length === 0) {
        console.error('No TMDB results for suggested movie:', selectedSuggestion.title);
        return fallbackToGenreMapping(tmdbApiKey, mood, seedInt);
      }
      
      searchData.results = titleOnlyData.results;
    }

    // Get the most relevant result
    const tmdbMovie = searchData.results[0];
    
    // Fetch detailed movie info including videos
    const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${tmdbApiKey}&append_to_response=videos,credits`;
    const detailsResponse = await fetch(movieDetailsUrl);
    const movieDetails = await detailsResponse.json();
    
    // Find a trailer in the videos
    let trailerKey = null;
    if (movieDetails.videos && movieDetails.videos.results) {
      const trailer = movieDetails.videos.results.find(
        (video: VideoResult) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        trailerKey = trailer.key;
      }
    }
    
    // Add mood-relevant keywords from the AI's reasons
    let moodKeywords: string[] = [];
    if (selectedSuggestion.reasons && selectedSuggestion.reasons.length > 0) {
      // Add the most commonly used descriptor words for this mood
      const commonMoodKeywords: Record<string, string[]> = {
        happy: ['uplifting', 'cheerful', 'joyful', 'funny', 'light-hearted'],
        sad: ['emotional', 'moving', 'tragic', 'somber', 'poignant'],
        excited: ['thrilling', 'high-energy', 'adrenaline-pumping', 'intense', 'action-packed'],
        relaxed: ['calm', 'peaceful', 'laid-back', 'soothing', 'gentle'],
        romantic: ['love', 'passionate', 'heartwarming', 'emotional', 'intimate'],
        scared: ['frightening', 'terrifying', 'chilling', 'creepy', 'unsettling'],
        thoughtful: ['profound', 'philosophical', 'thought-provoking', 'deep', 'intelligent'],
        mysterious: ['enigmatic', 'puzzling', 'suspenseful', 'intriguing', 'twisty'],
        adventurous: ['epic', 'journey', 'exploration', 'quest', 'discovery'],
        nostalgic: ['classic', 'reminiscent', 'memorable', 'timeless', 'retro'],
        inspired: ['motivational', 'encouraging', 'true story', 'uplifting', 'triumphant'],
        tense: ['suspenseful', 'edge-of-seat', 'gripping', 'nail-biting', 'riveting'],
        funny: ['hilarious', 'laugh-out-loud', 'comedic', 'witty', 'amusing'],
        epic: ['grand', 'sweeping', 'monumental', 'majestic', 'vast'],
        heartwarming: ['touching', 'feel-good', 'emotional', 'uplifting', 'sweet']
      };
      
      moodKeywords = commonMoodKeywords[mood.toLowerCase()] || [];
    }
    
    // Format the movie data with AI-provided information plus TMDB details
    const formattedMovie = {
      id: movieDetails.id,
      title: movieDetails.title,
      overview: movieDetails.overview,
      release_date: movieDetails.release_date,
      vote_average: movieDetails.vote_average,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      genres: movieDetails.genres || [],
      trailer_key: trailerKey,
      director: selectedSuggestion.director || 
                movieDetails.credits?.crew?.find((person: CrewMember) => person.job === 'Director')?.name || 
                'Unknown',
      cast: movieDetails.credits?.cast?.slice(0, 5).map((person: CastMember) => person.name) || [],
      mood_keywords: moodKeywords,
      ai_reasons: selectedSuggestion.reasons || []
    };
    
    return NextResponse.json({ movie: formattedMovie });
  } catch (error) {
    console.error('Error in AI movie recommendation:', error);
    return fallbackToGenreMapping(tmdbApiKey, mood, parseInt(randomSeed));
  }
}

// Fallback function to use the original genre-mapping method if AI recommendation fails
async function fallbackToGenreMapping(apiKey: string, mood: string, seedNum: number): Promise<NextResponse> {
  try {
    console.log('Falling back to genre mapping for movie recommendation');
    
    // Enhanced mood to genre mapping - primary and secondary genres for better matching
    const moodGenreMapping: Record<string, { primary: number[], secondary: number[] }> = {
      happy: { 
        primary: [35], // Comedy as primary
        secondary: [10751, 16, 12] // Family, Animation, Adventure as secondary
      },
      sad: { 
        primary: [18], // Drama as primary
        secondary: [10749] // Romance as secondary (often has sad elements)
      },
      excited: { 
        primary: [28], // Action as primary
        secondary: [12, 878] // Adventure, Sci-Fi as secondary
      },
      relaxed: { 
        primary: [12], // Adventure as primary
        secondary: [16, 10751, 14] // Animation, Family, Fantasy as secondary
      },
      romantic: { 
        primary: [10749], // Romance as primary
        secondary: [18, 35] // Drama, Comedy as secondary
      },
      scared: { 
        primary: [27], // Horror as primary
        secondary: [53, 9648] // Thriller, Mystery as secondary
      },
      thoughtful: { 
        primary: [878, 18], // Sci-Fi, Drama as primary
        secondary: [9648, 99] // Mystery, Documentary as secondary
      },
      mysterious: { 
        primary: [9648], // Mystery as primary
        secondary: [53, 80] // Thriller, Crime as secondary
      },
      adventurous: { 
        primary: [12], // Adventure as primary
        secondary: [28, 14, 16] // Action, Fantasy, Animation as secondary
      },
      nostalgic: { 
        primary: [36], // History as primary
        secondary: [18, 10751] // Drama, Family as secondary
      },
      inspired: { 
        primary: [99, 18], // Documentary, Drama as primary
        secondary: [36, 10752] // History, War as secondary (often inspirational)
      },
      tense: { 
        primary: [53], // Thriller as primary
        secondary: [80, 27, 9648] // Crime, Horror, Mystery as secondary
      },
      funny: { 
        primary: [35], // Comedy as primary
        secondary: [10751, 12] // Family, Adventure as secondary
      },
      epic: { 
        primary: [14, 12], // Fantasy, Adventure as primary
        secondary: [28, 10752] // Action, War as secondary
      },
      heartwarming: { 
        primary: [10751, 18], // Family, Drama as primary
        secondary: [35, 10749] // Comedy, Romance as secondary
      }
    };
    
    // Default to drama+comedy if no mapping exists
    const targetMood = moodGenreMapping[mood.toLowerCase()] || { 
      primary: [18, 35], 
      secondary: [12, 10751] 
    };
    
    // Get a consistent but random page (1-5) based on the seed
    const randomPage = (seedNum % 5) + 1;
    
    // Fetch movies from TMDB with primary genres
    const primaryGenreString = targetMood.primary.join('|');
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${primaryGenreString}&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=100`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: 'No movies found for this mood' }, { status: 404 });
    }
    
    // Get a random movie from the results
    const randomIndex = seedNum % data.results.length;
    const selectedMovie = data.results[randomIndex];
    
    // Fetch detailed movie info
    const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${selectedMovie.id}?api_key=${apiKey}&append_to_response=videos,credits`;
    const detailsResponse = await fetch(movieDetailsUrl);
    const movieDetails = await detailsResponse.json();
    
    // Find a trailer
    let trailerKey = null;
    if (movieDetails.videos && movieDetails.videos.results) {
      const trailer = movieDetails.videos.results.find(
        (video: VideoResult) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        trailerKey = trailer.key;
      }
    }
    
    // Basic mood keywords
    const moodKeywords: Record<string, string[]> = {
      happy: ['uplifting', 'cheerful', 'joyful'],
      sad: ['emotional', 'moving', 'tragic'],
      excited: ['thrilling', 'high-energy', 'adrenaline-pumping'],
      relaxed: ['calm', 'peaceful', 'laid-back'],
      romantic: ['love', 'passionate', 'heartwarming'],
      scared: ['frightening', 'terrifying', 'chilling'],
      thoughtful: ['profound', 'philosophical', 'thought-provoking'],
      mysterious: ['enigmatic', 'puzzling', 'suspenseful'],
      adventurous: ['epic', 'journey', 'exploration'],
      nostalgic: ['classic', 'reminiscent', 'memorable'],
      inspired: ['motivational', 'encouraging', 'true story'],
      tense: ['suspenseful', 'edge-of-seat', 'gripping'],
      funny: ['hilarious', 'laugh-out-loud', 'comedic'],
      epic: ['grand', 'sweeping', 'monumental'],
      heartwarming: ['touching', 'feel-good', 'emotional']
    };
    
    // Format the movie data
    const formattedMovie = {
      id: movieDetails.id,
      title: movieDetails.title,
      overview: movieDetails.overview,
      release_date: movieDetails.release_date,
      vote_average: movieDetails.vote_average,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      genres: movieDetails.genres || [],
      trailer_key: trailerKey,
      director: movieDetails.credits?.crew?.find((person: CrewMember) => person.job === 'Director')?.name || 'Unknown',
      cast: movieDetails.credits?.cast?.slice(0, 5).map((person: CastMember) => person.name) || [],
      mood_keywords: moodKeywords[mood.toLowerCase()] || []
    };
    
    return NextResponse.json({ movie: formattedMovie });
  } catch (error) {
    console.error('Error in fallback movie recommendation:', error);
    return NextResponse.json({ error: 'Failed to fetch movie recommendation' }, { status: 500 });
  }
} 