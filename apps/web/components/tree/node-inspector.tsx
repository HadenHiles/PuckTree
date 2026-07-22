'use client';

/**
 * Node Inspector
 * 
 * Contextual editor panel for selected tree nodes.
 * Allows editing asset and transaction properties with protected user edits.
 */

import * as React from 'react';
import { X, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTreeStore } from '@/lib/stores/tree-store';
import type { PlayerSearchCandidate } from '@/lib/nhl/types';

export function NodeInspector() {
  const {
    document,
    selectedNodeId,
    setSelectedNode,
    updateAsset,
    updateTransaction,
  } = useTreeStore();

  const [isEditing, setIsEditing] = React.useState(false);

  if (!selectedNodeId || !document) {
    return null;
  }

  // Determine if this is an asset or transaction
  const asset = document.assetsById[selectedNodeId];
  const transaction = document.tradesById[selectedNodeId];

  if (!asset && !transaction) {
    return null;
  }

  const handleClose = () => {
    setSelectedNode(null);
    setIsEditing(false);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-lg z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-lg text-slate-900">Inspector</h2>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {asset && (
          <AssetInspector
            asset={asset}
            isEditing={isEditing}
            onSave={(updates) => {
              updateAsset(asset.id, updates);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}
        {transaction && (
          <TransactionInspector
            transaction={transaction}
            isEditing={isEditing}
            onSave={(updates) => {
              updateTransaction(transaction.id, updates);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>
    </div>
  );
}

interface AssetInspectorProps {
  asset: any;
  isEditing: boolean;
  onSave: (updates: any) => void;
  onCancel: () => void;
}

function AssetInspector({
  asset,
  isEditing,
  onSave,
  onCancel,
}: AssetInspectorProps) {
  const [displayLabel, setDisplayLabel] = React.useState(
    asset.data.displayLabel || ''
  );
  const [kind, setKind] = React.useState<'player' | 'draft-pick' | 'custom'>(
    asset.kind
  );

  // Player-specific fields
  const [playerName, setPlayerName] = React.useState(
    asset.data.playerRef?.playerName || ''
  );
  const [position, setPosition] = React.useState(
    asset.data.playerRef?.position || ''
  );
  const [nhlPlayerId, setNhlPlayerId] = React.useState(
    asset.data.playerRef?.nhlPlayerId || ''
  );
  const [identityCandidates, setIdentityCandidates] = React.useState<PlayerSearchCandidate[]>([]);
  const [isSearchingIdentities, setIsSearchingIdentities] = React.useState(false);
  const [identitySearchError, setIdentitySearchError] = React.useState<string | null>(null);

  // Draft pick fields
  const [draftYear, setDraftYear] = React.useState(
    asset.data.draftYear?.toString() || ''
  );
  const [round, setRound] = React.useState(
    asset.data.round?.toString() || ''
  );

  const handleSave = () => {
    const updates: any = {
      kind,
      data: {
        ...asset.data,
        displayLabel,
      },
    };

    if (kind === 'player' && playerName) {
      updates.data.playerRef = {
        ...asset.data.playerRef,
        playerName,
        normalizedName: asset.data.playerRef?.normalizedName || playerName.toLowerCase(),
        nhlPlayerId: nhlPlayerId || null,
        position,
        confidence: 'manual',
      };
      updates.data.confidence = 'manual';
    }

    if (kind === 'draft-pick') {
      updates.data.draftYear = draftYear ? parseInt(draftYear) : null;
      updates.data.round = round ? parseInt(round) : null;
    }

    onSave(updates);
  };

  const handleIdentitySearch = async () => {
    if (playerName.trim().length < 2) {
      setIdentitySearchError('Enter at least two characters to search the NHL player directory.');
      return;
    }

    setIsSearchingIdentities(true);
    setIdentitySearchError(null);
    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(playerName)}&limit=5`);
      if (!response.ok) throw new Error('Player search failed');
      const data = await response.json() as { players?: PlayerSearchCandidate[] };
      setIdentityCandidates(data.players ?? []);
    } catch {
      setIdentitySearchError('Player search is unavailable. You can still enter an NHL Player ID manually.');
    } finally {
      setIsSearchingIdentities(false);
    }
  };

  const handleIdentitySelection = (candidate: PlayerSearchCandidate) => {
    setPlayerName(candidate.fullName);
    setPosition(candidate.position);
    setNhlPlayerId(candidate.playerId);
    setIdentityCandidates([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
          Asset Type
        </div>
        <div className="text-sm text-slate-700">{asset.kind}</div>
      </div>

      {asset.userEditedFields?.length > 0 && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-medium">Protected correction</span>
          <p className="mt-1 text-amber-800">
            Your edits to {asset.userEditedFields.join(', ')} will be retained when this tree is refreshed.
          </p>
        </div>
      )}

      {isEditing ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="kind">Asset Kind</Label>
            <Select value={kind} onValueChange={(v: any) => setKind(v)}>
              <SelectTrigger id="kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="draft-pick">Draft Pick</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayLabel">Display Label</Label>
            <Input
              id="displayLabel"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              placeholder="e.g., Phil Kessel"
            />
          </div>

          {kind === 'player' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="playerName">Player Name</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g., Right Wing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nhlPlayerId">NHL Player ID</Label>
                <Input
                  id="nhlPlayerId"
                  value={nhlPlayerId}
                  onChange={(e) => setNhlPlayerId(e.target.value)}
                  placeholder="Confirm the player identity"
                />
                <p className="text-xs text-slate-500">
                  Saving confirms this player identity and protects it from provider updates.
                </p>
              </div>

              <div className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Resolve player identity</p>
                    <p className="text-xs text-slate-500">Choose the correct NHL directory result before saving.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={handleIdentitySearch} disabled={isSearchingIdentities}>
                    {isSearchingIdentities ? 'Searching…' : 'Find matches'}
                  </Button>
                </div>

                {identitySearchError && <p className="mt-2 text-xs text-red-700">{identitySearchError}</p>}
                {identityCandidates.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {identityCandidates.map((candidate) => (
                      <button
                        key={candidate.playerId}
                        type="button"
                        onClick={() => handleIdentitySelection(candidate)}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-left text-sm hover:border-slate-400 hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">{candidate.fullName}</span>
                        <span className="ml-2 text-slate-500">{candidate.position}{candidate.teamAbbrev ? ` · ${candidate.teamAbbrev}` : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {kind === 'draft-pick' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="draftYear">Draft Year</Label>
                <Input
                  id="draftYear"
                  type="number"
                  value={draftYear}
                  onChange={(e) => setDraftYear(e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="round">Round</Label>
                <Input
                  id="round"
                  type="number"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  placeholder="e.g., 1"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
              Display Label
            </div>
            <div className="text-sm text-slate-900">{asset.data.displayLabel}</div>
          </div>

          {asset.kind === 'player' && asset.data.playerRef && (
            <>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                  Player Name
                </div>
                <div className="text-sm text-slate-900">
                  {asset.data.playerRef.playerName}
                </div>
              </div>

              {asset.data.playerRef.position && (
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                    Position
                  </div>
                  <div className="text-sm text-slate-900">
                    {asset.data.playerRef.position}
                  </div>
                </div>
              )}
            </>
          )}

          {asset.kind === 'draft-pick' && (
            <>
              {asset.data.draftYear && (
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                    Draft Year
                  </div>
                  <div className="text-sm text-slate-900">{asset.data.draftYear}</div>
                </div>
              )}

              {asset.data.round && (
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                    Round
                  </div>
                  <div className="text-sm text-slate-900">Round {asset.data.round}</div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

interface TransactionInspectorProps {
  transaction: any;
  isEditing: boolean;
  onSave: (updates: any) => void;
  onCancel: () => void;
}

function TransactionInspector({
  transaction,
  isEditing,
  onSave,
  onCancel,
}: TransactionInspectorProps) {
  const [transactionDate, setTransactionDate] = React.useState(
    transaction.transactionDate
  );
  const [kind, setKind] = React.useState(transaction.kind);

  const handleSave = () => {
    onSave({
      transactionDate,
      kind,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
          Transaction Type
        </div>
        <div className="text-sm text-slate-700">{transaction.kind}</div>
      </div>

      {isEditing ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              id="transactionDate"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kind">Transaction Kind</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger id="kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trade">Trade</SelectItem>
                <SelectItem value="waiver">Waiver</SelectItem>
                <SelectItem value="signing">Signing</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
              Date
            </div>
            <div className="text-sm text-slate-900">
              {new Date(transaction.transactionDate).toLocaleDateString()}
            </div>
          </div>

          {transaction.teams && transaction.teams.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                Teams
              </div>
              <div className="space-y-1">
                {transaction.teams.map((team: any, idx: number) => (
                  <div key={idx} className="text-sm text-slate-900">
                    {team.teamName} ({team.abbreviation})
                  </div>
                ))}
              </div>
            </div>
          )}

          {transaction.sourceRefs && transaction.sourceRefs.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                Source
              </div>
              <div className="text-sm text-slate-900">
                {transaction.sourceRefs[0].sourceName}
              </div>
              {transaction.sourceRefs[0].sourceUrl && (
                <a
                  href={transaction.sourceRefs[0].sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Source
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
