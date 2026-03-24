export type SortKey = 'trajectory' | 'score' | 'peak';

interface Props {
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  filterText: string;
  onFilterChange: (text: string) => void;
  totalCount: number;
  filteredCount: number;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'trajectory', label: 'Trajectory' },
  { key: 'score',      label: 'Current Rating' },
  { key: 'peak',       label: 'Peak' },
];

export function SortBar({ sortKey, onSortChange, filterText, onFilterChange, totalCount, filteredCount }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 w-full">
        <input
          type="text"
          value={filterText}
          onChange={e => onFilterChange(e.target.value)}
          placeholder="Filter by name…"
          className="w-full bg-[#1a2035] border border-[#2a3350] rounded-lg px-4 py-2.5 text-white placeholder-[#7c8db0] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors"
        />
        {filterText && (
          <button
            onClick={() => onFilterChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c8db0] hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-[#7c8db0] mr-1">Sort:</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key)}
            className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
              sortKey === opt.key
                ? 'bg-[#4f8ef7]/15 text-[#4f8ef7] border-[#4f8ef7]/40 font-semibold'
                : 'text-[#7c8db0] border-[#2a3350] hover:text-white hover:border-[#4a5568]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filterText && (
        <span className="text-xs text-[#7c8db0] shrink-0">
          {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}
