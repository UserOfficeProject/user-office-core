import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CallsTable from './CallsTable';

const CallPage: React.FC = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <CallsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default CallPage;
