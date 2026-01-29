import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import AccessTable from './AccessTable';

const AccessPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <AccessTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default AccessPage;