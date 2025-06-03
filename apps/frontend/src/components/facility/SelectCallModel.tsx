import MaterialTable from '@material-table/core';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React, { useState } from 'react';

import { Call } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

export const SelectCallModel = ({
  preSelectedCalls,
  open,
  addCalls,
  close,
}: {
  facilityId: number;
  preSelectedCalls: number[] | undefined;
  open: boolean;
  addCalls: (calls: Pick<Call, 'id' | 'shortCode'>[]) => void;
  close: () => void;
}) => {
  const theme = useTheme();
  const [selectedCalls, setSelectedCalls] = useState<
    Pick<Call, 'id' | 'shortCode'>[]
  >([]);

  const { calls, loadingCalls } = useCallsData();

  const onClickHandlerUpdateBtn = () => {
    addCalls(selectedCalls);
    setSelectedCalls([]);
  };

  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={open}
      onClose={(_, reason) => {
        if (reason && reason == 'backdropClick') return;
        setSelectedCalls([]);
        close();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          padding: theme.spacing(0.5),
          textAlign: 'right',
        }}
      >
        <IconButton
          data-cy="close-modal-btn"
          onClick={() => {
            setSelectedCalls([]);
            close();
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MaterialTable
          columns={[{ title: 'Short Code', field: 'shortCode' }]}
          data={
            preSelectedCalls
              ? calls.filter((call) => !preSelectedCalls.includes(call.id))
              : calls
          }
          isLoading={loadingCalls}
          options={{
            selection: true,
            pageSize: 10,
          }}
          onSelectionChange={(data) => {
            //Strip away the tableData field
            setSelectedCalls(
              data.map((call) => {
                return {
                  id: call.id,
                  shortCode: call.shortCode,
                };
              })
            );
          }}
        />
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            paddingRight: theme.spacing(1),
          }}
        >
          {`${selectedCalls.length} Call(s) selected`}
        </Box>
        <Button
          type="button"
          onClick={onClickHandlerUpdateBtn}
          disabled={setSelectedCalls.length === 0}
          data-cy="assign-selected-calls"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
