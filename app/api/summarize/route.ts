import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY environment variable' }, { status: 500 });
  }

  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Missing description parameter' }, { status: 400 });
    }

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
            content: `Summarize the following book description in a concise way:\n${description}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenRouter API Error:', data.error);
      return NextResponse.json({ error: 'Failed to summarize description', details: data.error }, { status: 500 });
    }

    const summary = data.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to summarize description' }, { status: 500 });
  }
}
