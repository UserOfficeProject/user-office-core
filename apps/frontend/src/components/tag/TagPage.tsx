import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import TagTable from './TagTable';

const TagPage = () => {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <TagTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default TagPage;
