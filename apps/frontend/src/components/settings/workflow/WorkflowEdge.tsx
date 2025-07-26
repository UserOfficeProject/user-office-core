import PendingActionsIcon from '@mui/icons-material/PendingActions';
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

import ProposalSettingsIcon from 'components/common/icons/ProposalSettingsIcon';
import { ConnectionStatusAction } from 'generated/sdk';

interface WorkflowEdgeData {
  events: string[];
  sourceStatusName: string;
  targetStatusName: string;
  workflowConnectionId?: number;
  statusActions: ConnectionStatusAction[];
  connectionLineType?: ConnectionLineType;
}

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

  // Don't render label if there are no events
  if (events.length === 0) {
    return (
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
    );
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#FFFFFFAA',
          }}
          className="nodrag nopan"
        >
          <ul
            style={{
              padding: '5px',
              listStyleType: 'none',
              fontSize: '11px',
              fontWeight: 500,
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            {events.map((e) => (
              <li key={e}>
                <ProposalSettingsIcon
                  style={{ marginRight: '6px', fontSize: '12px' }}
                />
                {e}
              </li>
            ))}
            {statusActions.map((e) => (
              <li
                key={e.actionId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <PendingActionsIcon
                  style={{ marginRight: '6px', fontSize: '12px' }}
                />
                {e.action.name}
              </li>
            ))}
          </ul>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default WorkflowEdge;
