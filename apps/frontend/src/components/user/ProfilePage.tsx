import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateUserInformation from './UpdateUserInformation';

const ProfilePage = () => {
  const params = useParams();

  if (!params.id) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <UpdateUserInformation id={parseInt(params.id)} />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProfilePage;
