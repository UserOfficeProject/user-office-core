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
  sourceStatusId: string;
  targetStatusId: string;
}

type WorkflowCanvasProps = React.ComponentProps<typeof ReactFlow> & {
  nodes: Node[];
  edges: Edge<EdgeData>[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onInit?: (instance: ReactFlowInstance) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDragStop?: NodeDragHandler;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  connectionLineType: ConnectionLineType;
};

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
  onNodeClick,
  onNodeDragStop,
  reactFlowWrapper,
  ...rest
}) => {
  return (
    <div
      ref={reactFlowWrapper}
      style={{ height: '100%' }}
      data-cy="react-flow-canvas"
    >
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
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'workflow',
        }}
        fitView
        {...rest}
      >
        <Background color="FloralWhite" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
