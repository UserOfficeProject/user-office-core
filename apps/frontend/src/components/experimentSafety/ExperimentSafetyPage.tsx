import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentSafety from './ExperimentSafety';

function ExperimentSafetyPage() {
  const { experimentSafetyPk } = useParams<{ experimentSafetyPk: string }>();

  if (!experimentSafetyPk) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="create-proposal-esi-table">
        <ExperimentSafety experimentSafetyPk={+experimentSafetyPk} />
      </StyledPaper>
    </StyledContainer>
  );
}

export default ExperimentSafetyPage;
