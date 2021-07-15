import Grid from '@material-ui/core/Grid';
import Edit from '@material-ui/icons/Edit';
import React, { useState } from 'react';
import { useHistory } from 'react-router';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import PeopleTable from './PeopleTable';

export default function PeoplePage() {
  const [userData, setUserData] = useState<{ id: number } | null>(null);
  const { api } = useDataApiWithFeedback();
  const history = useHistory();

  if (userData) {
    setTimeout(() => {
      history.push(`/PeoplePage/${userData.id}`);
    });
  }

  return (
    <ContentContainer>
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
              showInvitationButtons
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
