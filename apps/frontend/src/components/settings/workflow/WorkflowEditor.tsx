import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  MarkerType,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  WorkflowConnection,
  Status,
  WorkflowConnectionGroup,
  WorkflowType,
} from 'generated/sdk';
import { usePersistWorkflowEditorModel } from 'hooks/settings/usePersistWorkflowEditorModel';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { FunctionType } from 'utils/utilTypes';

import StatusNode from './StatusNode';
import StatusPicker from './StatusPicker';
import TransitionEventDialog from './TransitionEventDialog';
import WorkflowEditorModel, { Event, EventType } from './WorkflowEditorModel';
import WorkflowMetadataEditor from './WorkflowMetadataEditor';

// Register custom node types
const nodeTypes = {
  statusNode: StatusNode,
};

// Sample events - in a real application, these would come from your backend
const sampleEvents = [
  { id: 'submit', name: 'Submit', description: 'User submits the proposal' },
  { id: 'approve', name: 'Approve', description: 'Admin approves the proposal' },
  { id: 'reject', name: 'Reject', description: 'Admin rejects the proposal' },
  { id: 'revise', name: 'Revise', description: 'User revises the proposal' },
  { id: 'schedule', name: 'Schedule', description: 'Schedule the experiment' },
  { id: 'complete', name: 'Complete', description: 'Mark experiment as complete' },
];

interface EdgeData {
  events: string[];
  sourceStatusName: string;
  targetStatusName: string;
}

