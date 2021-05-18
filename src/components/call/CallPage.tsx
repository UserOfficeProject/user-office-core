import Grid from '@material-ui/core/Grid';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import CallsTable from './CallsTable';

const CallPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <CallsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default CallPage;
