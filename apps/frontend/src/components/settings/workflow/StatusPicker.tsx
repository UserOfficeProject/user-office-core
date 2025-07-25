import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';

import { Status } from 'generated/sdk';

interface StatusPickerProps {
  statuses: Status[];
  onDragStart: (status: Status) => void;
}

const StatusPicker: React.FC<StatusPickerProps> = ({
  statuses,
  onDragStart,
}) => {
  return (
    <Paper style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Available Statuses
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Drag a status into the diagram to add it to the workflow.
      </Typography>
      <List dense style={{ maxHeight: '500px', overflow: 'auto' }}>
        {statuses.map((status) => (
          <ListItem
            key={status.id}
            button
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(
                'application/reactflow',
                status.id.toString()
              );
              event.dataTransfer.effectAllowed = 'move';
              onDragStart(status);
            }}
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
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StatusPicker;
