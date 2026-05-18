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

import { Technique } from 'generated/sdk';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';

export const SelectTechniqueModal = ({
  preSelectedTechniques,
  open,
  addTechniques,
  close,
}: {
  tagId: number;
  preSelectedTechniques: number[] | undefined;
  open: boolean;
  addTechniques: (techniques: Pick<Technique, 'id' | 'shortCode'>[]) => void;
  close: () => void;
}) => {
  const theme = useTheme();
  const [selectedTechniques, setSelectedTechniques] = useState<
    Pick<Technique, 'id' | 'shortCode'>[]
  >([]);

  const { techniques, loadingTechniques } = useTechniquesData();

  const onClickHandlerUpdateBtn = () => {
    addTechniques(selectedTechniques);
    setSelectedTechniques([]);
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason && reason == 'backdropClick') return;
        setSelectedTechniques([]);
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
            setSelectedTechniques([]);
            close();
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MaterialTable
          title="Assign Techniques to Tag"
          columns={[{ title: 'Short Code', field: 'shortCode' }]}
          data={
            preSelectedTechniques
              ? techniques.filter(
                  (technique) => !preSelectedTechniques.includes(technique.id)
                )
              : techniques
          }
          isLoading={loadingTechniques}
          options={{
            selection: true,
            pageSize: 10,
          }}
          onSelectionChange={(data) => {
            //Strip away the tableData field
            setSelectedTechniques(
              data.map((technique) => {
                return {
                  id: technique.id,
                  shortCode: technique.shortCode,
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
          {`${selectedTechniques.length} Technique(s) selected`}
        </Box>
        <Button
          type="button"
          onClick={onClickHandlerUpdateBtn}
          disabled={setSelectedTechniques.length === 0}
          data-cy="assign-selected-techniques"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
