"use client";

import { BaseEdge, getStraightPath, type Edge, type EdgeProps } from "@xyflow/react";

// Endpoints are precomputed in radial-layout.ts (true intersection with the
// focus circle / child rectangle boundaries, not xyflow's Handle-based
// anchors) so the line looks right at any angle around the hub, not just
// straight down.
export interface RadialEdgeData extends Record<string, unknown> {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

type RadialEdgeType = Edge<RadialEdgeData>;

export default function RadialEdge({
  data,
  style,
  markerStart,
  markerEnd,
}: EdgeProps<RadialEdgeType>) {
  if (!data) return null;
  const [path] = getStraightPath({
    sourceX: data.sx,
    sourceY: data.sy,
    targetX: data.tx,
    targetY: data.ty,
  });
  return (
    <BaseEdge path={path} style={style} markerStart={markerStart} markerEnd={markerEnd} />
  );
}
