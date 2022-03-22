import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { useDataApi } from 'hooks/common/useDataApi';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalTemplatesTable from './ProposalTemplatesTable';

export default function ProposalTemplatesPage() {
  const api = useDataApi();

  return (
    <StyledContainer>
      <StyledPaper>
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
      </StyledPaper>
    </StyledContainer>
  );
}
