import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import React, { useCallback, useRef, useState } from 'react';
import {
  addEdge,
  Connection,
  ConnectionLineType,
  Edge,
  MarkerType,
  Node,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  ConnectionStatusAction,
  WorkflowConnection,
  WorkflowType,
} from 'generated/sdk';
import { usePersistWorkflowEditorModel } from 'hooks/settings/usePersistWorkflowEditorModel';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { FunctionType } from 'utils/utilTypes';

import LoadingOverlay from './LoadingOverlay';
import StatusEventsAndActionsDialog from './StatusEventsAndActionsDialog';
import StatusPicker from './StatusPicker';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorModel, { Event, EventType } from './WorkflowEditorModel';
import WorkflowMetadataEditor from './WorkflowMetadataEditor';

interface EdgeData {
  events: string[];
  sourceStatusShortCode: string;
  targetStatusShortCode: string;
  workflowConnectionId?: number;
  statusActions: ConnectionStatusAction[];
  connectionLineType?: ConnectionLineType;
  prevConnectionId: number | null;
}

const edgeFactory = (
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
    ariaLabel: `Edge from ${edgeData.data.sourceStatusShortCode} to ${edgeData.data.targetStatusShortCode}`,
  } as Edge<EdgeData>;
};

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
  const [workflowConnection, setWorkflowConnection] =
    useState<WorkflowConnection | null>(null);

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

  // Effect to update edge labels when workflowConnection changes
  React.useEffect(() => {
    if (selectedEdge && workflowConnection) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === selectedEdge.id) {
            // Map the status changing events to their display names
            const eventIds =
              workflowConnection.statusChangingEvents?.map(
                (event) => event.statusChangingEvent
              ) || [];

            return {
              ...e,
              data: {
                ...e.data,
                events: eventIds,
                statusActions:
                  (workflowConnection.statusActions?.length || 0) > 0,
                connectionLineType:
                  state.connectionLineType as ConnectionLineType,
              },
            };
          }

          return e;
        })
      );
    }
  }, [workflowConnection, selectedEdge, setEdges, state.connectionLineType]);

  // Convert workflow connections to React Flow nodes and edges when state changes
  React.useEffect(() => {
    if (!state.workflowConnections || state.workflowConnections.length === 0) {
      setNodes([]);
      setEdges([]);

      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge<EdgeData>[] = [];

    // Sort connections by sortOrder to maintain proper sequence
    const sortedConnections = [...state.workflowConnections].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    // Create nodes for each connection
    sortedConnections.forEach((connection) => {
      const statusId = connection.status.id.toString();
      const nodeId = connection.id.toString();
      // Use database coordinates if available, otherwise fall back to grid layout
      const nodePositionX = connection.posX;
      const nodePositionY = connection.posY;

      // Create node for the status
      const newNode = {
        id: nodeId,
        type: 'statusNode',
        data: {
          label: connection.status.name,
          status: connection.status,
          statusId: statusId,
          onDelete: (connectionId: string) => {
            // Since the node ID is the connection ID, use it directly
            dispatch({
              type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
              payload: {
                connectionId: Number(connectionId),
              },
            });
          },
        },
        position: { x: nodePositionX, y: nodePositionY },
      };

      newNodes.push(newNode);

      // Create edge from previous connection id if it exists because node can have only one parrent
      if (connection.prevConnectionId) {
        const prevStatusId = connection.prevStatusId!.toString();
        const prevConnection = sortedConnections.find(
          (c) => c.id === connection.prevConnectionId
        );

        if (prevConnection) {
          const edgeId = `edge-${prevStatusId}-${statusId}-${connection.id}`;
          const edgeAlreadyExists = newEdges.some((edge) => edge.id === edgeId);

          if (!edgeAlreadyExists) {
            const newEdge = edgeFactory({
              id: edgeId, // Use connection ID to ensure unique edge identification
              source: connection.prevConnectionId.toString(),
              target: connection.id.toString(),
              type: 'workflow', // Use custom workflow edge type
              data: {
                events:
                  connection.statusChangingEvents?.map(
                    (e) => e.statusChangingEvent
                  ) || [],
                sourceStatusShortCode: prevConnection.status.shortCode,
                targetStatusShortCode: connection.status.shortCode,
                workflowConnectionId: connection.id, // Use target connection ID (destination)
                statusActions: connection.statusActions || [],
                connectionLineType:
                  state.connectionLineType as ConnectionLineType,
                prevConnectionId: connection.prevConnectionId || null,
              },
            });

            newEdges.push(newEdge);
          }
        }
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.workflowConnections, state.connectionLineType, setNodes, setEdges]);

  // Handle connecting nodes (adding transitions)
  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection has required properties
      if (!connection.source || !connection.target) {
        return;
      }

      // Check if connection already exists
      const connectionExists = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          !edge.id.startsWith('temp-') // Don't count temporary edges as existing connections
      );
      if (connectionExists) {
        enqueueSnackbar('Connection already exists', {
          variant: 'info',
          className: 'snackbar-info',
        });

        return;
      }

      // Check if target node already has a parent (restrict to only one parent)
      const targetHasParentInEdges = edges.some(
        (edge) => edge.target === connection.target
      );

      if (targetHasParentInEdges) {
        enqueueSnackbar(
          'Node can only have one parent connection. Try adding another status of the same type instead.',
          {
            variant: 'warning',
            className: 'snackbar-warning',
          }
        );

        return;
      }

      const sourceConnection = state.workflowConnections.find(
        (s) => s.id.toString() === connection.source
      );
      const targetConnection = state.workflowConnections.find(
        (s) => s.id.toString() === connection.target
      );

      if (!sourceConnection || !targetConnection) {
        return;
      }

      // Find source and target status names for the edge data
      const sourceStatus = statuses.find(
        (s) => s.id === sourceConnection.statusId
      );
      const targetStatus = statuses.find(
        (s) => s.id === targetConnection.statusId
      );

      if (!sourceStatus || !targetStatus) {
        return;
      }

      // Add the connection to the graph
      const newEdge = edgeFactory({
        id: `temp-${connection.source}-${connection.target}`, // Temporary ID until persisted
        source: connection.source,
        target: connection.target,
        type: 'workflow', // Use custom workflow edge type
        data: {
          events: [], // No events initially
          sourceStatusShortCode: sourceStatus.shortCode,
          targetStatusShortCode: targetStatus.shortCode,
          statusActions: [],
          connectionLineType: state.connectionLineType as ConnectionLineType,
          prevConnectionId: sourceConnection.id,
        },
      });

      setEdges((eds) => addEdge(newEdge, eds));

      // Dispatch update events to persist the connection in the database
      // We need to update BOTH nodes: source gets nextStatusId, target gets prevStatusId and prevConnectionId

      // Update source node (A) - set its nextStatusId to target (B)
      dispatch({
        type: EventType.WORKFLOW_STATUS_UPDATE_REQUESTED,
        payload: {
          connectionId: sourceConnection.id, // Use connection ID for persistence
          nextStatusId: targetConnection.statusId,
        },
      });

      // Update target node (B) - set its prevStatusId to source (A) and prevConnectionId to source connection ID
      dispatch({
        type: EventType.WORKFLOW_STATUS_UPDATE_REQUESTED,
        payload: {
          connectionId: targetConnection.id, // Use connection ID for persistence
          prevStatusId: sourceConnection.statusId,
          prevConnectionId: sourceConnection.id, // Store the previous connection ID
        },
      });

      // Note: Connection is persisted by updating both source and target statuses
    },
    [
      dispatch,
      edges,
      enqueueSnackbar,
      setEdges,
      statuses,
      state.connectionLineType,
      state.workflowConnections,
    ]
  );

  // Handle edge click to open the transition event dialog
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);

      const targetWorkflowConnection = state.workflowConnections.find(
        (connection) => connection.id.toString() === edge.target
      );

      if (!targetWorkflowConnection) {
        return;
      }

      // Get the workflow connection ID from edge data
      const isTemporaryEdge = edge.id.startsWith('temp-');
      const workflowConnectionId = isTemporaryEdge
        ? 0
        : edge.data?.workflowConnectionId || 0;

      // Create a WorkflowConnection-like object to pass to the dialog
      const connection: WorkflowConnection = {
        id: workflowConnectionId,
        workflowId: state.id || 0,
        sortOrder: 0,
        prevStatusId: parseInt(edge.source),
        nextStatusId: parseInt(edge.target),
        statusId: parseInt(edge.target),
        status: targetWorkflowConnection.status,
        statusChangingEvents: (edge.data?.events || []).map(
          (eventId: string) => ({
            statusChangingEvent: eventId,
            workflowConnectionId: workflowConnectionId,
          })
        ),
        statusActions: [],
        posX: 0,
        posY: 0,
        prevConnectionId: edge.data?.prevConnectionId || null,
      };

      setWorkflowConnection(connection);
    },
    [state.id, state.workflowConnections]
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
      position.x = Math.round(position.x);
      position.y = Math.round(position.y);

      // Create new node
      const newNode: Node = {
        id: statusId,
        type: 'statusNode',
        ariaLabel: `connection_${status.shortCode}`,
        data: {
          label: status.name,
          status,
          onDelete: (connectionId: string) => {
            dispatch({
              type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
              payload: {
                connectionId: Number(connectionId),
              },
            });
          },
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
          sortOrder: 0,
          workflowId: state.id,
          nextStatusId: null,
          prevStatusId: null,
          posX: position.x,
          posY: position.y,
        },
      });
    },
    [reactFlowInstance, statuses, setNodes, dispatch, state.id]
  );

  // Determine if data is loaded
  const dataLoaded = !isLoading && !loadingStatuses && state.id;

  return (
    <StyledContainer maxWidth={false}>
      <WorkflowMetadataEditor dispatch={dispatch} workflow={state} />
      <StyledPaper>
        <LoadingOverlay isLoading={!dataLoaded}>
          <Grid container style={{ height: '600px' }}>
            <Grid item xs={9}>
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onEdgeClick={onEdgeClick}
                onNodeDragStop={(event, node) => {
                  // Extract statusId from node data
                  if (node.data && node.data.status && node.position) {
                    const newPosX = Math.round(node.position.x);
                    const newPosY = Math.round(node.position.y);

                    // Find the workflow connection for this status to check current position
                    const workflowConnection = state.workflowConnections.find(
                      (connection) => connection.id === parseInt(node.id)
                    );

                    // Only dispatch update if position has actually changed
                    if (
                      workflowConnection &&
                      (workflowConnection.posX !== newPosX ||
                        workflowConnection.posY !== newPosY)
                    ) {
                      dispatch({
                        type: EventType.WORKFLOW_STATUS_UPDATE_REQUESTED,
                        payload: {
                          connectionId: workflowConnection.id,
                          posX: newPosX,
                          posY: newPosY,
                        },
                      });
                    }
                  }
                }}
                reactFlowWrapper={reactFlowWrapper}
                connectionLineType={
                  state.connectionLineType as ConnectionLineType
                }
              />
            </Grid>
            <Grid item xs={3}>
              <StatusPicker
                statuses={statuses}
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
        </LoadingOverlay>
      </StyledPaper>
      {/* Status Events and Actions Dialog */}
      {selectedEdge && (
        <StatusEventsAndActionsDialog
          workflowConnection={workflowConnection}
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
