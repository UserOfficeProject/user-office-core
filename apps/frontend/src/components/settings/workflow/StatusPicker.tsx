import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { Status } from 'generated/sdk';

interface StatusPickerProps {
  statuses: Status[];
  onDragStart: (status: Status) => void;
}

const StatusPicker: React.FC<StatusPickerProps> = ({
  statuses,
  onDragStart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter statuses based on search term
  const filteredStatuses = statuses
    .filter(
      (status) =>
        status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (status.description &&
          status.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(
      (status) => ['DRAFT', 'AWAITING_ESF'].includes(status.shortCode) === false
    ); // Exclude DRAFT and 'AWAITING_ESF' status

  return (
    <Paper style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Available Statuses
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Drag a status into the diagram to add it to the workflow.
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search statuses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '10px' }}
        variant="outlined"
      />

      <List dense style={{ maxHeight: '400px', overflow: 'auto' }}>
        {filteredStatuses.map((status) => (
          <ListItemButton
            key={status.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(
                'application/reactflow',
                status.id.toString()
              );
              event.dataTransfer.effectAllowed = 'move';
              onDragStart(status);
            }}
            data-cy={`status_${status.shortCode}`}
            style={{
              marginBottom: '5px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
            }}
          >
            <ListItemText
              primary={status.name}
              secondary={status.description}
              primaryTypographyProps={{ variant: 'subtitle2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItemButton>
        ))}
        {filteredStatuses.length === 0 && searchTerm && (
          <Typography color="textSecondary">
            No statuses match your search
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default StatusPicker;
