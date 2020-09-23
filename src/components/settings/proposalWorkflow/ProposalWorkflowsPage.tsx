import Grid from '@material-ui/core/Grid';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalWorkflowsTable from './ProposalWorkflowsTable';

const ProposalWorkflowsPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <ProposalWorkflowsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default ProposalWorkflowsPage;
