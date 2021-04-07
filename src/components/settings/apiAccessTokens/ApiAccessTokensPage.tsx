import Grid from '@material-ui/core/Grid';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ApiAccessTokensTable from './ApiAccessTokensTable';

const ApiAccessTokensPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <ApiAccessTokensTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default ApiAccessTokensPage;
