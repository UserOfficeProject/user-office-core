import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import React, { useCallback, useRef, useState } from 'react';
import {
  addEdge,
  Connection,
  ConnectionLineType,
  Edge,
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

import LoadingOverlay from './LoadingOverlay';
import StatusEventsAndActionsDialog from './StatusEventsAndActionsDialog';
import StatusPicker from './StatusPicker';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorModel, { Event, EventType } from './WorkflowEditorModel';
import WorkflowMetadataEditor from './WorkflowMetadataEditor';
import {
  EdgeData,
  edgeFactory,
  mapWorkflowToNodesAndEdges,
} from './workflowUtils';

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
    const { nodes: newNodes, edges: newEdges } = mapWorkflowToNodesAndEdges(
      state,
      (workflowStatusId: string) => {
        dispatch({
          type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
          payload: {
            workflowStatusId: parseInt(workflowStatusId),
          },
        });
      }
    );

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
          sourceStatusId: sourceWfStatus.status.id,
          targetStatusId: targetWfStatus.status.id,
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
