import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import EmailTemplatesTable from './EmailTemplateTable';

const EmailTemplatesPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <EmailTemplatesTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default EmailTemplatesPage;
