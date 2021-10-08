import Grid from '@material-ui/core/Grid';
import React from 'react';
import { useParams } from 'react-router';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateProposalEsi from './UpdateProposalEsi';

export default function UpdateProposalEsiPage() {
  const { esiId } = useParams<{ esiId: string }>();

  if (!esiId) {
    return <span>Missing query params</span>;
  }

  return (
    <ContentContainer maxWidth="md">
      <Grid container>
        <Grid item xs={12} data-cy="update-proposal-esi-table">
          <StyledPaper>
            <UpdateProposalEsi esiId={+esiId} />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}
