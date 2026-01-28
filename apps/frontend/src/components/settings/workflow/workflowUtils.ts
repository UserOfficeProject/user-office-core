import { ConnectionLineType, Edge, MarkerType, Node } from 'reactflow';

import {
  ConnectionStatusAction,
  Workflow,
  WorkflowConnection,
} from 'generated/sdk';

export interface EdgeData {
  events: string[];
  sourceStatusId: string;
  targetStatusId: string;
  workflowConnectionId?: number;
  statusActions: ConnectionStatusAction[];
  connectionLineType?: ConnectionLineType;
  isReadOnly?: boolean;
}

export const edgeFactory = (
  edgeData: Edge<EdgeData> & { data: EdgeData }
): Edge<EdgeData> => {
  const base = {
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    style: { cursor: 'pointer' },
  };

  // Ensure we have valid source and target
  if (!edgeData.source || !edgeData.target) {
    throw new Error('Edge must have source and target');
  }

  return {
    ...base,
    id: edgeData.id,
    source: edgeData.source,
    target: edgeData.target,
    sourceHandle: edgeData.sourceHandle || null,
    targetHandle: edgeData.targetHandle || null,
    data: 'data' in edgeData ? edgeData.data : undefined,
    ariaLabel: `Edge from ${edgeData.data.sourceStatusId} to ${edgeData.data.targetStatusId}`,
  } as Edge<EdgeData>;
};

export const mapWorkflowToNodesAndEdges = (
  state: Workflow,
  onDelete?: (workflowStatusId: string) => void,
  highlightedNodes?: { statusId: string; entities: string[] }[],
  isReadOnly?: boolean
): { nodes: Node[]; edges: Edge<EdgeData>[] } => {
  const newNodes: Node[] = [];
  const newEdges: Edge<EdgeData>[] = [];

  state.statuses.forEach((workflowStatus) => {
    const statusId = workflowStatus.status.id.toString();
    const nodeId = workflowStatus.workflowStatusId.toString();
    // Use database coordinates if available, otherwise fall back to grid layout
    const nodePositionX = workflowStatus.posX;
    const nodePositionY = workflowStatus.posY;

    const highlightedNode = highlightedNodes?.find(
      (n) => n.statusId === statusId
    );

    // Create node for the status
    const newNode = {
      id: nodeId,
      type: 'statusNode',
      data: {
        label: workflowStatus.status.name,
        workflowStatus: workflowStatus,
        statusId: statusId,
        onDelete: onDelete
          ? (workflowStatusId: string) => onDelete(workflowStatusId)
          : undefined,
        isReadOnly,
        highlightCount: highlightedNode?.entities.length || 0,
        entityIds: highlightedNode?.entities || [],
      },
      position: { x: nodePositionX, y: nodePositionY },
    };

    newNodes.push(newNode);
  });

  state.connections.forEach((connection: WorkflowConnection) => {
    const edgeId = `${connection.id}`;

    const newEdge = edgeFactory({
      id: edgeId, // Use connection ID to ensure unique edge identification
      source: connection.prevStatus.workflowStatusId.toString(),
      target: connection.nextStatus.workflowStatusId.toString(),
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'workflow', // Use custom workflow edge type
      data: {
        events:
          connection.statusChangingEvents?.map((e) => e.statusChangingEvent) ||
          [],
        sourceStatusId: connection.prevStatus.status.id,
        targetStatusId: connection.nextStatus.status.id,
        workflowConnectionId: connection.id, // Use target connection ID (destination)
        statusActions: connection.statusActions || [],
        connectionLineType: state.connectionLineType as ConnectionLineType,
        isReadOnly,
      },
    });

    newEdges.push(newEdge);
  });

  return { nodes: newNodes, edges: newEdges };
};
