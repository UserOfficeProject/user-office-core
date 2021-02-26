import Container from '@material-ui/core/Container';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateCategoryId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import ShipmentTemplatesTable from './ShipmentTemplatesTable';

export default function ShipmentTemplatesPage() {
  const api = useDataApi();

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Current', 'Archived']}>
        <ShipmentTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: false,
                  category: TemplateCategoryId.SHIPMENT_DECLARATION,
                },
              })
              .then((data) => data.templates || [])
          }
        />
        <ShipmentTemplatesTable
          dataProvider={() =>
            api()
              .getTemplates({
                filter: {
                  isArchived: true,
                  category: TemplateCategoryId.SAMPLE_DECLARATION,
                },
              })
              .then((data) => data.templates || [])
          }
        />
      </SimpleTabs>
    </Container>
  );
}
