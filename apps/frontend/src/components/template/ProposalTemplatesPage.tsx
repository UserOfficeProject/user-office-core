import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalTemplatesTable from './ProposalTemplatesTable';

export default function ProposalTemplatesPage() {
  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <ProposalTemplatesTable isArchived={false} />
          <ProposalTemplatesTable isArchived={true} />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
