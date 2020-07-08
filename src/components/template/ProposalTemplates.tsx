import { Container } from '@material-ui/core';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { useDataApi } from 'hooks/useDataApi';

import ProposalTemplatesTable from './ProposalTemplatesTable';

export default function ProposalTemplates() {
  const api = useDataApi();

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <ProposalTemplatesTable
          dataProvider={() =>
            api()
              .getProposalTemplates({ filter: { isArchived: false } })
              .then(data => data.proposalTemplates || [])
          }
        />
        <ProposalTemplatesTable
          dataProvider={() =>
            api()
              .getProposalTemplates({ filter: { isArchived: true } })
              .then(data => data.proposalTemplates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
