import { Container } from '@material-ui/core';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';

import DefaultTemplatesTable from './DefaultTemplatesTable';

export default function SampleEsiPage() {
  const templateGroup = TemplateGroupId.SAMPLE_ESI;
  const itemCountLabel = '# Sample ESIs';

  return (
    <Container>
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
    </Container>
  );
}
