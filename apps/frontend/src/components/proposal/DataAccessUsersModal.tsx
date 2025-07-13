import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import UserManagementTable from 'components/common/UserManagementTable';
import { BasicUserDetails } from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { useDataAccessUsersData } from 'hooks/remoteUser/useDataAccessUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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
  const { proposalData } = useProposalData(proposalPk);
  const [managedUsers, setManagedUsers] = useState<BasicUserDetails[]>([]);
  const { api, isExecutingCall } = useDataApiWithFeedback();

  // Update managed users when data access users data changes
  React.useEffect(() => {
    if (dataAccessUsers && !loadingDataAccessUsers) {
      setManagedUsers(dataAccessUsers);
    }
  }, [dataAccessUsers, loadingDataAccessUsers]);

  // Calculate excludeUserIds from proposal data (proposer + co-proposers)
  const excludeUserIds = React.useMemo(() => {
    if (!proposalData) {
      return [];
    }

    const proposerId = proposalData.proposer?.id;
    const coProposerIds = proposalData.users?.map((user) => user.id) || [];

    return proposerId ? [proposerId, ...coProposerIds] : coProposerIds;
  }, [proposalData]);

  const handleUpdateDataAccessUsers = async () => {
    if (!proposalPk) {
      return;
    }

    const userIds = managedUsers.map((user) => user.id);

    try {
      await api({
        toastSuccessMessage: 'Data access users updated successfully!',
      }).updateDataAccessUsers({
        proposalPk,
        userIds,
      });
      onClose();
    } catch (error) {
      // Error handling is done by useDataApiWithFeedback
      console.error('Failed to update data access users:', error);
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      title="Data access users"
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
              title="Data access users"
              addButtonLabel="Add Data Access User"
              excludeUserIds={excludeUserIds}
            />
            <ActionButtonContainer>
              <Button
                onClick={onClose}
                variant="outlined"
                data-cy="close-data-access-users-modal"
              >
                Close
              </Button>
              <Button
                onClick={handleUpdateDataAccessUsers}
                variant="contained"
                disabled={isExecutingCall}
                data-cy="save-data-access-users-modal"
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
