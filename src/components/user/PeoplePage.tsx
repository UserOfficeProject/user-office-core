import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Edit from '@material-ui/icons/Edit';
import React, { useState } from 'react';
import { useHistory } from 'react-router';

import { UserRole } from 'generated/sdk';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import InviteUserForm from './InviteUserForm';
import PeopleTable from './PeopleTable';

export default function PeoplePage() {
  const [userData, setUserData] = useState<{ id: number } | null>(null);
  const [sendUserEmail, setSendUserEmail] = useState({
    show: false,
    title: '',
    userRole: UserRole.USER,
  });
  const { api } = useDataApiWithFeedback();
  const history = useHistory();

  if (userData) {
    setTimeout(() => {
      history.push(`/PeoplePage/${userData.id}`);
    });
  }

  const invitationButtons = [];

  invitationButtons.push({
    title: 'Invite User',
    action: () =>
      setSendUserEmail({
        show: true,
        title: 'Invite User',
        userRole: UserRole.USER,
      }),
    'data-cy': 'invite-user-button',
  });

  invitationButtons.push({
    title: 'Invite Reviewer',
    action: () =>
      setSendUserEmail({
        show: true,
        title: 'Invite Reviewer',
        userRole: UserRole.SEP_REVIEWER,
      }),
    'data-cy': 'invite-reviewer-button',
  });

  return (
    <ContentContainer>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={sendUserEmail.show}
        onClose={(): void =>
          setSendUserEmail({
            ...sendUserEmail,
            show: false,
          })
        }
        style={{ backdropFilter: 'blur(6px)' }}
      >
        <DialogContent>
          <InviteUserForm
            title={sendUserEmail.title}
            userRole={sendUserEmail.userRole}
            close={() =>
              setSendUserEmail({
                ...sendUserEmail,
                show: false,
              })
            }
            action={(invitedUser) => {
              console.log('action', invitedUser);
              // setUserData([...userData, {}])
            }}
          />
        </DialogContent>
      </Dialog>
      <Grid container>
        <Grid item xs={12} data-cy="people-table">
          <StyledPaper>
            <PeopleTable
              title="Users"
              action={{
                fn: setUserData,
                actionText: 'Edit user',
                actionIcon: <Edit />,
              }}
              selection={false}
              invitationButtons={invitationButtons}
              onRemove={(user: { id: number }) =>
                api('User removed successfully!').deleteUser({
                  id: user.id,
                })
              }
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}
