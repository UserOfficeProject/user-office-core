import Grid from '@material-ui/core/Grid';
import React from 'react';
import { useParams } from 'react-router';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateFeedback from './UpdateFeedback';

export default function UpdateFeedbackPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>();

  if (!feedbackId) {
    return <span>Missing query params</span>;
  }

  return (
    <ContentContainer maxWidth="md">
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <UpdateFeedback feedbackId={+feedbackId} />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}
