import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CreateExperimentSafety from './CreateExperimentSafety';

function CreateExperimentSafetyPage() {
  const { experimentPk } = useParams<{ experimentPk: string }>();

  if (!experimentPk) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <StyledPaper data-cy="create-proposal-esi-table">
        <CreateExperimentSafety experimentPk={+experimentPk} />
      </StyledPaper>
    </StyledContainer>
  );
}

export default CreateExperimentSafetyPage;
