import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

interface Event {
  id: string;
  name: string;
  description?: string;
}

interface TransitionEventDialogProps {
  open: boolean;
  onClose: () => void;
  sourceStatus: string;
  targetStatus: string;
  availableEvents: Event[];
  selectedEvents: string[];
  onSaveEvents: (selectedEvents: string[]) => void;
}

const TransitionEventDialog: React.FC<TransitionEventDialogProps> = ({
  open,
  onClose,
  sourceStatus,
  targetStatus,
  availableEvents,
  selectedEvents,
  onSaveEvents,
}) => {
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [localSelectedEvents, setLocalSelectedEvents] = useState<string[]>([]);

  // Reset local state when dialog opens
  useEffect(() => {
    setLocalSelectedEvents([...selectedEvents]);
    setNewEventName('');
    setNewEventDescription('');
  }, [selectedEvents, open]);

  const handleEventToggle = (eventId: string) => {
    setLocalSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleAddNewEvent = () => {
    if (!newEventName.trim()) return;
    
    // In a real implementation, you would save the new event to your backend
    // and get back an ID. For now, we'll create a temporary ID
    const newEventId = `new-event-${Date.now()}`;
    
    // Add the new event to selected events
    setLocalSelectedEvents((prev) => [...prev, newEventId]);
    setNewEventName('');
    setNewEventDescription('');
  };

  const handleSave = () => {
    onSaveEvents(localSelectedEvents);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Configure Transition Events
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          From: <strong>{sourceStatus}</strong> To: <strong>{targetStatus}</strong>
        </Typography>
        
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Select events that can trigger this transition:
        </Typography>
        
        {availableEvents.map((event) => (
          <FormControlLabel
            key={event.id}
            control={
              <Checkbox
                checked={localSelectedEvents.includes(event.id)}
                onChange={() => handleEventToggle(event.id)}
                color="primary"
              />
            }
            label={
              <div>
                <Typography variant="body2">{event.name}</Typography>
                {event.description && (
                  <Typography variant="caption" color="textSecondary">
                    {event.description}
                  </Typography>
                )}
              </div>
            }
          />
        ))}
        
        <Typography variant="subtitle2" sx={{ mt: 3 }}>
          Add a new event:
        </Typography>
        
        <TextField
          label="Event Name"
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />
        
        <TextField
          label="Event Description (optional)"
          value={newEventDescription}
          onChange={(e) => setNewEventDescription(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
          multiline
          rows={2}
        />
        
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddNewEvent}
          disabled={!newEventName.trim()}
          sx={{ mt: 1 }}
        >
          Add Event
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransitionEventDialog;