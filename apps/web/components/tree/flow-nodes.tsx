'use client';

/**
 * Custom React Flow nodes for PuckTree
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NormalizedAssetCandidate, NormalizedTeamRef } from '@pucktree/domain';

/**
 * Player Asset Node
 */

export interface AssetNodeData {
  asset: NormalizedAssetCandidate;
  kind: 'player' | 'draft-pick' | 'custom';
}

interface AssetNodeProps {
  data: AssetNodeData;
  selected?: boolean;
}

export const AssetNode = memo(({ data, selected }: AssetNodeProps) => {
  const { asset, kind } = data;

  if (!asset || !kind) {
    return null;
  }

  if (kind === 'player' && asset.playerRef) {
    return (
      <div
        className={cn(
          'bg-white rounded-lg shadow-md border-2 transition-all',
          selected ? 'border-blue-500 shadow-lg' : 'border-slate-200',
          'hover:border-slate-300 hover:shadow-lg'
        )}
        style={{ width: 200 }}
      >
        <Handle type="target" position={Position.Left} className="!bg-slate-400" />
        <Handle type="source" position={Position.Right} className="!bg-slate-400" />

        {/* Player headshot */}
        <div className="relative h-32 bg-gradient-to-b from-slate-100 to-slate-50 rounded-t-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-12 w-12 text-slate-300" />
          </div>
        </div>

        {/* Player info */}
        <div className="p-3">
          <div className="font-semibold text-slate-900 text-sm truncate">
            {asset.playerRef.playerName || 'Unknown Player'}
          </div>
          {asset.playerRef.position && (
            <div className="text-xs text-slate-500 mt-1">
              {asset.playerRef.position}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (kind === 'draft-pick' && asset.draftYear) {
    return (
      <div
        className={cn(
          'bg-white rounded-lg shadow-md border-2 transition-all',
          selected ? 'border-blue-500 shadow-lg' : 'border-slate-200',
          'hover:border-slate-300 hover:shadow-lg p-4'
        )}
        style={{ width: 180 }}
      >
        <Handle type="target" position={Position.Left} className="!bg-slate-400" />
        <Handle type="source" position={Position.Right} className="!bg-slate-400" />

        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">
            {asset.draftYear || '????'}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {asset.round ? `Round ${asset.round}` : 'Draft Pick'}
          </div>
          {asset.overall && (
            <div className="text-xs text-slate-500 mt-1">
              {asset.overall}th overall
            </div>
          )}
        </div>
      </div>
    );
  }

  // Custom asset
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border-2 transition-all p-4',
        selected ? 'border-blue-500 shadow-lg' : 'border-slate-200',
        'hover:border-slate-300 hover:shadow-lg'
      )}
      style={{ width: 180 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />

      <div className="text-sm text-slate-900 text-center">
        {asset.displayLabel || 'Unknown Asset'}
      </div>
    </div>
  );
});

AssetNode.displayName = 'AssetNode';

/**
 * Transaction Node
 */

export interface TransactionNodeData {
  date: string;
  kind: string;
  teams: NormalizedTeamRef[];
  confidence: string;
}

interface TransactionNodeProps {
  data: TransactionNodeData;
  selected?: boolean;
}

export const TransactionNode = memo(({ data, selected }: TransactionNodeProps) => {
  const { teams = [], date, kind = 'trade', confidence } = data;

  if (!date) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-slate-900 text-white rounded-lg shadow-lg border-2 transition-all',
        selected ? 'border-blue-400 shadow-xl' : 'border-slate-700',
        'hover:border-slate-600'
      )}
      style={{ width: 220 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />

      <div className="p-4">
        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-400" />
          <div className="text-sm font-medium">
            {new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Teams involved */}
        <div className="space-y-1">
          {teams.slice(0, 2).map((team, idx) => (
            <div key={team.teamId || idx} className="text-xs text-slate-300">
              {team.teamName || team.abbreviation || 'Unknown Team'}
            </div>
          ))}
          {teams.length > 2 && (
            <div className="text-xs text-slate-400">
              +{teams.length - 2} more
            </div>
          )}
        </div>

        {/* Transaction type */}
        <div className="mt-2 text-xs text-slate-400 capitalize">
          {kind}
        </div>

        {/* Confidence indicator */}
        {confidence && confidence !== 'verified' && (
          <div className="mt-2 text-xs text-yellow-400 capitalize">
            {confidence}
          </div>
        )}
      </div>
    </div>
  );
});

TransactionNode.displayName = 'TransactionNode';

// Export node types for React Flow
export const nodeTypes = {
  asset: AssetNode,
  transaction: TransactionNode,
};
