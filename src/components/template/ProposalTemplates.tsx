import { Container } from '@material-ui/core';
import React from 'react';

import { useDataApi } from '../../hooks/useDataApi';
import SimpleTabs from '../common/TabPanel';
import ProposalTemplatesTable from './ProposalTemplatesTable';

export default function ProposalTemplates() {
  const api = useDataApi();

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <ProposalTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({ filter: { isArchived: false } })
              .then(data => data.templates || [])
          }
        />
        <ProposalTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({ filter: { isArchived: true } })
              .then(data => data.templates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
