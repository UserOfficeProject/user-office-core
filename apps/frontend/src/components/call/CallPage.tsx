import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import CallsTable from './CallsTable';

const CallPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <CallsTable isArchivedTab={true} />
          <CallsTable isArchivedTab={false} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
};

export default CallPage;
