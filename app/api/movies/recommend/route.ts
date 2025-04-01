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
  let mood = searchParams.get('mood');
  const randomSeed = searchParams.get('seed') || Date.now().toString();

  if (!mood) {
    return NextResponse.json({ error: 'Missing mood parameter' }, { status: 400 });
  }

  // Normalize the mood parameter to lowercase for processing
  mood = mood.toLowerCase();

  const tmdbApiKey = process.env.TMDB_API_KEY;
  const tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.MOVIE_RECOMMENDATION_MODEL || 'mistralai/mistral-nemo';
  
  if (!tmdbApiKey || !tmdbAccessToken) {
    return NextResponse.json({ error: 'Missing TMDB API credentials in environment variables' }, { status: 500 });
  }

  if (!openRouterApiKey) {
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY environment variable' }, { status: 500 });
  }

  try {
    // Enhanced mood/genre descriptions for AI-based recommendations
    // Updated to match the moods shown in the UI buttons
    const moodDescriptions: Record<string, string> = {
      action: "high-energy films with dynamic action sequences, physical feats, and exciting confrontations that keep viewers engaged with thrilling conflicts.",
      comedy: "humorous films designed to make viewers laugh through witty dialogue, funny situations, and comedic timing.",
      drama: "emotionally resonant films that explore complex character relationships and human experiences, often with serious themes.",
      horror: "frightening, tense films designed to scare viewers through suspense, supernatural elements, or threatening scenarios.",
      adventure: "journey-filled movies with exploration, discovery, and action that transport viewers to exciting locations and situations.",
      thriller: "suspenseful films that build anticipation and anxiety through conflict, time pressure, or high-stakes situations.",
      romance: "heartfelt love stories with emotional depth, chemistry between characters, and meaningful relationships at their center.",
      animation: "visually creative films using animation techniques to tell stories that may range from family-friendly to mature themes.",
      fantasy: "imaginative films featuring magical elements, fictional worlds, supernatural beings, and fantastical adventures.",
      scifi: "speculative fiction films exploring futuristic concepts, technology, space exploration, or alternate realities.",
      historical: "films set in the past that recreate historical events, periods, or figures with varying degrees of accuracy.",
      mystery: "enigmatic films with puzzles, secrets, or detective elements that engage viewers in solving a central question.",
      musical: "films incorporating song and dance numbers as an essential storytelling element, expressing emotions through music.",
      documentary: "non-fiction films presenting factual information about real events, people, or subjects with an educational purpose.",
      crime: "films centered around criminal activities, investigations, or the justice system, often exploring moral complexities.",
      western: "films set in the American Old West featuring cowboys, frontiers, and themes of law and lawlessness.",
      superhero: "films featuring characters with extraordinary abilities who combat evil forces, often based on comic book characters.",
      war: "films depicting armed conflicts, military operations, and the experiences of soldiers and civilians during wartime.",
      foreign: "international films from non-English speaking countries, offering diverse cultural perspectives and storytelling styles.",
      indie: "independently produced films often characterized by creative risk-taking, personal vision, and lower budgets than mainstream cinema."
    };

    // Genre IDs mapping for TMDB
    const genreMapping: Record<string, number[]> = {
      action: [28],
      comedy: [35],
      drama: [18],
      horror: [27],
      adventure: [12],
      thriller: [53],
      romance: [10749],
      animation: [16],
      fantasy: [14],
      scifi: [878],
      historical: [36],
      mystery: [9648],
      musical: [10402],
      documentary: [99],
      crime: [80],
      western: [37],
      superhero: [28, 14], // Combine Action and Fantasy for Superhero
      war: [10752],
      foreign: [], // This is handled differently as it's a language parameter
      indie: [] // This is harder to capture with genres alone
    };

    // Mood keywords that help describe each genre/mood
    const moodKeywords: Record<string, string[]> = {
      action: ['thrilling', 'intense', 'high-energy', 'adrenaline-pumping', 'dynamic'],
      comedy: ['funny', 'humorous', 'witty', 'hilarious', 'amusing'],
      drama: ['emotional', 'moving', 'powerful', 'thought-provoking', 'compelling'],
      horror: ['scary', 'frightening', 'terrifying', 'chilling', 'unsettling'],
      adventure: ['exciting', 'journey', 'exploration', 'quest', 'discovery'],
      thriller: ['suspenseful', 'tense', 'gripping', 'nail-biting', 'riveting'],
      romance: ['love', 'passionate', 'heartwarming', 'emotional', 'intimate'],
      animation: ['colorful', 'imaginative', 'creative', 'vibrant', 'fantastical'],
      fantasy: ['magical', 'enchanting', 'mythical', 'wondrous', 'imaginative'],
      scifi: ['futuristic', 'technological', 'speculative', 'innovative', 'mind-bending'],
      historical: ['period', 'era', 'authentic', 'traditional', 'classic'],
      mystery: ['enigmatic', 'puzzling', 'suspenseful', 'intriguing', 'twisty'],
      musical: ['melodic', 'rhythmic', 'harmonious', 'theatrical', 'choreographed'],
      documentary: ['informative', 'educational', 'factual', 'revealing', 'insightful'],
      crime: ['detective', 'investigative', 'gritty', 'underworld', 'heist'],
      western: ['frontier', 'cowboy', 'rugged', 'wilderness', 'old west'],
      superhero: ['heroic', 'powerful', 'extraordinary', 'courageous', 'epic'],
      war: ['battlefield', 'combat', 'military', 'strategic', 'patriotic'],
      foreign: ['international', 'cultural', 'subtitled', 'global', 'diverse'],
      indie: ['unique', 'artistic', 'creative', 'personal', 'unconventional']
    };

    // Use random seed to ensure variety in recommendations
    const seedInt = parseInt(randomSeed);
    const promptVariation = seedInt % 3; // Create 3 different prompt variations
    
    let promptVariationText = "";
    if (promptVariation === 0) {
      promptVariationText = "Include a mix of well-known classics and hidden gems that perfectly embody this genre/mood.";
    } else if (promptVariation === 1) {
      promptVariationText = "Focus on films that are critically acclaimed and have strong emotional resonance with audiences.";
    } else {
      promptVariationText = "Include films from different decades that have stood the test of time in capturing this specific genre/mood.";
    }

    // Get the appropriate description for the requested mood
    const moodDescription = moodDescriptions[mood] || `movies in the ${mood} genre/mood`;
    
    // Prepare the OpenRouter API URL
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Create the prompt for OpenRouter with focus on desired characteristics
    const prompt = `
      As a film expert, suggest 5 specific movies that would be perfect for someone in a "${mood.toUpperCase()}" mood or wanting to watch a "${mood.toUpperCase()}" genre film.
      
      ${mood.toUpperCase()} films are characterized by ${moodDescription}
      
      ${promptVariationText}
      
      When selecting films, prioritize:
      - Strong representation of the ${mood} genre/mood with its typical elements and conventions
      - Visual elements that reinforce the genre (colors, lighting, scenery, special effects)
      - Memorable characters and performances that exemplify this type of film
      - Soundtrack and audio elements that enhance the genre experience
      - Pacing and storytelling techniques appropriate to ${mood} films
      
      For each movie, provide:
      1. Full title (exactly as it would appear in a database)
      2. Year of release
      3. Director (if notable)
      4. 1-2 sentences on why it's a perfect ${mood} film, focusing on specific elements that make it exemplary of this genre/mood
      
      Format your response as a JSON array with properties: title, year, director, reasons (array of strings).
      Don't include any other text in your response except the valid JSON.
    `;

    // Get movie recommendations from OpenRouter using the model specified in environment variables
    const openRouterResponse = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
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

    // Randomize the order of suggestions based on seed
    movieSuggestions = shuffleArray(movieSuggestions, seedInt);

    // Try each suggestion one by one until we find a match in TMDB
    for (const suggestion of movieSuggestions) {
      try {
        // Search for the movie on TMDB
        let searchQuery = suggestion.title;
        if (suggestion.year) {
          searchQuery += ` ${suggestion.year}`;
        }
        
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.results || searchData.results.length === 0) {
          // If no results with year, try without the year
          const titleOnlyUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(suggestion.title)}&include_adult=false`;
          const titleOnlyResponse = await fetch(titleOnlyUrl);
          const titleOnlyData = await titleOnlyResponse.json();
          
          if (!titleOnlyData.results || titleOnlyData.results.length === 0) {
            // No results for this suggestion, try the next one
            console.log(`No TMDB results for ${suggestion.title}, trying next suggestion`);
            continue;
          }
          
          searchData.results = titleOnlyData.results;
        }

        // Get the most relevant result
        const tmdbMovie = searchData.results[0];
        
        // Fetch detailed movie info including videos and credits
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
        
        // Get keywords for this mood
        const currentMoodKeywords = moodKeywords[mood] || [];
        
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
          director: suggestion.director || 
                    movieDetails.credits?.crew?.find((person: CrewMember) => person.job === 'Director')?.name || 
                    'Unknown',
          cast: movieDetails.credits?.cast?.slice(0, 5).map((person: CastMember) => person.name) || [],
          mood_keywords: currentMoodKeywords,
          ai_reasons: suggestion.reasons || []
        };
        
        return NextResponse.json({ movie: formattedMovie });
      } catch (error) {
        console.error(`Error processing suggestion ${suggestion.title}:`, error);
        // Continue to the next suggestion
      }
    }

    // If all suggestions failed, fall back to genre mapping
    console.log('All AI suggestions failed, falling back to genre mapping');
    return fallbackToGenreMapping(tmdbApiKey, mood, seedInt);
    
  } catch (error) {
    console.error('Error in AI movie recommendation:', error);
    return fallbackToGenreMapping(tmdbApiKey, mood, parseInt(randomSeed));
  }
}

// Helper function to shuffle array based on a seed
function shuffleArray<T>(array: T[], seed: number): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let seedValue = seed;

  // Fisher-Yates shuffle with seed
  while (currentIndex > 0) {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((seedValue / 233280) * currentIndex);
    currentIndex--;
    
    // Swap elements
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

// Fallback function to use TMDB genre IDs if AI recommendation fails
async function fallbackToGenreMapping(apiKey: string, mood: string, seedNum: number): Promise<NextResponse> {
  try {
    console.log('Falling back to genre mapping for movie recommendation');
    
    // Updated genre mappings to match UI moods exactly
    const genreMapping: Record<string, number[]> = {
      action: [28],
      comedy: [35],
      drama: [18],
      horror: [27],
      adventure: [12],
      thriller: [53],
      romance: [10749],
      animation: [16],
      fantasy: [14],
      scifi: [878], // Science Fiction
      historical: [36], // History
      mystery: [9648],
      musical: [10402],
      documentary: [99],
      crime: [80],
      western: [37],
      superhero: [28, 878], // Action + Sci-Fi (closest to superhero)
      war: [10752],
      foreign: [], // Special case handled below
      indie: [] // Special case handled below
    };
    
    let url;
    const genreIds = genreMapping[mood] || [];
    
    // Get a consistent but random page (1-5) based on the seed
    const randomPage = (seedNum % 5) + 1;
    
    if (mood === 'foreign') {
      // For foreign films, we'll search for non-English language films
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&with_original_language=fr|es|ja|ko|de|it|zh&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=100`;
    } else if (mood === 'indie') {
      // For indie films, we'll use a lower budget filter
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=50&vote_average.gte=6&with_companies=43|5491|2|7|25`;
    } else if (genreIds.length > 0) {
      // Normal genre filtering
      const genreString = genreIds.join('|');
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreString}&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=100`;
    } else {
      // Fallback for unknown moods
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=100`;
    }
    
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
    
    // Updated mood keywords to match UI moods
    const moodKeywords: Record<string, string[]> = {
      action: ['thrilling', 'intense', 'high-energy', 'adrenaline-pumping', 'dynamic'],
      comedy: ['funny', 'humorous', 'witty', 'hilarious', 'amusing'],
      drama: ['emotional', 'moving', 'powerful', 'thought-provoking', 'compelling'],
      horror: ['scary', 'frightening', 'terrifying', 'chilling', 'unsettling'],
      adventure: ['exciting', 'journey', 'exploration', 'quest', 'discovery'],
      thriller: ['suspenseful', 'tense', 'gripping', 'nail-biting', 'riveting'],
      romance: ['love', 'passionate', 'heartwarming', 'emotional', 'intimate'],
      animation: ['colorful', 'imaginative', 'creative', 'vibrant', 'fantastical'],
      fantasy: ['magical', 'enchanting', 'mythical', 'wondrous', 'imaginative'],
      scifi: ['futuristic', 'technological', 'speculative', 'innovative', 'mind-bending'],
      historical: ['period', 'era', 'authentic', 'traditional', 'classic'],
      mystery: ['enigmatic', 'puzzling', 'suspenseful', 'intriguing', 'twisty'],
      musical: ['melodic', 'rhythmic', 'harmonious', 'theatrical', 'choreographed'],
      documentary: ['informative', 'educational', 'factual', 'revealing', 'insightful'],
      crime: ['detective', 'investigative', 'gritty', 'underworld', 'heist'],
      western: ['frontier', 'cowboy', 'rugged', 'wilderness', 'old west'],
      superhero: ['heroic', 'powerful', 'extraordinary', 'courageous', 'epic'],
      war: ['battlefield', 'combat', 'military', 'strategic', 'patriotic'],
      foreign: ['international', 'cultural', 'subtitled', 'global', 'diverse'],
      indie: ['unique', 'artistic', 'creative', 'personal', 'unconventional']
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
      mood_keywords: moodKeywords[mood] || []
    };
    
    return NextResponse.json({ movie: formattedMovie });
  } catch (error) {
    console.error('Error in fallback movie recommendation:', error);
    return NextResponse.json({ error: 'Failed to fetch movie recommendation' }, { status: 500 });
  }
} 