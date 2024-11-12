import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalEsiTemplatesTable from './ProposalESITemplatesTable';

export default function ProposalEsiPage() {
  const api = useDataApi();
  const templateGroup = TemplateGroupId.PROPOSAL_ESI;

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <ProposalEsiTemplatesTable
            dataProvider={() =>
              api()
                .getProposalESITemplates({
                  filter: {
                    isArchived: false,
                    group: templateGroup,
                  },
                })
                .then((data) => data.templates || [])
            }
          />
          <ProposalEsiTemplatesTable
            dataProvider={() =>
              api()
                .getProposalESITemplates({
                  filter: {
                    isArchived: true,
                    group: templateGroup,
                  },
                })
                .then((data) => data.templates || [])
            }
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
