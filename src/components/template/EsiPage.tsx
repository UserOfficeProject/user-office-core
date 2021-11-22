import { Container } from '@material-ui/core';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';

import DefaultTemplatesTable from './DefaultTemplatesTable';

export default function ProposalEsiPage() {
  const templateGroup = TemplateGroupId.PROPOSAL_ESI;
  const itemCountLabel = 'Proposal safety reviews';

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
