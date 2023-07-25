import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import InstrumentTable from './InstrumentTable';

const InstrumentsPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <InstrumentTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default InstrumentsPage;
