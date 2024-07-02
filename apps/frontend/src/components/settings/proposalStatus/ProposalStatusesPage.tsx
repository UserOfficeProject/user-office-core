import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalStatusesTable from './ProposalStatusesTable';

const ProposalStatusesPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <ProposalStatusesTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalStatusesPage;
