import React from 'react';
import { useParams } from 'react-router';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateProposalEsi from './UpdateProposalEsi';

export default function UpdateProposalEsiPage() {
  const { esiId } = useParams<{ esiId: string }>();

  if (!esiId) {
    return <span>Missing query params</span>;
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="update-proposal-esi-table">
        <UpdateProposalEsi esiId={+esiId} />
      </StyledPaper>
    </StyledContainer>
  );
}
