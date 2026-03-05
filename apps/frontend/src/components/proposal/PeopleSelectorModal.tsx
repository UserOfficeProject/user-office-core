import AddBox from '@mui/icons-material/AddBox';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { UserRole, BasicUserDetails } from 'generated/sdk';

type PeopleSelectorModalProps = {
  title: string;
  addParticipants: (data: BasicUserDetails[]) => void;
  show: boolean;
  close: () => void;
  selection?: boolean;
  selectedUsers?: number[];
  userRole?: UserRole;
  invitationUserRole?: UserRole;
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
};

const PeopleSelectorModal = ({
  addParticipants,
  close,
  show,
  title,
  invitationUserRole,
  selectedUsers,
  selection,
  userRole,
  setPrincipalInvestigator,
}: PeopleSelectorModalProps) => {
  const theme = useTheme();
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);

  const addUser = (rowData: BasicUserDetails | BasicUserDetails[]) => {
    const addedUserDetails = rowData as BasicUserDetails;

    addParticipants([addedUserDetails]);
  };

  const onClickHandlerUpdateBtn = () => {
    addParticipants(selectedParticipants);
    setSelectedParticipants([]);
  };

  const userTableProps = {
    title: title,
    action: {
      fn: addUser,
      actionText: 'Select user',
      actionIcon: <AddBox data-cy="select-user" />,
    },
    selectedUsers: selectedUsers,
    userRole: userRole || ('' as UserRole),
    emailInvite: true,
    emailSearch: true,
    selection: !!selection,
    onUpdate: (data: BasicUserDetails[]) => addParticipants(data),
    invitationUserRole: invitationUserRole || userRole,
    setPrincipalInvestigator: setPrincipalInvestigator,
    search: true,
  };

  const peopleTablesProps = {
    selectedParticipants,
    setSelectedParticipants,
    ...userTableProps,
  };

  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={show}
      onClose={(_, reason) => {
        if (reason && reason == 'backdropClick') return;
        setSelectedParticipants([]);
        close();
      }}
      maxWidth="sm"
      fullWidth
      data-cy="participant-modal"
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
            setSelectedParticipants([]);
            close();
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <PeopleTable {...peopleTablesProps} />
      </DialogContent>
      {selection && (
        <DialogActions>
          <Box
            sx={{
              paddingRight: theme.spacing(1),
            }}
          >
            {selectedParticipants.length} user(s) selected
          </Box>
          <Button
            type="button"
            onClick={onClickHandlerUpdateBtn}
            disabled={selectedParticipants.length === 0}
            data-cy="assign-selected-users"
          >
            Update
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PeopleSelectorModal;
