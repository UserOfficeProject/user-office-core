import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { WorkflowConnection, WorkflowType } from 'generated/sdk';
import { usePersistWorkflowEditorModel } from 'hooks/settings/usePersistWorkflowEditorModel';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { FunctionType } from 'utils/utilTypes';

import StatusEventsAndActionsDialog from './StatusEventsAndActionsDialog';
import StatusNode from './StatusNode';
import StatusPicker from './StatusPicker';
import WorkflowEditorModel, { Event, EventType } from './WorkflowEditorModel';
import WorkflowMetadataEditor from './WorkflowMetadataEditor';

// Register custom node types
const nodeTypes = {
  statusNode: StatusNode,
};

// Sample events - in a real application, these would come from your backend
const sampleEvents = [
  { id: 'submit', name: 'Submit', description: 'User submits the proposal' },
  {
    id: 'approve',
    name: 'Approve',
    description: 'Admin approves the proposal',
  },
  { id: 'reject', name: 'Reject', description: 'Admin rejects the proposal' },
  { id: 'revise', name: 'Revise', description: 'User revises the proposal' },
  { id: 'schedule', name: 'Schedule', description: 'Schedule the experiment' },
  {
    id: 'complete',
    name: 'Complete',
    description: 'Mark experiment as complete',
  },
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
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for managing transition events dialog
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [workflowConnection, setWorkflowConnection] = useState<WorkflowConnection | null>(null);

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

  // Effect to update edge labels when workflowConnection changes
  React.useEffect(() => {
    if (selectedEdge && workflowConnection) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === selectedEdge.id) {
            // Map the status changing events to their display names
            const eventIds = workflowConnection.statusChangingEvents?.map(
              (event) => event.statusChangingEvent
            ) || [];
            
            // Get the event names from the sample events
            const eventNames = eventIds
              .map(eventId => sampleEvents.find(event => event.id === eventId)?.name || eventId)
              .join(', ');
              
            return {
              ...e,
              data: {
                ...e.data,
                events: eventIds,
              },
              label: eventIds.length > 0 ? eventNames : undefined,
            };
          }
          return e;
        })
      );
    }
  }, [workflowConnection, selectedEdge, setEdges, sampleEvents]);

  // Handle status deletion
  const handleStatusDelete = useCallback(
    (statusId: string, groupId?: string) => {
      // Remove the node and connected edges
      setNodes((nds) => nds.filter((node) => node.id !== statusId));
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== statusId && edge.target !== statusId
        )
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

  // Convert workflow connections to React Flow nodes and edges when state changes
  React.useEffect(() => {
    if (
      !state.workflowConnectionGroups ||
      state.workflowConnectionGroups.length === 0
    )
      return;

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
            onDelete: () => handleStatusDelete(statusId, group.groupId),
          },
          position: { x: nodePositionX, y: nodePositionY },
        });

        // If not the first status in the group, create an edge from the previous status
        if (index > 0) {
          const prevStatusId =
            group.connections[index - 1].status.id.toString();
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
              events: connection.statusChangingEvents?.map(event => event.statusChangingEvent) || [],
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
            const parentLastStatus =
              parentGroup.connections[parentGroup.connections.length - 1]
                .status;
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
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );
      if (connectionExists) {
        enqueueSnackbar('Connection already exists', {
          variant: 'info',
          className: 'snackbar-info',
        });

        return;
      }

      // Find source and target status names for the edge data
      const sourceStatus = statuses.find(
        (s) => s.id.toString() === connection.source
      );
      const targetStatus = statuses.find(
        (s) => s.id.toString() === connection.target
      );

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
            setWorkflowConnection(newEdge.data);
          }
        }, 100);
      }
    },
    [dispatch, edges, enqueueSnackbar, setEdges, statuses]
  );

  // Handle edge click to open the transition event dialog
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    
    // Create a workflowConnection object from the edge data that matches what StatusEventsAndActionsDialog expects
    const sourceStatus = statuses.find(s => s.id.toString() === edge.source);
    const targetStatus = statuses.find(s => s.id.toString() === edge.target);
    
    if (!sourceStatus || !targetStatus) return;
    
    // Create a WorkflowConnection-like object to pass to the dialog
    const connection: WorkflowConnection = {
      id: parseInt(edge.id.replace(/\D/g, '')), // Extract numeric part as ID
      workflowId: state.id || 0,
      sortOrder: 0,
      parentId: null,
      prevProposalStatusId: parseInt(edge.source),
      proposalStatusId: parseInt(edge.target),
      status: targetStatus,
      statusChangingEvents: (edge.data?.events || []).map(eventId => ({
        statusChangingEvent: eventId,
        workflowConnectionId: 0
      })),
      statusActions: []
    };
    
    setWorkflowConnection(connection);
  }, [statuses, state.id]);

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
          onDelete: () => handleStatusDelete(statusId),
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
    [
      reactFlowInstance,
      dispatch,
      statuses,
      nodes,
      setNodes,
      state.id,
      enqueueSnackbar,
    ]
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
                <Controls />
              </ReactFlow>
            </div>
          </Grid>
          <Grid item xs={3}>
            <StatusPicker
              statuses={statusesInThePicker}
              onDragStart={(status) => {
                /* Make status draggable to ReactFlow */
                const event = new CustomEvent('statusDragStart', {
                  detail: status,
                });
                document.dispatchEvent(event);
              }}
            />
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Status Events and Actions Dialog */}
      {selectedEdge && (
        <StatusEventsAndActionsDialog
          workflowConnection={workflowConnection as any}
          setWorkflowConnection={setWorkflowConnection}
          dispatch={dispatch}
          isLoading={isLoading}
          entityType={entityType}
        />
      )}
    </StyledContainer>
  );
};

export default WorkflowEditor;
