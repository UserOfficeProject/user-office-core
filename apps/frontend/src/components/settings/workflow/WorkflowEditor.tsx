import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import React, { useCallback, useRef, useState } from 'react';
import {
  addEdge,
  Connection,
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

import LoadingOverlay from './LoadingOverlay';
import StatusEventsAndActionsDialog from './StatusEventsAndActionsDialog';
import StatusPicker from './StatusPicker';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorModel, { Event, EventType } from './WorkflowEditorModel';
import WorkflowMetadataEditor from './WorkflowMetadataEditor';

interface EdgeData {
  events: string[];
  sourceStatusName: string;
  targetStatusName: string;
}

const edgeFactory = (
  edgeData: Edge<EdgeData> | (Connection & { id: string })
): Edge<EdgeData> => {
  const base = {
    type: 'floating',
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

  const statusesInThePicker = state.id ? statuses : [];

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
              },
              label: eventIds.length > 0 ? eventIds.join(', ') : undefined,
            };
          }

          return e;
        })
      );
    }
  }, [workflowConnection, selectedEdge, setEdges]);

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
    sortedConnections.forEach((connection, index) => {
      const statusId = connection.status.id.toString();
      const nodePositionX = 50 + (index % 4) * 250; // 4 nodes per row
      const nodePositionY = 50 + Math.floor(index / 4) * 150;

      // Create node for the status
      const newNode = {
        id: statusId,
        type: 'statusNode',
        data: {
          label: connection.status.name,
          status: connection.status,
          onDelete: (deleteStatusId: string) => {
            // Remove the node and connected edges
            setNodes((nds) => nds.filter((node) => node.id !== deleteStatusId));
            setEdges((eds) =>
              eds.filter(
                (edge) =>
                  edge.source !== deleteStatusId &&
                  edge.target !== deleteStatusId
              )
            );

            // Dispatch action to delete status from workflow model
            dispatch({
              type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
              payload: {
                statusId: Number(deleteStatusId),
              },
            });
          },
        },
        position: { x: nodePositionX, y: nodePositionY },
      };

      newNodes.push(newNode);

      // Create edge from previous status if it exists
      if (connection.prevStatusId) {
        const prevStatusId = connection.prevStatusId.toString();
        const prevConnection = sortedConnections.find(
          (c) => c.status.id === connection.prevStatusId
        );

        if (prevConnection) {
          const newEdge = edgeFactory({
            id: `e${prevStatusId}-${statusId}`,
            source: prevStatusId,
            target: statusId,
            data: {
              events:
                connection.statusChangingEvents?.map(
                  (event) => event.statusChangingEvent
                ) || [],
              sourceStatusName: prevConnection.status.name,
              targetStatusName: connection.status.name,
            },
          });
          newEdges.push(newEdge);
        }
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.workflowConnections]);

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
      const newEdge = edgeFactory({
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        data: {
          events: [], // No events initially
          sourceStatusName: sourceStatus.name,
          targetStatusName: targetStatus.name,
        },
      });

      setEdges((eds) => addEdge(newEdge, eds));

      // Note: In ReactFlow implementation, we don't need to dispatch ADD_WORKFLOW_CONNECTION
      // The connection is handled by the visual graph and persisted through other means
    },
    [dispatch, edges, enqueueSnackbar, setEdges, statuses]
  );

  // Handle edge click to open the transition event dialog
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);

      // Create a workflowConnection object from the edge data that matches what StatusEventsAndActionsDialog expects
      const sourceStatus = statuses.find(
        (s) => s.id.toString() === edge.source
      );
      const targetStatus = statuses.find(
        (s) => s.id.toString() === edge.target
      );

      if (!sourceStatus || !targetStatus) return;

      // Create a WorkflowConnection-like object to pass to the dialog
      const connection: any = {
        id: parseInt(edge.id.replace(/\D/g, '')) || 0,
        workflowId: state.id || 0,
        sortOrder: 0,
        prevProposalStatusId: parseInt(edge.source),
        proposalStatusId: parseInt(edge.target),
        status: targetStatus,
        statusChangingEvents: (edge.data?.events || []).map(
          (eventId: string) => ({
            statusChangingEvent: eventId,
            workflowConnectionId: 0,
          })
        ),
        statusActions: [],
      };

      setWorkflowConnection(connection);
    },
    [statuses, state.id]
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
          onDelete: (deleteStatusId: string) => {
            // Remove the node and connected edges
            setNodes((nds) => nds.filter((node) => node.id !== deleteStatusId));
            setEdges((eds) =>
              eds.filter(
                (edge) =>
                  edge.source !== deleteStatusId &&
                  edge.target !== deleteStatusId
              )
            );

            // Dispatch action to delete status from workflow model
            dispatch({
              type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
              payload: {
                statusId: Number(deleteStatusId),
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
        },
      });
    },
    [
      reactFlowInstance,
      statuses,
      nodes,
      setNodes,
      setEdges,
      dispatch,
      state.id,
      enqueueSnackbar,
    ]
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
                reactFlowWrapper={reactFlowWrapper}
              />
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
        </LoadingOverlay>
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
