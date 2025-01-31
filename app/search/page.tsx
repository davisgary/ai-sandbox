'use client';

import { useState } from 'react';
import { TfiWorld } from 'react-icons/tfi';
import Summary from './components/Summary';
import Results from './components/Results';
import Trends from './components/Trends';
import Suggestions from './components/Suggestions';

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  image: string;
};

type SearchSession = {
  query: string;
  summary: string;
  results: SearchResult[];
  suggestions: string[];
};

export default function IndexPage() {
  const [searchSessions, setSearchSessions] = useState<SearchSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
  
    setLoading(true);
    setError(null);
    setSearchSessions((prevSessions) => [
      ...prevSessions,
      {
        query,
        summary: '',
        results: [],
        suggestions: [],
      },
    ]);
  
    const newIndex = searchSessions.length;
    setCurrentSearchIndex(newIndex);
  
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
  
      const data: {
        message: string;
        searchResults: SearchResult[];
        suggestions: string[];
      } = await response.json();
  
      setSearchSessions((prevSessions) =>
        prevSessions.map((session, index) =>
          index === newIndex
            ? {
                ...session,
                summary: data.message,
                results: data.searchResults || [],
                suggestions: data.suggestions || [],
              }
            : session
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setCurrentSearchIndex(null);
    }
  };  

  return (
    <div className="min-h-screen flex flex-col bg-black text-center text-white">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-24">
        <h1 className="pb-6 font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">Search the Web with AI</h1>
        <div className="w-full relative">
          <input
            type="text"
            placeholder="Enter your search..."
            className="w-full px-5 py-3 pr-16 bg-neutral-900 text-white placeholder-neutral-400 rounded-3xl shadow-[0_0_4px_rgba(255,255,255,0.6)] focus:outline-none"
            onKeyDown={(e) => {if (e.key === 'Enter') {handleSearch((e.target as HTMLInputElement).value);}}} />
          <button onClick={() => handleSearch((document.querySelector('input') as HTMLInputElement).value)}
            disabled={loading}
            className="absolute right-2 bg-black w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-80 transition-colors duration-200"
            style={{top: '50%', transform: 'translateY(-50%)'}}
            aria-label="Search">
            <TfiWorld className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <Trends handleSearch={handleSearch} />
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {searchSessions.map((session, index) => (
          <div key={index} className="mt-4 w-full text-left">
            <Summary summary={session.summary} />
            <Results results={session.results} />
            {(session.summary || session.results.length > 0) && (
            <p className="mt-4">Search for "{session.query.replace(/^\d+\.\s*/, '').replace(/"/g, '')}"</p>
            )}
            {loading && currentSearchIndex === index && (<div className="px-5 text-neutral-400 animate-pulse">Searching...</div>)}
            <Suggestions suggestions={session.suggestions} handleSearch={handleSearch} />
          </div>
        ))}
      </div>
      <footer className="py-4 text-xs">AI can make mistakes. Check your results.</footer>
    </div>
  );
}