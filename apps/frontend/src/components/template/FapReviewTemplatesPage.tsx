import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FapReviewTemplatesTable from './FapReviewTemplatesTable';

export default function FapReviewTemplatesPage() {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <FapReviewTemplatesTable isArchived={false} />
          <FapReviewTemplatesTable isArchived={true} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
