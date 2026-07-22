'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerSearch } from '@/components/player/player-search';
import { TradePicker } from '@/components/player/trade-picker';
import { useTreeStore } from '@/lib/stores/tree-store';
import type { PlayerSearchCandidate } from '@/lib/nhl/types';
import type { NormalizedTransactionCandidate } from '@pucktree/domain';

export default function HomePage() {
  const router = useRouter();
  const loadTree = useTreeStore((state) => state.loadTree);
  const createBlankTree = useTreeStore((state) => state.createBlankTree);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSearchCandidate | null>(null);

  const handleSelectPlayer = (player: PlayerSearchCandidate) => {
    setSelectedPlayer(player);
  };

  const handleSelectTrade = (trade: NormalizedTransactionCandidate) => {
    // Load trade into store
    loadTree(trade);
    
    // Navigate to tree editor
    const treeId = trade.id || `tree-${Date.now()}`;
    router.push(`/tree/${treeId}`);
  };

  const handleBack = () => {
    setSelectedPlayer(null);
  };

  const handleManualEntry = () => {
    const treeId = createBlankTree();
    router.push(`/tree/${treeId}`);
  };

  // Show trade picker if player is selected
  if (selectedPlayer) {
    return (
      <TradePicker
        player={selectedPlayer}
        onSelectTrade={handleSelectTrade}
        onBack={handleBack}
        onManualEntry={handleManualEntry}
      />
    );
  }

  // Show landing page with player search
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            PuckTree
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Follow every branch of a hockey trade
          </p>
          <p className="text-sm text-slate-500">
            Pick a player, choose a trade, and follow what happened next.
          </p>
        </div>

        {/* Player Search */}
        <div className="max-w-2xl mx-auto mb-16">
          <PlayerSearch
            onSelectPlayer={handleSelectPlayer}
            onManualEntry={handleManualEntry}
            placeholder="Search any NHL player"
          />
        </div>

        {/* Sample Trees Placeholder */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
            Sample Trees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video bg-white rounded-lg shadow-md border-2 border-dashed border-slate-200 flex items-center justify-center"
              >
                <span className="text-slate-400">Sample {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="max-w-6xl mx-auto mt-16 text-center">
          <div className="flex justify-center gap-6 text-sm text-slate-500">
            <a href="/about" className="hover:text-slate-900">
              About
            </a>
            <a href="/data-sources" className="hover:text-slate-900">
              Data Sources
            </a>
            <a href="/diagnostics" className="hover:text-slate-900">
              Diagnostics
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
