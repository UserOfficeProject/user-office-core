import Edit from '@mui/icons-material/Edit';
import React, { useState } from 'react';
import { useHistory } from 'react-router';

import { BasicUserDetails } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import PeopleTable from './PeopleTable';

export default function PeoplePage() {
  const [userData, setUserData] = useState<BasicUserDetails | null>(null);
  const { api } = useDataApiWithFeedback();
  const history = useHistory();

  if (userData) {
    setTimeout(() => {
      history.push(`/People/${userData.id}`);
    });
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="people-table">
        <PeopleTable
          title="Users"
          action={{
            fn: (value) => setUserData(value as BasicUserDetails),
            actionText: 'Edit user',
            actionIcon: <Edit />,
          }}
          selection={false}
          showInvitationButtons
          onRemove={(user: { id: number }) =>
            api({
              toastSuccessMessage: 'User removed successfully!',
            }).deleteUser({
              id: user.id,
            })
          }
        />
      </StyledPaper>
    </StyledContainer>
  );
}
