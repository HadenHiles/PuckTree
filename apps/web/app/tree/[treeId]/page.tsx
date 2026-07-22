'use client';

/**
 * Tree editor page
 * 
 * Interactive trade tree canvas using React Flow.
 * Displays nodes for players, draft picks, and transactions.
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Download, Eye, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nodeTypes } from '@/components/tree/flow-nodes';
import { ConnectionTray } from '@/components/tree/connection-tray';
import { useTreeStore } from '@/lib/stores/tree-store';
import { fetchConnectionsForAsset } from '@/lib/stores/fetchConnections';

export default function TreeEditorPage() {
  const router = useRouter();

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
  } = useTreeStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

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
  }, [document, connectionsByAssetId, setConnectionsForAsset]);    });
      }, 100);
    },
    [onEdgesChange, setEdges, updateEdges]
  );

  const handleBack = () => {
    router.push('/');
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

      {/* Connection tray */}
      <ConnectionTray
        assetId={selectedAssetForConnections}
        connections={selectedAssetForConnections ? connectionsByAssetId[selectedAssetForConnections] || [] : []}
        isLoading={isLoadingConnections}
        onAdd={addBranch}
        onDismiss={dismissConnection}
        onClose={() => setSelectedAssetForConnections(null)}
      />
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
      </div>
    </div>
  );
}
