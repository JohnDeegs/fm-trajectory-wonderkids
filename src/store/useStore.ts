import { useState, useEffect, useCallback } from 'react';
import type { Player, Shortlist, SaveGame } from '../types';

const STORAGE_KEYS = {
  favourites:   'fm-traj-favourites',
  shortlists:   'fm-traj-shortlists',
  geminiKey:    'fm-traj-gemini-key',
  savedPlayers: 'fm-traj-saved-players',
  saveGames:    'fm-traj-save-games',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function useStore() {
  const [players, setPlayers]           = useState<Player[]>([]);
  const [searchResults, setSearchResults_] = useState<Player[]>([]);
  const [focusRoleKey, setFocusRoleKey] = useState<string | null>(null);
  const [lastQuery, setLastQuery]       = useState('');
  const [favourites, setFavourites]     = useState<string[]>(() => load(STORAGE_KEYS.favourites, []));
  const [shortlists, setShortlists]     = useState<Shortlist[]>(() => load(STORAGE_KEYS.shortlists, []));
  const [saveGames, setSaveGames]       = useState<SaveGame[]>(() => load(STORAGE_KEYS.saveGames, []));
  const [geminiKey, setGeminiKeyState]  = useState<string>(() => load(STORAGE_KEYS.geminiKey, ''));
  const [savedPlayers, setSavedPlayers] = useState<Record<string, Player>>(() => load(STORAGE_KEYS.savedPlayers, {}));

  // Persist favourites
  useEffect(() => { save(STORAGE_KEYS.favourites, favourites); }, [favourites]);
  useEffect(() => { save(STORAGE_KEYS.shortlists, shortlists); }, [shortlists]);
  useEffect(() => { save(STORAGE_KEYS.saveGames, saveGames); }, [saveGames]);
  useEffect(() => { save(STORAGE_KEYS.savedPlayers, savedPlayers); }, [savedPlayers]);

  const setGeminiKey = useCallback((key: string) => {
    setGeminiKeyState(key);
    save(STORAGE_KEYS.geminiKey, key);
  }, []);

  const toggleFavourite = useCallback((uid: string) => {
    setFavourites(prev => {
      if (prev.includes(uid)) {
        setSavedPlayers(sp => { const n = { ...sp }; delete n[uid]; return n; });
        return prev.filter(id => id !== uid);
      } else {
        const player = players.find(p => p.uid === uid);
        if (player) setSavedPlayers(sp => ({ ...sp, [uid]: player }));
        return [...prev, uid];
      }
    });
  }, [players]);

  const createShortlist = useCallback((name: string, saveGameId?: string) => {
    const id = `sl-${Date.now()}`;
    setShortlists(prev => [...prev, { id, name, playerUids: [], saveGameId }]);
    return id;
  }, []);

  const createSaveGame = useCallback((name: string) => {
    const id = `sg-${Date.now()}`;
    setSaveGames(prev => [...prev, { id, name }]);
    return id;
  }, []);

  const deleteSaveGame = useCallback((id: string) => {
    setShortlists(prev => prev.map(s =>
      s.saveGameId === id ? { ...s, saveGameId: undefined } : s
    ));
    setSaveGames(prev => prev.filter(sg => sg.id !== id));
  }, []);

  const renameSaveGame = useCallback((id: string, name: string) => {
    setSaveGames(prev => prev.map(sg => sg.id === id ? { ...sg, name } : sg));
  }, []);

  const deleteShortlist = useCallback((id: string) => {
    setShortlists(prev => prev.filter(s => s.id !== id));
  }, []);

  const addToShortlist = useCallback((shortlistId: string, uid: string) => {
    setShortlists(prev => prev.map(s =>
      s.id === shortlistId && !s.playerUids.includes(uid)
        ? { ...s, playerUids: [...s.playerUids, uid] }
        : s
    ));
  }, []);

  const removeFromShortlist = useCallback((shortlistId: string, uid: string) => {
    setShortlists(prev => prev.map(s =>
      s.id === shortlistId
        ? { ...s, playerUids: s.playerUids.filter(id => id !== uid) }
        : s
    ));
  }, []);

  const getFavouritePlayers = useCallback(() => {
    return favourites.map(uid => players.find(p => p.uid === uid)).filter(Boolean) as Player[];
  }, [favourites, players]);

  const setSearchResults = useCallback((results: Player[], roleKey: string | null = null) => {
    setSearchResults_(results);
    setFocusRoleKey(roleKey);
  }, []);

  // When a new file is imported, save player data for any favourite UIDs found in it
  const syncSavedPlayers = useCallback((importedPlayers: Player[]) => {
    const importMap = new Map(importedPlayers.map(p => [p.uid, p]));
    setFavourites(prev => {
      setSavedPlayers(sp => {
        const updated = { ...sp };
        prev.forEach(uid => {
          const player = importMap.get(uid);
          if (player) updated[uid] = player;
        });
        return updated;
      });
      return prev;
    });
  }, []);

  return {
    players, setPlayers,
    searchResults, setSearchResults,
    focusRoleKey,
    lastQuery, setLastQuery,
    favourites, toggleFavourite,
    shortlists, createShortlist, deleteShortlist, addToShortlist, removeFromShortlist,
    saveGames, createSaveGame, deleteSaveGame, renameSaveGame,
    geminiKey, setGeminiKey,
    getFavouritePlayers,
    savedPlayers, syncSavedPlayers,
  };
}
