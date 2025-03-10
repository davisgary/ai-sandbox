import React, { useEffect, useRef, useState } from 'react';

type TrendsProps = {
  handleSearch: (query: string) => void;
};

const Trends: React.FC<TrendsProps> = ({ handleSearch }) => {
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const trendsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const response = await fetch('/api/trends', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trending searches');
        }

        const data: { trends: string[] } = await response.json();
        setTrendingSearches(data.trends || []);
      } catch (err) {
        console.error('Error fetching trending searches:', err);
      }
    };

    fetchTrendingSearches();
  }, []);

  useEffect(() => {
    const trendsContainer = trendsContainerRef.current;
    if (!trendsContainer) return;

    let animationFrameId: number;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      trendsContainer.scrollLeft = (progress / 50) % trendsContainer.scrollWidth;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [trendingSearches]);

  if (!trendingSearches.length) {
    return null;
  }

  return (
    <div className="mt-5 w-full text-left">
      <div className="overflow-hidden whitespace-nowrap" ref={trendsContainerRef}>
        <div className="inline-block">
          {trendingSearches.map((trend, index) => (
            <span key={index} className="mx-4">
              <button onClick={() => handleSearch(trend)} className="text-normal text-neutral-400 hover:underline focus:outline-none focus:ring-0 active:bg-transparent">
                {trend}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trends;