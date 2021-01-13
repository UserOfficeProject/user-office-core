import { Grid } from '@material-ui/core';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

function ShipmentsPage() {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>{/* <UserShipmentsTable /> */}</StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}

export default ShipmentsPage;
