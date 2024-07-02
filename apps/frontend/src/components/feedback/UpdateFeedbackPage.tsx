import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateFeedback from './UpdateFeedback';

export default function UpdateFeedbackPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>();

  if (!feedbackId) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <UpdateFeedback feedbackId={+feedbackId} />
      </StyledPaper>
    </StyledContainer>
  );
}
