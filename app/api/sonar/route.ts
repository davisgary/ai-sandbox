import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-reasoning-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that conducts real-time web searches to provide very concise, fact-based summaries from trusted sources. Focus on recent news, stories, and information from authoritative and credible sources. Keep responses under 200 words. Always perform web searches to gather the most recent and authoritative information. At the end of your response, provide a Sources section with the URLs of the sources cited in the order they appear.',
        },
        {
          role: 'user',
          content: `Provide a short summary of the most recent news and information about ${message}.`,
        },
      ],
      temperature: 0.1,
      top_k: 0,
      top_p: 0.7,
      frequency_penalty: 1,
      presence_penalty: 0,
      search_recency_filter: 'month',
      max_tokens: 300,
    }),
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    const data = await response.json();
    console.log('Perplexity API Response:', data);

    if (data?.choices?.length > 0) {
      return NextResponse.json({
        message: data.choices[0].message.content,
      });
    } else {
      console.error('Unexpected data structure:', data);
      return NextResponse.json({ error: 'Unexpected response structure' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error fetching from Perplexity API:', err);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}