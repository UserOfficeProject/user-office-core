import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CreateProposalEsi from './CreateProposalEsi';

function CreateProposalEsiPage() {
  const { scheduledEventId } = useParams<{ scheduledEventId: string }>();

  if (!scheduledEventId) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="create-proposal-esi-table">
        <CreateProposalEsi scheduledEventId={+scheduledEventId} />
      </StyledPaper>
    </StyledContainer>
  );
}

export default CreateProposalEsiPage;
