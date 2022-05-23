import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FeaturesTable from './FeaturesTable';

const FeaturesPage: React.FC = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <FeaturesTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default FeaturesPage;
