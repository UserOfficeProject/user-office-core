import AddBox from '@mui/icons-material/AddBox';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import PeopleTable from 'components/user/PeopleTable';
import ProposalPeopleTable from 'components/user/ProposalsPeopleTable';
import { UserRole, BasicUserDetails } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    padding: theme.spacing(0.5),
    textAlign: 'right',
  },
  selectedUsersText: {
    paddingRight: theme.spacing(1),
  },
}));

type ParticipantModalProps = {
  title: string;
  addParticipants: (data: BasicUserDetails[]) => void;
  show: boolean;
  close: () => void;
  selection?: boolean;
  selectedUsers?: number[];
  userRole?: UserRole;
  invitationUserRole?: UserRole;
  participant?: boolean;
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
};

const ParticipantModal = ({
  addParticipants,
  close,
  show,
  title,
  invitationUserRole,
  participant,
  selectedUsers,
  selection,
  userRole,
  setPrincipalInvestigator,
}: ParticipantModalProps) => {
  const classes = useStyles();
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

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
    selection: !!selection,
    onUpdate: (data: BasicUserDetails[]) => addParticipants(data),
    invitationUserRole: invitationUserRole || userRole,
    setPrincipalInvestigator: setPrincipalInvestigator,
  };

  const peopleTablesProps = {
    selectedParticipants,
    setSelectedParticipants,
    ...userTableProps,
  };

  const peopleTable = <PeopleTable {...peopleTablesProps} />;
  const proposalPeopleTable = <ProposalPeopleTable {...peopleTablesProps} />;

  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={show}
      onClose={(_, reason) => {
        if (reason && reason == 'backdropClick') return;
        close();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <IconButton data-cy="close-modal-btn" onClick={close}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {participant && !isUserOfficer ? proposalPeopleTable : peopleTable}
      </DialogContent>
      {selection && (
        <DialogActions>
          <div className={classes.selectedUsersText}>
            {selectedParticipants.length} user(s) selected
          </div>
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

export default ParticipantModal;
