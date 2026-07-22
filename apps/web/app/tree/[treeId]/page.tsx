'use client';

/**
 * Tree editor page
 *
 * Interactive trade tree canvas using React Flow.
 * Displays nodes for players, draft picks, and transactions.
 */

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Download, Eye, Info, Plus, Undo2, Redo2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nodeTypes } from '@/components/tree/flow-nodes';
import { ConnectionTray } from '@/components/tree/connection-tray';
import { NodeInspector } from '@/components/tree/node-inspector';
import { CreateAssetDialog } from '@/components/tree/create-asset-dialog';
import { CreateTransactionDialog } from '@/components/tree/create-transaction-dialog';
import { useTreeStore } from '@/lib/stores/tree-store';
import { fetchConnectionsForAsset } from '@/lib/stores/fetchConnections';
import { migrateTreeDocument, readTreeDocument, writeTreeDocument } from '@/lib/tree-document-storage';
import type { NormalizedAssetCandidate, TransactionKind } from '@pucktree/domain';

export default function TreeEditorPage() {
  const router = useRouter();
  const params = useParams<{ treeId: string }>();
  const treeId = params.treeId;

  const {
    nodes: storeNodes,
    edges: storeEdges,
    document,
    connectionsByAssetId,
    isLoadingConnections,
    selectedAssetForConnections,
    updateNodes,
    updateEdges,
    toggleSourceDrawer,
    isSourceDrawerOpen,
    setLoadingConnections,
    setConnectionsForAsset,
    addBranch,
    dismissConnection,
    setSelectedAssetForConnections,
    setSelectedNode,
    createManualAsset,
    createManualTransaction,
    linkManualNodes,
    loadDocument,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTreeStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Restore the document for this editor route before autosave begins.
  useEffect(() => {
    const storedDocument = readTreeDocument(treeId);
    if (storedDocument) loadDocument(storedDocument);
    setIsDocumentReady(true);
  }, [treeId, loadDocument]);

  useEffect(() => {
    if (isDocumentReady && document) writeTreeDocument(treeId, document);
  }, [document, isDocumentReady, treeId]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      // Cmd/Ctrl + Shift + Z for redo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Sync store state with local state
  useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  // Update store when nodes/edges change
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Update store after a short delay to batch changes
      setTimeout(() => {
        setNodes((nds) => {
          updateNodes(nds);
          return nds;
        });
      }, 100);
    },
    [onNodesChange, setNodes, updateNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setEdges((eds) => {
          updateEdges(eds);
          return eds;
        });
      }, 100);
    },
    [onEdgesChange, setEdges, updateEdges]
  );

  const handleConnect: OnConnect = useCallback((connection) => {
    if (connection.source && connection.target) linkManualNodes(connection.source, connection.target);
  }, [linkManualNodes]);

  // Handle connection indicator click
  const handleConnectionClick = useCallback(async (assetId: string) => {
    const asset = document?.assetsById[assetId];
    if (!asset || asset.kind !== 'player' || !asset.data.playerRef) return;

    setSelectedAssetForConnections(assetId);

    // Fetch connections if not already loaded
    if (!connectionsByAssetId[assetId]) {
      setLoadingConnections(true);
      const existingTradeIds = document ? Object.keys(document.tradesById) : [];
      const connections = await fetchConnectionsForAsset(
        assetId,
        asset.data.playerRef.playerName,
        existingTradeIds
      );
      setConnectionsForAsset(assetId, connections);
      setLoadingConnections(false);
    }
  }, [
    document,
    connectionsByAssetId,
    setSelectedAssetForConnections,
    setLoadingConnections,
    setConnectionsForAsset,
  ]);

  // Update nodes with connection callbacks and counts
  useEffect(() => {
    const nodesWithConnections = storeNodes.map((node) => {
      if (node.type === 'asset') {
        const connections = connectionsByAssetId[node.id] || [];
        const visibleConnections = connections.filter((c) => !c.dismissed);

        return {
          ...node,
          data: {
            ...node.data,
            connectionCount: visibleConnections.length,
            onConnectionClick: () => handleConnectionClick(node.id),
          },
        };
      }
      return node;
    });

    setNodes(nodesWithConnections);
  }, [storeNodes, connectionsByAssetId, handleConnectionClick, setNodes]);

  // Auto-fetch connections for all player nodes when document loads
  useEffect(() => {
    if (!document) return;

    const existingTradeIds = Object.keys(document.tradesById);

    // Get all player assets that don't have connections fetched yet
    const playerAssets = Object.entries(document.assetsById).filter(
      ([assetId, asset]) =>
        asset.kind === 'player' &&
        asset.data.playerRef &&
        !connectionsByAssetId[assetId]
    );

    // Fetch connections for each player asset
    const fetchAllConnections = async () => {
      for (const [assetId, asset] of playerAssets) {
        if (asset.kind === 'player' && asset.data.playerRef) {
          const connections = await fetchConnectionsForAsset(
            assetId,
            asset.data.playerRef.playerName,
            existingTradeIds
          );
          setConnectionsForAsset(assetId, connections);
        }
      }
    };

    if (playerAssets.length > 0) {
      fetchAllConnections();
    }
  }, [document, connectionsByAssetId, setConnectionsForAsset]);

  const handleBack = () => {
    router.push('/');
  };

  const handleCreateAsset = (asset: Omit<NormalizedAssetCandidate, "id" | "displayLabel" | "confidence">) => {
    createManualAsset({
      kind: asset.kind,
      data: {
        ...asset,
        id: "", // Placeholder, will be set by store
        displayLabel: "", // Placeholder, will be set by store
        confidence: "manual",
      },
      receivingTeamId: null,
    });
  };

  const handleCreateTransaction = (transaction: { kind: TransactionKind; transactionDate: string }) => {
    createManualTransaction({
      transactionDate: transaction.transactionDate,
      kind: transaction.kind,
      teams: [],
      sourceRefs: [{
        id: `manual-${Date.now()}`,
        provider: 'manual',
        sourceName: 'Manual Entry',
        sourceUrl: null,
        retrievedAt: new Date().toISOString(),
      }],
      confidence: 'manual',
    });
  };

  const handleExportJson = () => {
    if (!document) return;

    const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title.replaceAll(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'pucktree'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const importedDocument = migrateTreeDocument(JSON.parse(await file.text()));
      if (!importedDocument) throw new Error('Invalid PuckTree document');

      loadDocument(importedDocument);
      writeTreeDocument(treeId, importedDocument);
      setImportError(null);
    } catch {
      setImportError('That file is not a valid PuckTree document.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top command bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex-1">
          <h1 className="text-lg font-semibold text-slate-900">
            Trade Tree
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-slate-200" />

          <input
            ref={importInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={handleImportJson}
          />
          <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJson} disabled={!document}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsCreateAssetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsCreateTransactionOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>

          <Button variant="outline" size="sm" onClick={toggleSourceDrawer}>
            <Info className="h-4 w-4 mr-2" />
            Sources
          </Button>

          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Presentation
          </Button>

          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {importError && (
          <div role="alert" className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded bg-red-50 px-4 py-2 text-sm text-red-800 shadow">
            {importError}
          </div>
        )}
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500 mb-4">
                No trade data loaded yet.
              </p>
              <Button onClick={handleBack}>
                Search for a player
              </Button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#94a3b8', strokeWidth: 2 },
            }}
          >
            <Background color="#e2e8f0" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'transaction':
                    return '#1e293b';
                  case 'asset':
                    return '#ffffff';
                  default:
                    return '#e2e8f0';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />

            {/* Info panel */}
            <Panel position="top-left" className="bg-white/90 backdrop-blur rounded-lg shadow-md p-3 text-sm">
              <div className="text-slate-600">
                <strong>{nodes.length}</strong> nodes · <strong>{edges.length}</strong> connections
              </div>
            </Panel>
          </ReactFlow>
        )}

        {/* Source drawer (overlay) */}
        {isSourceDrawerOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Data Sources
              </h2>
              <Button variant="ghost" size="sm" onClick={toggleSourceDrawer}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                All transactions are sourced from Pro Sports Transactions through the transaction provider service.
              </p>

              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-2">
                  Source Attribution
                </p>
                <p>
                  Transaction information may be incomplete, delayed, or incorrect.
                  Verify against the linked source before publication.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Node inspector */}
        <NodeInspector />
      </div>

      {/* Connection tray */}
      <ConnectionTray
        assetId={selectedAssetForConnections}
        connections={selectedAssetForConnections ? connectionsByAssetId[selectedAssetForConnections] || [] : []}
        isLoading={isLoadingConnections}
        onAdd={addBranch}
        onDismiss={dismissConnection}
        onClose={() => setSelectedAssetForConnections(null)}
      />

      {/* Create asset dialog */}
      <CreateAssetDialog
        open={isCreateAssetOpen}
        onOpenChange={setIsCreateAssetOpen}
        onCreateAsset={handleCreateAsset}
      />

      {/* Create transaction dialog */}
      <CreateTransactionDialog
        open={isCreateTransactionOpen}
        onOpenChange={setIsCreateTransactionOpen}
        onCreateTransaction={handleCreateTransaction}
      />
    </div>
  );
}
