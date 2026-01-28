import React, { useEffect, useRef } from 'react';
import { ConnectionLineType, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';

import { WorkflowType } from 'generated/sdk';
import { FunctionType } from 'utils/utilTypes';

import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorModel, { Event } from './WorkflowEditorModel';
import { mapWorkflowToNodesAndEdges } from './workflowUtils';

interface WorkflowViewProps {
  workflowId: number;
  entityType: WorkflowType;
  highlightedNodes?: { statusId: string; entities: string[] }[];
  onNodeClicked?: (statusId: string, workflowStatusId: number) => void;
  selectedStatusId?: string; // To highlight selected status
}

const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflowId,
  entityType,
  highlightedNodes,
  onNodeClicked,
  selectedStatusId,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const reducerMiddleware = () => {
    return (next: FunctionType) => (action: Event) => {
      // Read-only model, no middleware modifications expected
      next(action);
    };
  };

  // Pass externalWorkflowId to the model
  const { state } = WorkflowEditorModel(
    entityType,
    [reducerMiddleware],
    workflowId
  );

  useEffect(() => {
    if (state.id === 0) return; // Not loaded yet

    const { nodes: newNodes, edges: newEdges } = mapWorkflowToNodesAndEdges(
      state,
      undefined, // onDelete
      highlightedNodes,
      true // isReadOnly
    );

    const nodesWithSelection = newNodes.map((node) => ({
      ...node,
      selected: selectedStatusId
        ? node.data.statusId === selectedStatusId
        : node.selected,
    }));

    setNodes(nodesWithSelection);
    setEdges(newEdges);
  }, [state, highlightedNodes, setNodes, setEdges, selectedStatusId]);

  return (
    <WorkflowCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      reactFlowWrapper={reactFlowWrapper}
      connectionLineType={state.connectionLineType as ConnectionLineType}
      // Read-only specific props
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true} // Allow selection
      onNodeClick={(event, node) => {
        if (onNodeClicked) {
          onNodeClicked(
            node.data.statusId,
            node.data.workflowStatus.workflowStatusId
          );
        }
      }}
      // Disable other interactions
      zoomOnDoubleClick={false}
    />
  );
};

export default WorkflowView;
