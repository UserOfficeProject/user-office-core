import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FacilityTable from './FacilityTable';

const FacilityPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <FacilityTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default FacilityPage;
