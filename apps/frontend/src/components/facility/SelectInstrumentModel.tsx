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

import { InstrumentMinimalFragment } from 'generated/sdk';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';

export const SelectInstrumentModel = ({
  preSelectedInstruments,
  open,
  addInstruments,
  close,
}: {
  facilityId: number;
  preSelectedInstruments: number[] | null;
  open: boolean;
  addInstruments: (instruments: InstrumentMinimalFragment[]) => void;
  close: () => void;
}) => {
  const theme = useTheme();
  const [selectedInstruments, setSelectedInstruments] = useState<
    InstrumentMinimalFragment[]
  >([]);

  const { instruments, loadingInstruments } = useInstrumentsMinimalData();

  const onClickHandlerUpdateBtn = () => {
    addInstruments(selectedInstruments);
    setSelectedInstruments([]);
  };

  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={open}
      onClose={(_, reason) => {
        if (reason && reason == 'backdropClick') return;
        setSelectedInstruments([]);
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
            setSelectedInstruments([]);
            close();
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MaterialTable
          columns={[
            { title: 'Name', field: 'name' },
            { title: 'Short Code', field: 'shortCode' },
          ]}
          data={
            preSelectedInstruments
              ? instruments.filter(
                  (instruments) =>
                    !preSelectedInstruments.includes(instruments.id)
                )
              : instruments
          }
          isLoading={loadingInstruments}
          options={{
            selection: true,
            pageSize: 10,
          }}
          onSelectionChange={(data) => {
            //Strip away the tableData field
            setSelectedInstruments(
              data.map((instrument) => {
                return {
                  id: instrument.id,
                  name: instrument.name,
                  shortCode: instrument.shortCode,
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
          {selectedInstruments.length} TODO(s) selected
        </Box>
        <Button
          type="button"
          onClick={onClickHandlerUpdateBtn}
          disabled={setSelectedInstruments.length === 0}
          data-cy="assign-selected-instruments"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
