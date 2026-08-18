import EventBusyIcon from '@mui/icons-material/EventBusy';
import React from 'react';

import CardEmptyState from 'components/common/cards/CardEmptyState';
import { useCardRows } from 'hooks/common/useResponsive';
import { useUserExperiments } from 'hooks/experiment/useUserExperiments';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentsTimesTable from './ExperimentTimesTable';

export default function UserExperimentTimesTable() {
  const { loading, userExperiments } = useUserExperiments({ notDraft: true });
  const asCards = useCardRows();

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        {asCards && !loading && userExperiments.length === 0 ? (
          <CardEmptyState
            icon={<EventBusyIcon fontSize="large" color="disabled" />}
            title="No experiment times"
            description="When a proposal of yours is accepted and scheduled, its beamtime will be listed here with the instrument and your local contact."
          />
        ) : (
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
        )}
      </StyledPaper>
    </StyledContainer>
  );
}
