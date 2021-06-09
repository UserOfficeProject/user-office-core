import { Grid } from '@material-ui/core';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import VisitsTable from './VisitsTable';

function MyVisits() {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <VisitsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}

export default MyVisits;
