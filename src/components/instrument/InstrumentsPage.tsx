import { Grid } from '@material-ui/core';
import React from 'react';

import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import InstrumentsTable from './InstrumentsTableHoC';

const InstrumentsPage: React.FC = () => {
  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <InstrumentsTable />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default InstrumentsPage;
