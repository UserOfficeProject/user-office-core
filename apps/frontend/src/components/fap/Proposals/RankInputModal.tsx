import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

interface RankInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

const RankInputModal: React.FC<RankInputModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState<number | ''>('');

  const handleSubmit = () => {
    if (typeof value === 'number') {
      onSubmit(value);
      setValue('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>What Rank is this reviewer </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Number"
          type="number"
          fullWidth
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RankInputModal;
