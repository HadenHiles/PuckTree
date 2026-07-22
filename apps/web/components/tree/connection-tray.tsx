'use client';

/**
 * Connection tray for branch discovery
 * 
 * Shows suggested next trades for a selected asset.
 */

import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ConnectionSuggestion } from '@/lib/stores/tree-store';

interface ConnectionTrayProps {
  assetId: string | null;
  connections: ConnectionSuggestion[];
  isLoading: boolean;
  onAdd: (connectionId: string) => void;
  onDismiss: (connectionId: string) => void;
  onClose: () => void;
}

export function ConnectionTray({
  assetId,
  connections,
  isLoading,
  onAdd,
  onDismiss,
  onClose,
}: ConnectionTrayProps) {
  if (!assetId) return null;

  const visibleConnections = connections.filter((c) => !c.dismissed);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 max-h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-900">Branch Suggestions</h3>
          <p className="text-sm text-slate-600">
            {isLoading ? 'Loading connections...' : `${visibleConnections.length} suggested trade${visibleConnections.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Connection list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : visibleConnections.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No additional trades found for this player.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleConnections.map((connection) => (
              <div
                key={connection.id}
                className="border rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-slate-900">
                        {new Date(connection.transactionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 capitalize">
                        {connection.kind}
                      </span>
                      {connection.confidence !== 'verified' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 capitalize">
                          {connection.confidence}
                        </span>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="text-sm text-slate-600 mb-2">
                      {connection.teams.slice(0, 2).map((team, idx) => (
                        <span key={team.teamId || idx}>
                          {team.teamName || team.abbreviation}
                          {idx < Math.min(connection.teams.length, 2) - 1 && ' · '}
                        </span>
                      ))}
                      {connection.teams.length > 2 && (
                        <span className="text-slate-400"> +{connection.teams.length - 2} more</span>
                      )}
                    </div>

                    {/* Asset count */}
                    <div className="text-xs text-slate-500">
                      {connection.assets.length} asset{connection.assets.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDismiss(connection.id)}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAdd(connection.id)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Branch
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
