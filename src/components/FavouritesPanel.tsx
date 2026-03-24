import { useState, useEffect } from 'react';
import type { Player, Shortlist, SaveGame } from '../types';
import { getTrajectoryColour } from '../lib/calculateTrajectory';

interface Props {
  favourites: string[];
  shortlists: Shortlist[];
  allPlayers: Player[];
  savedPlayers: Record<string, Player>;
  saveGames: SaveGame[];
  favouriteSaveGames: Record<string, string>;
  onPlayerClick: (p: Player) => void;
  onRemoveFavourite: (uid: string) => void;
  onCreateShortlist: (name: string, saveGameId?: string) => string;
  onDeleteShortlist: (id: string) => void;
  onRemoveFromShortlist: (shortlistId: string, uid: string) => void;
  onAddToShortlist: (shortlistId: string, uid: string) => void;
  onCreateSaveGame: (name: string) => string;
  onDeleteSaveGame: (id: string) => void;
  onRenameSaveGame: (id: string, name: string) => void;
  onSetFavouriteSaveGame: (uid: string, saveGameId: string | undefined) => void;
}

export function FavouritesPanel({
  favourites, shortlists, allPlayers, savedPlayers, saveGames,
  favouriteSaveGames,
  onPlayerClick, onRemoveFavourite, onCreateShortlist, onDeleteShortlist,
  onRemoveFromShortlist, onAddToShortlist,
  onCreateSaveGame, onDeleteSaveGame, onSetFavouriteSaveGame,
}: Props) {
  const [activeTab, setActiveTab] = useState<'fav' | string>('fav');
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const [activeSaveGameFilter, setActiveSaveGameFilter] = useState<string | 'all' | 'ungrouped'>('all');
  const [movingUid, setMovingUid] = useState<string | null>(null);

  // allPlayers takes precedence over savedPlayers (fresh data preferred)
  const playerMap = new Map<string, Player>([
    ...Object.entries(savedPlayers),
    ...allPlayers.map(p => [p.uid, p] as [string, Player]),
  ]);

  const visibleShortlists = shortlists.filter(s => {
    if (activeSaveGameFilter === 'all') return true;
    if (activeSaveGameFilter === 'ungrouped') return !s.saveGameId;
    return s.saveGameId === activeSaveGameFilter;
  });

  // Reset active tab if it's no longer visible after filter change
  useEffect(() => {
    if (activeTab !== 'fav' && !visibleShortlists.find(s => s.id === activeTab)) {
      setActiveTab('fav');
    }
  }, [activeSaveGameFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter favourites by active save game
  const filteredFavUids = favourites.filter(uid => {
    if (activeSaveGameFilter === 'all') return true;
    if (activeSaveGameFilter === 'ungrouped') return !favouriteSaveGames[uid];
    return favouriteSaveGames[uid] === activeSaveGameFilter;
  });

  const favPlayers = filteredFavUids.map(uid => playerMap.get(uid)).filter(Boolean) as Player[];
  const orphanedUids = filteredFavUids.filter(uid => !playerMap.has(uid));

  const activeShortlist = shortlists.find(s => s.id === activeTab);
  const shortlistPlayers = activeShortlist
    ? activeShortlist.playerUids.map(uid => playerMap.get(uid)).filter(Boolean) as Player[]
    : [];

  const displayPlayers = activeTab === 'fav' ? favPlayers : shortlistPlayers;

  const handleNewShortlist = () => {
    const name = prompt('Shortlist name:');
    if (name?.trim()) {
      const saveGameId = activeSaveGameFilter !== 'all' && activeSaveGameFilter !== 'ungrouped'
        ? activeSaveGameFilter : undefined;
      const id = onCreateShortlist(name.trim(), saveGameId);
      setActiveTab(id);
    }
  };

  if (favourites.length === 0 && shortlists.length === 0 && saveGames.length === 0) {
    return (
      <div className="bg-[#1a2035] border border-[#2a3350] rounded-xl p-6 text-center">
        <p className="text-[#7c8db0] text-sm">No favourites yet.</p>
        <p className="text-[#7c8db0] text-xs mt-1">Star a player from the search results to save them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2035] border border-[#2a3350] rounded-xl overflow-hidden">
      {/* Save game filter bar — only shown when save games exist */}
      {saveGames.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a3350] overflow-x-auto">
          <FilterChip
            label="All"
            active={activeSaveGameFilter === 'all'}
            onClick={() => setActiveSaveGameFilter('all')}
          />
          {saveGames.map(sg => (
            <FilterChip
              key={sg.id}
              label={sg.name}
              active={activeSaveGameFilter === sg.id}
              onClick={() => setActiveSaveGameFilter(sg.id)}
              onDelete={() => onDeleteSaveGame(sg.id)}
            />
          ))}
          <FilterChip
            label="Ungrouped"
            active={activeSaveGameFilter === 'ungrouped'}
            onClick={() => setActiveSaveGameFilter('ungrouped')}
          />
          <button
            onClick={() => {
              const name = prompt('Save game name (e.g. "Liverpool FC"):');
              if (name?.trim()) onCreateSaveGame(name.trim());
            }}
            className="ml-auto shrink-0 px-2 py-1 text-xs text-[#4f8ef7] hover:bg-[#4f8ef7]/10 rounded transition-colors whitespace-nowrap"
          >
            + Save Game
          </button>
        </div>
      )}

      {/* Shortlist tabs */}
      <div className="flex overflow-x-auto border-b border-[#2a3350]">
        <Tab label={`Favourites (${filteredFavUids.length})`} active={activeTab === 'fav'} onClick={() => setActiveTab('fav')} />
        {visibleShortlists.map(s => (
          <Tab
            key={s.id}
            label={`${s.name} (${s.playerUids.length})`}
            active={activeTab === s.id}
            dragOver={dragOverTab === s.id}
            onClick={() => setActiveTab(s.id)}
            onDragOver={e => { e.preventDefault(); setDragOverTab(s.id); }}
            onDragLeave={() => setDragOverTab(null)}
            onDrop={e => {
              e.preventDefault();
              const uid = e.dataTransfer.getData('text/plain');
              if (uid) onAddToShortlist(s.id, uid);
              setDragOverTab(null);
            }}
          />
        ))}
        <button
          onClick={handleNewShortlist}
          className="px-4 py-3 text-xs text-[#4f8ef7] hover:bg-[#4f8ef7]/10 whitespace-nowrap transition-colors shrink-0"
        >
          + New Shortlist
        </button>
        {saveGames.length === 0 && (
          <button
            onClick={() => {
              const name = prompt('Save game name (e.g. "Liverpool FC"):');
              if (name?.trim()) onCreateSaveGame(name.trim());
            }}
            className="px-4 py-3 text-xs text-[#7c8db0] hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors shrink-0"
          >
            + Save Game
          </button>
        )}
      </div>

      {/* Header actions */}
      {activeTab !== 'fav' && activeShortlist && (
        <div className="px-4 py-2 border-b border-[#2a3350] flex justify-end">
          <button
            onClick={() => { onDeleteShortlist(activeShortlist.id); setActiveTab('fav'); }}
            className="text-xs text-[#f87171] hover:text-red-400 transition-colors"
          >
            Delete shortlist
          </button>
        </div>
      )}

      {activeTab === 'fav' && visibleShortlists.length > 0 && (
        <div className="px-4 py-2 border-b border-[#2a3350]">
          <p className="text-xs text-[#7c8db0]">Drag a player onto a shortlist tab to add them.</p>
        </div>
      )}

      {/* Player list */}
      <div
        className="divide-y divide-[#2a3350] max-h-96 overflow-y-auto"
        onClick={() => setMovingUid(null)}
      >
        {displayPlayers.length === 0 && orphanedUids.length === 0 ? (
          <p className="text-[#7c8db0] text-sm text-center py-6">No players here yet.</p>
        ) : (
          displayPlayers.map(p => (
            <div
              key={p.uid}
              draggable={activeTab === 'fav'}
              onDragStart={e => e.dataTransfer.setData('text/plain', p.uid)}
              onDragEnd={() => setDragOverTab(null)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1e2640] group transition-colors ${activeTab === 'fav' ? 'cursor-grab' : 'cursor-pointer'}`}
              onClick={() => onPlayerClick(p)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                <p className="text-xs text-[#7c8db0]">{p.age}y · {p.position} · {p.club}</p>
                {/* Save game label shown in "all" view */}
                {activeSaveGameFilter === 'all' && saveGames.length > 0 && activeTab === 'fav' && (
                  <p className="text-xs text-[#4a5568] mt-0.5">
                    {favouriteSaveGames[p.uid]
                      ? saveGames.find(sg => sg.id === favouriteSaveGames[p.uid])?.name ?? 'Unknown'
                      : 'Ungrouped'}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono" style={{ color: getTrajectoryColour(p.trajectoryPct) }}>
                  {p.trajectoryPct.toFixed(1)}%
                </span>
                <p className="text-xs text-[#7c8db0]">→ {p.projectedPeak.toFixed(1)}</p>
              </div>

              {/* Move to save game button — only on Favourites tab when save games exist */}
              {activeTab === 'fav' && saveGames.length > 0 && (
                <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    className="text-[#7c8db0] hover:text-[#4f8ef7] opacity-0 group-hover:opacity-100 transition-all text-xs px-1"
                    onClick={() => setMovingUid(movingUid === p.uid ? null : p.uid)}
                    title="Move to save game"
                  >
                    ⇄
                  </button>
                  {movingUid === p.uid && (
                    <div className="absolute right-0 top-full mt-1 bg-[#0f1320] border border-[#2a3350] rounded-lg shadow-xl z-20 min-w-36 py-1">
                      <p className="px-3 py-1 text-[10px] text-[#4a5568] uppercase tracking-wider">Move to save game</p>
                      <button
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#4f8ef7]/10 ${!favouriteSaveGames[p.uid] ? 'text-[#4f8ef7]' : 'text-[#7c8db0] hover:text-white'}`}
                        onClick={() => { onSetFavouriteSaveGame(p.uid, undefined); setMovingUid(null); }}
                      >
                        No save game {!favouriteSaveGames[p.uid] && '✓'}
                      </button>
                      {saveGames.map(sg => (
                        <button
                          key={sg.id}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#4f8ef7]/10 ${favouriteSaveGames[p.uid] === sg.id ? 'text-[#4f8ef7]' : 'text-[#7c8db0] hover:text-white'}`}
                          onClick={() => { onSetFavouriteSaveGame(p.uid, sg.id); setMovingUid(null); }}
                        >
                          {sg.name} {favouriteSaveGames[p.uid] === sg.id && '✓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className="text-[#7c8db0] hover:text-[#f87171] opacity-0 group-hover:opacity-100 transition-all text-sm shrink-0"
                onClick={e => {
                  e.stopPropagation();
                  activeTab === 'fav'
                    ? onRemoveFavourite(p.uid)
                    : onRemoveFromShortlist(activeTab, p.uid);
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))
        )}
        {activeTab === 'fav' && orphanedUids.map(uid => (
          <div key={uid} className="flex items-center gap-3 px-4 py-3 opacity-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#7c8db0] italic">Player data unavailable</p>
              <p className="text-xs text-[#7c8db0]">Upload your scout report to restore</p>
            </div>
            <button
              className="text-[#f87171] hover:text-red-400 text-sm shrink-0 transition-colors"
              onClick={() => onRemoveFavourite(uid)}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tab({ label, active, dragOver, onClick, onDragOver, onDragLeave, onDrop }: {
  label: string;
  active: boolean;
  dragOver?: boolean;
  onClick: () => void;
  onDragOver?: React.DragEventHandler<HTMLButtonElement>;
  onDragLeave?: React.DragEventHandler<HTMLButtonElement>;
  onDrop?: React.DragEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`px-4 py-3 text-sm whitespace-nowrap shrink-0 border-b-2 transition-colors ${
        dragOver
          ? 'border-[#4f8ef7] bg-[#4f8ef7]/10 text-white'
          : active
            ? 'border-[#4f8ef7] text-white'
            : 'border-transparent text-[#7c8db0] hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function FilterChip({ label, active, onClick, onDelete }: {
  label: string;
  active: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs cursor-pointer transition-colors border ${
        active
          ? 'bg-[#4f8ef7]/20 text-[#4f8ef7] border-[#4f8ef7]/40'
          : 'bg-[#0f1320] text-[#7c8db0] border-[#2a3350] hover:text-white'
      }`}
    >
      {label}
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="ml-0.5 text-[#7c8db0] hover:text-[#f87171] transition-colors leading-none"
          title={`Delete "${label}"`}
        >
          ×
        </button>
      )}
    </div>
  );
}
