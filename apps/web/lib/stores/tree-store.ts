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
 * Connection suggestion for branch discovery
 */
export interface ConnectionSuggestion {
  id: string;
  assetId: string; // The asset this connection relates to
  transactionId: string; // ID of the suggested transaction
  transactionDate: string;
  kind: string;
  teams: NormalizedTeamRef[];
  assets: NormalizedAssetCandidate[];
  confidence: string;
  source: {
    id: string;
    provider: string;
    sourceName: string;
    sourceUrl: string | null;
    retrievedAt: string;
  };
  dismissed: boolean;
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
  
  // Connection suggestions
  connectionsByAssetId: Record<string, ConnectionSuggestion[]>;
  isLoadingConnections: boolean;
  
  // UI state
  selectedNodeId: string | null;
  selectedAssetForConnections: string | null;
  isSourceDrawerOpen: boolean;
  
  // Actions
  loadTree: (trade: NormalizedTransactionCandidate) => void;
  setConnectionsForAsset: (assetId: string, connections: ConnectionSuggestion[]) => void;
  setLoadingConnections: (loading: boolean) => void;
  addBranch: (connectionId: string) => void;
  dismissConnection: (connectionId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedAssetForConnections: (assetId: string | null) => void;
  toggleSourceDrawer: () => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  updateAsset: (assetId: string, updates: Partial<AssetNode>) => void;
  updateTransaction: (transactionId: string, updates: Partial<TradeEvent>) => void;
  createManualAsset: (asset: Omit<AssetNode, 'id'>) => string;
  createManualTransaction: (transaction: Omit<TradeEvent, 'id' | 'assetIds'>) => string;
}

export const useTreeStore = create<TreeState>()(
  immer((set) => ({
    document: null,
    nodes: [],
    edges: [],
    connectionsByAssetId: {},
    isLoadingConnections: false,
    selectedNodeId: null,
    selectedAssetForConnections: null,
    isSourceDrawerOpen: false,

    loadTree(trade) {
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

    setSelectedNode(nodeId) {
      set((state) => {
        state.selectedNodeId = nodeId;
      });
    },

    setSelectedAssetForConnections(assetId) {
      set((state) => {
        state.selectedAssetForConnections = assetId;
      });
    },

    setLoadingConnections(loading) {
      set((state) => {
        state.isLoadingConnections = loading;
      });
    },

    setConnectionsForAsset(assetId, connections) {
      set((state) => {
        state.connectionsByAssetId[assetId] = connections;
      });
    },

    addBranch(connectionId) {
      set((state) => {
        // Find the connection
        const connection = Object.values(state.connectionsByAssetId)
          .flat()
          .find((c) => c.id === connectionId);

        if (!connection || !state.document) return;

        const tradeId = connection.transactionId;

        // Cycle prevention: Check if this transaction already exists in the tree
        if (state.document.tradesById[tradeId]) {
          console.warn(`Transaction ${tradeId} already exists in tree, skipping to prevent cycle`);
          return;
        }

        // Add the transaction to the document
        const newTrade: TradeEvent = {
          id: tradeId,
          transactionDate: connection.transactionDate,
          kind: connection.kind,
          teams: connection.teams,
          assetIds: connection.assets.map((a) => a.id || `asset-${Math.random()}`),
          sourceRefs: [{
            id: connection.source.id,
            provider: connection.source.provider,
            sourceName: connection.source.sourceName,
            sourceUrl: connection.source.sourceUrl,
            retrievedAt: connection.source.retrievedAt,
          }],
          confidence: connection.confidence,
        };

        state.document.tradesById[tradeId] = newTrade;

        // Add new assets
        connection.assets.forEach((asset, idx) => {
          const assetId = asset.id || `asset-${idx}`;
          if (!state.document!.assetsById[assetId]) {
            state.document!.assetsById[assetId] = {
              id: assetId,
              kind: asset.kind || 'player',
              data: asset,
              receivingTeamId: null,
            };
          }
        });

        state.document.updatedAt = new Date().toISOString();

        // Partial branch layout: only position new nodes
        // Find the parent asset node to position relative to it
        const parentAssetNode = state.nodes.find((n) => n.id === connection.assetId);
        const parentX = parentAssetNode?.position.x ?? 400;
        const parentY = parentAssetNode?.position.y ?? 200;

        // Add new transaction node to the right of the parent asset
        const newTransactionNode: Node = {
          id: tradeId,
          type: 'transaction',
          position: { x: parentX + 300, y: parentY },
          data: {
            date: connection.transactionDate,
            kind: connection.kind,
            teams: connection.teams,
            confidence: connection.confidence,
          },
        };
        state.nodes.push(newTransactionNode);

        // Add edge from parent asset to new transaction
        state.edges.push({
          id: `${connection.assetId}-${tradeId}`,
          source: connection.assetId,
          target: tradeId,
          type: 'smoothstep',
        });

        // Add new asset nodes to the right of the transaction
        connection.assets.forEach((asset, idx) => {
          const assetId = asset.id || `asset-${idx}`;
          
          // Only add node if it doesn't already exist
          const existingNode = state.nodes.find((n) => n.id === assetId);
          if (!existingNode) {
            const yOffset = (idx - (connection.assets.length - 1) / 2) * 140;
            state.nodes.push({
              id: assetId,
              type: 'asset',
              position: { x: parentX + 600, y: parentY + yOffset },
              data: {
                asset: asset,
                kind: asset.kind || 'player',
              },
            });
          }

          // Add edge from transaction to asset
          state.edges.push({
            id: `${tradeId}-${assetId}`,
            source: tradeId,
            target: assetId,
            type: 'smoothstep',
          });
        });

        // Remove this connection from available connections
        const connectionsForAsset = state.connectionsByAssetId[connection.assetId];
        if (connectionsForAsset) {
          state.connectionsByAssetId[connection.assetId] = connectionsForAsset.filter(
            (c) => c.id !== connectionId
          );
        }
      });
    },

    dismissConnection(connectionId) {
      set((state) => {
        // Find and mark the connection as dismissed
        Object.keys(state.connectionsByAssetId).forEach((assetId) => {
          const connections = state.connectionsByAssetId[assetId];
          if (!connections) return;
          const connection = connections.find(
            (c) => c.id === connectionId
          );
          if (connection) {
            connection.dismissed = true;
          }
        });
      });
    },

    toggleSourceDrawer() {
      set((state) => {
        state.isSourceDrawerOpen = !state.isSourceDrawerOpen;
      });
    },

    updateNodes(nodes) {
      set((state) => {
        state.nodes = nodes;
      });
    },

    updateEdges(edges) {
      set((state) => {
        state.edges = edges;
      });
    },

    updateAsset(assetId, updates) {
      set((state) => {
        if (!state.document) return;

        const asset = state.document.assetsById[assetId];
        if (!asset) return;

        // Apply updates to the asset
        Object.assign(asset, updates);
        state.document.updatedAt = new Date().toISOString();

        // Update the corresponding React Flow node
        const nodeIndex = state.nodes.findIndex((n) => n.id === assetId);
        if (nodeIndex !== -1 && state.nodes[nodeIndex]) {
          const node = state.nodes[nodeIndex];
          if (node && node.data) {
            state.nodes[nodeIndex] = {
              ...node,
              data: {
                ...node.data,
                asset: asset.data,
                kind: asset.kind,
              },
            };
          }
        }
      });
    },

    updateTransaction(transactionId, updates) {
      set((state) => {
        if (!state.document) return;

        const transaction = state.document.tradesById[transactionId];
        if (!transaction) return;

        // Apply updates to the transaction
        Object.assign(transaction, updates);
        state.document.updatedAt = new Date().toISOString();

        // Update the corresponding React Flow node
        const nodeIndex = state.nodes.findIndex((n) => n.id === transactionId);
        if (nodeIndex !== -1 && state.nodes[nodeIndex]) {
          const node = state.nodes[nodeIndex];
          if (node && node.data) {
            state.nodes[nodeIndex] = {
              ...node,
              data: {
                ...node.data,
                date: transaction.transactionDate,
                kind: transaction.kind,
                teams: transaction.teams,
                confidence: transaction.confidence,
              },
            };
          }
        }
      });
    },

    createManualAsset(asset) {
      let assetId = '';
      set((state) => {
        if (!state.document) return;

        assetId = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const displayLabel = asset.kind === "player"
          ? asset.data.playerRef?.playerName || "Unknown"
          : asset.data.draftYear
          ? `${asset.data.draftYear} Round ${asset.data.round || "?"}`
          : "Draft Pick";

        // Create complete NormalizedAssetCandidate with correct values
        const completeData: NormalizedAssetCandidate = {
          ...asset.data,
          id: assetId,
          displayLabel,
          confidence: "manual",
        };

        // Add asset to document
        state.document.assetsById[assetId] = {
          ...asset,
          id: assetId,
          data: completeData,
        };
        state.document.updatedAt = new Date().toISOString();

        // Create React Flow node
        const newNode: Node = {
          id: assetId,
          type: 'asset',
          position: { x: 100, y: 100 }, // User will position it
          data: {
            asset: completeData,
            kind: asset.kind,
          },
        };

        state.nodes.push(newNode);
      });
      return assetId;
    },

    createManualTransaction(transaction) {
      let transactionId = '';
      set((state) => {
        if (!state.document) return;

        transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add transaction to document
        state.document.tradesById[transactionId] = {
          ...transaction,
          id: transactionId,
          assetIds: [], // Will be connected later
        };
        state.document.updatedAt = new Date().toISOString();

        // Create React Flow node
        const newNode: Node = {
          id: transactionId,
          type: 'transaction',
          position: { x: 400, y: 300 }, // User will position it
          data: {
            date: transaction.transactionDate,
            kind: transaction.kind,
            teams: transaction.teams,
            confidence: transaction.confidence || 'manual',
          },
        };

        state.nodes.push(newNode);
      });
      return transactionId;
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
