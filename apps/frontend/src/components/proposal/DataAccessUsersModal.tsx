import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import UserManagementTable from 'components/common/UserManagementTable';
import { BasicUserDetails, Invite } from 'generated/sdk';
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
  const { proposalData, loading: loadingProposal } =
    useProposalData(proposalPk);
  const [managedUsers, setManagedUsers] = useState<BasicUserDetails[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const { api, isExecutingCall } = useDataApiWithFeedback();

  // Update managed users when data access users data changes
  React.useEffect(() => {
    if (dataAccessUsers && !loadingDataAccessUsers) {
      setManagedUsers(dataAccessUsers);
    }
  }, [dataAccessUsers, loadingDataAccessUsers]);

  // Seed existing data access invites from the proposal
  React.useEffect(() => {
    if (proposalData?.dataAccessInvites) {
      setInvites(proposalData.dataAccessInvites);
    }
  }, [proposalData]);

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
    const emails = invites.map((invite) => invite.email);

    try {
      await api().updateDataAccessUsers({
        proposalPk,
        userIds,
      });
      await api({
        toastSuccessMessage: 'Data access users updated successfully!',
      }).setDataAccessInvites({
        input: { proposalPk, emails },
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
        {loadingDataAccessUsers || loadingProposal ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <UserManagementTable
              users={managedUsers}
              setUsers={setManagedUsers}
              invites={invites}
              setInvites={setInvites}
              title="Data access users"
              addButtonLabel="Add Data Access User"
              addModalTitle="Add Data Access User"
              excludeUserIds={excludeUserIds}
              allowInviteByEmail={true}
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
