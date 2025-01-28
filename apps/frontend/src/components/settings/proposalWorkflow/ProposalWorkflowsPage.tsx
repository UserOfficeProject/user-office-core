import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import WorkflowsTable from './workflowsTable';

const ProposalWorkflowsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <WorkflowsTable
          entityType="proposal"
          title="Proposal Workflows"
          createTitle="Create Proposal Workflow"
          editorPath={'ProposalWorkflowEditor'}
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalWorkflowsPage;
