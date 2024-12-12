import Edit from '@mui/icons-material/Edit';
import { Button, Dialog, DialogContent } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { BasicUserDetails } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import InviteByEmailForm from './InviteByEmailForm';
import PeopleTable from './PeopleTable';

export default function PeoplePage() {
  const [userData, setUserData] = useState<BasicUserDetails | null>(null);
  const { api } = useDataApiWithFeedback();
  const navigate = useNavigate();
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);

  if (userData) {
    setTimeout(() => {
      navigate(`/People/${userData.id}`);
    });
  }

  return (
    <>
      <StyledContainer maxWidth={false}>
        <StyledPaper data-cy="people-table">
          <Dialog
            maxWidth="xs"
            open={isInviteFormOpen}
            onClose={() => setIsInviteFormOpen(false)}
            fullWidth={false}
            title="Invite User"
          >
            <DialogContent>
              <InviteByEmailForm close={() => setIsInviteFormOpen(false)} />
            </DialogContent>
          </Dialog>
          <PeopleTable
            title="Users"
            action={{
              fn: (value) => setUserData(value as BasicUserDetails),
              actionText: 'Edit user',
              actionIcon: <Edit />,
            }}
            selection={false}
            search
            onRemove={(user: { id: number }) =>
              api({
                toastSuccessMessage: 'User removed successfully!',
              }).deleteUser({
                id: user.id,
              })
            }
          />
          <ActionButtonContainer>
            <Button
              type="button"
              onClick={() => setIsInviteFormOpen(true)}
              data-cy="invite-user"
            >
              Invite User
            </Button>
          </ActionButtonContainer>
        </StyledPaper>
      </StyledContainer>
    </>
  );
}
