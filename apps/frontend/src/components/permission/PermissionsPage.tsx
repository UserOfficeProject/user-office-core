import React from 'react';

import 'react-querybuilder/dist/query-builder.css';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import { PermissionsBuilder } from './PermissionsBuilder';

const PermissionsPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <PermissionsBuilder />
      </StyledPaper>
    </StyledContainer>
  );
};

export default PermissionsPage;
