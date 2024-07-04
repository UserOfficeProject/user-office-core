import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalWorkflowsTable from './ProposalWorkflowsTable';

const ProposalWorkflowsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <ProposalWorkflowsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalWorkflowsPage;