const WorkflowEditor = ({ entityType }: { entityType: WorkflowType }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { statuses, loadingStatuses } = useStatusesData(entityType);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // State for managing transition events dialog
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  const reducerMiddleware = () => {
    return (next: FunctionType) => (action: Event) => {
      next(action);
    };
  };
  
  const { persistModel, isLoading } = usePersistWorkflowEditorModel();
  const { state, dispatch } = WorkflowEditorModel(entityType, [
    persistModel,
    reducerMiddleware,
  ]);
  
  const statusesInThePicker = state.id ? statuses : [];
  
  // Convert workflow connections to React Flow nodes and edges when state changes
  React.useEffect(() => {
    if (!state.workflowConnectionGroups || state.workflowConnectionGroups.length === 0) return;

    const newNodes: Node[] = [];
    const newEdges: Edge<EdgeData>[] = [];
    let nodePositionY = 50;
    
    // Process each group to create nodes and edges
    state.workflowConnectionGroups.forEach((group) => {
      let nodePositionX = 250;
      
      group.connections.forEach((connection, index) => {
        const statusId = connection.status.id.toString();
        
        // Create node for the status
        newNodes.push({
          id: statusId,
          type: 'statusNode',
          data: { 
            label: connection.status.name,
            status: connection.status,
            onDelete: () => handleStatusDelete(statusId, group.groupId)
          },
          position: { x: nodePositionX, y: nodePositionY },
        });
        
        // If not the first status in the group, create an edge from the previous status
        if (index > 0) {
          const prevStatusId = group.connections[index - 1].status.id.toString();
          newEdges.push({
            id: `e${prevStatusId}-${statusId}`,
            source: prevStatusId,
            target: statusId,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: { cursor: 'pointer' },
            data: {
              events: connection.nextStatusEvents || [],
              sourceStatusName: group.connections[index - 1].status.name,
              targetStatusName: connection.status.name,
            },
          });
        }
        
        // If there's a parent group and this is the first status, connect from the last status of parent
        if (index === 0 && group.parentGroupId) {
          const parentGroup = state.workflowConnectionGroups.find(
            (g) => g.groupId === group.parentGroupId
          );
          if (parentGroup && parentGroup.connections.length > 0) {
            const parentLastStatus = parentGroup.connections[parentGroup.connections.length - 1].status;
            const parentLastStatusId = parentLastStatus.id.toString();
            newEdges.push({
              id: `e${parentLastStatusId}-${statusId}`,
              source: parentLastStatusId,
              target: statusId,
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              style: { cursor: 'pointer' },
              data: {
                events: connection.previousStatusEvents || [],
                sourceStatusName: parentLastStatus.name,
                targetStatusName: connection.status.name,
              },
            });
          }
        }
        
        nodePositionX += 200;
      });
      
      nodePositionY += 150;
    });
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [state.workflowConnectionGroups, setNodes, setEdges]);
  
  // Handle connecting nodes (adding transitions)
  const onConnect = useCallback(
    (connection: Connection) => {
      // Check if connection already exists
      const connectionExists = edges.some(
        (edge) => edge.source === connection.source && edge.target === connection.target
      );
      if (connectionExists) {
        enqueueSnackbar('Connection already exists', {
          variant: 'info',
          className: 'snackbar-info',
        });
        return;
      }
      
      // Find source and target status names for the edge data
      const sourceStatus = statuses.find((s) => s.id.toString() === connection.source);
      const targetStatus = statuses.find((s) => s.id.toString() === connection.target);
      
      if (!sourceStatus || !targetStatus) {
        return;
      }
      
      // Add the connection to the graph
      const newEdge = {
        ...connection,
        animated: true,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { cursor: 'pointer' },
        data: {
          events: [], // No events initially
          sourceStatusName: sourceStatus.name,
          targetStatusName: targetStatus.name,
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Update the workflow model with the new connection
      if (sourceStatus && targetStatus) {
        dispatch({
          type: EventType.ADD_WORKFLOW_CONNECTION,
          payload: {
            sourceStatusId: sourceStatus.id,
            targetStatusId: targetStatus.id,
          },
        });
        
        // Open the event dialog for the newly created edge
        const edgeId = `reactflow__edge-${connection.source}-${connection.target}`;
        setTimeout(() => {
          const newEdge = edges.find((e) => e.id === edgeId);
          if (newEdge) {
            setSelectedEdge(newEdge);
            setIsEventDialogOpen(true);
          }
        }, 100);
      }
    },
    [dispatch, edges, enqueueSnackbar, setEdges, statuses]
  );
  
  // Handle edge click to open the transition event dialog
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setIsEventDialogOpen(true);
    },
    []
  );
  
  // Save events for a transition
  const handleSaveTransitionEvents = useCallback(
    (selectedEvents: string[]) => {
      if (!selectedEdge) return;
      
      // Update the edge with the selected events
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === selectedEdge.id) {
            return {
              ...e,
              data: {
                ...e.data,
                events: selectedEvents,
              },
              label: selectedEvents.length > 0 ? `Events: ${selectedEvents.length}` : undefined,
            };
          }
          return e;
        })
      );
      
      // Here you would also update your backend model with the events
      // This is a simplified version - in a real app, you'd need to map to your actual model
      const sourceId = selectedEdge.source;
      const targetId = selectedEdge.target;
      
      // Update the workflow connection in your model
      dispatch({
        type: EventType.UPDATE_WORKFLOW_CONNECTION_EVENTS,
        payload: {
          sourceStatusId: Number(sourceId),
          targetStatusId: Number(targetId),
          events: selectedEvents,
        },
      });
      
      enqueueSnackbar('Transition events updated', {
        variant: 'success',
      });
    },
    [selectedEdge, setEdges, dispatch, enqueueSnackbar]
  );
  
  // Handle status drag from picker to flow area
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle dropping a status into the flow area
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const statusId = event.dataTransfer.getData('application/reactflow');
      const status = statuses.find((s) => s.id.toString() === statusId);
      
      if (!status) return;
      
      // Get drop position
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Check if status already exists in workflow
      const statusExists = nodes.some((node) => node.id === statusId);
      if (statusExists) {
        enqueueSnackbar('Status already exists in workflow', {
          variant: 'info',
          className: 'snackbar-info',
        });
        return;
      }
      
      // Create new node
      const newNode: Node = {
        id: statusId,
        type: 'statusNode',
        data: { 
          label: status.name,
          status,
          onDelete: () => handleStatusDelete(statusId)
        },
        position,
      };
      
      // Add the node
      setNodes((nds) => nds.concat(newNode));
      
      // Dispatch action to add status to the workflow model
      dispatch({
        type: EventType.ADD_WORKFLOW_STATUS_REQUESTED,
        payload: {
          statusId: status.id,
          status,
          sortOrder: nodes.length,
          workflowId: state.id,
          droppableGroupId: 'WorkflowConnections_0', // Default group
          parentDroppableGroupId: null,
          nextStatusId: null,
          prevStatusId: null,
        },
      });
    },
    [reactFlowInstance, dispatch, statuses, nodes, setNodes, state.id, enqueueSnackbar]
  );
  
  // Handle status deletion
  const handleStatusDelete = useCallback(
    (statusId: string, groupId?: string) => {
      // Remove the node and connected edges
      setNodes((nds) => nds.filter((node) => node.id !== statusId));
      setEdges((eds) => 
        eds.filter((edge) => edge.source !== statusId && edge.target !== statusId)
      );
      
      // Dispatch action to delete status from workflow model
      dispatch({
        type: EventType.DELETE_WORKFLOW_STATUS,
        payload: {
          statusId: Number(statusId),
          groupId,
        },
      });
    },
    [dispatch, setNodes, setEdges]
  );
  
  // Determine if data is loaded
  const dataLoaded = !isLoading && !loadingStatuses && state.id;
  
  // Style for container based on loading state
  const getContainerStyle = (): React.CSSProperties => {
    return !dataLoaded
      ? {
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.5,
        minHeight: '380px',
      }
      : {};
  };
  
  const progressJsx = !dataLoaded ? <LinearProgress /> : null;
  
  return (
    <StyledContainer>
      <WorkflowMetadataEditor dispatch={dispatch} workflow={state} />
      <StyledPaper style={getContainerStyle()}>
        {progressJsx}
        <Grid container style={{ height: '600px' }}>
          <Grid item xs={9}>
            <div ref={reactFlowWrapper} style={{ height: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                fitView
                connectionLineType={ConnectionLineType.SmoothStep}
              >
                <Background color="#aaa" gap={16} />
                <Panel 
                  position="top-right"
                  style={{ 
                    zIndex: 0, // Ensure the panel is behind nodes
                    opacity: 0.8 // Make it slightly transparent
                  }}
                >
                  <div style={{ 
                    background: 'white', 
                    padding: '10px', 
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    pointerEvents: 'none' // Allows clicking through the panel to interact with nodes
                  }}>
                    <h4>Workflow Status Machine</h4>
                    <p>Drag statuses from the sidebar to add them to the workflow</p>
                    <p>Connect statuses by dragging from one node to another</p>
                    <p>Click on a connection to add transition events</p>
                    <p>Click on a status to delete it from the workflow</p>
                  </div>
                </Panel>
                <Controls />
              </ReactFlow>
            </div>
          </Grid>
          <Grid item xs={3}>
            <StatusPicker 
              statuses={statusesInThePicker} 
              onDragStart={(status) => {
                /* Make status draggable to ReactFlow */
                const event = new CustomEvent('statusDragStart', { detail: status });
                document.dispatchEvent(event);
              }}
            />
          </Grid>
        </Grid>
      </StyledPaper>
      
      {/* Transition Events Dialog */}
      {selectedEdge && (
        <TransitionEventDialog
          open={isEventDialogOpen}
          onClose={() => setIsEventDialogOpen(false)}
          sourceStatus={selectedEdge.data?.sourceStatusName || ''}
          targetStatus={selectedEdge.data?.targetStatusName || ''}
          availableEvents={sampleEvents}
          selectedEvents={selectedEdge.data?.events || []}
          onSaveEvents={handleSaveTransitionEvents}
        />
      )}
    </StyledContainer>
  );
};

export default WorkflowEditor;
