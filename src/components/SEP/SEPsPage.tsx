import Grid from '@material-ui/core/Grid';
import React from 'react';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import SEPsTable from './SEPsTable';

const SEPsPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <SEPsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default SEPsPage;
