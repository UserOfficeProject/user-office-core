import Container from '@material-ui/core/Container';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import ProposalEsiTemplatesTable from './EsiTemplatesTable';

export default function ProposalEsiPage() {
  const api = useDataApi();

  return (
    <Container>
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <ProposalEsiTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: false,
                  group: TemplateGroupId.PROPOSAL_ESI,
                },
              })
              .then((data) => data.templates || [])
          }
        />
        <ProposalEsiTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: true,
                  group: TemplateGroupId.PROPOSAL_ESI,
                },
              })
              .then((data) => data.templates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
