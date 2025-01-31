import React from 'react';

type SuggestionsProps = {
  suggestions: string[];
  handleSearch: (query: string) => void;
};

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, handleSearch }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <h4 className="text-lg font-semibold">Follow-Up Suggestions</h4>
      <ul className="mt-2 space-y-1">
        {suggestions.slice(0, 5).map((suggestion, index) => (
          <li key={index}>
            <button onClick={() => handleSearch(suggestion)} className="text-normal text-neutral-400 hover:underline">
              {suggestion.replace(/"/g, '')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suggestions;