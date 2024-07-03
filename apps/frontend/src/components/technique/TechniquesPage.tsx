import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import TechniqueTable from './TechniqueTable';

const TechniquesPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <TechniqueTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default TechniquesPage;
