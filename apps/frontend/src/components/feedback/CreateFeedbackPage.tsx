import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CreateFeedback from './CreateFeedback';

function CreateFeedbackPage() {
  const { scheduledEventId } = useParams<{ scheduledEventId: string }>();

  if (!scheduledEventId) {
    return <NotFound />;
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
