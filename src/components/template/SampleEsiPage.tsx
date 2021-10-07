import Container from '@material-ui/core/Container';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import SampleEsiTemplatesTable from './SampleEsiTemplatesTable';

export default function EsiPage() {
  const api = useDataApi();

  return (
    <Container>
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <SampleEsiTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: false,
                  group: TemplateGroupId.SAMPLE_ESI,
                },
              })
              .then((data) => data.templates || [])
          }
        />
        <SampleEsiTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: true,
                  group: TemplateGroupId.SAMPLE_ESI,
                },
              })
              .then((data) => data.templates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
