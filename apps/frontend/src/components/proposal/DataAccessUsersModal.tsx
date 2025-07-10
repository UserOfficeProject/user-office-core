import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import UserManagementTable from 'components/common/UserManagementTable';
import { BasicUserDetails } from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
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
  const { proposalData } = useProposalData(proposalPk);
  const [managedUsers, setManagedUsers] = useState<BasicUserDetails[]>([]);

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
                onClick={onClose}
                variant="contained"
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
