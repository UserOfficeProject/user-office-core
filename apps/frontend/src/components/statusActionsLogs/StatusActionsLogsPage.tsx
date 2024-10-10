import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import StatusActionsLogsTable from './StatusActionsLogsTable';

const StatusActionsLogsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <StatusActionsLogsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default StatusActionsLogsPage;
