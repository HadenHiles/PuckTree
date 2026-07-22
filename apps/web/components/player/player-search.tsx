'use client';

/**
 * Player search combobox
 * 
 * Photo-backed autocomplete for NHL player search.
 * Debounces input and shows up to 8 results with headshots and team badges.
 */

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { PlayerSearchCandidate } from '@/lib/nhl/types';

interface PlayerSearchProps {
  onSelectPlayer: (player: PlayerSearchCandidate) => void;
  onManualEntry?: () => void;
  placeholder?: string;
  className?: string;
}

export function PlayerSearch({
  onSelectPlayer,
  onManualEntry,
  placeholder = 'Search any NHL player',
  className,
}: PlayerSearchProps) {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch player search results
  const { data, isLoading } = useQuery({
    queryKey: ['players', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { players: [] };
      }

      const response = await fetch(
        `/api/players/search?q=${encodeURIComponent(debouncedQuery)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search players');
      }

      return response.json() as Promise<{ players: PlayerSearchCandidate[] }>;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const players = data?.players ?? [];
  const showResults = isOpen && query.length >= 2;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle player selection
  const handleSelectPlayer = (player: PlayerSearchCandidate) => {
    onSelectPlayer(player);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle manual entry
  const handleManualEntry = () => {
    if (onManualEntry) {
      onManualEntry();
      setQuery('');
      setIsOpen(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    const maxIndex = players.length + (onManualEntry ? 0 : -1);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < players.length) {
          const player = players[selectedIndex];
          if (player) {
            handleSelectPlayer(player);
          }
        } else if (selectedIndex === players.length && onManualEntry) {
          handleManualEntry();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 text-base h-12"
          aria-label="Search for NHL player"
          aria-expanded={showResults}
          aria-controls="player-search-results"
          aria-activedescendant={
            selectedIndex >= 0 ? `player-${selectedIndex}` : undefined
          }
        />
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          id="player-search-results"
          className="absolute z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg"
          role="listbox"
        >
          {isLoading && (
            <div className="p-4 text-center text-sm text-slate-500">
              Searching...
            </div>
          )}

          {!isLoading && players.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-500">
              No players found
            </div>
          )}

          {!isLoading && players.length > 0 && (
            <div className="py-1">
              {players.map((player, index) => (
                <button
                  key={player.playerId}
                  id={`player-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => handleSelectPlayer(player)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    'hover:bg-slate-50 focus:bg-slate-50 focus:outline-none',
                    index === selectedIndex && 'bg-slate-100'
                  )}
                >
                  {/* Player headshot */}
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                    {player.headshotUrl ? (
                      <img
                        src={player.headshotUrl}
                        alt={player.fullName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center',
                        player.headshotUrl && 'hidden'
                      )}
                    >
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">
                      {player.fullName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {player.position}
                      {player.teamAbbrev && ` · ${player.teamAbbrev}`}
                      {player.sweaterNumber && ` · #${player.sweaterNumber}`}
                    </div>
                  </div>

                  {/* Career years */}
                  {player.careerYears && (
                    <div className="flex-shrink-0 text-xs text-slate-400">
                      {player.careerYears}
                    </div>
                  )}
                </button>
              ))}

              {/* Manual entry option */}
              {onManualEntry && (
                <button
                  id={`player-${players.length}`}
                  role="option"
                  aria-selected={selectedIndex === players.length}
                  onClick={handleManualEntry}
                  className={cn(
                    'flex w-full items-center gap-3 border-t border-slate-100 px-3 py-2.5 text-left transition-colors',
                    'hover:bg-slate-50 focus:bg-slate-50 focus:outline-none',
                    selectedIndex === players.length && 'bg-slate-100'
                  )}
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="flex-1 text-sm font-medium text-slate-700">
                    Enter player manually
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
