import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { TemplateGroupId } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import DefaultTemplatesTable from './DefaultTemplatesTable';
import withMarkTemplateAsActiveAction from './withMarkTemplateAsActiveAction';

export default function SampleEsiPage() {
  const templateGroup = TemplateGroupId.VISIT_REGISTRATION;
  const itemCountLabel = '# visits';

  const TableComponent = withMarkTemplateAsActiveAction(DefaultTemplatesTable);

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <TableComponent
            templateGroup={templateGroup}
            itemCountLabel={itemCountLabel}
            isArchived={false}
            emptyDataSourceMessage={
              <div>
                <strong>Warning</strong> Visit registration has no templates.
                Users will not be able to register visits. Please create a new
                template and mark it as active.
              </div>
            }
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
