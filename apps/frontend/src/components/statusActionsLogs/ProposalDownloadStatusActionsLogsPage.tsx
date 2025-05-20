import React from 'react';

import { StatusActionType } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import StatusActionsLogsTable from './StatusActionsLogsTable';

const ProposalDownloadStatusActionsLogsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <StatusActionsLogsTable
          statusActionTypes={[StatusActionType.PROPOSALDOWNLOAD]}
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalDownloadStatusActionsLogsPage;
