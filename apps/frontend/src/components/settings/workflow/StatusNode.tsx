import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Paper, Typography } from '@mui/material';
import React from 'react';
import { Handle, Position } from 'reactflow';

import { Status } from 'generated/sdk';

// Color mapping for different status types
const getStatusColor = (status: Status) => {
  // You can customize these colors based on your status types
  switch (status.statusCode) {
    case 'DRAFT':
      return '#e3f2fd'; // light blue
    case 'SUBMITTED':
      return '#e8f5e9'; // light green
    case 'ACCEPTED':
      return '#c8e6c9'; // green
    case 'REJECTED':
      return '#ffebee'; // light red
    case 'REVIEW':
      return '#fff3e0'; // light orange
    case 'SCHEDULING':
      return '#e0f7fa'; // light cyan
    case 'COMPLETE':
      return '#e0f2f1'; // teal
    default:
      return '#f5f5f5'; // light grey
  }
};

interface StatusNodeProps {
  data: {
    label: string;
    status: Status;
    onDelete: () => void;
  };
  selected: boolean;
}

const StatusNode: React.FC<StatusNodeProps> = ({ data, selected }) => {
  const statusColor = getStatusColor(data.status);
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <Paper
        elevation={selected ? 5 : 2}
        style={{
          padding: '10px',
          borderRadius: '5px',
          minWidth: '150px',
          backgroundColor: selected ? '#f0f7ff' : statusColor,
          border: selected ? '2px solid #1976d2' : '1px solid #ccc',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">{data.label}</Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete();
            }}
            title="Delete status"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
        <Typography variant="caption" color="textSecondary">
          ID: {data.status.id}
        </Typography>
        {data.status.statusCode && (
          <Typography variant="caption" color="textSecondary" display="block">
            Code: {data.status.statusCode}
          </Typography>
        )}
      </Paper>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', borderRadius: '50%' }}
      />
    </>
  );
};

export default StatusNode;