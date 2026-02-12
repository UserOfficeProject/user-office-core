import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PermissionsTable from './PermissionsTable';

const PermissionPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <PermissionsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default PermissionPage;