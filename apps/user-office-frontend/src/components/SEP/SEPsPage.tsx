import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import SEPsTable from './SEPsTable';

const SEPsPage: React.FC = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <SEPsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default SEPsPage;
