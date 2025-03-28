import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CreateFeedback from './CreateFeedback';

function CreateFeedbackPage() {
  const { experimentPk } = useParams<{ experimentPk: string }>();

  if (!experimentPk) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <CreateFeedback experimentPk={+experimentPk} />
      </StyledPaper>
    </StyledContainer>
  );
}

export default CreateFeedbackPage;
