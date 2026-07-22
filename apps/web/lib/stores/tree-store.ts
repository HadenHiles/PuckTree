/**
 * Tree editor store
 * 
 * Manages the PuckTree document state and React Flow derived state.
 * Domain model is kept separate from React Flow nodes/edges.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Node, Edge } from '@xyflow/react';
import type {
  NormalizedTransactionCandidate,
  NormalizedAssetCandidate,
  NormalizedTeamRef,
} from '@pucktree/domain';

/**
 * Domain types for PuckTree document
 */

export interface TreeDocument {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  rootTradeId: string;
  tradesById: Record<string, TradeEvent>;
  assetsById: Record<string, AssetNode>;
}

export interface TradeEvent {
  id: string;
  transactionDate: string;
  kind: string;
  teams: NormalizedTeamRef[];
  assetIds: string[];
  sourceRefs: SourceRef[];
  confidence: string;
}

export interface AssetNode {
  id: string;
  kind: 'player' | 'draft-pick' | 'custom';
  data: NormalizedAssetCandidate;
  receivingTeamId: string | null;
}

export interface SourceRef {
  id: string;
  provider: string;
  sourceName: string;
  sourceUrl: string | null;
  retrievedAt: string;
}

/**
 * Store state and actions
 */

interface TreeState {
  // Document state
  document: TreeDocument | null;
  
  // React Flow state (derived)
  nodes: Node[];
  edges: Edge[];
  
  // UI state
  selectedNodeId: string | null;
  isSourceDrawerOpen: boolean;
  
  // Actions
  loadTree: (trade: NormalizedTransactionCandidate) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleSourceDrawer: () => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
}

export const useTreeStore = create<TreeState>()(
  immer((set) => ({
    document: null,
    nodes: [],
    edges: [],
    selectedNodeId: null,
    isSourceDrawerOpen: false,

    loadTree: (trade) => {
      set((state) => {
        // Create tree document from trade
        const treeId = `tree-${Date.now()}`;
        const tradeId = trade.id || `trade-${Date.now()}`;

        // Convert normalized transaction to domain model
        const tradeEvent: TradeEvent = {
          id: tradeId,
          transactionDate: trade.transactionDate,
          kind: trade.kind || 'trade',
          teams: trade.teams || [],
          assetIds: (trade.assets || []).map((a) => a.id || `asset-${Math.random()}`),
          sourceRefs: [{
            id: trade.source.id || `ref-${Math.random()}`,
            provider: trade.source.provider || 'unknown',
            sourceName: trade.source.sourceName || 'Unknown',
            sourceUrl: trade.source.sourceUrl || null,
            retrievedAt: trade.source.retrievedAt || new Date().toISOString(),
          }],
          confidence: trade.confidence || 'verified',
        };

        // Create asset nodes
        const assetsById: Record<string, AssetNode> = {};
        (trade.assets || []).forEach((asset, idx) => {
          const assetId = asset.id || `asset-${idx}`;
          assetsById[assetId] = {
            id: assetId,
            kind: asset.kind || 'player',
            data: asset,
            receivingTeamId: null, // TODO: Determine from trade sides
          };
        });

        state.document = {
          id: treeId,
          title: `Trade Tree: ${new Date(trade.transactionDate).toLocaleDateString()}`,
          description: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rootTradeId: tradeId,
          tradesById: {
            [tradeId]: tradeEvent,
          },
          assetsById,
        };

        // Convert to React Flow nodes and edges
        const { nodes, edges } = convertToFlow(state.document);
        state.nodes = nodes;
        state.edges = edges;
      });
    },

    setSelectedNode: (nodeId) => {
      set((state) => {
        state.selectedNodeId = nodeId;
      });
    },

    toggleSourceDrawer: () => {
      set((state) => {
        state.isSourceDrawerOpen = !state.isSourceDrawerOpen;
      });
    },

    updateNodes: (nodes) => {
      set((state) => {
        state.nodes = nodes;
      });
    },

    updateEdges: (edges) => {
      set((state) => {
        state.edges = edges;
      });
    },
  }))
);

/**
 * Convert tree document to React Flow nodes and edges
 */
function convertToFlow(document: TreeDocument): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const trade = document.tradesById[document.rootTradeId];
  if (!trade) {
    return { nodes, edges };
  }

  // Create transaction node
  nodes.push({
    id: trade.id,
    type: 'transaction',
    position: { x: 400, y: 200 },
    data: {
      date: trade.transactionDate,
      kind: trade.kind,
      teams: trade.teams,
      confidence: trade.confidence,
    },
  });

  // Create asset nodes
  trade.assetIds.forEach((assetId, index) => {
    const asset = document.assetsById[assetId];
    if (!asset) return;

    const isLeft = index % 2 === 0;
    const xOffset = isLeft ? -250 : 250;
    const yOffset = Math.floor(index / 2) * 120;

    nodes.push({
      id: assetId,
      type: 'asset',
      position: { x: 400 + xOffset, y: 200 + yOffset },
      data: {
        asset: asset.data,
        kind: asset.kind,
      },
    });

    // Create edge from asset to transaction
    edges.push({
      id: `${assetId}-${trade.id}`,
      source: assetId,
      target: trade.id,
      type: 'default',
    });
  });

  return { nodes, edges };
}
