import Container from '@material-ui/core/Container';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';

import DefaultTemplatesTable from './DefaultTemplatesTable';
import withMarkTemplateAsActiveAction from './withMarkTemplateAsActiveAction';

export default function FeedbackTemplatesPage() {
  const templateGroup = TemplateGroupId.FEEDBACK;
  const itemCountLabel = '# feedbacks';

  const TableComponent = withMarkTemplateAsActiveAction(DefaultTemplatesTable);

  return (
    <Container>
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
    </Container>
  );
}
