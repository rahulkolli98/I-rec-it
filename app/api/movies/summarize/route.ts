import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY environment variable' }, { status: 500 });
  }

  try {
    const { overview, mood, title, genres, mood_keywords = [], ai_reasons = [] } = await request.json();

    if (!overview) {
      return NextResponse.json({ error: 'Missing overview parameter' }, { status: 400 });
    }

    // Enhanced mood descriptions for better summaries
    const moodDescriptions: Record<string, string> = {
      happy: "joyful, uplifting, and light-hearted",
      sad: "melancholic, moving, and emotionally resonant",
      excited: "thrilling, high-energy, and adrenaline-pumping",
      relaxed: "peaceful, calming, and contemplative",
      romantic: "heartfelt, passionate, and emotionally intimate",
      scared: "frightening, tense, and unsettling",
      thoughtful: "philosophical, thought-provoking, and intellectually stimulating",
      mysterious: "enigmatic, puzzling, and full of intrigue",
      adventurous: "journey-filled, explorative, and exciting",
      nostalgic: "reminiscent, memory-evoking, and timelessly familiar",
      inspired: "motivational, encouraging, and emotionally uplifting",
      tense: "suspenseful, edge-of-seat, and nerve-wracking",
      funny: "humorous, laugh-inducing, and comedic",
      epic: "grand, sweeping, and monumentally impressive",
      heartwarming: "touching, emotionally resonant, and feel-good"
    };

    // Get appropriate adjectives for this mood
    const moodAdjectives = moodDescriptions[mood.toLowerCase()] || 
      `that perfectly captures the ${mood} feeling`;
    
    // Format genre names for better readability
    const genreNames = genres?.map((g: any) => g.name).join(', ') || 'various genres';
    
    // Format AI reasons if available
    let aiReasonsText = "";
    if (ai_reasons && ai_reasons.length > 0) {
      aiReasonsText = "Expert notes on why this film matches the mood:\n" + 
        ai_reasons.map((reason: string) => `- ${reason}`).join('\n') + "\n\n";
    }
    
    // Craft a more targeted prompt that focuses on the emotional connection
    const keywordsString = mood_keywords.length > 0 ? 
      `Consider using these mood-related keywords: ${mood_keywords.join(', ')}.` : '';
    
    const prompt = `
      Write an engaging, thoughtful summary for the movie "${title}" that strongly emphasizes 
      its connection to a ${mood.toLowerCase()} mood. This film falls within ${genreNames} and 
      has the following official description:
      
      "${overview}"
      
      ${aiReasonsText}
      
      Your summary should:
      1. Highlight specifically how this film creates a ${moodAdjectives} experience for viewers
      2. Mention particular elements (characters, plot, visuals, music) that contribute to this mood
      3. Explain why someone feeling "${mood}" would connect with this specific film
      
      ${keywordsString}
      
      Keep your response concise (3-4 sentences) yet compelling, focusing primarily on the 
      emotional impact of the film and why it's perfect for someone in a ${mood.toLowerCase()} mood.
    `;

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
      console.error('OpenRouter API Error:', data.error);
      return NextResponse.json({ error: 'Failed to summarize movie', details: data.error }, { status: 500 });
    }

    const summary = data.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to summarize movie' }, { status: 500 });
  }
} 