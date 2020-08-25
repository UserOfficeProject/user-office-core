import Container from '@material-ui/core/Container';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateCategoryId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import SampleTemplatesTable from './SampleTemplatesTable';

export default function SampleTemplates() {
  const api = useDataApi();

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <SampleTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: false,
                  category: TemplateCategoryId.SAMPLE_DECLARATION,
                },
              })
              .then(data => data.templates || [])
          }
        />
        <SampleTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: true,
                  category: TemplateCategoryId.SAMPLE_DECLARATION,
                },
              })
              .then(data => data.templates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
