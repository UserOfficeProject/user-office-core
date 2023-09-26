import React from 'react';
import { useParams } from 'react-router';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateFeedback from './UpdateFeedback';

export default function UpdateFeedbackPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>();

  if (!feedbackId) {
    return <span>Missing query params</span>;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <UpdateFeedback feedbackId={+feedbackId} />
      </StyledPaper>
    </StyledContainer>
  );
}
