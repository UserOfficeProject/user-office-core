import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import AppSettingsTable from './AppSettingsTable';

const AppSettingsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <AppSettingsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default AppSettingsPage;
