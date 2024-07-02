import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentFilterBar from './ExperimentFilterBar';
import ExperimentTable from './ExperimentTable';

function ExperimentPage() {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper data-cy="officer-scheduled-events-table">
        <ExperimentFilterBar />
        <ExperimentTable />
      </StyledPaper>
    </StyledContainer>
  );
}

export default ExperimentPage;
