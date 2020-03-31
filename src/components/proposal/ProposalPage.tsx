import Grid from '@material-ui/core/Grid';
import React from 'react';

import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import ProposalTableOfficer from './ProposalTableOfficer';

export default function ProposalPage() {
  return (
    <>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <ProposalTableOfficer />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}
