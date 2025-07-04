import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import UserManagementTable from 'components/common/UserManagementTable';
import { BasicUserDetails } from 'generated/sdk';
import { useRemoteUsersData } from 'hooks/remoteUser/useRemoteUsersData';

type RemoteUsersModalProps = {
  open: boolean;
  onClose: () => void;
  proposalPk?: number;
};

const RemoteUsersModal = ({
  open,
  onClose,
  proposalPk,
}: RemoteUsersModalProps) => {
  const { remoteUsers, loadingRemoteUsers } = useRemoteUsersData(proposalPk);
  const [managedUsers, setManagedUsers] = useState<BasicUserDetails[]>([]);

  // Update managed users when remote users data changes
  React.useEffect(() => {
    if (remoteUsers && !loadingRemoteUsers) {
      setManagedUsers(remoteUsers);
    }
  }, [remoteUsers, loadingRemoteUsers]);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      title="Remote Users"
    >
      <DialogContent>
        {loadingRemoteUsers ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <UserManagementTable
              users={managedUsers}
              setUsers={setManagedUsers}
              invites={[]}
              setInvites={() => {}}
              title="Remote Users"
              addButtonLabel="Add Remote User"
            />
            <ActionButtonContainer>
              <Button
                onClick={onClose}
                variant="outlined"
                data-cy="close-remote-users-modal"
              >
                Close
              </Button>
              <Button
                onClick={onClose}
                variant="contained"
                data-cy="save-remote-users-modal"
              >
                Update
              </Button>
            </ActionButtonContainer>
          </>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default RemoteUsersModal;
