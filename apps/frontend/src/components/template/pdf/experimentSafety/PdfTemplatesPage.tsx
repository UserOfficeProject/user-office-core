import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PdfTemplatesTable from '../experimentSafety/PdfTemplatesTable';

export default function PdfTemplatesPage() {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <PdfTemplatesTable isArchived={false} />
          <PdfTemplatesTable isArchived={true} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
