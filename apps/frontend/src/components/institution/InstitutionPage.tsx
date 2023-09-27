import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import InstitutionTable from './InstitutionTable';

const InstrumentsPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <InstitutionTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default InstrumentsPage;
