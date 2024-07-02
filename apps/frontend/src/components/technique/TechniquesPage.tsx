import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import TechniqueTable from './TechniqueTable';

const TechniquesPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <TechniqueTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default TechniquesPage;
