import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../store/useStore';

describe('Phase 5 — State Hook (useStore)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with no players', () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.players).toHaveLength(0);
    });

    it('starts with empty favourites', () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.favourites).toHaveLength(0);
    });

    it('starts with no save games', () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.saveGames).toHaveLength(0);
    });

    it('starts with no shortlists', () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.shortlists).toHaveLength(0);
    });

    it('starts with an empty gemini key', () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.geminiKey).toBe('');
    });

    it('starts with empty search results', () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.searchResults).toHaveLength(0);
    });
  });

  describe('save games', () => {
    it('createSaveGame adds a save game with the given name', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.createSaveGame('FM Save 2024'); });
      expect(result.current.saveGames).toHaveLength(1);
      expect(result.current.saveGames[0].name).toBe('FM Save 2024');
    });

    it('createSaveGame returns an id prefixed with "sg-"', () => {
      const { result } = renderHook(() => useStore());
      let id!: string;
      act(() => { id = result.current.createSaveGame('Test'); });
      expect(id).toMatch(/^sg-/);
    });

    it('deleteSaveGame removes the save game', () => {
      const { result } = renderHook(() => useStore());
      let id!: string;
      act(() => { id = result.current.createSaveGame('To Delete'); });
      act(() => { result.current.deleteSaveGame(id); });
      expect(result.current.saveGames).toHaveLength(0);
    });

    it('renameSaveGame updates the name', () => {
      const { result } = renderHook(() => useStore());
      let id!: string;
      act(() => { id = result.current.createSaveGame('Original'); });
      act(() => { result.current.renameSaveGame(id, 'Renamed'); });
      expect(result.current.saveGames[0].name).toBe('Renamed');
    });

    it('can create multiple save games', () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.createSaveGame('Save A');
        result.current.createSaveGame('Save B');
      });
      expect(result.current.saveGames).toHaveLength(2);
    });

    it('deleteSaveGame unlinks associated shortlists (sets saveGameId to undefined)', () => {
      const { result } = renderHook(() => useStore());
      let sgId!: string;
      act(() => { sgId = result.current.createSaveGame('Test Save'); });
      act(() => { result.current.createShortlist('My List', sgId); });
      expect(result.current.shortlists[0].saveGameId).toBe(sgId);
      act(() => { result.current.deleteSaveGame(sgId); });
      expect(result.current.shortlists[0].saveGameId).toBeUndefined();
    });
  });

  describe('favourites', () => {
    it('toggleFavourite adds a uid to favourites', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.toggleFavourite('player-1'); });
      expect(result.current.favourites).toContain('player-1');
    });

    it('toggleFavourite removes a uid that is already favourited', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.toggleFavourite('player-1'); });
      act(() => { result.current.toggleFavourite('player-1'); });
      expect(result.current.favourites).not.toContain('player-1');
    });

    it('can favourite multiple different players', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.toggleFavourite('p1'); });
      act(() => { result.current.toggleFavourite('p2'); });
      act(() => { result.current.toggleFavourite('p3'); });
      expect(result.current.favourites).toHaveLength(3);
    });

    it('persists favourites to localStorage', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.toggleFavourite('stored-player'); });
      const stored = JSON.parse(localStorage.getItem('fm-traj-favourites') ?? '[]');
      expect(stored).toContain('stored-player');
    });
  });

  describe('shortlists', () => {
    it('createShortlist adds a shortlist with the given name', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.createShortlist('Top Targets'); });
      expect(result.current.shortlists).toHaveLength(1);
      expect(result.current.shortlists[0].name).toBe('Top Targets');
    });

    it('createShortlist returns an id prefixed with "sl-"', () => {
      const { result } = renderHook(() => useStore());
      let id!: string;
      act(() => { id = result.current.createShortlist('List'); });
      expect(id).toMatch(/^sl-/);
    });

    it('createShortlist associates a saveGameId when provided', () => {
      const { result } = renderHook(() => useStore());
      let sgId!: string;
      act(() => { sgId = result.current.createSaveGame('Save'); });
      act(() => { result.current.createShortlist('Scoped List', sgId); });
      expect(result.current.shortlists[0].saveGameId).toBe(sgId);
    });

    it('deleteShortlist removes it', () => {
      const { result } = renderHook(() => useStore());
      let slId!: string;
      act(() => { slId = result.current.createShortlist('To Delete'); });
      act(() => { result.current.deleteShortlist(slId); });
      expect(result.current.shortlists).toHaveLength(0);
    });

    it('addToShortlist adds a player uid', () => {
      const { result } = renderHook(() => useStore());
      let slId!: string;
      act(() => { slId = result.current.createShortlist('List'); });
      act(() => { result.current.addToShortlist(slId, 'player-1'); });
      expect(result.current.shortlists[0].playerUids).toContain('player-1');
    });

    it('addToShortlist does not add duplicate uids', () => {
      const { result } = renderHook(() => useStore());
      let slId!: string;
      act(() => { slId = result.current.createShortlist('List'); });
      act(() => { result.current.addToShortlist(slId, 'player-1'); });
      act(() => { result.current.addToShortlist(slId, 'player-1'); });
      expect(result.current.shortlists[0].playerUids).toHaveLength(1);
    });

    it('removeFromShortlist removes a player uid', () => {
      const { result } = renderHook(() => useStore());
      let slId!: string;
      act(() => { slId = result.current.createShortlist('List'); });
      act(() => { result.current.addToShortlist(slId, 'player-1'); });
      act(() => { result.current.removeFromShortlist(slId, 'player-1'); });
      expect(result.current.shortlists[0].playerUids).toHaveLength(0);
    });

    it('new shortlist starts with empty playerUids', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.createShortlist('Empty'); });
      expect(result.current.shortlists[0].playerUids).toEqual([]);
    });
  });

  describe('favouriteSaveGames', () => {
    it('setFavouriteSaveGame associates a uid with a save game id', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.setFavouriteSaveGame('player-1', 'sg-abc'); });
      expect(result.current.favouriteSaveGames['player-1']).toBe('sg-abc');
    });

    it('setFavouriteSaveGame with undefined clears the association', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.setFavouriteSaveGame('player-1', 'sg-abc'); });
      act(() => { result.current.setFavouriteSaveGame('player-1', undefined); });
      expect(result.current.favouriteSaveGames['player-1']).toBeUndefined();
    });

    it('deleteSaveGame clears favouriteSaveGames entries for that save', () => {
      const { result } = renderHook(() => useStore());
      let sgId!: string;
      act(() => { sgId = result.current.createSaveGame('Save'); });
      act(() => { result.current.setFavouriteSaveGame('player-1', sgId); });
      act(() => { result.current.deleteSaveGame(sgId); });
      expect(result.current.favouriteSaveGames['player-1']).toBeUndefined();
    });
  });

  describe('gemini key', () => {
    it('setGeminiKey updates the key in state', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.setGeminiKey('my-api-key-123'); });
      expect(result.current.geminiKey).toBe('my-api-key-123');
    });

    it('setGeminiKey persists immediately to localStorage', () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.setGeminiKey('stored-key'); });
      expect(localStorage.getItem('fm-traj-gemini-key')).toBe('"stored-key"');
    });
  });

  describe('localStorage persistence', () => {
    it('restores save games from localStorage on mount', () => {
      localStorage.setItem('fm-traj-save-games', JSON.stringify([{ id: 'sg-1', name: 'Existing Save' }]));
      const { result } = renderHook(() => useStore());
      expect(result.current.saveGames).toHaveLength(1);
      expect(result.current.saveGames[0].name).toBe('Existing Save');
    });

    it('restores favourites from localStorage on mount', () => {
      localStorage.setItem('fm-traj-favourites', JSON.stringify(['uid-a', 'uid-b']));
      const { result } = renderHook(() => useStore());
      expect(result.current.favourites).toContain('uid-a');
      expect(result.current.favourites).toContain('uid-b');
    });

    it('falls back gracefully when localStorage contains invalid JSON', () => {
      localStorage.setItem('fm-traj-favourites', 'not-valid-json{{{');
      const { result } = renderHook(() => useStore());
      // Should fall back to empty array, not throw
      expect(result.current.favourites).toEqual([]);
    });
  });
});
