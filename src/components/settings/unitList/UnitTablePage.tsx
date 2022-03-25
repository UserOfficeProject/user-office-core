import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UnitTable from './UnitTable';

const UnitTablePage: React.FC = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <UnitTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default UnitTablePage;
