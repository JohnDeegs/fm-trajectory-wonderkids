import { useState, useCallback, useMemo } from 'react';
import { UploadPanel } from './components/UploadPanel';
import { SearchBar } from './components/SearchBar';
import { SortBar } from './components/SortBar';
import type { SortKey } from './components/SortBar';
import { ResultsGrid } from './components/ResultsGrid';
import { PlayerModal } from './components/PlayerModal';
import { FavouritesPanel } from './components/FavouritesPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { parseHtmlExport } from './lib/parseHtml';
import { scoreAllPlayers } from './lib/calculateTrajectory';
import { geminiSearch } from './lib/geminiSearch';
import { findRolesByQuery } from './lib/roleFormulas';
import { getNationalitySearchTerms } from './lib/youthData';
import { useStore } from './store/useStore';
import type { Player } from './types';
import './index.css';

const PAGE_SIZE = 25;

export default function App() {
  const store = useStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeView, setActiveView] = useState<'search' | 'favourites'>('search');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('trajectory');
  const [filterText, setFilterText] = useState('');

  const handleLoad = useCallback((html: string) => {
    const raw = parseHtmlExport(html);
    const scored = scoreAllPlayers(raw);
    store.setPlayers(scored);
    store.syncSavedPlayers(scored);
    // Show all players sorted by trajectory on load
    const sorted = [...scored].sort((a, b) => b.trajectoryPct - a.trajectoryPct);
    store.setSearchResults(sorted, null);
    store.setLastQuery('');
    setSearchError('');
    setCurrentPage(1);
    setFilterText('');
    setActiveView('search');
  }, [store]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchLoading(true);
    setSearchError('');
    setFilterText('');
    try {
      const results = await geminiSearch(query, store.players, store.geminiKey);
      const matchedRoles = findRolesByQuery(query);
      const focusKey = matchedRoles.length > 0 ? matchedRoles[0].key : null;
      const sorted = [...results].sort((a, b) => {
        if (matchedRoles.length > 0) {
          const scoreA = Math.max(...matchedRoles.map(r => a.roleScores[r.key] ?? 0));
          const scoreB = Math.max(...matchedRoles.map(r => b.roleScores[r.key] ?? 0));
          return scoreB - scoreA;
        }
        return b.trajectoryPct - a.trajectoryPct;
      });
      store.setSearchResults(sorted, focusKey);
      store.setLastQuery(query);
      setCurrentPage(1);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setSearchLoading(false);
    }
  }, [store]);

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    setCurrentPage(1);
  };

  const handleFilterChange = (text: string) => {
    setFilterText(text);
    setCurrentPage(1);
  };

  // Apply local filter + sort on top of whatever results are currently shown
  const displayPlayers = useMemo(() => {
    let list = store.searchResults;

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sortKey === 'trajectory') return b.trajectoryPct - a.trajectoryPct;
      if (sortKey === 'score')      return b.bestRoleScore - a.bestRoleScore;
      return b.projectedPeak - a.projectedPeak;
    });
  }, [store.searchResults, sortKey, filterText]);

  const favCount = store.favourites.length;
  const totalPages = Math.ceil(displayPlayers.length / PAGE_SIZE);
  const pagedPlayers = displayPlayers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-[#0f1320] text-[#e2e8f0]">
      {/* Header */}
      <header className="border-b border-[#2a3350] sticky top-0 bg-[#0f1320]/95 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚽</span>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">FM Trajectory</h1>
              <p className="text-xs text-[#7c8db0] leading-tight">Wonderkid Scout — FM24</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('search')}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                activeView === 'search'
                  ? 'bg-[#4f8ef7]/10 text-[#4f8ef7] border-[#4f8ef7]/40'
                  : 'text-[#7c8db0] border-[#2a3350] hover:text-white'
              }`}
            >
              🔍 Search{store.players.length > 0 && (
                <span className={`ml-1.5 text-xs ${activeView === 'search' ? 'text-[#4f8ef7]/70' : 'text-[#4a5568]'}`}>
                  {store.players.length.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('favourites')}
              className={`relative text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                activeView === 'favourites'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  : 'text-[#7c8db0] border-[#2a3350] hover:text-white'
              }`}
            >
              ⭐ Saved
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4f8ef7] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                  {favCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                store.geminiKey
                  ? 'text-[#7c8db0] border-[#2a3350] hover:text-white'
                  : 'text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10 animate-pulse'
              }`}
            >
              ⚙ {store.geminiKey ? 'Settings' : 'Add API Key'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Upload */}
        <UploadPanel onLoad={handleLoad} playerCount={store.players.length} />

        {activeView === 'search' ? (
          <>
            {store.players.length > 0 && (
              <div className="space-y-3">
                <SearchBar
                  onSearch={handleSearch}
                  loading={searchLoading}
                  disabled={false}
                  hasKey={!!store.geminiKey}
                />
                <SortBar
                  sortKey={sortKey}
                  onSortChange={handleSortChange}
                  filterText={filterText}
                  onFilterChange={handleFilterChange}
                  totalCount={store.searchResults.length}
                  filteredCount={displayPlayers.length}
                />
              </div>
            )}

            {searchError && (
              <div className="bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] px-4 py-3 rounded-lg text-sm">
                {searchError}
              </div>
            )}

            {store.lastQuery && store.searchResults.length > 0 && (
              <p className="text-xs text-[#7c8db0]">
                Results for: <span className="text-white italic">"{store.lastQuery}"</span>
                {filterText && <span className="ml-1">— filtered to {displayPlayers.length}</span>}
              </p>
            )}

            <ResultsGrid
              players={pagedPlayers}
              favourites={store.favourites}
              focusRoleKey={store.focusRoleKey}
              rankOffset={(currentPage - 1) * PAGE_SIZE}
              onPlayerClick={setSelectedPlayer}
              onToggleFavourite={store.toggleFavourite}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-2 text-sm">
                <button
                  className="px-3 py-1.5 rounded-lg border border-[#2a3350] text-[#7c8db0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                <span className="text-[#7c8db0]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-1.5 rounded-lg border border-[#2a3350] text-[#7c8db0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}

            {store.players.length > 0 && store.searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-16 text-[#7c8db0]">
                <p className="text-5xl mb-4">🔭</p>
                <p className="font-semibold text-white text-lg">Ready to scout</p>
                <p className="text-sm mt-2">
                  {store.geminiKey
                    ? 'Use the search bar above to find players by natural language'
                    : 'Add your Gemini API key in Settings to enable AI search'}
                </p>
              </div>
            )}
          </>
        ) : (
          <FavouritesPanel
            favourites={store.favourites}
            shortlists={store.shortlists}
            allPlayers={store.players}
            savedPlayers={store.savedPlayers}
            onPlayerClick={setSelectedPlayer}
            onRemoveFavourite={store.toggleFavourite}
            onCreateShortlist={store.createShortlist}
            onDeleteShortlist={store.deleteShortlist}
            onRemoveFromShortlist={store.removeFromShortlist}
            onAddToShortlist={store.addToShortlist}
            saveGames={store.saveGames}
            onCreateSaveGame={store.createSaveGame}
            onDeleteSaveGame={store.deleteSaveGame}
            onRenameSaveGame={store.renameSaveGame}
            favouriteSaveGames={store.favouriteSaveGames}
            onSetFavouriteSaveGame={store.setFavouriteSaveGame}
          />
        )}
      </main>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          isFavourite={store.favourites.includes(selectedPlayer.uid)}
          shortlists={store.shortlists}
          onToggleFavourite={() => store.toggleFavourite(selectedPlayer.uid)}
          onAddToShortlist={id => store.addToShortlist(id, selectedPlayer.uid)}
          onCreateShortlist={store.createShortlist}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel
          geminiKey={store.geminiKey}
          onSave={store.setGeminiKey}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
