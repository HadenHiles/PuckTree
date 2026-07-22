'use client';

/**
 * Trade picker component
 * 
 * Shows a list of trades for a selected player.
 * Each trade card displays date, teams involved, and asset summary.
 */

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowLeftRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PlayerSearchCandidate } from '@/lib/nhl/types';
import type { NormalizedTransactionCandidate } from '@pucktree/domain';

interface TradePickerProps {
  player: PlayerSearchCandidate;
  onSelectTrade: (trade: NormalizedTransactionCandidate) => void;
  onBack?: () => void;
  onManualEntry?: () => void;
}

interface TradesResponse {
  trades: NormalizedTransactionCandidate[];
  rawCount: number;
  provider: string;
  cached: boolean;
  retrievedAt: string;
  error?: string;
}

export function TradePicker({
  player,
  onSelectTrade,
  onBack,
  onManualEntry,
}: TradePickerProps) {
  // Fetch player trades
  const { data, isLoading, error } = useQuery({
    queryKey: ['player', player.playerId, 'trades'],
    queryFn: async () => {
      const response = await fetch(
        `/api/players/${player.playerId}/trades?playerName=${encodeURIComponent(player.fullName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trades');
      }

      return response.json() as Promise<TradesResponse>;
    },
  });

  const trades = data?.trades ?? [];
  const hasError = error || data?.error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header with player info */}
        <div className="mb-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              ← Back to search
            </Button>
          )}

          <div className="flex items-center gap-4 mb-6">
            {/* Player headshot */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
              {player.headshotUrl && (
                <img
                  src={player.headshotUrl}
                  alt={player.fullName}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Player info */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {player.fullName}
              </h1>
              <p className="text-slate-600">
                {player.position}
                {player.teamAbbrev && ` · ${player.teamAbbrev}`}
                {player.sweaterNumber && ` · #${player.sweaterNumber}`}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-700">
            Choose a trade to trace
          </h2>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="ml-3 text-slate-600">Finding transactions...</span>
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6 mb-6">
            <p className="text-yellow-900 mb-4">
              {data?.error || 'Unable to fetch trade history automatically.'}
            </p>
            {onManualEntry && (
              <Button variant="outline" onClick={onManualEntry}>
                Add a trade manually
              </Button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasError && trades.length === 0 && (
          <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
            <p className="text-slate-600 mb-4">
              No trade history was found for {player.fullName}.
            </p>
            <div className="flex gap-3 justify-center">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Try another player
                </Button>
              )}
              {onManualEntry && (
                <Button onClick={onManualEntry}>
                  Add a trade manually
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Trade list */}
        {!isLoading && trades.length > 0 && (
          <div className="space-y-4">
            {trades.map((trade, index) => (
              <TradeCard
                key={trade.id || index}
                trade={trade}
                onClick={() => onSelectTrade(trade)}
              />
            ))}

            {/* Manual entry option */}
            {onManualEntry && (
              <button
                onClick={onManualEntry}
                className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-white p-6 text-center hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-700 font-medium">
                  + Add a missing trade manually
                </span>
              </button>
            )}
          </div>
        )}

        {/* Provider info */}
        {data && !isLoading && (
          <div className="mt-8 text-center text-xs text-slate-400">
            {data.cached && `Cached ${data.provider} data`}
            {data.retrievedAt && ` · Retrieved ${new Date(data.retrievedAt).toLocaleDateString()}`}
          </div>
        )}
      </div>
    </div>
  );
}

interface TradeCardProps {
  trade: NormalizedTransactionCandidate;
  onClick: () => void;
}

function TradeCard({ trade, onClick }: TradeCardProps) {
  const teamsInvolved = trade.teams || [];
  const assetsCount = trade.assets?.length || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg bg-white border border-slate-200 p-6',
        'hover:border-slate-300 hover:shadow-md transition-all',
        'text-left focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Date */}
        <div className="flex-shrink-0 text-center">
          <Calendar className="h-5 w-5 text-slate-400 mx-auto mb-1" />
          <div className="text-sm font-medium text-slate-900">
            {new Date(trade.transactionDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(trade.transactionDate).getFullYear()}
          </div>
        </div>

        {/* Trade info */}
        <div className="flex-1 min-w-0">
          {/* Teams */}
          <div className="flex items-center gap-2 mb-3">
            {teamsInvolved.slice(0, 2).map((team, idx) => (
              <React.Fragment key={team.teamId || idx}>
                {idx > 0 && <ArrowLeftRight className="h-4 w-4 text-slate-400" />}
                <span className="font-medium text-slate-900">
                  {team.teamName || 'Unknown Team'}
                </span>
              </React.Fragment>
            ))}
            {teamsInvolved.length > 2 && (
              <span className="text-sm text-slate-500">
                +{teamsInvolved.length - 2} more
              </span>
            )}
          </div>

          {/* Transaction type and assets */}
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="capitalize">{trade.kind || 'trade'}</span>
            <span className="text-slate-300">·</span>
            <span>{assetsCount} {assetsCount === 1 ? 'asset' : 'assets'}</span>
            {trade.confidence && trade.confidence !== 'verified' && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-yellow-600 capitalize">
                  {trade.confidence}
                </span>
              </>
            )}
          </div>

          {/* Review reasons */}
          {trade.reviewReasons && trade.reviewReasons.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              Needs review: {trade.reviewReasons.join(', ')}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-600">→</span>
          </div>
        </div>
      </div>
    </button>
  );
}
