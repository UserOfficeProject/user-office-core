import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import UserManagementTable from 'components/common/UserManagementTable';
import { BasicUserDetails } from 'generated/sdk';
import { useDataAccessUsersData } from 'hooks/remoteUser/useDataAccessUsersData';

type DataAccessUsersModalProps = {
  open: boolean;
  onClose: () => void;
  proposalPk?: number;
};

const DataAccessUsersModal = ({
  open,
  onClose,
  proposalPk,
}: DataAccessUsersModalProps) => {
  const { dataAccessUsers, loadingDataAccessUsers } =
    useDataAccessUsersData(proposalPk);
  const [managedUsers, setManagedUsers] = useState<BasicUserDetails[]>([]);

  // Update managed users when data access users data changes
  React.useEffect(() => {
    if (dataAccessUsers && !loadingDataAccessUsers) {
      setManagedUsers(dataAccessUsers);
    }
  }, [dataAccessUsers, loadingDataAccessUsers]);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      title="Remote Users"
    >
      <DialogContent>
        {loadingDataAccessUsers ? (
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

export default DataAccessUsersModal;
