import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import InstitutionTable from './InstitutionTable';

const InstrumentsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <InstitutionTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default InstrumentsPage;
