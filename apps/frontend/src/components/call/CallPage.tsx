import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CallsTable from './CallsTable';

const CallPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <CallsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default CallPage;
