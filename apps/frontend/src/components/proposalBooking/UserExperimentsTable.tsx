import React from 'react';

import { ExperimentStatus } from 'generated/sdk';
import { useUserExperiments } from 'hooks/experiment/useUserExperiments';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentsTimesTable from './ExperimentTimesTable';

export default function UserExperimentTimesTable() {
  const { loading, userExperiments } = useUserExperiments({
    filter: { status: [ExperimentStatus.ACTIVE, ExperimentStatus.COMPLETED] },
  });

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <ExperimentsTimesTable
          isLoading={loading}
          experiments={userExperiments}
          title="Experiment Times"
          options={{
            search: true,
            padding: 'default',
            emptyRowsWhenPaging: true,
            paging: true,
          }}
        />
      </StyledPaper>
    </StyledContainer>
  );
}
