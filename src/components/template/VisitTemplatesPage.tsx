import Container from '@material-ui/core/Container';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import VisitsTemplatesTable from './VisitsTemplatesTable';

export default function VisitTemplatesPage() {
  const api = useDataApi();

  return (
    <Container>
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <VisitsTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: false,
                  group: TemplateGroupId.VISIT_REGISTRATION,
                },
              })
              .then((data) => data.templates || [])
          }
        />
        <VisitsTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: true,
                  group: TemplateGroupId.VISIT_REGISTRATION,
                },
              })
              .then((data) => data.templates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
