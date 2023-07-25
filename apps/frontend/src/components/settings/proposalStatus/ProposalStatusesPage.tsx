import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalStatusesTable from './ProposalStatusesTable';

const ProposalStatusesPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <ProposalStatusesTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalStatusesPage;
