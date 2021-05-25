import Grid from '@material-ui/core/Grid';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateCategoryId } from 'generated/sdk';
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
                      category: TemplateCategoryId.SAMPLE_DECLARATION,
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
                      category: TemplateCategoryId.SAMPLE_DECLARATION,
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
