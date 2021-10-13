import Grid from '@material-ui/core/Grid';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ContentContainer } from 'styles/StyledComponents';

import GenericTemplatesTable from './GenericTemplatesTable';

export default function GenericTemplates() {
  const api = useDataApi();

  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <SimpleTabs tabNames={['Current', 'Archived']}>
            <GenericTemplatesTable
              dataProvider={() =>
                api()
                  .getTemplates({
                    filter: {
                      isArchived: false,
                      group: TemplateGroupId.GENERIC_TEMPLATE,
                    },
                  })
                  .then((data) => data.templates || [])
              }
            />
            <GenericTemplatesTable
              dataProvider={() =>
                api()
                  .getTemplates({
                    filter: {
                      isArchived: true,
                      group: TemplateGroupId.GENERIC_TEMPLATE,
                    },
                  })
                  .then((data) => data.templates || [])
              }
            />
          </SimpleTabs>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}
