import { Grid } from '@material-ui/core';
import React from 'react';

import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import SEPsTableOfficer from './SEPsTableOfficer';

const SEPsPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <SEPsTableOfficer />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default SEPsPage;
