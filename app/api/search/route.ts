import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CUSTOM_SEARCH_ENGINE_ID = process.env.CUSTOM_SEARCH_ENGINE_ID;
const BING_API_KEY = process.env.BING_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!GOOGLE_API_KEY || !CUSTOM_SEARCH_ENGINE_ID || !BING_API_KEY) {
      throw new Error('Missing one or more API keys');
    }

    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
      message
    )}&fields=items(title,link,snippet,pagemap(cse_image),pagemap(metatags))&num=4`;
    
    const bingUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(
      message
    )}&$select=name,url,snippet,image,webPages&count=4`;

    const bingHeaders: HeadersInit = {
      'Ocp-Apim-Subscription-Key': BING_API_KEY,
    };

    console.log('Fetching search results from Google and Bing...');
    const [googleResponse, bingResponse] = await Promise.all([
      fetch(googleUrl),
      fetch(bingUrl, { headers: bingHeaders }),
    ]);

    if (!googleResponse.ok || !bingResponse.ok) {
      console.error('Failed to fetch search results:', {
        googleStatus: googleResponse.status,
        bingStatus: bingResponse.status,
      });
      throw new Error('Failed to fetch search results from one or both APIs');
    }

    const [googleData, bingData] = await Promise.all([
      googleResponse.json(),
      bingResponse.json(),
    ]);

    const googleResults = googleData.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      image: item.pagemap?.cse_image?.[0]?.src || null,
      source: 'Google',
      date: item.pagemap?.metatags?.[0]?.['article:published_time'] || null,
    })) || [];

    const bingResults = bingData.webPages?.value?.map((item: any) => ({
      title: item.name,
      link: item.url,
      snippet: item.snippet,
      image: item.image?.thumbnail?.contentUrl || null,
      source: 'Bing',
      date: item.dateLastCrawled || null,
    })) || [];

    const searchResults = [...googleResults, ...bingResults].sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.source.localeCompare(b.source);
    });

    if (searchResults.length === 0) {
      return NextResponse.json({
        message: "Hmm, we couldn’t find anything with that. Try a different search.",
        searchResults: [],
        suggestions: [],
      });
    }

    const summarizedContent = searchResults
      .map((item) => `- ${item.title}: ${item.snippet}`)
      .join('\n');

    const [response, suggestionsResponse] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize the following search results for the user. Focus on recent news or events. Provide an introductory sentence or two, followed by two to three bullet points for the main points, and any final remarks with an additional sentence.' },
          { role: 'user', content: summarizedContent },
        ],
      }),
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Suggest related search queries for the user based on their input.',
          },
          { role: 'user', content: `User's query: "${message}"` },
        ],
      }),
    ]);

    let assistantMessage = response.choices[0]?.message?.content ?? '';

    if (assistantMessage) {
      assistantMessage = `${assistantMessage}`;
    }

    const suggestions = suggestionsResponse.choices[0]?.message?.content
      ?.split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^\d+\.\s*/, '')) || [];

    const jsonResponse = {
      message: assistantMessage || "No summary generated.",
      searchResults,
      suggestions,
    };

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in search and summarize API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or process search results' },
      { status: 500 }
    );
  }
}