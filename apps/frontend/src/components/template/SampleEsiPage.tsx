import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import DefaultTemplatesTable from './DefaultTemplatesTable';

export default function SampleEsiPage() {
  const templateGroup = TemplateGroupId.SAMPLE_ESI;
  const itemCountLabel = '# Sample ESIs';

  return (
    <StyledContainer>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <DefaultTemplatesTable
            templateGroup={templateGroup}
            itemCountLabel={itemCountLabel}
            isArchived={false}
          />
          <DefaultTemplatesTable
            templateGroup={templateGroup}
            itemCountLabel={itemCountLabel}
            isArchived={true}
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
