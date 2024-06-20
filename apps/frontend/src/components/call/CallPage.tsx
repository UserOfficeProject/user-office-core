import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CallsTable from './CallsTable';

const CallPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <CallsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default CallPage;
