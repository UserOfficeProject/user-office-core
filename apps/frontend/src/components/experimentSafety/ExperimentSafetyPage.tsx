import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentSafety from './ExperimentSafety';

function ExperimentSafetyPage() {
  const { experimentPk } = useParams<{ experimentPk: string }>();

  if (!experimentPk) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="create-proposal-esi-table">
        <ExperimentSafety experimentPk={+experimentPk} />
      </StyledPaper>
    </StyledContainer>
  );
}

export default ExperimentSafetyPage;
