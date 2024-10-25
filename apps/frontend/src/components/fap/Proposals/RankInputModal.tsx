import {
  Button,
  DialogActions,
  DialogContent,
  FormHelperText,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';

interface RankInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: number) => void;
  currentRank: number | null;
  totalReviewers: number;
  takenRanks: number[];
}

const RankInputModal: React.FC<RankInputModalProps> = ({
  open,
  onClose,
  onSubmit,
  currentRank,
  totalReviewers,
  takenRanks,
}) => {
  const [value, setValue] = useState<number | ''>(currentRank ?? '');
  const [takenError, setTakenError] = useState(false);
  const [invalidError, setInvalidError] = useState(false);

  const onDialogClose = () => {
    setTakenError(false);
    setInvalidError(false);
    setValue('');
    onClose();
  };

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
      onClose={onDialogClose}
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
          onChange={(e) => {
            if (e.target.value === '') {
              setTakenError(false);
              setInvalidError(false);

              return setValue('');
            }

            const rank = Number(e.target.value);

            if (takenRanks.includes(rank)) {
              setInvalidError(false);
              setTakenError(true);
            } else if (rank > totalReviewers || rank <= 0) {
              setTakenError(false);
              setInvalidError(true);
            } else {
              setTakenError(false);
              setInvalidError(false);
            }

            return setValue(rank);
          }}
          error={invalidError}
          data-cy="rank-input"
          inputProps={{ min: 1, max: totalReviewers, step: 1 }}
        />
        {invalidError && (
          <FormHelperText error>
            The rank {value} is invalid, please chose another.
          </FormHelperText>
        )}
        {takenError && (
          <FormHelperText error>
            Warning! The rank {value} is already taken please chose another or
            update other ranks.
          </FormHelperText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onDialogClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          data-cy="rank-submit"
          disabled={invalidError}
        >
          Submit
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default RankInputModal;
