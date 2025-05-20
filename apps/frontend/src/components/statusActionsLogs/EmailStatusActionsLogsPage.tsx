import React from 'react';

import { StatusActionType } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import StatusActionsLogsTable from './StatusActionsLogsTable';

const EmailStatusActionsLogsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <StatusActionsLogsTable
          statusActionTypes={[
            StatusActionType.EMAIL,
            StatusActionType.RABBITMQ,
          ]}
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default EmailStatusActionsLogsPage;
