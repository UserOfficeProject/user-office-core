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
  const [selectedWorkflowConnection, setSelectedWorkflowConnection] =
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
    if (selectedEdge && selectedWorkflowConnection) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === selectedEdge.id) {
            // Map the status changing events to their display names
            const eventIds =
              selectedWorkflowConnection.statusChangingEvents?.map(
                (event) => event.statusChangingEvent
              ) || [];

            const statusActions =
              selectedWorkflowConnection.statusActions || [];

            return {
              ...e,
              data: {
                ...e.data,
                events: eventIds,
                statusActions: statusActions,
                connectionLineType:
                  state.connectionLineType as ConnectionLineType,
              },
            };
          }

          return e;
        })
      );
    }
  }, [
    selectedWorkflowConnection,
    selectedEdge,
    setEdges,
    state.connectionLineType,
  ]);

  // Convert workflow connections to React Flow nodes and edges when state changes
  React.useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge<EdgeData>[] = [];

    state.statuses.forEach((workflowStatus) => {
      const statusId = workflowStatus.status.id.toString();
      const nodeId = workflowStatus.workflowStatusId.toString();
      // Use database coordinates if available, otherwise fall back to grid layout
      const nodePositionX = workflowStatus.posX;
      const nodePositionY = workflowStatus.posY;

      // Create node for the status
      const newNode = {
        id: nodeId,
        type: 'statusNode',
        data: {
          label: workflowStatus.status.name,
          workflowStatus: workflowStatus,
          statusId: statusId,
          onDelete: (workflowStatusId: string) => {
            dispatch({
              type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
              payload: {
                workflowStatusId: parseInt(workflowStatusId),
              },
            });
          },
        },
        position: { x: nodePositionX, y: nodePositionY },
      };

      newNodes.push(newNode);
    });
    state.connections.forEach((connection) => {
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
            connection.statusChangingEvents?.map(
              (e) => e.statusChangingEvent
            ) || [],
          sourceStatusShortCode: connection.prevStatus.status.id,
          targetStatusShortCode: connection.nextStatus.status.id,
          workflowConnectionId: connection.id, // Use target connection ID (destination)
          statusActions: connection.statusActions || [],
          connectionLineType: state.connectionLineType as ConnectionLineType,
        },
      });

      newEdges.push(newEdge);
    });

    setNodes(newNodes);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.connections,
    state.statuses,
    state.connectionLineType,
    setNodes,
    setEdges,
  ]);

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

      // Find source and target status names for the edge data
      const sourceWfStatus = state.statuses.find(
        (s) => s.workflowStatusId.toString() === connection.source
      );
      const targetWfStatus = state.statuses.find(
        (s) => s.workflowStatusId.toString() === connection.target
      );

      if (!sourceWfStatus || !targetWfStatus) {
        return;
      }

      const sourceHandle = connection.sourceHandle ?? 'bottom-source';
      const targetHandle = connection.targetHandle ?? 'top-target';

      // Add the connection to the graph
      const newEdge = edgeFactory({
        id: `temp-${connection.source}-${connection.target}`, // Temporary ID until persisted
        source: connection.source,
        target: connection.target,
        sourceHandle,
        targetHandle,
        type: 'workflow', // Use custom workflow edge type
        data: {
          events: [], // No events initially
          sourceStatusShortCode: sourceWfStatus.status.id,
          targetStatusShortCode: targetWfStatus.status.id,
          statusActions: [],
          connectionLineType: state.connectionLineType as ConnectionLineType,
        },
      });

      setEdges((eds) => addEdge(newEdge, eds));

      // Dispatch update events to persist the connection in the database
      // We need to update BOTH nodes: source gets nextStatusId, target gets prevStatusId and prevConnectionId

      // Update source node (A) - set its nextStatusId to target (B)
      dispatch({
        type: EventType.ADD_WORKFLOW_CONNECTION_REQUESTED,
        payload: {
          sourceWorkflowStatusId: sourceWfStatus.workflowStatusId, // Use connection ID for persistence
          targetWorkflowStatusId: targetWfStatus.workflowStatusId,
          sourceHandle,
          targetHandle,
        },
      });

      // Note: Connection is persisted by updating both source and target statuses
    },
    [
      edges,
      state.statuses,
      state.connectionLineType,
      setEdges,
      dispatch,
      enqueueSnackbar,
    ]
  );

  // Handle edge click to open the transition event dialog
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);

      const clickedWorkflowConnection = state.connections.find(
        (connection) => connection.id.toString() === edge.id
      );

      if (!clickedWorkflowConnection) {
        return;
      }

      setSelectedWorkflowConnection(clickedWorkflowConnection);
    },
    [state.connections]
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
        ariaLabel: `connection_${status.id}`,
        data: {
          label: status.name,
          workflowStatus: {
            workflowStatusId: 0, // Temporary ID until persisted
            status: status,
          },
          onDelete: (nodeId: string) => {
            dispatch({
              type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
              payload: {
                workflowStatusId: parseInt(nodeId),
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
          workflowId: state.id,
          posX: position.x,
          posY: position.y,
          status: status,
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
                  if (node.data && node.data.workflowStatus && node.position) {
                    const newPosX = Math.round(node.position.x);
                    const newPosY = Math.round(node.position.y);

                    // Find the workflow connection for this status to check current position
                    const workflowStatus = state.statuses.find(
                      (status) => status.workflowStatusId === parseInt(node.id)
                    );

                    // Only dispatch update if position has actually changed
                    if (
                      workflowStatus &&
                      (workflowStatus.posX !== newPosX ||
                        workflowStatus.posY !== newPosY)
                    ) {
                      dispatch({
                        type: EventType.WORKFLOW_STATUS_UPDATE_REQUESTED,
                        payload: {
                          workflowStatusId: workflowStatus.workflowStatusId,
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
          workflowConnection={selectedWorkflowConnection}
          setWorkflowConnection={setSelectedWorkflowConnection}
          dispatch={dispatch}
          isLoading={isLoading}
          entityType={entityType}
        />
      )}
    </StyledContainer>
  );
};

export default WorkflowEditor;
