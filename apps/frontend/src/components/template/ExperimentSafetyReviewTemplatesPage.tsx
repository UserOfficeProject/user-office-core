import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { TemplateGroupId } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import DefaultTemplatesTable from './DefaultTemplatesTable';
import withMarkTemplateAsActiveAction from './withMarkTemplateAsActiveAction';

export default function ExperimentSafetyReviewTemplatesPage() {
  const templateGroup = TemplateGroupId.EXP_SAFETY_REVIEW;
  const itemCountLabel = '# Reviews';

  const TableComponent = withMarkTemplateAsActiveAction(DefaultTemplatesTable);

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <TableComponent
            templateGroup={templateGroup}
            itemCountLabel={itemCountLabel}
            isArchived={false}
          />
          <TableComponent
            templateGroup={templateGroup}
            itemCountLabel={itemCountLabel}
            isArchived={true}
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
