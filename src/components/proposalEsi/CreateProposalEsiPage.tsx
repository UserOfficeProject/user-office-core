import React from 'react';
import { useParams } from 'react-router';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CreateProposalEsi from './CreateProposalEsi';

function CreateProposalEsiPage() {
  const { scheduledEventId } = useParams<{ scheduledEventId: string }>();

  if (!scheduledEventId) {
    return <span>Missing query params</span>;
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
