import Edit from '@mui/icons-material/Edit';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BasicUserDetails } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import PeopleTable from './PeopleTable';

export default function PeoplePage() {
  const [userData, setUserData] = useState<BasicUserDetails | null>(null);
  const { api } = useDataApiWithFeedback();
  const navigate = useNavigate();

  if (userData) {
    setTimeout(() => {
      navigate(`/People/${userData.id}`);
    });
  }

  return (
    <StyledContainer maxWidth={false}>
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
          search
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
