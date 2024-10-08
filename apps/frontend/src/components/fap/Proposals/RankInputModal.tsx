import { Button, DialogActions, DialogContent, TextField } from '@mui/material';
import React, { useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';

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
    <StyledDialog
      open={open}
      onClose={onClose}
      title="What Rank is this reviewer"
      fullWidth
      maxWidth="xs"
    >
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Number"
          type="number"
          fullWidth
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          data-cy="rank-input"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" data-cy="rank-submit">
          Submit
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default RankInputModal;
