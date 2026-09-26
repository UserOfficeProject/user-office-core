import Edit from '@mui/icons-material/Edit';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SimpleTabs from 'components/common/SimpleTabs';
import { BasicUserDetails } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AssignRolesView from './AssignRolesView';
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

  const tabNames = ['Edit Users', 'Assign Roles'];

  const tabs = tabNames.map((name) => {
    switch (name) {
      case 'Edit Users':
        return (
          <PeopleTable
            title="Users"
            action={{
              fn: (value) => setUserData(value as BasicUserDetails),
              actionText: 'Edit user',
              actionIcon: <Edit />,
            }}
            selection={false}
            showInvitationButtons
            search={false}
            customSearch={true}
            onRemove={(user: { id: number }) =>
              api({
                toastSuccessMessage: 'User removed successfully!',
              }).deleteUser({
                id: user.id,
              })
            }
            persistUrlQueryParams={true}
          />
        );
      case 'Assign Roles':
        return <AssignRolesView />;
      default:
        return null;
    }
  });

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper data-cy="people-table">
        <SimpleTabs tabNames={tabNames}>{tabs}</SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
