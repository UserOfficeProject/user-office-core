import Grid from '@material-ui/core/Grid';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalStatusesTable from './ProposalStatusesTable';

const ProposalStatusesPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <ProposalStatusesTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default ProposalStatusesPage;
