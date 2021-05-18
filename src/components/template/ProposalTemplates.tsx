import Grid from '@material-ui/core/Grid';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { useDataApi } from 'hooks/common/useDataApi';
import { ContentContainer } from 'styles/StyledComponents';

import ProposalTemplatesTable from './ProposalTemplatesTable';

export default function ProposalTemplates() {
  const api = useDataApi();

  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <SimpleTabs tabNames={['Current', 'Archived']}>
            <ProposalTemplatesTable
              dataProvider={() =>
                api()
                  .getProposalTemplates({ filter: { isArchived: false } })
                  .then((data) => data.proposalTemplates || [])
              }
            />
            <ProposalTemplatesTable
              dataProvider={() =>
                api()
                  .getProposalTemplates({ filter: { isArchived: true } })
                  .then((data) => data.proposalTemplates || [])
              }
            />
          </SimpleTabs>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}
