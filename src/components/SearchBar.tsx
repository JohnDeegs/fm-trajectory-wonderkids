import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
  disabled: boolean;
  hasKey: boolean;
}

const SUGGESTIONS = [
  'Best young striker under 20 on high trajectory',
  'Fastest defenders on a 110%+ trajectory',
  'Creative midfielders with high vision and passing',
  'South American wonderkids',
  'Cheap players with elite potential',
];

export function SearchBar({ onSearch, loading, disabled, hasKey }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) onSearch(query.trim());
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={
            !hasKey ? 'Add a Gemini API key in Settings first…' :
            disabled ? 'Load player data first…' :
            'Search for players… e.g. "best young striker on high trajectory"'
          }
          disabled={disabled || !hasKey}
          className="flex-1 bg-[#1a2035] border border-[#2a3350] rounded-lg px-4 py-3 text-white placeholder-[#7c8db0] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || loading || !query.trim() || !hasKey}
          className="bg-[#4f8ef7] hover:bg-[#3a7de6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : '🔍'}
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {!disabled && hasKey && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); onSearch(s); }}
              disabled={loading}
              className="text-xs text-[#7c8db0] hover:text-[#4f8ef7] bg-[#1a2035] hover:bg-[#1a2035] border border-[#2a3350] hover:border-[#4f8ef7]/50 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
