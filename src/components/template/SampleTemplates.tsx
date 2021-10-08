import Grid from '@material-ui/core/Grid';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ContentContainer } from 'styles/StyledComponents';

import SampleTemplatesTable from './SampleTemplatesTable';

export default function SampleTemplates() {
  const api = useDataApi();

  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <SimpleTabs tabNames={['Current', 'Archived']}>
            <SampleTemplatesTable
              dataProvider={() =>
                api()
                  .getTemplates({
                    filter: {
                      isArchived: false,
                      group: TemplateGroupId.SAMPLE,
                    },
                  })
                  .then((data) => data.templates || [])
              }
            />
            <SampleTemplatesTable
              dataProvider={() =>
                api()
                  .getTemplates({
                    filter: {
                      isArchived: true,
                      group: TemplateGroupId.SAMPLE,
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
