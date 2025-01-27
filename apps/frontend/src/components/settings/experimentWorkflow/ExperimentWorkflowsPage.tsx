import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import WorkflowsTable from '../proposalWorkflow/workflowsTable';

const ExperimentWorkflowsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <WorkflowsTable entityType="experiment" />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ExperimentWorkflowsPage;
