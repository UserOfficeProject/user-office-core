import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import TechnicalReviewTemplatesTable from './TechnicalReviewTemplatesTable';

export default function TechnicalReviewTemplatesPage() {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <TechnicalReviewTemplatesTable isArchived={false} />
          <TechnicalReviewTemplatesTable isArchived={true} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
