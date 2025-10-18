import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable' }, { status: 500 });
  }

  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Missing description parameter' }, { status: 400 });
    }

    const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Summarize the following book description in a concise way:\n${description}`
          }]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return NextResponse.json({ error: 'Failed to summarize description', details: data.error }, { status: 500 });
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate summary.';
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to summarize description' }, { status: 500 });
  }
}
