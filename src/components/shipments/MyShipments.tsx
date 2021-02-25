import { Grid } from '@material-ui/core';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ShipmentsTable from './ShipmentsTable';

function MyShipments() {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <ShipmentsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}

export default MyShipments;
