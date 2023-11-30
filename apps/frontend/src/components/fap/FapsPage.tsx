import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FapsTable from './FapsTable';

const FapsPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <FapsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default FapsPage;
