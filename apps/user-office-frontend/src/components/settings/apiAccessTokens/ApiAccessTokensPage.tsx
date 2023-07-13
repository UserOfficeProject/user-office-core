import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ApiAccessTokensTable from './ApiAccessTokensTable';

const ApiAccessTokensPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <ApiAccessTokensTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ApiAccessTokensPage;
