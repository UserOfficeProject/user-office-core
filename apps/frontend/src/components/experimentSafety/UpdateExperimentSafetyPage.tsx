import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateProposalEsi from '../proposalEsi/UpdateProposalEsi';

export default function UpdateExperimentSafetyPage() {
  const { esiId } = useParams<{ esiId: string }>();

  if (!esiId) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="update-proposal-esi-table">
        <UpdateProposalEsi esiId={+esiId} />
      </StyledPaper>
    </StyledContainer>
  );
}
