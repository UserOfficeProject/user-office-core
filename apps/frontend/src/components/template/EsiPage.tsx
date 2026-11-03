import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalEsiTemplatesTable from './ProposalESITemplatesTable';

export default function ProposalEsiPage() {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <ProposalEsiTemplatesTable isArchived={false} />
          <ProposalEsiTemplatesTable isArchived={true} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
