import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import { StyledContainer } from 'styles/StyledComponents';

import ExperimentSafety from './ExperimentSafety';

function ExperimentSafetyPage() {
  const { experimentSafetyPk } = useParams<{ experimentSafetyPk: string }>();

  if (!experimentSafetyPk) {
    return <NotFound />;
  }

  return (
    <StyledContainer>
      <ExperimentSafety experimentSafetyPk={+experimentSafetyPk} />
    </StyledContainer>
  );
}

export default ExperimentSafetyPage;
