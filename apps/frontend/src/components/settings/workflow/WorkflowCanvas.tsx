import React from 'react';
import ReactFlow, {
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  NodeDragHandler,
  ReactFlowInstance,
} from 'reactflow';

import StatusNode from './StatusNode';
import WorkflowEdge from './WorkflowEdge';

// Register custom node and edge types
const nodeTypes = {
  statusNode: StatusNode,
};

const edgeTypes = {
  workflow: WorkflowEdge,
};

interface EdgeData {
  events: string[];
  sourceStatusName: string;
  targetStatusName: string;
}

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge<EdgeData>[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onInit: (instance: ReactFlowInstance) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onNodeDragStop?: NodeDragHandler;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  connectionLineType: ConnectionLineType;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onDrop,
  onDragOver,
  onEdgeClick,
  onNodeDragStop,
  reactFlowWrapper,
}) => {
  return (
    <div ref={reactFlowWrapper} style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'workflow',
        }}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
