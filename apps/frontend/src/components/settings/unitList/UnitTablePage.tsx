import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UnitTable from './UnitTable';

const UnitTablePage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <UnitTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default UnitTablePage;
