import React from 'react';

import { WorkflowType } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import WorkflowsTable from './workflowsTable';

const ProposalWorkflowsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <WorkflowsTable
          entityType={WorkflowType.PROPOSAL}
          title="Proposal Workflows"
          createTitle="Create Proposal Workflow"
          editorPath={'ProposalWorkflowEditor'}
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalWorkflowsPage;
