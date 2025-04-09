import React from 'react';

import { WorkflowType } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import WorkflowsTable from '../workflow/workflowsTable';

const ExperimentWorkflowsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <WorkflowsTable
          entityType={WorkflowType.EXPERIMENT}
          editorPath="ExperimentWorkflowEditor"
          title="Experiment workflows"
          createTitle="Create Experiment Workflow"
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ExperimentWorkflowsPage;
