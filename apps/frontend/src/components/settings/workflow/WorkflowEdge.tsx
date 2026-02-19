import { styled } from '@mui/material/styles';
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  getSimpleBezierPath,
  ConnectionLineType,
} from 'reactflow';

import { ConnectionStatusAction } from 'generated/sdk';

interface WorkflowEdgeData {
  events: string[];
  sourceStatusId: string;
  targetStatusId: string;
  workflowConnectionId?: number;
  statusActions: ConnectionStatusAction[];
  connectionLineType?: ConnectionLineType;
  isReadOnly?: boolean;
}

const List = styled('ul')(({ theme }) => ({
  padding: '4px 8px',
  margin: '2px',
  listStyleType: 'none',
  fontSize: '10px',
  fontWeight: 600,
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  borderRadius: '12px',
  boxShadow: theme.shadows[1] as string,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  minWidth: '60px',
  border: `1px solid ${theme.palette.primary.dark}`,
}));

const ActionList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  border: `1px solid ${theme.palette.secondary.dark}`,
}));

const WorkflowEdge: React.FC<EdgeProps<WorkflowEdgeData>> = ({
  id,
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  // Get the appropriate path based on edge type
  const getPath = () => {
    const pathProps = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    const connectionType =
      data?.connectionLineType || ConnectionLineType.Bezier;

    switch (connectionType) {
      case ConnectionLineType.Straight:
        return getStraightPath(pathProps);
      case ConnectionLineType.Step:
      case ConnectionLineType.SmoothStep:
        return getSmoothStepPath(pathProps);
      case ConnectionLineType.SimpleBezier:
        return getSimpleBezierPath(pathProps);
      case ConnectionLineType.Bezier:
      default:
        return getBezierPath(pathProps);
    }
  };

  const [edgePath, labelX, labelY] = getPath();

  const events = data?.events || [];
  const statusActions = data?.statusActions || [];
  const edgeStyle =
    events.length > 0
      ? style
      : {
          ...style,
          strokeDasharray: '2 4',
        };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan"
        >
          {!data?.isReadOnly && events.length > 0 && (
            <List
              data-cy={`edge-label-events-list-${data?.sourceStatusId}-${data?.targetStatusId}`}
            >
              {events.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </List>
          )}
          {!data?.isReadOnly && statusActions.length > 0 && (
            <ActionList
              data-cy={`edge-label-actions-list-${data?.sourceStatusId}-${data?.targetStatusId}`}
            >
              {statusActions.map((e) => (
                <li key={e.actionId}>{`⚡ ${e.action.name}`}</li>
              ))}
            </ActionList>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default WorkflowEdge;
