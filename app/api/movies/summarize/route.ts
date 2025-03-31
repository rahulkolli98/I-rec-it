import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY environment variable' }, { status: 500 });
  }

  try {
    const { overview, mood, title, genres, mood_keywords, ai_reasons } = await request.json();
    
    // Enhanced mood descriptions for better summaries
    const moodDescriptions: Record<string, string> = {
      happy: "uplifting, joyful, and positive emotions",
      sad: "melancholy, emotional depth, and poignant reflection",
      excited: "thrilling, high-energy, and adrenaline-pumping moments",
      relaxed: "calm, peaceful, and soothing sensations",
      romantic: "love, passion, and emotional connection",
      scared: "fear, tension, and spine-chilling thrills",
      thoughtful: "intellectual stimulation, philosophy, and deep introspection",
      mysterious: "intrigue, suspense, and enigmatic elements",
      adventurous: "exploration, journey, and exciting discoveries",
      nostalgic: "reminiscence, memory, and emotional longing for the past",
      inspired: "motivation, encouragement, and personal transformation",
      tense: "suspense, anxiety, and edge-of-seat anticipation",
      funny: "humor, laughter, and comedic situations",
      epic: "grandeur, spectacle, and monumental storytelling",
      heartwarming: "emotional comfort, tenderness, and uplifting stories"
    };
    
    // Format genre names for readability
    const formattedGenres = genres.map((genre: { name: string }) => genre.name).join(', ');
    
    // Format AI reasons if available
    const aiReasonsText = ai_reasons && ai_reasons.length > 0
      ? "AI-provided reasons why this film matches the mood: " +
        ai_reasons.map((reason: string) => `"${reason}"`).join(", ")
      : "";
    
    const moodDescription = moodDescriptions[mood.toLowerCase()] || mood;
    
    const prompt = `
    Generate a compelling, engaging summary for the film "${title}" that highlights how it connects to a ${mood} mood.
    
    Film overview: "${overview}"
    
    Film genres: ${formattedGenres}
    
    A ${mood} mood is characterized by ${moodDescription}.
    
    Keywords associated with this mood: ${mood_keywords ? mood_keywords.join(', ') : ''}
    
    ${aiReasonsText}
    
    Your summary should:
    1. Highlight how the film creates a ${mood} experience for viewers
    2. Mention specific elements in the film that contribute to this mood
    3. Explain why someone feeling ${mood} would connect with this film
    4. Be around 3-4 sentences long, with vivid and emotionally resonant language
    5. Avoid plot spoilers or twists
    `;
    
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Error from OpenRouter API:', data.error);
      return NextResponse.json({ error: 'Failed to summarize movie', details: data.error }, { status: 500 });
    }
    
    const summary = data.choices[0].message.content.trim();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in movie summarization:', error);
    return NextResponse.json({ error: 'Failed to summarize movie' }, { status: 500 });
  }
} 