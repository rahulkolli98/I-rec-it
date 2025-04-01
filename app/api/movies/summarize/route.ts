import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Check if API key is available
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.MOVIE_SUMMARY_MODEL || 'mistralai/mistral-nemo';
  
  if (!openRouterApiKey) {
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY environment variable' }, { status: 500 });
  }

  // Extract data from request
  let data;
  try {
    data = await request.json();
    const { overview, mood, title, genres } = data;

    if (!overview || !mood || !title) {
      return NextResponse.json({ error: 'Missing required parameters (overview, mood, title)' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
  }

  // Normalize the mood parameter to lowercase for processing
  const normalizedMood = data.mood.toLowerCase();

  try {
    // Enhanced mood descriptions for AI-based summaries
    // Updated to match the moods shown in the UI buttons
    const moodDescriptions: Record<string, string> = {
      action: "high-energy, thrilling, with exciting confrontations and dynamic sequences that deliver an adrenaline rush.",
      comedy: "humorous, witty, and amusing with laugh-out-loud moments that create a lighthearted mood.",
      drama: "emotionally resonant, powerful, with complex character development and meaningful human experiences.",
      horror: "frightening, tense, with suspense and scares that create feelings of dread and unease.",
      adventure: "exciting journey-filled experiences with exploration, discovery, and scenarios that inspire wonder.",
      thriller: "suspenseful, intense, with high-stakes situations that create nail-biting anticipation.",
      romance: "emotionally touching love stories with meaningful relationships and heartfelt connections.",
      animation: "visually creative and imaginative with expressive characters and artistic visual storytelling.",
      fantasy: "magical, enchanting, with fantastical elements that transport viewers to imaginative worlds.",
      scifi: "futuristic, speculative, with technological concepts and innovative ideas that expand the mind.",
      historical: "period-authentic with attention to historical detail and context from significant eras.",
      mystery: "enigmatic, puzzling, with intriguing questions that engage viewers in solving the central puzzle.",
      musical: "rhythmic, melodic, with songs and choreography that express emotions through music.",
      documentary: "informative, educational, with factual information presented in a revealing and insightful way.",
      crime: "gritty, investigative, featuring criminal activities and moral complexities within the justice system.",
      western: "frontier-focused, with rugged landscapes and themes of law and lawlessness in the Old West.",
      superhero: "heroic, with extraordinary characters and powers that showcase courage in epic circumstances.",
      war: "battlefield-focused, with combat sequences and strategic elements that depict military conflict.",
      foreign: "international, with cultural elements and perspectives from non-English speaking countries.",
      indie: "unique, artistic, with a personal creative vision that often breaks from conventional filmmaking."
    };
    
    // Format genre names more readably
    const genreList = data.genres?.map((genre: any) => genre.name).join(', ') || '';
    
    // Format AI reasons if provided
    let aiReasonsText = '';
    if (data.ai_reasons && data.ai_reasons.length > 0) {
      aiReasonsText = "\n\nThe film has been selected for the following reasons:\n" + 
                      data.ai_reasons.map((reason: string) => `- ${reason}`).join('\n');
    }
    
    // Format mood keywords if provided
    let keywordsText = '';
    if (data.mood_keywords && data.mood_keywords.length > 0) {
      keywordsText = data.mood_keywords.join(', ');
    }
    
    // Get the appropriate description for the requested mood
    const moodDescription = moodDescriptions[normalizedMood] || `movies that would make someone feel ${normalizedMood}`;
    
    // Create the prompt for OpenRouter to generate a movie summary
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const prompt = `
      You are tasked with creating a brief, engaging summary for the film "${data.title}" that highlights its connection to a ${normalizedMood.toUpperCase()} mood/genre.
      
      Film details:
      - Title: ${data.title}
      - Overview: ${data.overview}
      - Genres: ${genreList}
      - Mood/Genre: ${normalizedMood.toUpperCase()}
      - Mood description: Films that are ${moodDescription}
      ${aiReasonsText}
      ${keywordsText ? `- Mood keywords: ${keywordsText}` : ''}
      
      Write a CONCISE summary (maximum 80-100 words) that:
      1. Briefly highlights how the film creates a ${normalizedMood.toUpperCase()} experience
      2. Mentions 1-2 specific elements that contribute to this mood/genre
      3. Explains why someone looking for this mood would enjoy it
      
      Your summary should be engaging but avoid revealing major plot twists or spoilers. Focus on mood and atmosphere rather than detailed plot points.
      
      Keep your response short, direct, and conversational in tone.
    `;
    
    // Call OpenRouter API to generate the summary
    const response = await fetch(openRouterUrl, {
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
    
    const responseData = await response.json();
    
    if (responseData.error) {
      console.error('OpenRouter API Error:', responseData.error);
      return NextResponse.json({ error: 'Failed to summarize movie' }, { status: 500 });
    }
    
    const summary = responseData.choices[0].message.content;
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in movie summarization:', error);
    return NextResponse.json({ error: 'Failed to summarize movie' }, { status: 500 });
  }
} 