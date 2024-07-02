import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FeaturesTable from './FeaturesTable';

const FeaturesPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <FeaturesTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default FeaturesPage;
