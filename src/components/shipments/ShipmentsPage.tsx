import { Grid } from '@material-ui/core';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ShipmentsTable from './ShipmentsTable';

function ShipmentsPage() {
  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <ShipmentsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}

export default ShipmentsPage;
