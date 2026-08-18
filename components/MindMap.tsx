"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getNode, getPath, getRoot } from "@/lib/hierarchy-data";
import HierarchyFlowNode, {
  type HierarchyNodeData,
} from "@/components/HierarchyFlowNode";
import RadialEdge from "@/components/RadialEdge";
import { buildRadialGraph } from "@/components/radial-layout";
import Breadcrumb from "@/components/Breadcrumb";

const nodeTypes = { hierarchy: HierarchyFlowNode };
const edgeTypes = { radial: RadialEdge };

function MindMapCanvas() {
  const root = useMemo(() => getRoot(), []);
  const [currentNodeId, setCurrentNodeId] = useState(root.id);
  const { fitView } = useReactFlow();

  const focus = getNode(currentNodeId) ?? root;
  const { nodes, edges } = useMemo(() => buildRadialGraph(focus), [focus]);
  const path = useMemo(() => getPath(currentNodeId), [currentNodeId]);

  // Re-frame the camera every time the focus changes, including the
  // initial mount (redundant with the `fitView` prop below, but harmless).
  useEffect(() => {
    fitView({ duration: 500, padding: 0.15 });
  }, [currentNodeId, fitView]);

  const navigateTo = useCallback((id: string) => {
    setCurrentNodeId(id);
  }, []);

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      const data = node.data as HierarchyNodeData;
      if (data.role === "focus") {
        // Clicking the hub steps back up one level, same as the breadcrumb's
        // previous segment. Root has no parent, so it's a no-op there.
        if (data.node.parentId) navigateTo(data.node.parentId);
        return;
      }
      if (data.isLeaf) {
        if (data.node.url) {
          window.open(data.node.url, "_blank", "noopener,noreferrer");
        }
        return;
      }
      navigateTo(data.node.id);
    },
    [navigateTo]
  );

  return (
    <div className="flex h-full w-full flex-col">
      <Breadcrumb path={path} onNavigate={navigateTo} />
      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} />
          {/* bottom-right: thumb-reachable on a phone held one-handed */}
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function MindMap() {
  return (
    <ReactFlowProvider>
      <MindMapCanvas />
    </ReactFlowProvider>
  );
}
