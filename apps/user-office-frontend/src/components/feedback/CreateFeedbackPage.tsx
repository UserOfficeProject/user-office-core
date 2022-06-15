import React from 'react';
import { useParams } from 'react-router';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CreateFeedback from './CreateFeedback';

function CreateFeedbackPage() {
  const { scheduledEventId } = useParams<{ scheduledEventId: string }>();

  if (!scheduledEventId) {
    return <span>Missing query params</span>;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <CreateFeedback scheduledEventId={+scheduledEventId} />
      </StyledPaper>
    </StyledContainer>
  );
}

export default CreateFeedbackPage;
