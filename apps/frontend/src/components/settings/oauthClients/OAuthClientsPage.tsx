import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import OAuthClientsTable from './OAuthClientsTable';

const OAuthClientsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <OAuthClientsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default OAuthClientsPage;
